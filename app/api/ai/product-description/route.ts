/**
 * AI Product Description Generator API
 * Generates product descriptions using Google Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function POST(request: NextRequest) {
  try {
    const { productName, category, features, imageContext, language = 'both' } = await request.json();

    if (!productName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // Build prompt
    let prompt = `Generate an engaging product description for:
- Product Name: ${productName}
- Category: ${category || 'General'}
- Key Features: ${features?.join(', ') || 'Not specified'}
${imageContext ? `- Image Context: ${imageContext}` : ''}

Requirements:
- Make it persuasive and highlight key benefits
- Include a catchy opening line
- Mention practical uses
- Keep it under 150 words
- ${language === 'th' ? 'Respond in Thai only' : language === 'en' ? 'Respond in English only' : 'Provide both Thai and English versions'}
- Format as JSON with keys: ${language === 'both' ? '"th", "en", "short"' : '"description"'}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

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
