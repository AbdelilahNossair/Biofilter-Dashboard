import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "harmonized_data.csv");
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");
  const data = lines.slice(1).map((line) => {
    const vals = line.split(",");
    const obj: Record<string, number> = {};
    headers.forEach((h, i) => {
      obj[h] = parseFloat(vals[i]);
    });
    return obj;
  });
  return NextResponse.json(data);
}
