# Script to copy assets from dist folder to Content and create local NuGet package

# Get script directory and set paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$distDir = Join-Path (Split-Path -Parent (Split-Path -Parent $projectDir)) "core\dist"
$contentDir = Join-Path $projectDir "Content"
$buildScriptPath = Join-Path (Split-Path -Parent (Split-Path -Parent $projectDir)) "core\build.js"

Write-Host "Project directory: $projectDir" -ForegroundColor Green
Write-Host "Dist directory: $distDir" -ForegroundColor Green
Write-Host "Content directory: $contentDir" -ForegroundColor Green
Write-Host "Build script path: $buildScriptPath" -ForegroundColor Green

# First, run the build script to generate the dist files
Write-Host "`nRunning build script..." -ForegroundColor Yellow
if (-not (Test-Path $buildScriptPath)) {
    Write-Error "Build script not found: $buildScriptPath"
    exit 1
}

try {
    Set-Location (Split-Path -Parent $buildScriptPath)
    node build.js
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build script failed"
    }
    
    Write-Host "Build script completed successfully!" -ForegroundColor Green
    Set-Location $scriptDir
}
catch {
    Write-Error "Error running build script: $($_.Exception.Message)"
    exit 1
}

# Check if dist directory exists
if (-not (Test-Path $distDir)) {
    Write-Error "Dist directory not found: $distDir"
    exit 1
}

# Create Content directory if it doesn't exist
if (-not (Test-Path $contentDir)) {
    Write-Host "Creating Content directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $contentDir -Force | Out-Null
}

# Clear existing content
Write-Host "Clearing existing content in Content directory..." -ForegroundColor Yellow
Get-ChildItem -Path $contentDir -Recurse | Remove-Item -Force -Recurse

# Copy all files from dist to Content
Write-Host "Copying files from dist to Content..." -ForegroundColor Yellow
Copy-Item -Path "$distDir\*" -Destination $contentDir -Recurse -Force

Write-Host "Files copied successfully!" -ForegroundColor Green

# List copied files
Write-Host "`nCopied files:" -ForegroundColor Cyan
Get-ChildItem -Path $contentDir -Recurse | ForEach-Object {
    Write-Host "  $($_.FullName.Replace($contentDir, '.'))" -ForegroundColor Gray
}

# Clean previous builds
Write-Host "`nCleaning previous builds..." -ForegroundColor Yellow
$binDir = Join-Path $projectDir "bin"
$objDir = Join-Path $projectDir "obj"

if (Test-Path $binDir) {
    Remove-Item -Path $binDir -Recurse -Force
}
if (Test-Path $objDir) {
    Remove-Item -Path $objDir -Recurse -Force
}

# Build and pack the project
Write-Host "`nBuilding and packing the project..." -ForegroundColor Yellow
Set-Location $projectDir

try {
    # Restore packages
    Write-Host "Restoring packages..." -ForegroundColor Yellow
    dotnet restore
    
    if ($LASTEXITCODE -ne 0) {
        throw "Package restore failed"
    }
    
    # Build the project
    Write-Host "Building project..." -ForegroundColor Yellow
    dotnet build --configuration Release --no-restore
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    
    # Create NuGet package
    Write-Host "Creating NuGet package..." -ForegroundColor Yellow
    dotnet pack --configuration Release --no-build --output ".\nupkg"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Pack failed"
    }
    
    Write-Host "`nNuGet package created successfully!" -ForegroundColor Green
    
    # List created packages
    $nupkgDir = Join-Path $projectDir "nupkg"
    if (Test-Path $nupkgDir) {
        Write-Host "`nCreated packages:" -ForegroundColor Cyan
        Get-ChildItem -Path $nupkgDir -Filter "*.nupkg" | ForEach-Object {
            Write-Host "  $($_.Name)" -ForegroundColor Gray
            Write-Host "  Size: $([math]::Round($_.Length / 1KB, 2)) KB" -ForegroundColor Gray
            Write-Host "  Path: $($_.FullName)" -ForegroundColor Gray
            Write-Host ""
        }
    }
    
}
catch {
    Write-Error "Error during build/pack process: $($_.Exception.Message)"
    exit 1
}

Write-Host "Script completed successfully!" -ForegroundColor Green
