import core from "@actions/core";

import Action from "./src/Action.js";

const main = async () => {
  const action = new Action(
    core.getInput("action"),
    core.getInput("file_path"),
    core.getInput("private_key"),
    core.getInput("out_file"),
    core.getInput("ejson_version"),
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

(async function () {
  await main();
})();
