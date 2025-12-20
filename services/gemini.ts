
import { GoogleGenAI, Type } from "@google/genai";
import { GBPAuditData, AuditResult } from "../types";

export const performGBPAudit = async (data: GBPAuditData, coords?: { lat: number; lng: number }): Promise<AuditResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Realiza una auditoría técnica y estratégica de SEO local para un Perfil de Empresa en Google (GBP).
    
    INFORMACIÓN DEL NEGOCIO:
    - Nombre: ${data.businessName}
    - Ciudad: ${data.city}
    - Coordenadas aproximadas: ${coords ? `${coords.lat}, ${coords.lng}` : 'No proporcionadas'}
    - Categoría: ${data.category}
    - Descripción Actual: ${data.description}
    - Sitio Web: ${data.website || 'No proporcionado'}
    - Fotos: ${data.hasPhotos ? 'Sí' : 'No'}
    - Reseñas: ${data.hasReviews ? 'Sí' : 'No'}

    REGLAS DE ORO PARA LA RESPUESTA:
    1. IDIOMA: Todo en ESPAÑOL.
    2. BÚSQUEDA REAL: Usa Google Search para analizar competidores reales en ${data.city}.
    3. UBICACIÓN DE KEYWORDS: No te limites a listar palabras clave. Debes indicar EXACTAMENTE en qué campo técnico del GBP deben ir. 
       Los campos válidos son: "Título del Negocio (con cautela)", "Descripción de la Empresa", "Nombres de Servicios", "Descripciones de Servicios", "Texto de Publicaciones (Novedades)", "Preguntas Frecuentes (Q&A)" o "Texto alternativo de fotos".
    4. ACCIONABLE: El plan de acción debe ser paso a paso.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      // Si tenemos coordenadas, podemos usarlas para mejorar el contexto de búsqueda
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Puntuación SEO de 0 a 100" },
          businessName: { type: Type.STRING },
          summary: { type: Type.STRING, description: "Análisis estratégico inicial" },
          categories: {
            type: Type.OBJECT,
            properties: {
              primary: { type: Type.STRING, description: "Categoría principal óptima" },
              suggested: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Categorías secundarias permitidas" }
            },
            required: ["primary", "suggested"]
          },
          keywords: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: "Palabra clave local" },
                placement: { type: Type.STRING, description: "Sección específica del GBP: ej. 'En la descripción del servicio de limpieza'" }
              },
              required: ["term", "placement"]
            }
          },
          attributes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Atributos sugeridos (ej: Acceso para discapacitados)" },
          descriptionOptimization: { type: Type.STRING, description: "Versión final lista para copiar de la descripción" },
          actionPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                description: { type: Type.STRING }
              },
              required: ["title", "impact", "description"]
            }
          }
        },
        required: ["score", "summary", "categories", "keywords", "attributes", "descriptionOptimization", "actionPlan"]
      }
    }
  });

  const rawJson = response.text || "{}";
  const parsed: any = JSON.parse(rawJson);

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || "Fuente de referencia",
      uri: chunk.web.uri
    }));

  return {
    ...parsed,
    sources
  };
};
