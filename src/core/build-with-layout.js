const fs = require("node:fs");
const path = require("node:path");
const { build } = require("./build");

async function run() {
  const demo = process.argv.includes("--demo");
  const directory = path.join(__dirname, demo ? "demo-dist" : "dist");
  await build({ demo, sync: false });
  fs.appendFileSync(
    path.join(directory, "bundle.css"),
    `\n${fs.readFileSync(path.join(__dirname, "react/parameter-layout.css"), "utf8")}`,
  );

  if (!demo) {
    for (const destination of [
      "../c-sharp/OpenApiUi/Content",
      "../vsc-extension/openapi-ui/core-dist",
    ]) {
      fs.cpSync(directory, path.resolve(__dirname, destination), {
        recursive: true,
      });
    }
    console.log("Layout assets synchronized to NuGet and VS Code hosts");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
