import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import axios from "axios";
import fs from "fs";
import targz from "targz";
import Action from "../src/Action.js";

chai.use(chaiAsPromised);
chai.use(sinonChai);

const expect = chai.expect;

describe("Action", async () => {
  let axiosGetStub;
  let fsCreateWriteStreamStub;
  let targzDecompressStub;
  let fsChmodSyncStub;
  let fsExistsSyncStub;
  let execStub;
  let readFileSyncStub;
  let fsWriteFileSyncStub;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    axiosGetStub = sandbox.stub(axios, "get");
    fsCreateWriteStreamStub = sandbox.stub(fs, "createWriteStream");
    targzDecompressStub = sandbox.stub(targz, "decompress");
    fsChmodSyncStub = sandbox.stub(fs, "chmodSync");
    fsExistsSyncStub = sandbox.stub(fs, "existsSync");
    readFileSyncStub = sandbox.stub(fs, "readFileSync");
    fsWriteFileSyncStub = sandbox.stub(fs, "writeFileSync");
    execStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should throw an error if the latest version cannot be obtained", async () => {
    const latestUrl =
      "https://api.github.com/repos/Shopify/ejson/releases/latest";
    axiosGetStub.withArgs(latestUrl).rejects(); // -> fin
    fsExistsSyncStub.returns(true);
    const action = new Action("encrypt", "file_path", "", "", "");

    await expect(action.run()).to.be.rejectedWith(
      "Failed to fetch the latest ejson version",
    );
  });

  it("should throw an error if the download fails", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub
      .withArgs(ejsonBinURL, { responseType: "stream" })
      .rejects(new Error("Error"));
    fsExistsSyncStub.returns(true);
    const action = new Action("encrypt", "file_path", "", "", "1.4.1");
    await expect(action.run()).to.be.rejectedWith("Error");
  });

  it("should throw an error if the decompression fails", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback(new Error("Error"));
      });
    fsExistsSyncStub.returns(true);
    const action = new Action("encrypt", "file_path", "", "", "1.4.1");
    await expect(action.run()).to.be.rejectedWith("Error");
  });

  it("should throw an error if the chmod fails", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).throws("Error");

    fsExistsSyncStub.returns(true);

    const action = new Action("encrypt", "file_path", "", "", "1.4.1");

    await expect(action.run()).to.be.rejectedWith("Error");
  });

  it("should throw an error if the encrypt command fails", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();

    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "" },
      stderr: { toString: () => "Error" },
    });

    const action = new Action("encrypt", "file_path", "", "", "1.4.1");

    action.exec = execStub;

    await expect(action.run()).to.be.rejectedWith("Error");
  });

  it("should throw an error if running the decrypt action without a private key", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();

    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "" },
      stderr: { toString: () => "Error" },
    });

    const action = new Action("decrypt", "file_path", "", "", "1.4.1");

    action.exec = execStub;

    await expect(action.run()).to.be.rejectedWith(
      "No provided private key for encryption",
    );
  });

  it("should throw an error if running the decrypt action without a public key", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);

    const fakeData = JSON.stringify({});
    readFileSyncStub.returns(fakeData);
    fsWriteFileSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "" },
      stderr: { toString: () => "Error" },
    });

    const action = new Action(
      "decrypt",
      "file_path",
      "private_key",
      "",
      "1.4.1",
    );

    action.exec = execStub;

    await expect(action.run()).to.be.rejectedWith(
      "Not found public key in ejson file",
    );
  });

  it("should throw an error if the decrypt command fails", async () => {
    // throw new Error("Error") - decrypt command
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);
    const fakeData = JSON.stringify({ _public_key: "public_key" });
    readFileSyncStub.returns(fakeData);
    fsWriteFileSyncStub.returns(true);
    execStub.resolves({
      stdout: { toString: () => "" },
      stderr: { toString: () => "Error" },
    });

    const action = new Action(
      "decrypt",
      "file_path",
      "private_key",
      "",
      "1.4.1",
    );

    action.exec = execStub;

    await expect(action.run()).to.be.rejectedWith("Error");
  });

  it("should throw an error if the JSON file does not exist", async () => {
    fsExistsSyncStub.returns(false);
    expect(() => new Action("encrypt", "invalid-path", "", "", "")).to.throw(
      "JSON file does not exist at path: invalid-path",
    );
  });

  it("should download the specific ejson version", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";
    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });
    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });
    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });
    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "finish" },
      stderr: { toString: () => "" },
    });

    const action = new Action("encrypt", "file_path", "", "", "1.4.1");
    action.exec = execStub;

    await expect(action.run()).to.be.fulfilled;
  });

  it("should use the latest ejson version if no ejson version is specified", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v";
    const latestUrl =
      "https://api.github.com/repos/Shopify/ejson/releases/latest";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";
    axiosGetStub.withArgs(url).rejects({});
    axiosGetStub.withArgs(latestUrl).resolves({
      data: {
        tag_name: "1.5.2",
      },
    });
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.5.2/ejson_1.5.2_linux_amd64.tar.gz";
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });
    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });
    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });
    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "finish" },
      stderr: { toString: () => "" },
    });

    const action = new Action("encrypt", "file_path", "", "", "");
    action.exec = execStub;

    await expect(action.run()).to.be.fulfilled;
  });

  it("should use the latest ejson version if no specified ejson version does not exist", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.1.1.1";
    const latestUrl =
      "https://api.github.com/repos/Shopify/ejson/releases/latest";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";
    axiosGetStub.withArgs(url).rejects({});
    axiosGetStub.withArgs(latestUrl).resolves({
      data: {
        tag_name: "1.5.2",
      },
    });
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.5.2/ejson_1.5.2_linux_amd64.tar.gz";
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });
    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });
    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });
    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "finish" },
      stderr: { toString: () => "" },
    });

    const action = new Action("encrypt", "file_path", "", "", "1.1.1.1");
    action.exec = execStub;

    await expect(action.run()).to.be.fulfilled;
  });

  it("should encrypt the JSON file successfully", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);
    execStub.resolves({
      stdout: { toString: () => "finish" },
      stderr: { toString: () => "" },
    });

    const action = new Action("encrypt", "file_path", "", "", "1.4.1");

    action.exec = execStub;

    await expect(action.run()).to.eventually.equal("finish");
  });

  it("should decrypt the JSON file successfully", async () => {
    const url = "https://github.com/Shopify/ejson/releases/tag/v1.4.1";
    const ejsonBinURL =
      "https://github.com/Shopify/ejson/releases/download/v1.4.1/ejson_1.4.1_linux_amd64.tar.gz";
    const path = "/usr/local/bin/ejson.tar.gz";
    const bin = "/usr/local/bin/ejson";

    axiosGetStub.withArgs(url).resolves({});
    axiosGetStub.withArgs(ejsonBinURL, { responseType: "stream" }).resolves({
      data: {
        pipe: sinon.stub().returns(),
      },
    });

    fsCreateWriteStreamStub.withArgs(path).returns({
      on: (action, callback) => {
        if (action === "finish") {
          callback();
        }
      },
    });

    targzDecompressStub
      .withArgs({ src: path, dest: "/usr/local/bin/" })
      .callsFake((opts, callback) => {
        callback();
      });

    fsChmodSyncStub.withArgs(bin, 0o755).returns();
    fsExistsSyncStub.returns(true);
    const fakeData = JSON.stringify({ _public_key: "public_key" });
    readFileSyncStub.returns(fakeData);
    fsWriteFileSyncStub.returns(true);
    execStub.resolves({
      stdout: { toString: () => "finish" },
      stderr: { toString: () => "" },
    });

    const action = new Action(
      "decrypt",
      "file_path",
      "private_key",
      "",
      "1.4.1",
    );

    action.exec = execStub;

    await expect(action.run()).to.be.fulfilled;
  });
});
