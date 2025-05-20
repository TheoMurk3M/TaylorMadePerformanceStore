import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || "default_key",
  dangerouslyAllowBrowser: true 
});

// Get product recommendations based on a product description and other products
export async function getProductRecommendations(
  currentProduct: { name: string; description: string; category: string },
  otherProducts: Array<{ id: string; name: string; description: string; category: string }>
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a product recommendation expert for UTV aftermarket parts. Your task is to recommend similar or complementary products based on the current product a customer is viewing."
        },
        {
          role: "user",
          content: `
          Current product: ${currentProduct.name}
          Description: ${currentProduct.description}
          Category: ${currentProduct.category}
          
          Available products to recommend:
          ${otherProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`).join('\n')}
          
          Suggest 3-4 product IDs that would complement the current product or serve as alternatives. Return only the product IDs as a JSON array.
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.recommendations || [];
  } catch (error) {
    console.error("Failed to get AI recommendations:", error);
    return [];
  }
}

// Analyze product description to generate key features
export async function analyzeProductFeatures(productDescription: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a product description analyst. Extract the key technical features and benefits from UTV part descriptions in concise bullet points."
        },
        {
          role: "user",
          content: `Extract 3-5 key features or benefits from this UTV part description as concise bullet points:
          ${productDescription}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.features || [];
  } catch (error) {
    console.error("Failed to analyze product features:", error);
    return [];
  }
}

// Generate personalized shopping suggestions based on browsing history
export async function getPersonalizedSuggestions(
  browsingHistory: Array<{ name: string; category: string }>,
  availableProducts: Array<{ id: string; name: string; category: string }>
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a personalized shopping assistant for UTV parts. Suggest products based on a customer's browsing history."
        },
        {
          role: "user",
          content: `
          Customer's browsing history:
          ${browsingHistory.map(p => `Name: ${p.name}, Category: ${p.category}`).join('\n')}
          
          Available products to recommend:
          ${availableProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`).join('\n')}
          
          Suggest 3-5 product IDs that this customer might be interested in based on their browsing history. Return only the product IDs as a JSON array.
          `
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error("Failed to get personalized suggestions:", error);
    return [];
  }
}

export default openai;
