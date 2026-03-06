import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const {
            dressType,
            material,
            fabricSource,
            consumption,
            historicalOrders
        } = await request.json();

        // Build context from historical orders
        const historicalContext = historicalOrders.length > 0
            ? historicalOrders
                .slice(0, 10) // last 10 similar orders
                .map(o => `${o.dressType} (${o.material}): ₹${o.totalPrice}`)
                .join(', ')
            : 'No historical data available yet';

        const prompt = `You are a pricing assistant for a premium Indian tailoring boutique called StitchFlow.

A new order has come in with these details:
- Garment Type: ${dressType}
- Material: ${material}
- Fabric Source: ${fabricSource} (customer-provided or shop-provided)
- Fabric Consumption: ${consumption} meters

BASE PRICING GUIDELINES (Strict):
- Shirt: ₹600 - ₹900
- Pant: ₹700 - ₹1000
- Suit: ₹5500 - ₹8000
- Kurta: ₹500 - ₹800
- Safari: ₹1200 - ₹1800
- Sherwani: ₹8000 - ₹15000

HISTORICAL DATA (CAUTION):
${historicalContext}

CRITICAL INSTRUCTIONS:
1. The historical data provided may contain test values or wildly inaccurate prices (e.g., ₹10 or ₹50000 for a shirt).
2. If the historical prices deviate significantly from the BASE PRICING GUIDELINES, you MUST IGNORE the historical data entirely and base your suggestion strictly on the Base Guidelines.
3. Only use historical prices for minor adjustments if they fall reasonably close to the base ranges.
4. "shop-provided" fabric usually costs more than "customer-provided".
5. Premium materials (Silk, Linen, Wool) should lean toward the higher end of the base range.

Based on this information, suggest a fair stitching price in Indian Rupees.

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "suggestedPrice": 850,
  "minPrice": 700,
  "maxPrice": 1000,
  "reasoning": "One sentence explanation focusing on material, type, and source.",
  "confidence": "high"
}

confidence must be one of: "high", "medium", "low". (Use "high" if you relied on Base Guidelines, use "low" if historical data was confusing).
suggestedPrice, minPrice, maxPrice must be numbers only, no rupee symbol.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3, // low temp = consistent pricing
                        maxOutputTokens: 200,
                    }
                })
            }
        );

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean and parse JSON
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return NextResponse.json({ success: true, suggestion: parsed });

    } catch (error) {
        console.error('Price suggestion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate suggestion' },
            { status: 500 }
        );
    }
}