import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json(
        { error: "กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env" },
        { status: 500 }
      );
    }

    const { prompt, context, stream = false } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const fullPrompt = `You are an intelligent assistant for "PICKPOCK FOUNDER" E-commerce platform.

Context: ${JSON.stringify(context)}

Instruction: ${prompt}

Respond in ${context?.language || 'Thai'}. Be professional, concise, and actionable. Use natural business vocabulary, not generic "AI-sounding" phrases.`;

    if (stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const response = await ai.models.generateContentStream({
              model: 'gemini-2.5-flash',
              contents: fullPrompt
            });

            for await (const chunk of response) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
