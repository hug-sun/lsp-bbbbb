const { initUserData } = require("./src/user");
const { start } = require("./src/task");
(async () => {
  await initUserData()
  start();
})();
