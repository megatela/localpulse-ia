import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { data, coords } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no configurada");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ MODELO CORRECTO Y SOPORTADO
    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });

    const prompt = `
Devuelve EXCLUSIVAMENTE un JSON válido.

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

NEGOCIO:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Coordenadas: ${coords ? `${coords.lat}, ${coords.lng}` : "No"}
- Categoría: ${data.category}
- Descripción: ${data.description}
- Web: ${data.website || "No"}
- Fotos: ${data.hasPhotos ? "Sí" : "No"}
- Reseñas: ${data.hasReviews ? "Sí" : "No"}

REGLAS:
- Idioma ESPAÑOL
- No texto fuera del JSON
- SEO local real
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // ✅ Validación robusta
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Gemini devolvió JSON inválido");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Gemini Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
