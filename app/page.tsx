import TodoApp from "./components/TodoApp";
import { getTodos } from "@/lib/db";

export default function Home() {
  const todos = getTodos();
  return <TodoApp initialTodos={todos} />;
}
