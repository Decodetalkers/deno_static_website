import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { copySync, ensureDir, existsSync } from "@std/fs";
import { resolve } from "@std/path";

import { serveDir } from "@std/http";

const distDir = "dist";
ensureDir(distDir);

const options = { overwrite: true };
copySync("static", distDir, options);

const esBuildOptions: esbuild.BuildOptions = {
  entryPoints: [
    "./src/main.tsx",
  ],
  outdir: distDir,
  bundle: true,
  format: "esm",
  logLevel: "verbose",
  plugins: [],
};

// Build Deno Plugin Options
let importMapURL: string | undefined = resolve("./import_map.json");

if (!existsSync(importMapURL)) {
  importMapURL = undefined;
}
const configUrl = resolve("./deno.json");

esBuildOptions.plugins = [
  ...denoPlugins(
    {
      importMapURL: importMapURL,
      configPath: configUrl,
    },
  ),
];

await esbuild.build({ ...esBuildOptions });

Deno.serve({ hostname: "localhost", port: 8000 }, async (ctx) => {
  return await serveDir(ctx, { fsRoot: `${Deno.cwd()}/dist` });
});
