/**
 * AI Product Description Generator API
 * Generates product descriptions using Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const genAI = new GoogleGenAI({ apiKey });
  let productName = '';
  try {
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json({ error: 'AI configuration error' }, { status: 500 });
    }
    const body = await request.json();
    productName = body.productName;
    const { category, features, imageContext, language = 'both' } = body;

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Refined Persuasive Prompt
    let prompt = `คุณคือผู้เชี่ยวชาญด้านการเขียนคำโฆษณา (Copywriter) มืออาชีพที่มีสไตล์การเขียนที่ทันสมัย น่าเชื่อถือ และเข้าถึงอารมณ์ลูกค้า
หน้าที่ของคุณคือเขียนคำบรรยายสินค้าสำหรับ:
- ชื่อสินค้า: ${productName}
- หมวดหมู่: ${category || 'สินค้าทั่วไป'}
- จุดเด่น: ${features?.join(', ') || 'คุณภาพพรีเมียม'}
${imageContext ? `- รายละเอียดจากรูปภาพ: ${imageContext}` : ''}

กลยุทธ์การเขียน:
1. พาดหัวที่หยุดสายตา: เริ่มต้นด้วยประโยคที่ดึงดูดความสนใจทันที
2. เน้นคุณประโยชน์ (Benefits): ไม่ใช่แค่บอกสเปค แต่บอกว่าชีวิตลูกค้าจะดีขึ้นอย่างไรเมื่อใช้สินค้านี้
3. ใช้อารมณ์ร่วม: สร้างความรู้สึกปรารถนาหรือแก้ปัญหา (Pain Point) ให้ลูกค้า
4. กระตุ้นการตัดสินใจ: มี Call to Action ที่นุ่มนวลแต่ทรงพลัง
5. การจัดรูปแบบ: ใช้การเว้นวรรคและการจัดย่อหน้าที่อ่านง่าย สบายตา (สำคัญมาก: ห้ามเขียนเป็นก้อนเดียว)

ข้อกำหนดทางเทคนิค:
- ความยาวไม่เกิน 150 คำ
- ${language === 'th' ? 'ตอบเป็นภาษาไทยเท่านั้น' : language === 'en' ? 'Respond in English only' : 'ให้ข้อมูลทั้งภาษาไทยและภาษาอังกฤษแยกกัน'}
- รูปแบบผลลัพธ์เป็น JSON ที่มีคีย์: ${language === 'both' ? '"th", "en", "short"' : '"description"'}
- ในส่วนของ "short" ให้เขียนสรุปสั้นๆ 1 ประโยคที่ทรงพลังที่สุด`;

    const result = await genAI.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });
    
    const text = result.text || '';

    try {
      // Try to parse JSON response
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, description: parsed });
    } catch {
      // If not JSON, return as plain text
      return NextResponse.json({
        success: true,
        description: {
          th: text,
          en: text,
          short: text.slice(0, 100) + '...'
        }
      });
    }
  } catch (error) {
    console.error('AI description generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate description',
      description: {
        th: `${productName} - สินค้าคุณภาพดีที่คุณไว้วางใจได้`,
        en: `${productName} - Quality product you can trust`
      }
    }, { status: 500 });
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: 'AI description service is running' });
}
