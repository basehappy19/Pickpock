import { GoogleGenerativeAI } from "@google/generative-ai";
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

    const { query, products } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      คุณคือระบบ AI Smart Search สำหรับร้านค้า E-commerce
      
      เป้าหมายของคุณคือ: วิเคราะห์ความต้องการของลูกค้า (Query) และเลือก ID ของสินค้าที่ตรงกับความต้องการนั้นมากที่สุด จากรายการสินค้าที่กำหนดให้
      
      คำค้นหาของลูกค้า: "${query}"
      
      รายการสินค้าที่มี:
      ${JSON.stringify(products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price
      })), null, 2)}
      
      กฎการตอบกลับ:
      - ส่งกลับเป็น JSON Array ของ Product ID ที่ตรงกับความต้องการเท่านั้น
      - เรียงลำดับจากตรงความต้องการมากที่สุดไปน้อยที่สุด
      - ตัวอย่างผลลัพธ์: ["p1", "p3"]
      - หากไม่มีสินค้าที่ตรงเลย ให้ตอบเป็น Array ว่าง: []
      - ตอบเฉพาะ JSON เท่านั้น ห้ามมีคำอธิบายอื่น
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
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
  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในระบบค้นหา AI" },
      { status: 500 }
    );
  }
}
