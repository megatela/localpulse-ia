import type { Handler } from "@netlify/functions";

const SYSTEM_PROMPT = `
Eres un auditor profesional de SEO Local especializado en Google Business Profile.

REGLAS ESTRICTAS:
- No inventes datos.
- No simules posiciones, métricas ni competidores reales.
- Si falta información, indícalo claramente.
- Diferencia DEMO vs FULL.
- Sin ubicación: análisis limitado, explícito.
- Responde siempre en español claro, estructurado y accionable.
`;

export const handler: Handler = async (event) => {
  try {
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
      location, // { lat, lng } | null
      mode = "demo",
    } = body;

    if (!businessName || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Datos insuficientes para la auditoría",
        }),
      };
    }

    const hasLocation =
      location && typeof location.lat === "number" && typeof location.lng === "number";

    const locationText = hasLocation
      ? `Ubicación detectada: lat ${location.lat}, lng ${location.lng}`
      : `Ubicación NO proporcionada. Ejecutar auditoría en modo DEMO limitado.`;

    const userPrompt = `
Audita el perfil de Google Business Profile con los siguientes datos:

Nombre del negocio: ${businessName}
Categoría: ${category}
Sitio web: ${website || "No proporcionado"}
Tiene fotos: ${hasPhotos ? "Sí" : "No"}
Tiene reseñas: ${hasReviews ? "Sí" : "No"}
Modo: ${mode.toUpperCase()}

${locationText}

ENTREGA OBLIGATORIA:
1. Evaluación general del perfil
2. Qué falta para ser un perfil 5 estrellas
3. Recomendaciones claras y accionables
4. Implementación de keywords (explicar dónde usar cada una)
5. Advertencia explícita si el análisis es limitado
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localpulse.ai",
        "X-Title": "LocalPulse IA",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        mode,
        limited: !hasLocation,
        result: data?.choices?.[0]?.message?.content || "Sin respuesta de IA",
      }),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Fallo en el servidor",
        detail: message,
      }),
    };
  }
};
