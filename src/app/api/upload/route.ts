import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const { image, name } = await req.json();
      if (!image) {
        return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
      }

      // If it's a data URL, we can write it to /public/uploads
      if (image.startsWith("data:image/")) {
        const matches = image.match(/^data:image\/([A-Za-z-+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          // If valid URL already, just return it
          return NextResponse.json({ url: image });
        }

        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const fileName = `tree-${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
      }

      return NextResponse.json({ url: image });
    }

    // Handle multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `tree-${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
