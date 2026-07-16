const sharp = require("C:\\Users\\99226\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\sharp");
const fs = require("fs");
const path = require("path");
const baseDir = "D:\\codex+++\\Workspace\\V.30";

const rules = [
  { test: p => p.includes("\\g2\\"), width: 800, quality: 80 },
  { test: p => p.includes("\\icon\\"), width: 256, quality: 80 },
  { test: p => p.includes("\\skills-icons\\"), width: 256, quality: 80 },
  { test: p => p.includes("\\luodiye\\"), width: 600, quality: 80 },
  { test: p => p.includes("\\erciyuan\\"), width: 800, quality: 80 },
  { test: p => p.includes("\\rouge\\"), width: 600, quality: 80 },
  { test: p => p.includes("\\xianxia\\"), width: 800, quality: 80 },
  { test: p => p.endsWith("hero-bg-jpg.jpg"), width: 1920, quality: 80 },
  { test: p => p.includes("title.webp"), width: null, quality: 80 },
];

const files = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !f.name.startsWith(".")) walk(full);
    else if (/\.(webp|jpg|jpeg)$/i.test(f.name)) files.push(full);
  }
}
walk(baseDir);

(async () => {
  let totalOrig = 0, totalNew = 0, done = 0;
  for (const fp of files) {
    const rule = rules.find(r => r.test(fp));
    if (!rule) continue;
    const stat = fs.statSync(fp);
    totalOrig += stat.size;
    try {
      let pipeline = sharp(fp);
      if (rule.width) pipeline = pipeline.resize({ width: rule.width, withoutEnlargement: true });
      const ext = path.extname(fp).toLowerCase();
      if (ext === ".webp") pipeline = pipeline.webp({ quality: rule.quality, effort: 4 });
      else pipeline = pipeline.jpeg({ quality: rule.quality, mozjpeg: true });
      const buf = await pipeline.toBuffer();
      fs.writeFileSync(fp, buf);
      totalNew += buf.length;
      done++;
      const pct = Math.round((1 - buf.length/stat.size) * 100);
      const rel = path.relative(baseDir, fp);
      if (done <= 8 || done % 20 === 0) console.log(`${rel.padEnd(45)} ${(stat.size/1024).toFixed(1)}KB->${(buf.length/1024).toFixed(1)}KB(-${pct}%)`);
    } catch(e) {
      console.log(`X ${path.relative(baseDir, fp)}: ${e.message}`);
    }
  }
  console.log(`\nDone: ${done}/${files.length}`);
  console.log(`Original: ${(totalOrig/1024/1024).toFixed(2)} MB`);
  console.log(`Compressed: ${(totalNew/1024/1024).toFixed(2)} MB`);
  console.log(`Saved: ${((totalOrig-totalNew)/1024/1024).toFixed(2)} MB (${Math.round((1-totalNew/totalOrig)*100)}%)`);
})();
