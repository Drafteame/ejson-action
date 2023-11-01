import fs from "fs";
import util from "util";
import cp from "child_process";
import lodash from "lodash";
import core from "@actions/core";

const ejson = "ejson";

export default class Action {
  #action;
  #filePath;
  #privateKey;

  constructor(action, filePath, privateKey = "") {
    this.exec = util.promisify(cp.exec);

    this.#action = action;
    this.#filePath = filePath;
    this.#privateKey = privateKey;

    this.#validate();
  }

  #validate() {
    if (!fs.existsSync(this.#filePath)) {
      throw new Error(`JSON file does not exist at path: ${this.#filePath}`);
    }
  }

  async run() {
    switch (this.#action) {
      case "encrypt":
        return await this.#encrypt();

      case "decrypt":
        return await this.#decrypt();

      default:
        throw new Error(`invalid action '${this.#action}'`);
    }
  }

  async #encrypt() {
    const command = `${ejson} encrypt ${this.#filePath}`;
    const opts = { env: { ...process.env } };

    const res = await this.exec(command, opts);

    const out = res.stdout.toString();
    const err = res.stderr.toString();

    if (!lodash.isEmpty(err)) {
      throw new Error(err);
    }

    return out;
  }

  async #decrypt() {
    this.#configurePrivateKey();

    const command = `${ejson} decrypt ${this.#filePath}`;
    const opts = { env: { ...process.env } };

    const res = await this.exec(command, opts);

    const out = res.stdout.toString();
    const err = res.stderr.toString();

    if (!lodash.isEmpty(err)) {
      throw new Error(err);
    }

    core.setOutput("decrypted", out);

    return decrypted;
  }

  #configurePrivateKey() {
    if (lodash.isEmpty(this.#privateKey)) {
      throw new Error("no provided private key for encryption");
    }

    const data = JSON.parse(fs.readFileSync(this.#filePath, "utf8"));

    const publicKey = data["_public_key"];

    if (!publicKey) {
      throw new Error("not found public key on ejson file");
    }

    const keyPath = `/opt/ejson/keys/${publicKey}`;

    fs.writeFileSync(keyPath, this.#privateKey, "utf-8");
  }
}
