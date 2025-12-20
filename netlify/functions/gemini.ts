import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req: Request) => {
  // 🔐 Solo POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no está definida");
    }

    const body = await req.json();
    const { data, coords } = body;

    if (!data) {
      throw new Error("Payload inválido: falta data");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ MODELO ESTABLE Y SOPORTADO EN NETLIFY
    const model = genAI.getGenerativeModel({
    model: "models/gemini-1.0-pro",
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
- Respuesta accionable
- NO texto fuera del JSON
`;

    const result = await model.generateContent(prompt);

    const rawText = result.response.text();

    if (!rawText) {
      throw new Error("Gemini devolvió una respuesta vacía");
    }

    // 🧹 Limpieza defensiva (por si Gemini añade texto extra)
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Respuesta de Gemini no contiene JSON válido");
    }

    const cleanJson = rawText.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(cleanJson);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Gemini Function Error:", error);

    return new Response(
      JSON.stringify({
        error: "Error interno en la función Gemini",
        detail: error.message,
      }),
      { status: 500 }
    );
  }
};
