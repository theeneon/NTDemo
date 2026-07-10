import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "docs", "phase-0");
const destination = resolve(root, "dist", "docs", "phase-0");

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
console.log("Copied Phase 0 planning baseline into the production build.");
