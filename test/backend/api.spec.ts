import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Database from "better-sqlite3";
import { handleTodoRequest } from "@/backend/server.mjs";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-api-test-"));
const tempDbPath = path.join(tempDir, "todos.api.test.db");
const db = new Database(tempDbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function clearTodos() {
  db.prepare("DELETE FROM todos").run();
}

function runRequest({
  method,
  url,
  body,
}: {
  method: string;
  url: string;
  body?: unknown;
}): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve) => {
    const req = new EventEmitter() as EventEmitter & {
      url: string;
      method: string;
      headers: { host: string };
    };

    req.url = url;
    req.method = method;
    req.headers = { host: "localhost:4000" };

    let statusCode = 200;
    let responseBody = "";

    const res = {
      writeHead(code: number) {
        statusCode = code;
      },
      end(content?: string) {
        if (typeof content === "string") {
          responseBody = content;
        }
        resolve({ statusCode, body: responseBody });
      },
    };

    handleTodoRequest(req, res as never, db);

    if (body !== undefined) {
      req.emit("data", JSON.stringify(body));
    }
    req.emit("end");
  });
}

test("GET /health returns ok", async () => {
  const response = await runRequest({ method: "GET", url: "/health" });
  const parsed = JSON.parse(response.body) as { status: string };

  assert.equal(response.statusCode, 200);
  assert.equal(parsed.status, "ok");
});

test("GET /todos returns empty list initially", async () => {
  clearTodos();
  const response = await runRequest({ method: "GET", url: "/todos" });
  const parsed = JSON.parse(response.body) as unknown[];

  assert.equal(response.statusCode, 200);
  assert.equal(parsed.length, 0);
});

test("POST /todos creates a todo", async () => {
  clearTodos();
  const response = await runRequest({
    method: "POST",
    url: "/todos",
    body: { title: "Backend API todo" },
  });
  const parsed = JSON.parse(response.body) as {
    title: string;
    completed: boolean;
  };

  assert.equal(response.statusCode, 201);
  assert.equal(parsed.title, "Backend API todo");
  assert.equal(parsed.completed, false);
});

test("PATCH /todos/:id toggles completion", async () => {
  clearTodos();
  const created = await runRequest({
    method: "POST",
    url: "/todos",
    body: { title: "Toggle from API" },
  });
  const createdTodo = JSON.parse(created.body) as { id: number };

  const patched = await runRequest({
    method: "PATCH",
    url: `/todos/${createdTodo.id}`,
  });
  const parsed = JSON.parse(patched.body) as { completed: boolean };

  assert.equal(patched.statusCode, 200);
  assert.equal(parsed.completed, true);
});

test("DELETE /todos/:id removes todo and returns 404 for missing todo", async () => {
  clearTodos();
  const created = await runRequest({
    method: "POST",
    url: "/todos",
    body: { title: "Delete from API" },
  });
  const createdTodo = JSON.parse(created.body) as { id: number };

  const deleted = await runRequest({
    method: "DELETE",
    url: `/todos/${createdTodo.id}`,
  });
  const deletedAgain = await runRequest({
    method: "DELETE",
    url: `/todos/${createdTodo.id}`,
  });
  const secondBody = JSON.parse(deletedAgain.body) as { error: string };

  assert.equal(deleted.statusCode, 204);
  assert.equal(deletedAgain.statusCode, 404);
  assert.equal(secondBody.error, "Todo not found.");
});
