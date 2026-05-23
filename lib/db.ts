import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.TODO_DB_PATH ?? path.join(dataDir, "todos.db");

const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

export function getTodos(): Todo[] {
  const rows = db
    .prepare(
      "SELECT id, title, completed, created_at FROM todos ORDER BY id DESC",
    )
    .all() as Array<{
    id: number;
    title: string;
    completed: number;
    created_at: string;
  }>;

  return rows.map((row) => ({
    ...row,
    completed: row.completed === 1,
  }));
}

export function addTodo(title: string): Todo {
  const insert = db.prepare("INSERT INTO todos (title) VALUES (?)");
  const info = insert.run(title);
  const row = db
    .prepare("SELECT id, title, completed, created_at FROM todos WHERE id = ?")
    .get(info.lastInsertRowid) as {
    id: number;
    title: string;
    completed: number;
    created_at: string;
  };

  return {
    ...row,
    completed: row.completed === 1,
  };
}

export function toggleTodo(id: number): Todo | null {
  const existing = db
    .prepare("SELECT id FROM todos WHERE id = ?")
    .get(id) as { id: number } | undefined;

  if (!existing) {
    return null;
  }

  db.prepare(
    "UPDATE todos SET completed = CASE completed WHEN 1 THEN 0 ELSE 1 END WHERE id = ?",
  ).run(id);

  const row = db
    .prepare("SELECT id, title, completed, created_at FROM todos WHERE id = ?")
    .get(id) as {
    id: number;
    title: string;
    completed: number;
    created_at: string;
  };

  return {
    ...row,
    completed: row.completed === 1,
  };
}

export function deleteTodo(id: number): boolean {
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return result.changes > 0;
}
