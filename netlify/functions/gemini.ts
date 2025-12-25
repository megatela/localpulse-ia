import type { Handler } from "@netlify/functions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * SYSTEM / DEVELOPER PROMPT
 * NUNCA generar texto fuera del JSON.
 * NUNCA inventar datos reales.
 * NUNCA asumir acceso a Google Business Profile.
 */
const SYSTEM_PROMPT = `
Eres una IA experta en auditoría SEO local REAL para perfiles de Google Business Profile (GBP).

REGLAS ABSOLUTAS (NO NEGOCIABLES):
1. Responde ÚNICAMENTE con JSON válido.
2. NO incluyas texto fuera del JSON.
3. NO inventes datos reales (reviews, posiciones, competidores, métricas).
4. Si un dato no está disponible, usa null y explica la limitación en "limitations".
5. NO simules acceso interno a Google Business Profile.
6. Si no hay coordenadas (lat/lng), el análisis debe ser limitado y explícito.
7. No alucines fuentes. Si no hay fuentes reales, devuelve [].
8. El objetivo es orientar al negocio con recomendaciones accionables y honestas.

CONTEXTO DEL PRODUCTO:
- Modo DEMO: sin login, puede no tener ubicación, análisis limitado.
- Modo FULL: con login, ubicación obligatoria, análisis completo.
- Esta auditoría NO gestiona el perfil ni accede a insights internos sin autorización explícita.

FORMATO DE RESPUESTA (OBLIGATORIO):

{
  "mode": "demo" | "full",
  "locationStatus": "precise" | "missing",
  "summary": {
    "businessName": string,
    "score": number,
    "headline": string
  },
  "keywords": {
    "explanation": string,
    "items": [
      {
        "keyword": string,
        "whereToUse": "title" | "description" | "posts"
      }
    ]
  },
  "strategicPlan": [
    {
      "title": string,
      "action": string,
      "impact": "alto" | "medio" | "bajo"
    }
  ],
  "optimizedDescription": string | null,
  "limitations": string[],
  "upgradeMessage": string | null,
  "sources": []
}

Si locationStatus = "missing":
- score debe ser bajo (<=40)
- optimizedDescription puede ser null
- keywords deben ser genéricas (sin barrios específicos)
- incluir mensaje claro explicando la limitación

Si locationStatus = "precise":
- personaliza keywords con ciudad/zona
- recomendaciones más específicas
- score puede ser más alto

RECUERDA:
Precisión > apariencia.
Honestidad > marketing.
JSON estricto SIEMPRE.
`;

export const handler: Handler = async (event) => {
  try {
    if (!OPENROUTER_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENROUTER_API_KEY no configurada"
        })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const {
      businessName,
      category,
      city,
      lat,
      lng,
      mode
    } = body;

    const hasLocation =
      typeof lat === "number" &&
      typeof lng === "number";

    const resolvedMode = mode === "full" ? "full" : "demo";

    const userPrompt = `
DATOS DEL NEGOCIO:
- Nombre: ${businessName || "No especificado"}
- Categoría: ${category || "No especificada"}
- Ciudad: ${city || "No especificada"}
- Latitud: ${hasLocation ? lat : "NO DISPONIBLE"}
- Longitud: ${hasLocation ? lng : "NO DISPONIBLE"}

INSTRUCCIONES:
Genera una auditoría SEO local siguiendo estrictamente el formato definido.
Respeta las limitaciones si no hay ubicación.
No inventes datos reales.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localpulseia.app",
        "X-Title": "LocalPulseIA"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Respuesta vacía del modelo");
    }

    // Parseo seguro del JSON
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          mode: resolvedMode,
          locationStatus: hasLocation ? "precise" : "missing",
          summary: {
            businessName: businessName || "Negocio",
            score: 0,
            headline: "No se pudo generar el análisis"
          },
          keywords: {
            explanation: "Error al procesar la respuesta de IA.",
            items: []
          },
          strategicPlan: [],
          optimizedDescription: null,
          limitations: [
            "Error interno al interpretar la respuesta de la IA."
          ],
          upgradeMessage: resolvedMode === "demo"
            ? "Activa el modo completo para obtener una auditoría real con ubicación precisa."
            : null,
          sources: []
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };

  } catch (error: any) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: "demo",
        locationStatus: "missing",
        summary: {
          businessName: "Negocio",
          score: 0,
          headline: "No se pudo generar la auditoría"
        },
        keywords: {
          explanation: "La auditoría falló por un error interno.",
          items: []
        },
        strategicPlan: [],
        optimizedDescription: null,
        limitations: [
          "Error del servidor",
          "La IA no pudo procesar la solicitud"
        ],
        upgradeMessage:
          "Intenta nuevamente o activa el modo completo con ubicación para un análisis real.",
        sources: []
      })
    };
  }
};
