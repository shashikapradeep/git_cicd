import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDbPath = path.join(__dirname, "..", "data", "todos.db");

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

function getTodos(db) {
  const rows = db
    .prepare(
      "SELECT id, title, completed, created_at FROM todos ORDER BY id DESC",
    )
    .all();
  return rows.map((row) => ({ ...row, completed: row.completed === 1 }));
}

function addTodo(db, title) {
  const insert = db.prepare("INSERT INTO todos (title) VALUES (?)");
  const info = insert.run(title);
  const row = db
    .prepare("SELECT id, title, completed, created_at FROM todos WHERE id = ?")
    .get(info.lastInsertRowid);
  return { ...row, completed: row.completed === 1 };
}

function toggleTodo(db, id) {
  const existing = db.prepare("SELECT id FROM todos WHERE id = ?").get(id);
  if (!existing) return null;
  db
    .prepare(
    "UPDATE todos SET completed = CASE completed WHEN 1 THEN 0 ELSE 1 END WHERE id = ?",
    )
    .run(id);
  const row = db
    .prepare("SELECT id, title, completed, created_at FROM todos WHERE id = ?")
    .get(id);
  return { ...row, completed: row.completed === 1 };
}

function deleteTodo(db, id) {
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return result.changes > 0;
}

export function handleTodoRequest(req, res, db) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const { method = "GET" } = req;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (method === "GET" && url.pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (method === "GET" && url.pathname === "/todos") {
    sendJson(res, 200, getTodos(db));
    return;
  }

  if (method === "POST" && url.pathname === "/todos") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        const body = raw ? JSON.parse(raw) : {};
        const title = typeof body.title === "string" ? body.title.trim() : "";
        if (!title) {
          sendJson(res, 400, { error: "Title is required." });
          return;
        }
        sendJson(res, 201, addTodo(db, title));
      } catch {
        sendJson(res, 400, { error: "Invalid JSON body." });
      }
    });
    return;
  }

  const todoMatch = url.pathname.match(/^\/todos\/(\d+)$/);
  if (todoMatch) {
    const todoId = Number(todoMatch[1]);

    if (method === "PATCH") {
      const updated = toggleTodo(db, todoId);
      if (!updated) {
        sendJson(res, 404, { error: "Todo not found." });
        return;
      }
      sendJson(res, 200, updated);
      return;
    }

    if (method === "DELETE") {
      const removed = deleteTodo(db, todoId);
      if (!removed) {
        sendJson(res, 404, { error: "Todo not found." });
        return;
      }
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
      });
      res.end();
      return;
    }
  }

  sendJson(res, 404, { error: "Not found." });
}

export function createTodoServer({ dbPath } = {}) {
  const resolvedDbPath = dbPath || process.env.TODO_DB_PATH || defaultDbPath;
  const dbDir = path.dirname(resolvedDbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(resolvedDbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const server = http.createServer((req, res) => {
    handleTodoRequest(req, res, db);
  });

  server.on("close", () => {
    db.close();
  });

  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 4000);
  const server = createTodoServer();
  server.listen(port, () => {
    console.log(`Todo backend running on http://localhost:${port}`);
  });
}
