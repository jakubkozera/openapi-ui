const { build } = require("./build");

build({ demo: true, sync: false }).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
