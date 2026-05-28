#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, initSchema, closeDb, saveDb } from "../server/db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const db = await getDb(path.join(__dirname, "..", "data", "news.db"));
  await initSchema(db);

  const jsonPath = process.env.TEMP + "/isoftstone-test/article-updates.json";
  const updates = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  for (const u of updates) {
    const plain = u.content.replace(/<[^>]+>/g, "").trim();
    db.run("UPDATE news SET content = ?, source_url = ? WHERE id = ?", [u.content, u.url, u.id]);
    console.log("Article #" + u.id + ": " + plain.length + " chars updated");
  }

  saveDb();
  console.log("All " + updates.length + " articles updated!");
  setTimeout(() => process.exit(0), 2000);
}

main().catch(e => { console.error(e); process.exit(1); });