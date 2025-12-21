export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { data, coords } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY no definida");
    }

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
- Respuesta accionable
- NO incluyas texto fuera del JSON
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      throw new Error("Error en OpenRouter");
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Respuesta vacía del modelo");
    }

    // Parseo robusto
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Respuesta no JSON:", text);
      throw new Error("La IA no devolvió JSON válido");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("❌ Gemini Function Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
