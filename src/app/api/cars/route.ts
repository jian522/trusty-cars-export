import { NextResponse } from "next/server";
import { listCars, createCar, type CarType, type CarRecord } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as CarType | null;
  const cars = listCars(type === "fuel" || type === "ne" ? type : undefined);
  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CarRecord;
  if (!body.type || (body.type !== "fuel" && body.type !== "ne")) {
    return NextResponse.json({ error: "type 必须是 fuel 或 ne" }, { status: 400 });
  }
  if (!body.id) {
    body.id = `${body.type}-${Date.now()}`;
  }
  const created = createCar(body);
  return NextResponse.json(created, { status: 201 });
}
