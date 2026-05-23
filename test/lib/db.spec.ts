import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test, { beforeEach } from "node:test";
import { createRequire } from "node:module";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "todo-db-test-"));
const tempDbPath = path.join(tempDir, "todos.test.db");

process.env.TODO_DB_PATH = tempDbPath;

const require = createRequire(import.meta.url);
const { addTodo, deleteTodo, getTodos, toggleTodo } = require("@/lib/db");

beforeEach(() => {
  for (const todo of getTodos()) {
    deleteTodo(todo.id);
  }
});

test("returns an empty todo list when DB has no rows", () => {
  const todos = getTodos();
  assert.equal(todos.length, 0);
});

test("adds a todo with default completed=false", () => {
  const todo = addTodo("Write tests");
  assert.equal(todo.title, "Write tests");
  assert.equal(todo.completed, false);
  assert.ok(todo.id > 0);
});

test("returns todos in reverse insertion order", () => {
  const first = addTodo("First task");
  const second = addTodo("Second task");

  const todos = getTodos();
  assert.equal(todos.length, 2);
  assert.equal(todos[0].id, second.id);
  assert.equal(todos[1].id, first.id);
});

test("toggles a todo completion state", () => {
  const todo = addTodo("Toggle me");
  const toggled = toggleTodo(todo.id);

  assert.ok(toggled);
  assert.equal(toggled.completed, true);
});

test("deletes a todo and reports missing rows correctly", () => {
  const todo = addTodo("Delete me");

  assert.equal(deleteTodo(todo.id), true);
  assert.equal(deleteTodo(todo.id), false);
  assert.equal(toggleTodo(999999), null);
});
