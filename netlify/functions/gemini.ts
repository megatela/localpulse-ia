import fetch from 'node-fetch';

const SYSTEM_PROMPT = `
Eres un sistema de auditoría SEO LOCAL REAL.
REGLAS CRÍTICAS:
- NO alucines datos.
- NO inventes proximidad si no hay coordenadas.
- Si no hay lat/lng: modo DEMO_LIMITADO.
- Explica claramente las limitaciones.
- Nunca afirmes acceso a datos internos de Google.
- Solo usa datos explícitamente proporcionados.
`;

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { coords, locationMode, ...input } = body;

    const isFull = coords && locationMode === 'FULL';

    const userPrompt = isFull
      ? `
Auditoría LOCAL REAL con coordenadas:
Lat: ${coords.lat}
Lng: ${coords.lng}

Negocio: ${input.businessName}
Ciudad declarada: ${input.city}

Realiza una auditoría SEO local comparativa basada en proximidad.
`
      : `
Auditoría SEO en MODO LIMITADO (SIN UBICACIÓN REAL).

IMPORTANTE:
- No asumir proximidad real.
- No simular competencia cercana.
- Analizar solo estructura, contenido y buenas prácticas generales.
- Indicar claramente que el análisis no es geolocalizado.

Negocio: ${input.businessName}
Ciudad declarada: ${input.city}
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: isFull ? 'FULL_LOCAL' : 'DEMO_LIMITADO',
        result: data.choices?.[0]?.message?.content || 'Sin respuesta',
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        mode: 'ERROR_SAFE',
        message:
          'No se pudo realizar la auditoría completa. Se devolvió una respuesta segura sin caída del sistema.',
      }),
    };
  }
};
