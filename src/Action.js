import fs from "fs";
import util from "util";
import cp from "child_process";
import lodash from "lodash";
import core from "@actions/core";
import download from "download";
import fetch from "node-fetch";

// The ejson command used for encryption and decryption
const ejson = "ejson";

export default class Action {
  #action;
  #filePath;
  #privateKey;
  #outFile;
  #ejsonVersion;

  /**
   * Create a new Action instance.
   *
   * @param {string} action The action to perform (encrypt or decrypt).
   * @param {string} filePath The path to the JSON file.
   * @param {string} privateKey Optional private key for encryption.
   * @param {string} outFile Path to a destination file were the decrypted content should be placed.
   * @param {string} ejsonVersion Version of the ejson binary to be downloaded
   */
  constructor(
    action,
    filePath,
    privateKey = "",
    outFile = "",
    ejsonVersion = "",
  ) {
    this.exec = util.promisify(cp.exec);

    this.#action = action;
    this.#filePath = filePath;
    this.#privateKey = privateKey;
    this.#outFile = outFile;
    this.#ejsonVersion = ejsonVersion;

    this.#validate();
  }

  /**
   * Validate the existence of the JSON file at the specified path.
   *
   * @throws {Error} File not exists
   */
  #validate() {
    if (!fs.existsSync(this.#filePath)) {
      throw new Error(`JSON file does not exist at path: ${this.#filePath}`);
    }
  }

  /**
   * Run the action based on the provided action type.
   *
   * @throws {Error} Invalid action to perform
   *
   * @returns {Promise<string|void>} - The result of the action.
   */
  async run() {
    await this.#downloadEjsonBin();

    switch (this.#action) {
      case "encrypt":
        return await this.#encrypt();

      case "decrypt":
        return await this.#decrypt();

      default:
        throw new Error(`Invalid action '${this.#action}'`);
    }
  }

  /**
   * Encrypt the JSON file using the ejson command.
   *
   * @throws {Error} An execution error occurs during ejson command
   *
   * @returns {Promise<string>} - The encrypted content.
   */
  async #encrypt() {
    this.#debugFileContent(this.#filePath);

    const command = `${ejson} encrypt ${this.#filePath}`;
    const opts = { env: { ...process.env } };

    const res = await this.exec(command, opts);

    const out = res.stdout.toString();
    const err = res.stderr.toString();

    if (!lodash.isEmpty(err)) {
      throw new Error(err);
    }

    core.info("Encrypted successfully...");
    core.info(out);
  }

  /**
   * Decrypt the JSON file using the ejson command and set the decrypted output.
   *
   * @throws {Error} An execution error occurs during ejson command
   *
   * @returns {Promise<void>}
   */
  async #decrypt() {
    this.#configurePrivateKey();

    this.#debugFileContent(this.#filePath);

    const command = `${ejson} decrypt ${this.#filePath}`;
    const opts = { env: { ...process.env } };

    const res = await this.exec(command, opts);

    const out = res.stdout.toString();
    const err = res.stderr.toString();

    if (!lodash.isEmpty(err)) {
      throw new Error(err);
    }

    if (!lodash.isEmpty(this.#outFile)) {
      fs.writeFileSync(this.#outFile, out, "utf-8");
    }

    core.setOutput("decrypted", out);

    core.info("Decrypted successfully...");
  }

  /**
   * Configure the private key for decryption.
   *
   * @throws {Error} Private key is not configured
   * @throws {Error} Public key is not present on ejson file
   */
  #configurePrivateKey() {
    if (lodash.isEmpty(this.#privateKey)) {
      throw new Error("No provided private key for encryption");
    }

    const data = JSON.parse(fs.readFileSync(this.#filePath, "utf8"));

    const publicKey = data["_public_key"];

    if (!publicKey) {
      throw new Error("Not found public key in ejson file");
    }

    const keyPath = `/opt/ejson/keys/${publicKey}`;

    core.info(`Creating file ${keyPath}`);

    fs.writeFileSync(keyPath, this.#privateKey, "utf-8");
  }

  #debugFileContent(filePath) {
    if (process.env.EJSON_DEBUG !== "true") {
      return;
    }

    const content = fs.readFileSync(filePath);

    core.info(`[${this.#action}] File content: ${filePath}`);
    core.info(content.toString());
  }

  async #downloadEjsonBin() {
    let version = this.#ejsonVersion;

    if (version === "") {
      version = await this.#getLatestEjsonVersion();
    }

    const ejsonBinURL = `https://github.com/Shopify/ejson/releases/download/v${version}/ejson_${version}_linux_amd64.tar.gz`;

    fs.writeFileSync("/usr/local/bin/ejson", await download(ejsonBinURL));
    fs.chmodSync("/usr/local/bin/ejson", 0o755);

    this.#printVersion();
  }

  async #getLatestEjsonVersion() {
    const url = "https://api.github.com/repos/Shopify/ejson/releases/latest";

    let res = await fetch(url);
    let tagVersion = res.json().tag_name;

    core.info("Latest ejson version: ", tagVersion);

    return tagVersion.replace("v", "");
  }

  async #printVersion() {
    const opts = { env: { ...process.env } };
    let res = await this.exec("ejson -v", opts);

    if (res.stderr !== "") {
      console.log(res.stderr);
      return;
    }

    console.log(res.stdout);
  }
}
