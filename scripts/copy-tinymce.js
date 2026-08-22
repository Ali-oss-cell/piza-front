#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "node_modules", "tinymce");
const target = path.join(__dirname, "..", "public", "tinymce");

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(source)) {
  console.warn(`TinyMCE source not found at ${source}. Skipping copy (run npm install tinymce first).`);
  process.exit(0);
}

try {
  copyRecursive(source, target);
  console.log("Copied TinyMCE assets to public/tinymce");
} catch (error) {
  console.error("Failed to copy TinyMCE assets:", error);
  process.exit(1);
}
