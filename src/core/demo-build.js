// demo-build.js - Build script for demo mode with sample specs
const fs = require("fs");
const path = require("path");

// Lista plików CSS w odpowiedniej kolejności (dodajemy demo-mode.css)
const cssFiles = [
  "css/styles.css",
  "css/parameters.css",
  "css/loader.css",
  "css/tryitout-tabs.css",
  "css/editor.css",
  "css/collection-runner.css",
  "css/code-snippet-tabs.css",
  "css/monaco-file-tabs.css",
  "css/toast.css",
  "css/favorites.css",
  "css/serverSelector.css",
  "css/variables.css",
  "css/sidebar-animations.css",
  "css/theme-variables.css",
  "css/demo-mode.css", // Dodajemy style dla demo mode
];

// Lista plików JS w odpowiedniej kolejności (dodajemy demoMode.js)
const jsFiles = [
  "js/config.js",
  "js/themeManager.js",
  "js/utils.js",
  "js/markdownRenderer.js",
  "js/tooltip.js",
  "js/monacoSetup.js",
  "js/codeSnippets.js",
  "js/codeSnippetTabs.js",
  "js/codeApiGenerators/csharpApiClientGenerator.js",
  "js/codeApiGenerators/javascriptApiClientGenerator.js",
  "js/apiClientOptions.js",
  "js/apiClientGeneration.js",
  "js/serverSelector.js",
  "js/apiLoader.js",
  "js/exampleGenerator.js",
  "js/httpVerbFilter.js",
  "js/sidebarHandler.js",
  "js/sidebarToggle.js",
  "js/sidebarExpand.js",
  "js/mainContentBuilder.js",
  "js/rightPanel.js",
  "js/viewModes.js",
  "js/auth.js",
  "js/favorites.js",
  "js/variables.js",
  "js/rightPanelHandlers.js",
  "js/responseDetailsHandler.js",
  "js/executeButtonHandler.js",
  "js/responseDisplayHandler.js",
  "js/eventHandlers.js",
  "js/collectionRunner.js",
  "js/collectionRunnerUI.js",
  "js/scrollToTop.js",
  "js/demoMode.js", // Dodajemy demo mode jako przedostatni
  "js/app.js",
];

function buildCSS() {
  let combinedCSS = "";

  cssFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      combinedCSS += `/* ${file} */\n${content}\n\n`;
    } else {
      console.log(`⚠️ CSS file not found: ${file}`);
    }
  });

  fs.writeFileSync("demo-dist/bundle.css", combinedCSS);
  console.log("✅ CSS bundle created: demo-dist/bundle.css");
}

function buildJS() {
  let combinedJS = "";

  jsFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      combinedJS += `/* ${file} */\n${content}\n\n`;
    } else {
      console.log(`⚠️ JS file not found: ${file}`);
    }
  });

  fs.writeFileSync("demo-dist/bundle.js", combinedJS);
  console.log("✅ JS bundle created: demo-dist/bundle.js");
}

function copyImages() {
  const sourceDir = "img";
  const targetDir = "demo-dist/img";

  if (!fs.existsSync(sourceDir)) {
    console.log("⚠️ img folder not found, skipping image copy");
    return;
  }

  // Stwórz folder img w demo-dist jeśli nie istnieje
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Kopiuj wszystkie pliki z folderu img
  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });

  console.log(`✅ Images copied: ${files.length} files to demo-dist/img/`);
}

function copyLogo() {
  const logoFile = "openapi-ui.png";

  if (fs.existsSync(logoFile)) {
    fs.copyFileSync(logoFile, path.join("demo-dist", logoFile));
    console.log("✅ Logo copied: demo-dist/openapi-ui.png");
  } else {
    console.log("⚠️ openapi-ui.png not found, skipping logo copy");
  }
}

function copySampleSpecs() {
  const sourceDir = "sample-specs";
  const targetDir = "demo-dist/sample-specs";

  if (!fs.existsSync(sourceDir)) {
    console.log("⚠️ sample-specs folder not found, skipping sample specs copy");
    return;
  }

  // Stwórz folder sample-specs w demo-dist jeśli nie istnieje
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Kopiuj wszystkie pliki z folderu sample-specs
  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });

  console.log(
    `✅ Sample specs copied: ${files.length} files to demo-dist/sample-specs/`
  );
}

function createDistFolder() {
  if (!fs.existsSync("demo-dist")) {
    fs.mkdirSync("demo-dist", { recursive: true });
  }
}

function updateIndexHTML() {
  let html = fs.readFileSync("index.html", "utf8");

  // Usuń wszystkie linki CSS
  html = html.replace(/<link rel="stylesheet" href="css\/.*?">/g, "");

  // Usuń wszystkie skrypty JS
  html = html.replace(/<script src="js\/.*?"><\/script>/g, "");

  // Dodaj bundlowane pliki przed </head> i </body>
  html = html.replace(
    "</head>",
    '    <link rel="stylesheet" href="bundle.css">\n</head>'
  );
  html = html.replace(
    "</body>",
    '    <script src="bundle.js"></script>\n</body>'
  );

  // Update title to indicate demo mode
  html = html.replace(
    "<title>API Documentation</title>",
    "<title>API Documentation - Demo Mode</title>"
  );

  fs.writeFileSync("demo-dist/index.html", html);
  console.log("✅ Demo HTML created: demo-dist/index.html");
}

function createDemoInfo() {
  const demoInfo = {
    name: "OpenAPI UI Demo",
    version: "1.0.0",
    description:
      "Demo version of OpenAPI UI with predefined specifications and custom JSON loading capability",
    features: [
      "Predefined API specifications",
      "Custom JSON input support",
      "Real-time spec switching",
      "All standard OpenAPI UI features",
    ],
    sampleSpecs: [],
    buildDate: new Date().toISOString(),
  };

  // Get list of sample specs
  const sampleSpecsDir = "sample-specs";
  if (fs.existsSync(sampleSpecsDir)) {
    const files = fs.readdirSync(sampleSpecsDir);
    demoInfo.sampleSpecs = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(sampleSpecsDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
          return {
            file: file,
            title: content.info?.title || file,
            version: content.info?.version || "unknown",
            description:
              content.info?.description || "No description available",
          };
        } catch (error) {
          return {
            file: file,
            title: file,
            version: "unknown",
            description: "Error reading specification",
          };
        }
      });
  }

  fs.writeFileSync(
    "demo-dist/demo-info.json",
    JSON.stringify(demoInfo, null, 2)
  );
  console.log("✅ Demo info created: demo-dist/demo-info.json");
}

// Wykonaj demo build
console.log("🚀 Starting demo build...\n");

createDistFolder();
buildCSS();
buildJS();
copyImages();
copyLogo();
copySampleSpecs();
updateIndexHTML();
createDemoInfo();

console.log(
  "\n🎉 Demo build completed! Files in demo-dist/ folder are ready to use."
);
console.log("📁 Demo folder includes:");
console.log("   - index.html (with demo mode enabled)");
console.log("   - bundle.css & bundle.js (with demo functionality)");
console.log("   - img/ folder");
console.log("   - sample-specs/ folder with predefined API specifications");
console.log("   - demo-info.json with build information");
console.log("\n💡 To test the demo:");
console.log("   1. Serve the demo-dist folder with a web server");
console.log("   2. Click the 'Demo Mode' button in the top-left");
console.log("   3. Try loading predefined specs or custom JSON");
