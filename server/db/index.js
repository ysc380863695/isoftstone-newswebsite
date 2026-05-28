import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

let db = null;
let dbPath = null;
let saveTimer = null;
let dirty = false;
const SAVE_INTERVAL = 30_000; // 30 秒

export async function getDb(filePath) {
  if (db) return db;

  dbPath = filePath;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const SQL = await initSqlJs();

  // 如果数据库文件已存在则加载
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 外键约束
  db.run('PRAGMA foreign_keys = ON');

  // 启动定时批量保存
  saveTimer = setInterval(() => {
    if (dirty) {
      saveDb();
      dirty = false;
    }
  }, SAVE_INTERVAL);

  return db;
}

export function closeDb() {
  if (saveTimer) {
    clearInterval(saveTimer);
    saveTimer = null;
  }
  if (db) {
    // 优雅关闭: 确保最后一次保存
    saveDb();
    dirty = false;
    db.close();
    db = null;
  }
}

export function saveDb() {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// 标记脏位，由定时器统一保存
function markDirty() {
  dirty = true;
}

// 初始化表结构
export function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      category TEXT NOT NULL DEFAULT '公司动态',
      source TEXT,
      source_url TEXT NOT NULL,
      publish_date TEXT,
      cover_image TEXT,
      tags TEXT DEFAULT '[]',
      key_entities TEXT DEFAULT '{}',
      sentiment TEXT DEFAULT 'neutral',
      content_vector TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(source_url)
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news(publish_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_news_source ON news(source)');

  db.run(`
    CREATE TABLE IF NOT EXISTS crawl_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT DEFAULT (datetime('now')),
      finished_at TEXT,
      status TEXT NOT NULL DEFAULT 'running',
      articles_found INTEGER DEFAULT 0,
      articles_new INTEGER DEFAULT 0,
      error TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_session (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      sources TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_session(id)
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_chat_message_session ON chat_message(session_id)');

  // Schema 初始化后立即保存（启动阶段，非热路径）
  saveDb();
}

// 辅助：执行查询并返回对象数组
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// 辅助：执行查询返回单行
export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// 辅助：执行写操作（标记脏位，由定时器统一保存）
export function run(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  // last_insert_rowid 必须在任何其他查询之前获取
  const lastId = queryOne('SELECT last_insert_rowid() as id');
  markDirty();
  return {
    changes,
    lastInsertRowid: lastId ? lastId.id : null,
  };
}
