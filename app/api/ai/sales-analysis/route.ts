/**
 * AI Sales Analysis API
 * Provides AI-powered sales insights and pricing recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import ordersJson from '@/lib/ecommerce_orders.json';
import productsJson from '@/lib/products.json';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Find product
    const product = productsJson.find((p: any) =>
      p.product_id === productId || p.id === productId
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get sales data for this product
    const productSales = ordersJson
      .filter((order: any) =>
        order.items.some((item: any) => item.product_id === productId)
      )
      .map((order: any) => ({
        date: order.timestamp,
        quantity: order.items.find((item: any) => item.product_id === productId)?.qty || 0,
        revenue: order.total_price
      }));

    const totalSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = productSales.reduce((sum, s) => sum + s.revenue, 0);
    const avgOrderValue = productSales.length > 0 ? totalRevenue / productSales.length : 0;

    // Calculate demand score
    const last30Days = productSales.filter(s => {
      const saleDate = new Date(s.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return saleDate >= thirtyDaysAgo;
    });
    const recentVelocity = last30Days.reduce((sum, s) => sum + s.quantity, 0) / 30;

    // Get AI analysis
    const prompt = `Analyze this product's sales performance and provide pricing strategy:
Product: ${product.name}
Current Price: ฿${product.price}
Stock: ${product.stock}
Total Sold: ${totalSold} units
Recent Sales Velocity (30 days): ${recentVelocity.toFixed(2)} units/day

Provide recommendations in JSON format:
{
  "demandLevel": "LOW" | "MEDIUM" | "HIGH",
  "suggestedAction": "MAINTAIN" | "INCREASE_PRICE" | "DECREASE_PRICE" | "RUN_PROMOTION",
  "suggestedPrice": <number>,
  "adjustmentPercent": <number>,
  "reasoning": "<brief explanation in Thai>",
  "promotionStrategy": "<if applicable, promotion idea in Thai>"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let analysis;
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      // Fallback analysis
      const demandLevel = recentVelocity > 2 ? 'HIGH' : recentVelocity > 0.5 ? 'MEDIUM' : 'LOW';
      analysis = {
        demandLevel,
        suggestedAction: demandLevel === 'HIGH' && product.stock < 20 ? 'INCREASE_PRICE' : 'MAINTAIN',
        suggestedPrice: product.price,
        adjustmentPercent: 0,
        reasoning: demandLevel === 'HIGH' ? 'ความต้องการสูง สามารถพิจารณาปรับราคาได้' : 'ความต้องการปกติ รักษาราคาไว้',
        promotionStrategy: null
      };
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.product_id || product.id,
        name: product.name,
        price: product.price,
        stock: product.stock
      },
      stats: {
        totalSold,
        totalRevenue,
        avgOrderValue,
        recentVelocity: recentVelocity.toFixed(2)
      },
      analysis
    });
  } catch (error) {
    console.error('Sales analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze sales data'
    }, { status: 500 });
  }
}
