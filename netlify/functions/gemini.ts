import type { Handler } from "@netlify/functions";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "anthropic/claude-3.5-sonnet";

/**
 * SYSTEM / DEVELOPER PROMPT
 * Define el comportamiento global de la IA (NO depende del usuario)
 */
const SYSTEM_PROMPT = `
Eres un motor de auditoría REAL de SEO Local especializado en Google Business Profile (GBP).

⚠️ NO es una simulación.
⚠️ NO es un ejemplo académico.
⚠️ NO inventes datos.
⚠️ NO suavices conclusiones.

Tu tarea es:
- Analizar negocios locales como lo haría un consultor SEO senior
- Pensar en términos de ranking local, proximidad, relevancia y prominencia
- Emitir recomendaciones ACCIONABLES y priorizadas

REGLAS ABSOLUTAS:
1. Idioma: ESPAÑOL
2. Devuelve EXCLUSIVAMENTE JSON válido (sin texto adicional)
3. Sé crítico: si algo está mal, dilo
4. Usa el contexto geográfico (lat/lng) como factor clave
5. No repitas explicaciones obvias
6. Optimiza para resultados reales en Google Maps

ESTRUCTURA DE SALIDA OBLIGATORIA:

{
  "score": number (0-100),
  "businessName": string,
  "summary": string,
  "categories": {
    "primary": string,
    "suggested": string[]
  },
  "keywords": {
    "term": string,
    "placement": string
  }[],
  "attributes": string[],
  "descriptionOptimization": string,
  "actionPlan": {
    "title": string,
    "impact": "High" | "Medium" | "Low",
    "description": string
  }[],
  "competitors": {
    "name": string,
    "strengths": string[],
    "weaknesses": string[]
  }[]
}
`;

/**
 * Netlify Function
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { data, coords, mode } = JSON.parse(event.body || "{}");

    if (!data || !coords) {
      throw new Error("Datos insuficientes para auditoría real");
    }

    /**
     * USER PROMPT (dinámico)
     * Contiene SOLO datos del negocio
     */
    const USER_PROMPT = `
MODO DE USO: ${mode === "FULL" ? "FULL (usuario de pago)" : "DEMO (limitado)"}

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Coordenadas exactas: ${coords.lat}, ${coords.lng}
- Categoría actual: ${data.category}
- Descripción actual: ${data.description}
- Sitio web: ${data.website || "No disponible"}
- Tiene fotos: ${data.hasPhotos ? "Sí" : "No"}
- Tiene reseñas: ${data.hasReviews ? "Sí" : "No"}

INSTRUCCIONES ESPECÍFICAS:
- Analiza el posicionamiento local REAL basado en proximidad
- Detecta debilidades frente a competidores cercanos
- Sugiere keywords GEOLOCALIZADAS
- Indica EXACTAMENTE dónde implementar cada keyword
- Si el modo es DEMO:
  - Reduce profundidad
  - Oculta parte del análisis competitivo
  - No entregues la optimización completa de la descripción
`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://legendary-crostata-cc8b9b.netlify.app",
        "X-Title": "LocalPulse IA",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT },
        ],
      }),
    });

    const json = await response.json();

    if (!json.choices?.[0]?.message?.content) {
      throw new Error("Respuesta inválida del modelo IA");
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: json.choices[0].message.content,
    };

  } catch (error: any) {
    console.error("❌ Gemini/OpenRouter Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Fallo en el servidor. Auditoría no generada.",
        detail: error.message,
      }),
    };
  }
};
