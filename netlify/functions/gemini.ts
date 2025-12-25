import type { Handler } from "@netlify/functions";

const SYSTEM_PROMPT = `
Eres un auditor profesional de SEO Local especializado en Google Business Profile.
NO inventes datos.
NO asumas acceso a información privada.
Si faltan datos (ubicación, reviews, etc), debes indicarlo claramente y continuar en modo limitado.
Entrega siempre recomendaciones accionables, honestas y realistas.
`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY no configurada");
    }

    const { data, coords } = JSON.parse(event.body || "{}");

    const hasCoords = coords?.lat && coords?.lng;

    const userPrompt = `
Negocio: ${data?.businessName || "No especificado"}
Ciudad: ${data?.city || "No especificada"}
Categoría: ${data?.category || "No especificada"}
Descripción actual: ${data?.description || "No proporcionada"}

Ubicación del usuario:
${hasCoords ? `Lat ${coords.lat}, Lng ${coords.lng}` : "NO DISPONIBLE (modo DEMO)"}

Instrucciones:
- Si no hay ubicación, indica claramente que el análisis es limitado.
- NO inventes competidores.
- Sugiere keywords locales realistas.
- Indica qué falta para una auditoría 5 estrellas.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error: ${errText}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Respuesta vacía de IA");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: hasCoords ? "FULL" : "DEMO",
        warning: hasCoords
          ? null
          : "Modo limitado: sin ubicación no es posible un análisis competitivo real.",
        audit: content
      })
    };

  } catch (error: any) {
    console.error("Gemini Function Error:", error.message);

    return {
      statusCode: 200, // ⚠️ IMPORTANTE: NO 500
      body: JSON.stringify({
        mode: "DEMO",
        error: "No se pudo ejecutar la auditoría completa",
        message:
          "La auditoría se ejecutó en modo limitado. Para resultados completos, permite la ubicación o inténtalo más tarde."
      })
    };
  }
};
