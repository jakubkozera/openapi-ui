// build.js
const fs = require("fs");
const path = require("path");

// Lista plików CSS w odpowiedniej kolejności
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
];

// Lista plików JS w odpowiedniej kolejności (z index.html)
const jsFiles = [
  "js/config.js",
  "js/themeManager.js",
  "js/utils.js",
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
  "js/app.js",
];

function buildCSS() {
  let combinedCSS = "";

  cssFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      combinedCSS += `/* ${file} */\n${content}\n\n`;
    }
  });

  fs.writeFileSync("dist/bundle.css", combinedCSS);
  console.log("✅ CSS bundle created: dist/bundle.css");
}

function buildJS() {
  let combinedJS = "";

  jsFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      combinedJS += `/* ${file} */\n${content}\n\n`;
    }
  });

  fs.writeFileSync("dist/bundle.js", combinedJS);
  console.log("✅ JS bundle created: dist/bundle.js");
}

function copyImages() {
  const sourceDir = "img";
  const targetDir = "dist/img";

  if (!fs.existsSync(sourceDir)) {
    console.log("⚠️ img folder not found, skipping image copy");
    return;
  }

  // Stwórz folder img w dist jeśli nie istnieje
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

  console.log(`✅ Images copied: ${files.length} files to dist/img/`);
}

function createDistFolder() {
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
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

  fs.writeFileSync("dist/index.html", html);
  console.log("✅ Updated HTML created: dist/index.html");
}

// Wykonaj build
createDistFolder();
buildCSS();
buildJS();
copyImages();
updateIndexHTML();

console.log("\n🎉 Build completed! Files in dist/ folder are ready to use.");
