import type { Handler } from "@netlify/functions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `
Eres un motor de auditoría SEO LOCAL para Google Business Profile.
NO inventes datos.
NO afirmes acceso a APIs privadas de Google.
Si falta información (ej. ubicación), debes indicarlo claramente.

Responde EXCLUSIVAMENTE en JSON válido, sin texto adicional.

Estructura OBLIGATORIA:
{
  "score": number,
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": string[],
  "keywords": string[],
  "competitors": {
    "name": string,
    "rating": number,
    "reviews": number
  }[]
}
`;

const DEMO_FALLBACK_AUDIT = {
  score: 55,
  summary:
    "Auditoría DEMO basada en señales públicas y mejores prácticas de SEO local. La precisión es limitada sin ubicación exacta.",
  strengths: [
    "Nombre del negocio definido",
    "Categoría principal identificada"
  ],
  weaknesses: [
    "Falta de optimización local precisa",
    "Pocas señales de autoridad (reseñas, posts)"
  ],
  recommendations: [
    "Optimizar la descripción con keywords locales",
    "Solicitar reseñas recientes a clientes",
    "Publicar actualizaciones semanales en Google Business Profile"
  ],
  keywords: [
    "negocio local en tu ciudad",
    "servicio cerca de mí"
  ],
  competitors: [
    { name: "Competidor Local A", rating: 4.6, reviews: 320 },
    { name: "Competidor Local B", rating: 4.4, reviews: 210 }
  ]
};

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY no configurada");
    }

    const body = JSON.parse(event.body || "{}");

    const {
      businessName,
      city,
      category,
      description,
      website,
      hasPhotos,
      hasReviews,
      location // { lat, lng } | null
    } = body;

    const hasLocation =
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number";

    const mode = hasLocation ? "full" : "demo";

    const userPrompt = `
Negocio: ${businessName || "No especificado"}
Ciudad declarada: ${city || "No especificada"}
Categoría: ${category || "No especificada"}
Descripción: ${description || "No especificada"}
Website: ${website || "No disponible"}
Tiene fotos: ${hasPhotos ? "Sí" : "No"}
Tiene reseñas: ${hasReviews ? "Sí" : "No"}

Ubicación exacta:
${hasLocation ? `Lat ${location.lat}, Lng ${location.lng}` : "NO DISPONIBLE"}

Modo: ${mode.toUpperCase()}

Genera la auditoría respetando estrictamente las limitaciones.
Si no hay ubicación exacta, haz recomendaciones generales sin fingir proximidad real.
`;

    let auditResult = DEMO_FALLBACK_AUDIT;
    let warnings: string[] = [];

    if (!hasLocation) {
      warnings.push(
        "Ubicación no concedida. El análisis se ejecuta en modo DEMO con precisión limitada."
      );
    }

    try {
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2
        })
      });

      const aiData = await aiResponse.json();
      const rawContent =
        aiData?.choices?.[0]?.message?.content;

      if (rawContent) {
        auditResult = JSON.parse(rawContent);
      }
    } catch (aiError) {
      warnings.push(
        "La IA no pudo generar la auditoría completa. Se usó un resultado seguro de respaldo."
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        mode,
        audit: auditResult,
        warnings
      })
    };
  } catch (error: any) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        mode: "demo",
        audit: DEMO_FALLBACK_AUDIT,
        warnings: [
          "Error interno controlado. Se mostró una auditoría de respaldo."
        ]
      })
    };
  }
};
