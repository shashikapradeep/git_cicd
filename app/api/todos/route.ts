import { NextResponse } from "next/server";
import { addTodo, getTodos } from "@/lib/db";

export async function GET() {
  return NextResponse.json(getTodos());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { title?: string };
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 },
    );
  }

  const todo = addTodo(title);
  return NextResponse.json(todo, { status: 201 });
}
