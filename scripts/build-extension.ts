/**
 * FORGE — Customizer extension build script
 *
 * Bundles extensions/customizer/src/customizer.ts → assets/forge-customizer.js
 * Enforces the 150 KB gzipped bundle budget (non-negotiable gate).
 *
 * Usage:
 *   npm run build:customizer           # one-shot build
 *   npm run build:customizer -- --watch  # watch mode (dev)
 */

import * as esbuild from "esbuild";
import { gzipSync } from "zlib";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const ENTRY = resolve(ROOT, "extensions/customizer/src/customizer.ts");
const OUT_JS = resolve(ROOT, "extensions/customizer/assets/forge-customizer.js");
const OUT_CSS = resolve(ROOT, "extensions/customizer/assets/forge-customizer.css");

/** 150 KB gzipped — the non-negotiable performance gate */
const MAX_GZIP_BYTES = 150 * 1024;

const watchMode = process.argv.includes("--watch");

const buildOptions: esbuild.BuildOptions = {
  entryPoints: [ENTRY],
  bundle: true,
  minify: !watchMode,
  target: "es2020",
  format: "iife",
  outfile: OUT_JS,
  sourcemap: watchMode ? "inline" : false,
  // No framework runtime — vanilla TS only to hit the bundle budget.
  // External: nothing. We own the whole bundle.
  define: {
    "process.env.NODE_ENV": watchMode ? '"development"' : '"production"',
  },
};

async function checkBundleSize(): Promise<void> {
  const js = readFileSync(OUT_JS);
  const gzipped = gzipSync(js);
  const gzipKb = (gzipped.length / 1024).toFixed(1);
  const rawKb = (js.length / 1024).toFixed(1);

  if (gzipped.length > MAX_GZIP_BYTES) {
    console.error(
      `\n❌  Bundle size gate FAILED: ${gzipKb} KB gzipped (limit: 150 KB, raw: ${rawKb} KB)\n` +
        "   Reduce bundle size before shipping. No exceptions.\n",
    );
    process.exit(1);
  }

  console.log(
    `✅  Bundle size: ${gzipKb} KB gzipped (limit: 150 KB, raw: ${rawKb} KB)`,
  );
}

// Ensure a minimal CSS file always exists so the Liquid template doesn't 404.
function ensureCssFile(): void {
  try {
    readFileSync(OUT_CSS);
  } catch {
    writeFileSync(
      OUT_CSS,
      "/* FORGE Customizer — styles injected by the web component shadow DOM */\n",
    );
    console.log("Created empty forge-customizer.css");
  }
}

if (watchMode) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  ensureCssFile();
  console.log("👀  Watching for changes…");
} else {
  const result = await esbuild.build(buildOptions);

  if (result.errors.length > 0) {
    console.error("Build errors:", result.errors);
    process.exit(1);
  }

  ensureCssFile();
  await checkBundleSize();
  console.log("🔨  Extension build complete.");
}
