export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { data, coords } = await req.json();

    const prompt = `
Eres un experto en SEO local y Google Business Profile.

Devuelve EXCLUSIVAMENTE un JSON válido con esta estructura:

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
  "descriptionOptimization": string,
  "actionPlan": {
    "title": string,
    "impact": "High" | "Medium" | "Low",
    "description": string
  }[]
}

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${data.businessName}
- Ciudad: ${data.city}
- Coordenadas: ${coords ? `${coords.lat}, ${coords.lng}` : "No proporcionadas"}
- Categoría: ${data.category}
- Descripción actual: ${data.description}
- Web: ${data.website || "No"}
- Fotos: ${data.hasPhotos ? "Sí" : "No"}
- Reseñas: ${data.hasReviews ? "Sí" : "No"}

REGLAS:
- Idioma: ESPAÑOL
- No texto fuera del JSON
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://legendary-crostata-cc8b9b.netlify.app",
        "X-Title": "LocalPulse AI"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Respuesta vacía del modelo");
    }

    // Validación fuerte de JSON
    const parsed = JSON.parse(text);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Gemini/OpenRouter Function Error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
