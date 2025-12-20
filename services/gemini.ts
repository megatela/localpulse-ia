import { GBPAuditData, AuditResult } from "../types";

/**
 * Llama a la función serverless de Netlify que ejecuta Gemini
 * El frontend nunca accede directamente a la API de Google
 */
export async function performGBPAudit(
  data: GBPAuditData,
  coords?: { lat: number; lng: number }
): Promise<AuditResult> {
  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data, coords })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error Gemini Function:", text);
    throw new Error("No se pudo generar la auditoría con IA");
  }

  return await response.json();
}
