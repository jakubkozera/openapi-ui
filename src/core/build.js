const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");

async function build({ demo = false, sync = true } = {}) {
  const directory = path.join(__dirname, demo ? "demo-dist" : "dist");
  fs.mkdirSync(directory, { recursive: true });
  await esbuild.build({
    entryPoints: [path.join(__dirname, "react/main.jsx")],
    bundle: true,
    outfile: path.join(directory, "bundle.js"),
    format: "iife",
    target: ["es2020"],
    minify: true,
    legalComments: "eof",
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.env.MODE": '"production"',
    },
    logLevel: "info",
  });
  let html = fs
    .readFileSync(path.join(__dirname, "index.html"), "utf8")
    .replace(
      '<script type="module" src="./react/main.jsx"></script>',
      '<script src="bundle.js" defer></script>',
    )
    .replace("</head>", '  <link rel="stylesheet" href="bundle.css">\n</head>');
  if (!demo)
    html = html.replace('content="swagger.json"', 'content="#swagger_path#"');
  fs.writeFileSync(path.join(directory, "index.html"), html);
  for (const asset of [
    "swagger.json",
    "sample-specs",
    "img",
    "openapi-ui.png",
  ]) {
    const source = path.join(__dirname, asset);
    if (fs.existsSync(source))
      fs.cpSync(source, path.join(directory, asset), { recursive: true });
  }
  if (demo) {
    const sampleSpecs = fs
      .readdirSync(path.join(__dirname, "sample-specs"))
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const spec = JSON.parse(
          fs.readFileSync(path.join(__dirname, "sample-specs", file), "utf8"),
        );
        return { file, ...spec.info };
      });
    fs.writeFileSync(
      path.join(directory, "demo-info.json"),
      JSON.stringify(
        { name: "OpenAPI UI Demo", version: "2.0.0", sampleSpecs },
        null,
        2,
      ),
    );
  }
  if (!demo && sync) {
    for (const destination of [
      "../c-sharp/OpenApiUi/Content",
      "../vsc-extension/openapi-ui/core-dist",
    ]) {
      fs.cpSync(directory, path.resolve(__dirname, destination), {
        recursive: true,
      });
    }
  }
  console.log(
    `React build ready: ${directory}${!demo && sync ? " (NuGet and VS Code assets synchronized)" : ""}`,
  );
}

module.exports = { build };
if (require.main === module)
  build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
