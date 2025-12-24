import type { Handler } from "@netlify/functions";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_MODEL = "google/gemini-pro";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed",
      };
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
      coords, // { lat, lng } | undefined
      mode = "DEMO", // DEMO | FULL
    } = body;

    /* =========================
       SYSTEM / DEVELOPER PROMPT
       ========================= */
    const systemPrompt = `
Eres un auditor profesional de SEO Local especializado en Google Business Profile (GBP).

REGLAS ABSOLUTAS (OBLIGATORIAS):
1. Responde EXCLUSIVAMENTE con JSON válido.
2. NO incluyas texto fuera del JSON.
3. NO agregues comentarios ni explicaciones.
4. NO simules accesos internos a Google Business Profile.
5. NO inventes métricas, datos internos ni insights privados.
6. Si no tienes datos suficientes, indícalo explícitamente dentro del JSON.
7. Nunca devuelvas errores por falta de datos.

UBICACIÓN GEOGRÁFICA:
- Si las coordenadas NO están disponibles:
  - La auditoría DEBE continuar.
  - Marca el análisis como "limited".
  - Reduce el score si corresponde.
  - Incluye un mensaje UX claro indicando modo limitado.
  - NO falles.
  - NO muestres advertencias fuera del JSON.

ACCESOS PROFESIONALES:
- Todo lo que requiera acceso real al perfil GBP debe marcarse como:
  "requiresProfessionalAccess": true

IDIOMA: Español
FORMATO: JSON ESTRICTO
`.trim();

    /* =================
       USER PROMPT
       ================= */
    const userPrompt = `
DATOS DEL NEGOCIO:
- Nombre: ${businessName}
- Ciudad: ${city}
- Categoría: ${category}
- Descripción actual: ${description}
- Sitio web: ${website || "No disponible"}
- Tiene fotos: ${hasPhotos ? "Sí" : "No"}
- Tiene reseñas: ${hasReviews ? "Sí" : "No"}
- Coordenadas: ${
      coords ? `${coords.lat}, ${coords.lng}` : "NO_DISPONIBLES"
    }
- Modo de la aplicación: ${mode}

OBJETIVO:
Realizar una auditoría SEO Local REALISTA del perfil Google Business Profile
basada únicamente en información pública, contexto local y mejores prácticas SEO.

ENTREGABLE:
Devuelve un JSON con la siguiente estructura EXACTA:

{
  "mode": "DEMO | FULL",
  "analysisLevel": "full | limited",
  "uxMessage": "string",
  "score": number,
  "limitations": string[],
  "keywords": string[],
  "categorySuggestions": string[],
  "attributeSuggestions": string[],
  "reviewsAnalysis": {
    "status": "good | average | poor",
    "recommendation": string
  },
  "competitors": [
    {
      "name": string,
      "category": string,
      "strength": string
    }
  ],
  "requiresProfessionalAccess": boolean,
  "professionalServicesAvailable": string[]
}

REGLAS:
- Si Coordenadas = NO_DISPONIBLES:
  - analysisLevel = "limited"
  - uxMessage debe advertir modo limitado
  - competitors debe basarse solo en estimaciones públicas
`.trim();

    /* =========================
       LLAMADA A OPENROUTER
       ========================= */
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://tu-sitio.netlify.app",
        "X-Title": "GBP Local Audit SaaS",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const json = await response.json();
    const rawContent = json?.choices?.[0]?.message?.content;

    /* =========================
       BLINDAJE ANTI-CAÍDA TOTAL
       ========================= */
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.error("Respuesta inválida de la IA:", rawContent);
      throw new Error("La IA no devolvió JSON válido");
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };

  } catch (error: any) {
    console.error("Error en auditoría:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "No se pudo generar la auditoría con IA",
      }),
    };
  }
};
