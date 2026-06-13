import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env.local" },
        { status: 500 }
      );
    }

    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Optimized: More concise prompt structure
    const fullPrompt = `คุณคือผู้ช่วยอัจฉริยะสำหรับ "MSU FOUNDER" E-commerce

Context: ${JSON.stringify(context)}

คำสั่ง: ${prompt}

ตอบเป็นภาษาไทยสุภาพมืออาชีพ กระชับ เข้าใจง่าย นำไปใช้ได้จริง`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Updated to faster model
      contents: fullPrompt
    });

    const text = response.text;

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดภายในระบบ AI" },
      { status: 500 }
    );
  }
}
