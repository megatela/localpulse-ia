import { GBPAuditData, AuditResult } from "../types";

export const performGBPAudit = async (
  data: GBPAuditData,
  coords?: { lat: number; lng: number }
): Promise<AuditResult> => {
  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data, coords })
  });

  if (!response.ok) {
    throw new Error("Error al ejecutar auditoría IA");
  }

  return await response.json();
};
