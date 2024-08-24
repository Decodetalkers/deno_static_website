import * as esbuild from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { copySync, ensureDir, existsSync } from "@std/fs";
import { resolve } from "@std/path";

import { serveDir } from "@std/http";
import { delay } from "@std/async";

const distDir = "dist";
ensureDir(distDir);

const options = { overwrite: true };
copySync("static", distDir, options);

async function esbuild_generate() {
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
}

await esbuild_generate();

let server = Deno.serve({ hostname: "localhost", port: 8000 }, async (ctx) => {
  return await serveDir(ctx, { fsRoot: `${Deno.cwd()}/dist` });
});

const watcher = Deno.watchFs("./");

let during_wait = false;

for await (const event of watcher) {
  if (during_wait) {
    continue;
  }
  let has_watched_file = false;
  if (event.kind != "modify") {
    continue;
  }
  for (const pa of event.paths) {
    if (
      pa.includes("./dist") || pa.includes("./build.ts") ||
      pa.includes(".git") ||
      (!pa.endsWith("ts") && !pa.endsWith("tsx") && !pa.endsWith("css") &&
        !pa.endsWith("js") && !pa.endsWith("jsx"))
    ) {
      continue;
    }
    has_watched_file = true;
    break;
  }
  if (!has_watched_file) {
    continue;
  }
  server.shutdown();
  await esbuild_generate();
  server = Deno.serve({ hostname: "localhost", port: 8000 }, async (ctx) => {
    return await serveDir(ctx, { fsRoot: `${Deno.cwd()}/dist` });
  });
  during_wait = true;
  delay(1000).then(() => during_wait = false);
}
