import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `
      Context: ${JSON.stringify(context)}
      User Prompt: ${prompt}
      
      Please provide a concise and helpful response based on the context provided.
      Respond in Thai if the user asks in Thai.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
