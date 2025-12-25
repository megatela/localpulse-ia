export default async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method Not Allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OpenRouter API Key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const {
      businessName,
      category,
      website,
      hasPhotos,
      hasReviews,
      sources,
      latitude,
      longitude,
      mode = "demo"
    } = body;

    const hasGeo =
      typeof latitude === "number" && typeof longitude === "number";

    const geoContext = hasGeo
      ? `Ubicación detectada: lat ${latitude}, lng ${longitude}.`
      : `Ubicación NO proporcionada. El análisis debe realizarse en modo limitado, sin inventar datos locales.`;

    const systemPrompt = `
Eres una IA experta en SEO Local y Google Business Profile.

REGLAS ABSOLUTAS:
- NO inventes datos.
- NO simules acceso interno a Google.
- NO asumas ubicación si no existe.
- Si faltan datos, dilo claramente.
- Prioriza precisión sobre completitud.
- Nunca alucines.

Modo DEMO: educativo, limitado.
Modo FULL: análisis avanzado con datos reales.
`;

    const userPrompt = `
Negocio: ${businessName}
Categoría: ${category}
Sitio web: ${website || "No proporcionado"}
Tiene fotos: ${hasPhotos ? "Sí" : "No"}
Tiene reseñas: ${hasReviews ? "Sí" : "No"}
Fuentes: ${sources || "No indicadas"}
Modo: ${mode.toUpperCase()}

${geoContext}

TAREA:
1. Evalúa el estado del perfil Google Business.
2. Indica si el análisis es limitado por falta de ubicación.
3. Da recomendaciones claras y accionables.
4. Sugiere keywords (genéricas si no hay ubicación).
5. Explica qué se necesita para alcanzar un perfil 5 estrellas.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-site.netlify.app",
          "X-Title": "Local SEO Audit AI"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: "AI provider error", details: text }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content;

    if (!output) {
      return new Response(
        JSON.stringify({
          error: "Empty AI response",
          message: "No se pudo generar la auditoría."
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        mode,
        hasGeo,
        audit: output
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Server Error",
        message: "No se pudo generar la auditoría con IA",
        details: error?.message || "Unknown error"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
