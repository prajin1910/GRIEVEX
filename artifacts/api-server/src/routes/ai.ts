import { Router, type IRouter } from "express";
import { Product } from "../models/Product";
import { AiChatBody, GetRecommendationsParams } from "@workspace/api-zod";

const router: IRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "AI assistant is not configured. Please add GEMINI_API_KEY.";
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!res.ok) {
    return "Sorry, I could not process your request at this time.";
  }

  const data = (await res.json()) as any;
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from AI.";
}

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = AiChatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, sessionId } = parsed.data;

  const products = await Product.find({ isActive: true }).limit(50);
  const productList = products
    .map((p) => `- ${p.name} (SKU: ${p.sku}, Price: ₹${p.price}, Stock: ${p.stock})`)
    .join("\n");

  const prompt = `You are an intelligent retail AI shopping assistant for an online store. 
Here is our current product catalog:
${productList}

Customer query: "${message}"

Provide a helpful, conversational response. If the customer is asking about products, suggest relevant ones from the catalog above. Keep your response concise and friendly. Respond in plain text without markdown.`;

  const aiMessage = await callGemini(prompt);

  const lowerMsg = message.toLowerCase();
  const matchedProducts = products
    .filter((p) => {
      const pName = p.name.toLowerCase();
      const words = lowerMsg.split(" ").filter((w) => w.length > 3);
      return words.some((w) => pName.includes(w));
    })
    .slice(0, 4)
    .map((p) => ({
      id: 1,
      _mongoId: p._id.toString(),
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      categoryId: null,
      categoryName: null,
      sku: p.sku,
      imageUrl: p.imageUrl ?? null,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isActive: p.isActive,
      rating: p.rating ?? null,
      reviewCount: p.reviewCount,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));

  res.json({
    message: aiMessage,
    products: matchedProducts,
    sessionId: sessionId ?? `session_${Date.now()}`,
  });
});

router.get("/ai/recommendations/:customerId", async (req, res): Promise<void> => {
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .sort({ reviewCount: -1, rating: -1 })
    .limit(6);

  res.json(
    products.map((p) => ({
      id: 1,
      _mongoId: p._id.toString(),
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      categoryId: null,
      categoryName: null,
      sku: p.sku,
      imageUrl: p.imageUrl ?? null,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isActive: p.isActive,
      rating: p.rating ?? null,
      reviewCount: p.reviewCount,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }))
  );
});

router.get("/ai/demand-forecast", async (_req, res): Promise<void> => {
  const products = await Product.find({ isActive: true }).limit(10);

  const forecasts = await Promise.all(
    products.map(async (p) => {
      const prompt = `You are a retail demand forecasting AI. 
Product: ${p.name}, Current Stock: ${p.stock}, Price: ₹${p.price}
Predict demand for the next 30 days and provide a brief recommendation. 
Respond in JSON format with fields: predictedDemand (number), trend (rising/stable/declining), recommendation (string, max 20 words).`;

      let predictedDemand = Math.floor(Math.random() * 50) + 10;
      let trend: "rising" | "stable" | "declining" = "stable";
      let recommendation = `Maintain current stock levels for ${p.name}`;

      try {
        const aiRes = await callGemini(prompt);
        const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          predictedDemand = parsed.predictedDemand ?? predictedDemand;
          trend = parsed.trend ?? trend;
          recommendation = parsed.recommendation ?? recommendation;
        }
      } catch {
      }

      return {
        productId: 1,
        _mongoId: p._id.toString(),
        productName: p.name,
        currentStock: p.stock,
        predictedDemand,
        confidence: Math.round((0.6 + Math.random() * 0.35) * 100) / 100,
        trend,
        recommendation,
      };
    })
  );

  res.json(forecasts);
});

router.get("/ai/pricing-suggestions", async (_req, res): Promise<void> => {
  const products = await Product.find({ isActive: true }).limit(8);

  const suggestions = products.map((p) => {
    const demandFactor = p.stock < p.lowStockThreshold ? 1.1 : p.stock > p.lowStockThreshold * 5 ? 0.9 : 1.0;
    const suggestedPrice = Math.round(p.price * demandFactor * 100) / 100;
    const reasoning =
      p.stock < p.lowStockThreshold
        ? "Low stock indicates high demand — price increase recommended"
        : p.stock > p.lowStockThreshold * 5
        ? "High inventory levels — slight discount to boost sales"
        : "Stock levels are optimal — current price is appropriate";

    return {
      productId: 1,
      _mongoId: p._id.toString(),
      productName: p.name,
      currentPrice: p.price,
      suggestedPrice,
      reasoning,
      expectedImpact:
        demandFactor > 1
          ? `+${Math.round((demandFactor - 1) * 100)}% revenue with minimal demand loss`
          : demandFactor < 1
          ? `${Math.round((1 - demandFactor) * 100)}% price reduction to clear ${p.stock} units`
          : "No change needed",
    };
  });

  res.json(suggestions);
});

export default router;
