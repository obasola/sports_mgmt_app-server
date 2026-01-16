const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(process.cwd(), "src");

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.isFile() && p.endsWith(".ts")) out.push(p);
  }
  return out;
}

function ensureImport(code) {
  // Already importing esmFilename
  if (code.includes('from "@/shared/utils/esmPaths"') && code.includes("esmFilename")) return code;

  // Insert after last import, else at top
  const importLine = `import { esmFilename } from "@/shared/utils/esmPaths";\n`;
  const imports = [...code.matchAll(/^import .*?;\s*$/gm)];
  if (imports.length === 0) return importLine + code;

  const last = imports[imports.length - 1];
  const idx = last.index + last[0].length;
  return code.slice(0, idx) + "\n" + importLine + code.slice(idx);
}

function transform(code) {
  if (!code.includes("__filename")) return null;

  let next = code;

  // Replace __filename with esmFilename(import.meta.url)
  next = next.replaceAll("__filename", "esmFilename(import.meta.url)");

  // Only add import if we actually replaced something
  if (next !== code) next = ensureImport(next);

  return next;
}

let changed = 0;

for (const file of walk(SRC)) {
  const code = fs.readFileSync(file, "utf8");
  const next = transform(code);
  if (next && next !== code) {
    fs.writeFileSync(file, next, "utf8");
    changed++;
  }
}

console.log(`Updated ${changed} file(s).`);
