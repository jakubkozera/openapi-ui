// prebuild.js
// This script builds the core OpenAPI UI and copies the output to the extension's core-dist folder

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting prebuild process...\n');

// Paths
const coreFolder = path.resolve(__dirname, '../../../core');
const coreDist = path.join(coreFolder, 'dist');
const extensionCoreDist = path.resolve(__dirname, '../core-dist');

// Step 1: Build core
console.log('📦 Building core OpenAPI UI...');
try {
    execSync('node build.js', { 
        cwd: coreFolder, 
        stdio: 'inherit' 
    });
    console.log('✅ Core build completed\n');
} catch (error) {
    console.error('❌ Core build failed:', error.message);
    process.exit(1);
}

// Step 2: Copy files from core/dist to extension/core-dist
console.log('📋 Copying files to extension core-dist...');
try {
    // Create core-dist folder if it doesn't exist
    if (!fs.existsSync(extensionCoreDist)) {
        fs.mkdirSync(extensionCoreDist, { recursive: true });
    }

    // Get all files from core/dist
    const files = fs.readdirSync(coreDist);
    
    files.forEach(file => {
        const sourcePath = path.join(coreDist, file);
        const targetPath = path.join(extensionCoreDist, file);
        
        const stat = fs.statSync(sourcePath);
        
        if (stat.isFile()) {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✓ Copied ${file}`);
        } else if (stat.isDirectory()) {
            // Copy directory recursively (e.g., img folder)
            copyDirectoryRecursive(sourcePath, targetPath);
            console.log(`  ✓ Copied directory ${file}/`);
        }
    });
    
    console.log('\n✅ All files copied successfully');
} catch (error) {
    console.error('❌ File copy failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 Prebuild completed successfully!\n');

// Helper function to copy directory recursively
function copyDirectoryRecursive(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectoryRecursive(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}
