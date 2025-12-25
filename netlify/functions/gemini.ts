import type { Handler } from "@netlify/functions";

const SYSTEM_PROMPT = `
Eres un auditor profesional de SEO Local especializado en Google Business Profile.
Reglas estrictas:
- NO inventes datos.
- Si falta información (ubicación, reseñas, etc.), indícalo claramente.
- Diferencia explícitamente entre DEMO y FULL.
- En DEMO sin ubicación, genera recomendaciones generales sin fingir proximidad.
- Nunca alucines competencia, métricas o posiciones.
- Responde siempre en español claro y estructurado.
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
      mode = "demo", // demo | full
    } = body;

    if (!businessName || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Datos insuficientes para la auditoría",
        }),
      };
    }

    const locationText = location?.lat && location?.lng
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

Entrega:
1. Evaluación general
2. Qué falta para ser un perfil 5 estrellas
3. Recomendaciones accionables
4. Keywords sugeridas (explica dónde implementarlas)
5. Advertencias claras si el análisis es limitado
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        mode,
        limited: !location,
        result: data.choices?.[0]?.message?.content || "Sin respuesta",
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Fallo en el servidor",
        detail: error.message,
      }),
    };
  }
};
