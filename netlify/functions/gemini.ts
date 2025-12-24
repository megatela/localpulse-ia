import type { Handler } from "@netlify/functions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  if (!OPENROUTER_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENROUTER_API_KEY no configurada" })
    };
  }

  try {
    const { data, coords, mode } = JSON.parse(event.body || "{}");

    /* =========================================================
       SYSTEM / DEVELOPER PROMPT (ANTI-ALUCINACIÓN – DEFINITIVO)
       ========================================================= */
    const systemPrompt = `
Eres un auditor profesional de SEO local especializado en Google Business Profile (GBP).

REGLAS ABSOLUTAS (NO VIOLABLES):
1. NO inventes datos.
2. NO simules acceso a Google Business Profile.
3. NO afirmes que un atributo, post, insight o métrica existe si no es información pública verificable.
4. Si una información requiere acceso interno al GBP, debes indicarlo explícitamente.
5. Usa únicamente:
   - Información proporcionada por el usuario
   - Datos públicos típicos visibles en Google (SERP)
6. Nunca “asumas” resultados.
7. Nunca uses lenguaje ambiguo.
8. Declara limitaciones cuando existan.

IMPORTANTE:
Esta es una auditoría REAL basada en SEO local público, NO una simulación.

Si algo requiere gestión profesional del perfil, debes marcarlo como:
"Requiere acceso directo al perfil de Google Business".

MODO DE FUNCIONAMIENTO:
- DEMO: análisis limitado, advertir restricciones
- FULL: análisis completo público + checklist accionable

IDIOMA: Español
FORMATO: Devuelve exclusivamente JSON válido
    `.trim();

    /* =========================
       USER PROMPT (DATOS REALES)
       ========================= */
    const userPrompt = `
NEGOCIO:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Categoría declarada: ${data.category}
- Descripción actual: ${data.description}
- Web: ${data.website || "No proporcionada"}
- Tiene fotos: ${data.hasPhotos ? "Sí" : "No"}
- Tiene reseñas: ${data.hasReviews ? "Sí" : "No"}
- Coordenadas: ${coords ? `${coords.lat}, ${coords.lng}` : "No proporcionadas"}

MODO: ${mode || "DEMO"}

OBJETIVO:
Realizar una auditoría SEO local REAL del perfil de Google Business enfocada en visibilidad, relevancia y proximidad.

DEVUELVE ESTE JSON EXACTO:

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
  "attributes": string[],
  "descriptionOptimization": string,
  "actionPlan": {
    "title": string,
    "impact": "High" | "Medium" | "Low",
    "description": string,
    "requiresProfessionalAccess": boolean
  }[],
  "limitations": string[],
  "sources": {
    "title": string,
    "uri": string
  }[]
}
    `.trim();

    /* ======================
       OPENROUTER REQUEST
       ====================== */
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://legendary-crostata-cc8b9b.netlify.app",
        "X-Title": "LocalPulse IA"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const json = await response.json();

    if (!json.choices?.[0]?.message?.content) {
      throw new Error("Respuesta inválida del modelo");
    }

    // Parseo estricto del JSON devuelto por la IA
    const parsed = JSON.parse(json.choices[0].message.content);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    };

  } catch (error: any) {
    console.error("❌ Gemini/OpenRouter Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "No se pudo generar la auditoría con IA",
        details: error.message
      })
    };
  }
};
