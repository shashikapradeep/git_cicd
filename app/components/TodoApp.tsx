"use client";

import { FormEvent, useEffect, useState } from "react";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadTodos() {
      try {
        const response = await fetch(`${API_BASE_URL}/todos`);
        if (!response.ok) {
          throw new Error("Could not load todos.");
        }
        const data = (await response.json()) as Todo[];
        if (isActive) {
          setTodos(data);
        }
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Could not load todos.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadTodos();

    return () => {
      isActive = false;
    };
  }, []);

  async function onAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });

    if (!response.ok) {
      setError("Could not add todo.");
      return;
    }

    const newTodo = (await response.json()) as Todo;
    setTodos((prev) => [newTodo, ...prev]);
    setTitle("");
    setError("");
  }

  async function onToggleTodo(id: number) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PATCH",
    });
    if (!response.ok) {
      setError("Could not update todo.");
      return;
    }

    const updated = (await response.json()) as Todo;
    setTodos((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
    setError("");
  }

  async function onDeleteTodo(id: number) {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Could not delete todo.");
      return;
    }

    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-3xl font-semibold">Todo App</h1>
        <p className="mt-1 text-sm text-slate-500">Stored in SQLite</p>

        <form className="mt-6 flex gap-2" onSubmit={onAddTodo}>
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
            type="submit"
          >
            Add
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <ul className="mt-6 space-y-2">
          {loading && (
            <li className="rounded-md border border-slate-200 p-4 text-center text-slate-500">
              Loading todos...
            </li>
          )}
          {!loading && todos.length === 0 && (
            <li className="rounded-md border border-dashed border-slate-300 p-4 text-center text-slate-500">
              No todos yet.
            </li>
          )}
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between rounded-md border border-slate-200 p-3"
            >
              <button
                type="button"
                onClick={() => onToggleTodo(todo.id)}
                className={`text-left ${todo.completed ? "text-slate-400 line-through" : ""}`}
              >
                {todo.title}
              </button>
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-800"
                onClick={() => onDeleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
