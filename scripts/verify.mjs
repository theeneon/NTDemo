import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "vercel.json",
  "docs/phase-0/README.md",
  "docs/phase-0/scope-lock.md",
  "docs/phase-0/screen-flow.md",
  "docs/phase-0/combat-rules.md",
  "docs/phase-0/acceptance-checklist.md",
  "docs/phase-0/asset-inventory.md",
];

const failures = [];
for (const file of requiredFiles) {
  try {
    await access(resolve(root, file));
  } catch {
    failures.push(`Missing required file: ${file}`);
  }
}

const html = await readFile(resolve(root, "index.html"), "utf8");
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) failures.push(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(", ")}`);

const localLinks = [...html.matchAll(/(?:href|src)="\/(?!\/)([^"#?]+)"/g)].map((match) => match[1]);
for (const target of localLinks) {
  try {
    await access(resolve(root, target));
  } catch {
    failures.push(`Broken root-relative link: /${target}`);
  }
}

const config = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
if (config.outputDirectory !== "dist") failures.push("Vercel outputDirectory must be dist");
if (config.buildCommand !== "npm run build") failures.push("Vercel buildCommand must run the checked build script");

const script = await readFile(resolve(root, "app.js"), "utf8");
for (const screen of ["roster", "squad", "campaign", "battle", "results", "upgrade", "summon"]) {
  if (!script.includes(`${screen}: {`)) failures.push(`Missing wireframe definition: ${screen}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Verified ${requiredFiles.length} required files, ${ids.length} unique HTML ids, ${localLinks.length} local links, and 7 wireframes.`);
