/**
 * AI Service - Centralized AI operations
 * Refactored to call server-side API routes for security and reliability
 */

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
 * Generic helper to call the Gemini API via server route
 */
async function callGeminiAPI(prompt: string, context?: any): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI request failed');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}

/**
 * Generate product description
 */
export async function generateProductDescription(input: string | AIProductDescription): Promise<string> {
  const prompt = typeof input === 'string'
    ? `Generate an engaging product description in Thai and English for this product image context: "${input}". Make it persuasive and highlight key features. Format as JSON with "th" and "en" keys.`
    : `Generate an engaging product description in Thai and English for a product with:
- Name: ${input.name}
- Category: ${input.category}
- Features: ${input.features?.join(', ') || 'Not specified'}
- Target Audience: ${input.targetAudience || 'General'}

Make it persuasive and highlight key features. Format as JSON with "th" and "en" keys.`;

  try {
    const text = await callGeminiAPI(prompt);
    try {
      const parsed = JSON.parse(text);
      return parsed.th || parsed.en || text;
    } catch {
      return text;
    }
  } catch (error) {
    console.error('AI description generation failed:', error);
    return 'Failed to generate description';
  }
}

/**
 * AI Chat for product assistance
 */
export async function getAIChatResponse(
  messages: AIChatMessage[],
  products: any[],
  userContext?: { tier?: string; recentViews?: string[] }
): Promise<string> {
  const productContext = products.slice(0, 15).map(p =>
    `- ${p.name} (฿${p.price}): ${p.description} [ID: ${p.id || p.product_id}]`
  ).join('\n');

  const systemPrompt = `You are Pickpock Assistant, a professional and helpful shopping expert.
Available Products:
${productContext}
User Tier: ${userContext?.tier || 'MEMBER'}

CORE RULES:
1. If you mention a product, ALWAYS append [PRODUCT:id] tag. Example: "I suggest the Wireless Headphones [PRODUCT:p-101]".
2. Format your text with clear spacing and bullet points where appropriate.
3. Be concise. Don't repeat product details that are already in the card.
4. Primary language: Thai. Use English only if the user does.
5. Tone: Luxury but accessible, helpful and polite.`;

  const conversation = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
  const prompt = `${systemPrompt}\n\nConversation History:\n${conversation}\n\nAssistant:`;

  try {
    return await callGeminiAPI(prompt);
  } catch (error) {
    return 'ขออภัยครับ ผมกำลังมีปัญหาในการเชื่อมต่อข้อมูล กรุณาลองใหม่อีกครั้งนะครับ';
  }
}

/**
 * Smart search with AI
 */
export async function smartSearch(query: string, products: any[]): Promise<any[]> {
  const productNames = products.slice(0, 20).map(p => p.name).join(', ');
  const prompt = `Search query: "${query}". Products: ${productNames}. Return the IDs of 5 relevant products as a JSON array.`;

  try {
    const response = await callGeminiAPI(prompt);
    const ids = JSON.parse(response);
    return products.filter(p => ids.includes(p.id) || ids.includes(p.product_id));
  } catch {
    return products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }
}

/**
 * AI bundle recommendations
 */
export async function getBundleRecommendations(productId: string, products: any[]): Promise<any[]> {
  const mainProduct = products.find(p => p.id === productId || p.product_id === productId);
  if (!mainProduct) return [];

  const similarProducts = products
    .filter(p => p.id !== productId)
    .slice(0, 10)
    .map(p => p.name)
    .join(', ');

  const prompt = `For "${mainProduct.name}", suggest 3 complementary products from: ${similarProducts}. Return as JSON array of names.`;

  try {
    const response = await callGeminiAPI(prompt);
    const names = JSON.parse(response);
    return products.filter(p => names.includes(p.name)).slice(0, 3);
  } catch {
    return products.filter(p => p.category === mainProduct.category && p.id !== productId).slice(0, 3);
  }
}

/**
 * AI Sales Analysis
 */
export async function analyzeSalesAndPricing(
  productId: string,
  salesData: any[]
): Promise<AISalesAnalysis> {
  const prompt = `Analyze sales for product ${productId}: ${JSON.stringify(salesData.slice(-10))}. Suggest pricing and return JSON.`;

  try {
    const response = await callGeminiAPI(prompt);
    const analysis = JSON.parse(response);
    return {
      productId,
      currentPrice: 0,
      salesVelocity: 0,
      demandScore: 0,
      suggestedPrice: analysis.suggestedPrice || 0,
      reasoning: analysis.reasoning || 'Market conditions stable'
    };
  } catch {
    throw new Error('Failed to analyze sales data');
  }
}

/**
 * Analyze reviews
 */
export async function analyzeReviews(reviews: any[]): Promise<string> {
  if (reviews.length === 0) return 'No reviews available.';
  const reviewsText = reviews.slice(0, 5).map(r => r.comment).join('\n');
  const prompt = `Analyze these reviews and provide summary in Thai/English JSON: ${reviewsText}`;

  try {
    const response = await callGeminiAPI(prompt);
    const parsed = JSON.parse(response);
    return parsed.th || parsed.en || response;
  } catch {
    return 'Unable to analyze reviews.';
  }
}
