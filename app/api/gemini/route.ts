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

    const fullPrompt = `
      คุณคือผู้ช่วยอัจฉริยะสำหรับระบบ E-commerce ชื่อ "MSU FOUNDER"

      ข้อมูลบริบท (Context):
      ${JSON.stringify(context, null, 2)}

      คำสั่งจากผู้ใช้:
      ${prompt}

      คำแนะนำในการตอบ:
      1. ตอบเป็นภาษาไทยที่สุภาพ เป็นกันเอง และดูเป็นมืออาชีพแบบเจ้าของธุรกิจ (Founder)
      2. สรุปข้อมูลให้กระชับ เข้าใจง่าย และนำไปใช้งานได้จริง
      3. หากเป็นข้อมูลสินค้า ให้เน้นจุดเด่นที่ลูกค้าน่าจะชอบ
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
