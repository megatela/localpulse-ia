import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { data, coords } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no está configurada en Netlify");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash"
    });

    const prompt = `
Eres un experto en SEO local y Google Business Profile.

Devuelve EXCLUSIVAMENTE un JSON válido con la siguiente estructura:

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

    // 🔒 Limpieza defensiva ante markdown / texto extra
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Gemini devolvió texto no válido:", cleaned);
      throw new Error("Gemini no devolvió un JSON válido");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("🔥 Error en función Gemini:", error);

    return new Response(
      JSON.stringify({
        error: "Error procesando la auditoría con IA"
      }),
      { status: 500 }
    );
  }
};
