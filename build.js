#!/usr/bin/env node

// Cross-platform build script for Netlify deployment
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Scriptor Umbra AI for Netlify...');

// Source and destination directories
const sourceDir = path.join(__dirname, 'DRAG_TO_DOMAIN');
const distDir = path.join(__dirname, 'dist');

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const items = fs.readdirSync(src);

  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${item}`);
    }
  });
}

try {
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ Error: DRAG_TO_DOMAIN directory not found!');
    process.exit(1);
  }

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('🧹 Cleaned dist directory');
  }

  // Copy frontend files
  copyDir(sourceDir, distDir);

  // Verify index.html exists
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Error: index.html not found in built files!');
    process.exit(1);
  }

  console.log('✅ Frontend built successfully!');
  console.log(`📁 Output directory: ${distDir}`);
  
  // List built files
  const builtFiles = fs.readdirSync(distDir);
  console.log('📦 Built files:');
  builtFiles.forEach(file => {
    console.log(`   - ${file}`);
  });

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}