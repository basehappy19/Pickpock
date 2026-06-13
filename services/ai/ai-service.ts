/**
 * AI Service - Centralized AI operations
 * Handles product description generation, chat, recommendations, and sales analysis
 */

import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const genAI = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Type definitions
export interface AIProductDescription {
  name: string;
  category: string;
  features?: string[];
  targetAudience?: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AISalesAnalysis {
  productId: string;
  currentPrice: number;
  salesVelocity: number;
  demandScore: number;
  suggestedPrice: number;
  reasoning: string;
}

/**
 * Generate product description from image or basic info
 */
export async function generateProductDescription(input: string | AIProductDescription): Promise<string> {
  try {
    const prompt = typeof input === 'string'
      ? `Generate an engaging product description in Thai and English for this product image context: "${input}". Make it persuasive and highlight key features. Format as JSON with "th" and "en" keys.`
      : `Generate an engaging product description in Thai and English for a product with:
- Name: ${input.name}
- Category: ${input.category}
- Features: ${input.features?.join(', ') || 'Not specified'}
- Target Audience: ${input.targetAudience || 'General'}

Make it persuasive and highlight key features. Format as JSON with "th" and "en" keys.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return parsed.th || parsed.en || text;
    } catch {
      return text;
    }
  } catch (error) {
    console.error('AI description generation failed:', error);
    throw new Error('Failed to generate description');
  }
}

/**
 * Generate product descriptions in batch
 */
export async function generateBatchDescriptions(products: AIProductDescription[]): Promise<string[]> {
  const descriptions = await Promise.allSettled(
    products.map(p => generateProductDescription(p))
  );

  return descriptions.map((d, i) => {
    if (d.status === 'fulfilled') return d.value;
    console.error(`Failed to generate description for product ${i}`);
    return products[i].name + ' - สินค้าคุณภาพดี | Quality product';
  });
}

/**
 * AI Chat for product assistance
 */
export async function getAIChatResponse(
  messages: AIChatMessage[],
  products: any[],
  userContext?: { tier?: string; recentViews?: string[] }
): Promise<string> {
  try {
    const productContext = products.map(p =>
      `- ${p.name} (฿${p.price}): ${p.description} - Category: ${p.category}`
    ).join('\n');

    const systemPrompt = `You are a helpful shopping assistant for Pickpock, an e-commerce platform.

Available Products:
${productContext}

User Tier: ${userContext?.tier || 'MEMBER'} (VIP gets 10% discount)

Guidelines:
- Respond in the language the user uses (Thai or English)
- Recommend ONLY products from the list above
- Highlight features and benefits
- If user is VIP, mention their 10% discount
- Be concise but helpful
- If asking about products not in the list, suggest similar alternatives`;

    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `${systemPrompt}\n\nConversation:\n${conversation}\n\nassistant:`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('AI chat failed:', error);
    return 'Sorry, I\'m having trouble responding right now. Please try again.';
  }
}

/**
 * Smart search with AI
 */
export async function smartSearch(query: string, products: any[]): Promise<any[]> {
  try {
    const productNames = products.map(p => p.name).join(', ');
    const prompt = `Given the search query "${query}" and these available products: ${productNames}
Return the IDs of the 5 most relevant products as a JSON array. Consider:
- Exact matches
- Similar items in the same category
- Related items that complement the query`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const ids = JSON.parse(response);
      const relevantIds = Array.isArray(ids) ? ids : [];
      return products.filter(p => relevantIds.includes(p.id) || relevantIds.includes(p.product_id));
    } catch {
      // Fallback to basic search
      return products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
  } catch (error) {
    console.error('Smart search failed:', error);
    // Fallback to basic search
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * AI bundle recommendations
 */
export async function getBundleRecommendations(productId: string, products: any[]): Promise<any[]> {
  const mainProduct = products.find(p => p.id === productId || p.product_id === productId);
  if (!mainProduct) return [];

  try {
    const similarProducts = products
      .filter(p => p.id !== productId && p.product_id !== productId)
      .map(p => p.name)
      .join(', ');

    const prompt = `For the product "${mainProduct.name}" in category "${mainProduct.category}",
suggest 3 complementary products from this list: ${similarProducts}
Return as a JSON array of product names. Consider:
- Items that go well together (accessories, related items)
- Same category trends
- Popular combinations`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const names = JSON.parse(response);
      return products.filter(p =>
        names.includes(p.name) && (p.id !== productId && p.product_id !== productId)
      ).slice(0, 3);
    } catch {
      // Fallback: same category products
      return products
        .filter(p => p.category === mainProduct.category && p.id !== productId)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('Bundle recommendation failed:', error);
    return products
      .filter(p => p.category === mainProduct.category && p.id !== productId)
      .slice(0, 3);
  }
}

/**
 * AI Sales Analysis with price optimization
 */
export async function analyzeSalesAndPricing(
  productId: string,
  salesData: { date: string; quantity: number; revenue: number }[]
): Promise<AISalesAnalysis> {
  try {
    const recentSales = salesData.slice(-30); // Last 30 days
    const totalQuantity = recentSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = recentSales.reduce((sum, s) => sum + s.revenue, 0);
    const avgPrice = totalRevenue / totalQuantity || 0;

    // Calculate demand score
    const salesVelocity = totalQuantity / 30; // Per day
    const demandScore = Math.min(100, salesVelocity * 10);

    const prompt = `Analyze this product's sales data and suggest pricing:
- Current Price: ฿${avgPrice.toFixed(2)}
- Sales Velocity: ${salesVelocity.toFixed(2)} units/day
- Demand Score: ${demandScore.toFixed(0)}/100
- Last 30 days sales: ${JSON.stringify(recentSales)}

Recommend a price adjustment (+/- %) with reasoning. Consider:
- High demand + low stock = slight price increase
- Low demand = price decrease or promotion
- Steady sales = maintain current price

Return JSON with: suggestedPrice, adjustmentPercent, reasoning`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const analysis = JSON.parse(response);
      return {
        productId,
        currentPrice: avgPrice,
        salesVelocity,
        demandScore,
        suggestedPrice: analysis.suggestedPrice || avgPrice,
        reasoning: analysis.reasoning || 'Market conditions stable'
      };
    } catch {
      return {
        productId,
        currentPrice: avgPrice,
        salesVelocity,
        demandScore,
        suggestedPrice: avgPrice,
        reasoning: 'Unable to generate AI insights, current price maintained'
      };
    }
  } catch (error) {
    console.error('Sales analysis failed:', error);
    throw new Error('Failed to analyze sales data');
  }
}

/**
 * Generate review insights from customer reviews
 */
export async function analyzeReviews(reviews: Array<{ rating: number; comment: string }>): Promise<string> {
  if (reviews.length === 0) return 'No reviews available for analysis.';

  try {
    const reviewsText = reviews.map(r => `Rating: ${r.rating}/5 - "${r.comment}"`).join('\n');
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const prompt = `Analyze these customer reviews and provide a concise summary in Thai and English:
Average Rating: ${avgRating.toFixed(1)}/5

Reviews:
${reviewsText}

Provide:
1. Key positive points
2. Key negative points
3. Overall sentiment (positive/neutral/negative)
4. Recommendation for potential buyers

Keep it under 200 words. Format as JSON with "th" and "en" keys.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    try {
      const parsed = JSON.parse(response);
      return parsed.th || parsed.en || response;
    } catch {
      return response;
    }
  } catch (error) {
    console.error('Review analysis failed:', error);
    return 'Unable to analyze reviews at this time.';
  }
}
