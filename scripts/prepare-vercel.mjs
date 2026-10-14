import { cpSync, mkdirSync, copyFileSync, existsSync, rmSync } from "fs";

const out = ".vercel/output";

// Clean previous output
if (existsSync(".vercel/output")) {
  rmSync(".vercel/output", { recursive: true, force: true });
}

mkdirSync(`${out}/static`, { recursive: true });
mkdirSync(`${out}/functions/__server.func`, { recursive: true });

if (existsSync("dist/client")) {
  cpSync("dist/client", `${out}/static`, { recursive: true });
}
if (existsSync("dist/server")) {
  cpSync("dist/server", `${out}/functions/__server.func`, { recursive: true });
}
if (existsSync("dist/config.json")) {
  copyFileSync("dist/config.json", `${out}/config.json`);
}

console.log("✓ Vercel output prepared at .vercel/output/");
