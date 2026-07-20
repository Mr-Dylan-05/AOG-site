#!/usr/bin/env node
/**
 * decode-asset.js — decode a DesignSync get_file persisted result (JSON with a
 * base64 `content` field) into a real binary asset on disk.
 * Usage: node scripts/decode-asset.js <persisted.json> <output-file>
 */
const fs = require("fs");
const path = require("path");
const [, , src, out] = process.argv;
if (!src || !out) { console.error("usage: decode-asset.js <persisted.json> <out>"); process.exit(1); }
const j = JSON.parse(fs.readFileSync(src, "utf8"));
if (typeof j.content !== "string") { console.error("no content field"); process.exit(1); }
const buf = Buffer.from(j.content, "base64");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buf);
const sig = buf.slice(0, 4).toString("hex");
const kind = sig.startsWith("89504e47") ? "PNG" : sig.startsWith("ffd8ff") ? "JPEG"
  : buf.slice(0, 4).toString("ascii") === "RIFF" ? "WEBP" : buf.slice(0, 5).toString("ascii") === "<?xml" || buf.slice(0,4).toString("ascii")==="<svg" ? "SVG" : "?";
console.log(`${path.basename(out)}: ${buf.length} bytes, type=${kind}${j.truncated ? " [TRUNCATED!]" : ""}`);
