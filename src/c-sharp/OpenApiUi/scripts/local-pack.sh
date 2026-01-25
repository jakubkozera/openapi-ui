#!/bin/bash
# Script to copy assets from dist folder to Content and create local NuGet package

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$(dirname "$(dirname "$PROJECT_DIR")")/core/dist"
CONTENT_DIR="$PROJECT_DIR/Content"

echo "Project directory: $PROJECT_DIR"
echo "Dist directory: $DIST_DIR"
echo "Content directory: $CONTENT_DIR"

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    echo "Error: Dist directory not found: $DIST_DIR"
    exit 1
fi

# Create Content directory if it doesn't exist
if [ ! -d "$CONTENT_DIR" ]; then
    echo "Creating Content directory..."
    mkdir -p "$CONTENT_DIR"
fi

# Clear existing content
echo "Clearing existing content in Content directory..."
rm -rf "$CONTENT_DIR"/*

# Copy all files from dist to Content
echo "Copying files from dist to Content..."
cp -r "$DIST_DIR"/* "$CONTENT_DIR"/

echo "Files copied successfully!"

# List copied files
echo -e "\nCopied files:"
find "$CONTENT_DIR" -type f | sed "s|$CONTENT_DIR|.|g"

# Clean previous builds
echo -e "\nCleaning previous builds..."
rm -rf "$PROJECT_DIR/bin" "$PROJECT_DIR/obj"

# Build and pack the project
echo -e "\nBuilding and packing the project..."
cd "$PROJECT_DIR"

# Restore packages
echo "Restoring packages..."
dotnet restore

if [ $? -ne 0 ]; then
    echo "Error: Package restore failed"
    exit 1
fi

# Build the project
echo "Building project..."
dotnet build --configuration Release --no-restore

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

# Create NuGet package
echo "Creating NuGet package..."
dotnet pack --configuration Release --no-build --output "./nupkg"

if [ $? -ne 0 ]; then
    echo "Error: Pack failed"
    exit 1
fi

echo -e "\nNuGet package created successfully!"

# List created packages
NUPKG_DIR="$PROJECT_DIR/nupkg"
if [ -d "$NUPKG_DIR" ]; then
    echo -e "\nCreated packages:"
    find "$NUPKG_DIR" -name "*.nupkg" -exec basename {} \; | while read pkg; do
        echo "  $pkg"
        echo "  Path: $NUPKG_DIR/$pkg"
        echo ""
    done
fi

echo "Script completed successfully!"