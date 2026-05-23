import { NextResponse } from "next/server";
import { deleteTodo, toggleTodo } from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: Request, { params }: Params) {
  const { id } = await params;
  const todoId = Number(id);

  if (Number.isNaN(todoId)) {
    return NextResponse.json({ error: "Invalid todo id." }, { status: 400 });
  }

  const todo = toggleTodo(todoId);
  if (!todo) {
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  }

  return NextResponse.json(todo);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const todoId = Number(id);

  if (Number.isNaN(todoId)) {
    return NextResponse.json({ error: "Invalid todo id." }, { status: 400 });
  }

  const removed = deleteTodo(todoId);
  if (!removed) {
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
