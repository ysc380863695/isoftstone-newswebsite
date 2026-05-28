import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import initSqlJs from 'sql.js';
import { __setDb, initSchema, queryAll, queryOne, run, saveDb } from './index.js';

describe('db', () => {
  before(async () => {
    const SQL = await initSqlJs();
    const mockDb = new SQL.Database();
    initSchema(mockDb);
    __setDb(mockDb);
  });

  describe('queryAll', () => {
    it('returns empty array for empty table', () => {
      const rows = queryAll('SELECT * FROM news');
      assert.equal(rows.length, 0);
    });

    it('returns all matching rows', () => {
      run("INSERT INTO news (title, source_url) VALUES (?, ?)", ['Multi A', 'http://test.com/ma']);
      run("INSERT INTO news (title, source_url) VALUES (?, ?)", ['Multi B', 'http://test.com/mb']);
      const rows = queryAll('SELECT * FROM news ORDER BY id');
      assert.equal(rows.length, 2);
      assert.equal(rows[0].title, 'Multi A');
      assert.equal(rows[1].title, 'Multi B');
    });
  });

  describe('queryOne', () => {
    it('returns first matching row', () => {
      const row = queryOne('SELECT title FROM news WHERE source_url = ?', ['http://test.com/ma']);
      assert.equal(row.title, 'Multi A');
    });

    it('returns null for no match', () => {
      const row = queryOne('SELECT * FROM news WHERE source_url = ?', ['nonexistent']);
      assert.equal(row, null);
    });
  });

  describe('run', () => {
    it('inserts row and returns changes and lastInsertRowid', () => {
      const result = run(
        "INSERT INTO news (title, source_url) VALUES (?, ?)",
        ['Run Test', 'http://test.com/run']
      );
      assert.equal(result.changes, 1);
      assert.equal(typeof result.lastInsertRowid, 'number');
      assert.ok(result.lastInsertRowid > 0);
    });

    it('updates row and returns changes count', () => {
      const result = run(
        "UPDATE news SET title = ? WHERE source_url = ?",
        ['Updated', 'http://test.com/run']
      );
      assert.equal(result.changes, 1);
    });
  });

  describe('saveDb', () => {
    it('does not crash when dbPath is null (test mode)', () => {
      // __setDb sets dbPath = null, so saveDb returns early without writing
      saveDb(); // should not throw
    });
  });
});
