import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Product } from "@/types";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const query = body.query as string;
    const products = body.products as Product[];

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Optimized: Create compact product list for faster processing
    const compactProducts = products.map((p) => ({
      i: p.id,
      n: p.name,
      c: p.category,
      p: p.price
    }));

    const ai = new GoogleGenAI({ apiKey });

    // Optimized: More concise prompt for faster processing
    const prompt = `AI Search - Query: "${query}"

Products: ${JSON.stringify(compactProducts)}

Return ONLY JSON array of matching product IDs (most relevant first). Example: ["p1", "p3"]. Empty array if no matches: []`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp', // Using stable model name from codebase
      contents: prompt
    });

    let text = response.text?.trim() || "";

    // Clean up potential markdown formatting from Gemini
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/, '').replace(/```\n?$/, '');
    }

    let matchedIds: string[] = [];
    try {
      matchedIds = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json({ matchedIds: [] });
    }

    return NextResponse.json({ matchedIds });
  } catch (error) {
    const err = error as Error;
    console.error("AI Search Error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบค้นหา AI" },
      { status: 500 }
    );
  }
}
