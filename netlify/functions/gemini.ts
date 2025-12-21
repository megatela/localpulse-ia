import { GoogleGenAI } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { data, coords } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no definida");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
Eres un experto en SEO local y Google Business Profile.

Devuelve EXCLUSIVAMENTE un JSON válido con esta estructura:

{
  "score": number,
  "summary": string,
  "categories": {
    "primary": string,
    "suggested": string[]
  },
  "keywords": {
    "term": string,
    "placement": string
  }[],
  "descriptionOptimization": string,
  "actionPlan": {
    "title": string,
    "impact": "High" | "Medium" | "Low",
    "description": string
  }[]
}

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Coordenadas: ${coords ? `${coords.lat}, ${coords.lng}` : "No proporcionadas"}
- Categoría: ${data.category}
- Descripción actual: ${data.description}
- Web: ${data.website || "No"}
- Fotos: ${data.hasPhotos ? "Sí" : "No"}
- Reseñas: ${data.hasReviews ? "Sí" : "No"}

REGLAS:
- Idioma: ESPAÑOL
- Solo JSON válido
- Sin texto extra
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = response.text;

    // 🔐 Validación robusta
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Respuesta no contiene JSON válido");
    }

    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("❌ Gemini Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
};
