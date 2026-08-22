#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "node_modules", "tinymce");
const target = path.join(__dirname, "..", "public", "tinymce");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`TinyMCE source not found at ${src}. Run npm install tinymce first.`);
    return;
  }

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

copyRecursive(source, target);
console.log("Copied TinyMCE assets to public/tinymce");
