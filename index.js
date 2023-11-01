import core from "@actions/core";

import Action from "./src/Action.js";

const main = async () => {
  const action = new Action(
    core.getInput("action"),
    core.getInput("file_path"),
    core.getInput("private_key"),
  );

  try {
    const decrypted = await action.run();
    core.info(decrypted);
  } catch (e) {
    core.error(e);
  }
};

main();
