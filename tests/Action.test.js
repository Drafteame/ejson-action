import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import sinon from "sinon";
import axios from "axios";
import fs from "fs";
import targz from "targz";
import Action from "../src/Action.js"; // Assuming Action is in a separate file

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

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    axiosGetStub = sandbox.stub(axios, "get");
    fsCreateWriteStreamStub = sandbox.stub(fs, "createWriteStream");
    targzDecompressStub = sandbox.stub(targz, "decompress");
    fsChmodSyncStub = sandbox.stub(fs, "chmodSync");
    fsExistsSyncStub = sandbox.stub(fs, "existsSync");
    execStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should throw an error if the command fails", async () => {
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

    fsChmodSyncStub.returns();

    fsExistsSyncStub.returns(true);

    execStub.resolves({
      stdout: { toString: () => "" },
      stderr: { toString: () => "Error" },
    });

    const action = new Action("encrypt", "file_path", "", "", "1.4.1");

    action.exec = execStub;

    await expect(action.run()).to.be.rejectedWith("Error");
  });
});
