// netlify/functions/gemini.ts
import type { Handler } from "@netlify/functions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `
Eres un motor de auditoría SEO LOCAL REAL para perfiles de Google Business Profile.
NO SIMULAS datos. NO INVENTAS métricas. NO ALUCINAS.

REGLAS OBLIGATORIAS:
- Si un dato no puede determinarse, usa null y explica la limitación.
- Si no hay coordenadas, el modo es DEMO LIMITADO.
- Devuelve SIEMPRE un JSON válido, incluso ante errores.
- NO incluyas texto fuera del JSON.
- NO uses Markdown.

FORMATO DE RESPUESTA OBLIGATORIO (JSON ESTRICTO):

{
  "mode": "demo" | "full",
  "geo": {
    "lat": number | null,
    "lng": number | null,
    "precision": "alta" | "media" | "baja"
  },
  "summary": {
    "score": number,
    "level": "excelente" | "bueno" | "regular" | "critico",
    "explanation": string
  },
  "warnings": string[],
  "checklist": {
    "completo": string[],
    "incompleto": string[],
    "faltante": string[]
  },
  "keywords": {
    "actuales": string[],
    "recomendadas": string[],
    "implementacion": {
      "titulo": string[],
      "descripcion": string[],
      "posts": string[]
    }
  },
  "atributos": {
    "presentes": string[],
    "faltantes": string[]
  },
  "reviews": {
    "cantidad_estimada": number | null,
    "rating_estimado": number | null,
    "recomendaciones": string[]
  },
  "competidores": [
    {
      "nombre": string,
      "ventaja": string,
      "debilidad": string
    }
  ],
  "recomendaciones_priorizadas": string[]
}

Si la auditoría es DEMO:
- score máximo: 60
- competidores: máximo 2
- agregar warning claro de limitación por ubicación
`;

export const handler: Handler = async (event) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY no configurada");
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const body = JSON.parse(event.body || "{}");

    const {
      businessName,
      category,
      website,
      hasPhotos,
      hasReviews,
      lat,
      lng,
    } = body;

    const hasGeo =
      typeof lat === "number" && typeof lng === "number";

    const mode = hasGeo ? "full" : "demo";

    const userPrompt = `
Datos del negocio:
Nombre: ${businessName || "No especificado"}
Categoría: ${category || "No especificada"}
Sitio web: ${website || "No tiene"}
Tiene fotos: ${hasPhotos ? "Sí" : "No"}
Tiene reseñas: ${hasReviews ? "Sí" : "No"}

Ubicación:
Latitud: ${hasGeo ? lat : "No disponible"}
Longitud: ${hasGeo ? lng : "No disponible"}

Modo: ${mode.toUpperCase()}

Realiza la auditoría cumpliendo estrictamente el formato JSON indicado.
`;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-1.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error("Error al llamar a OpenRouter");
    }

    const aiJson = await aiResponse.json();
    const rawContent =
      aiJson?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Respuesta vacía del modelo");
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error("El modelo no devolvió JSON válido");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (error: any) {
    // FALLBACK ABSOLUTO — NUNCA PANTALLA BLANCA
    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: "demo",
        geo: { lat: null, lng: null, precision: "baja" },
        summary: {
          score: 0,
          level: "critico",
          explanation:
            "No fue posible generar la auditoría completa. Se activó el modo seguro.",
        },
        warnings: [
          "Error interno del servidor",
          "Auditoría limitada",
        ],
        checklist: {
          completo: [],
          incompleto: [],
          faltante: [],
        },
        keywords: {
          actuales: [],
          recomendadas: [],
          implementacion: {
            titulo: [],
            descripcion: [],
            posts: [],
          },
        },
        atributos: {
          presentes: [],
          faltantes: [],
        },
        reviews: {
          cantidad_estimada: null,
          rating_estimado: null,
          recomendaciones: [],
        },
        competidores: [],
        recomendaciones_priorizadas: [
          "Reintenta la auditoría",
          "Activa la ubicación para mayor precisión",
        ],
      }),
    };
  }
};
