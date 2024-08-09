import core from "@actions/core";

import Action from "./src/Action.js";

import { execSync } from 'child_process';

const main = async () => {
  const action = new Action(
    core.getInput("action"),
    core.getInput("file_path"),
    core.getInput("private_key"),
    core.getInput("out_file"),
  );

  try {
    await action.run();
  } catch (e) {
    core.error(
      `[ERROR] Failure on ejson ${core.getInput("action")}: ${e.message}`,
    );

    process.exit(1);
  }
};

const ejsonVersion = () => {
  const version = core.getInput("ejson_version");

    try {
      const output = execSync(`./script.sh ${version}`, { encoding: 'utf-8' });
      console.log(output);
    } catch (error) {
      console.error(error);
    }

}

ejsonVersion();

main();