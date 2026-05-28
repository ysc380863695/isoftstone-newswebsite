#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, initSchema, saveDb } from "../server/db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const imageMap = [
  { id: 48, cover_image: "/images/news/2026-04-24-nianbao.jpg" },
  { id: 49, cover_image: "/images/news/2026-01-13-qinghai.jpg" },
  { id: 50, cover_image: "/images/news/2026-02-06-baiqiang.png" },
  { id: 51, cover_image: "/images/news/2026-02-06-saerwaduo.jpg" },
  { id: 52, cover_image: "/images/news/2026-02-06-aiagent.png" },
  { id: 53, cover_image: "/images/news/2025-12-25-tianshu.jpg" },
  { id: 54, cover_image: "/images/news/2025-10-18-jilin.png" },
  { id: 55, cover_image: "/images/news/2025-10-30-sanjibao.jpg" },
  { id: 46, cover_image: "/images/news/2025-11-07-ruanyingti.jpg" },
  { id: 47, cover_image: "/images/news/2025-09-24-quanguo.png" },
];

async function main() {
  const db = await getDb(path.join(__dirname, "..", "data", "news.db"));
  await initSchema(db);

  for (const item of imageMap) {
    db.run("UPDATE news SET cover_image = ? WHERE id = ?", [item.cover_image, item.id]);
    console.log(`Article #${item.id}: cover_image set to ${item.cover_image}`);
  }

  saveDb();
  console.log(`All ${imageMap.length} cover images updated!`);
  setTimeout(() => process.exit(0), 2000);
}

main().catch(e => { console.error(e); process.exit(1); });
