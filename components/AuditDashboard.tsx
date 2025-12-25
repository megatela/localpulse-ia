import { useState } from "react";
import AuditForm from "./AuditForm";

type AuditResult = {
  summary: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  isDemo: boolean;
};

export default function AuditDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  const runAudit = async ({
    businessName,
    address,
    coords,
    isDemo,
  }: {
    businessName: string;
    address: string;
    coords: { lat: number; lng: number } | null;
    isDemo: boolean;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          address,
          coords,
          isDemo,
        }),
      });

      if (!response.ok) {
        throw new Error("El servidor no pudo generar la auditoría.");
      }

      const data = await response.json();

      // 🔒 Blindaje absoluto del frontend
      if (
        !data ||
        typeof data !== "object" ||
        !data.summary ||
        !Array.isArray(data.recommendations)
      ) {
        throw new Error("Respuesta inválida de la IA.");
      }

      setResult({
        summary: data.summary,
        score: data.score ?? 0,
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        recommendations: data.recommendations,
        isDemo: Boolean(data.isDemo),
      });
    } catch (err: any) {
      setError(
        err.message ||
          "No se pudo generar la auditoría con IA. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-dashboard">
      <AuditForm onAudit={runAudit} />

      {/* Estado: cargando */}
      {loading && (
        <div className="audit-loading">
          <p>Analizando el perfil del negocio…</p>
          <p>Esto puede tardar unos segundos.</p>
        </div>
      )}

      {/* Estado: error */}
      {error && (
        <div className="audit-error">
          <p style={{ color: "red" }}>{error}</p>
        </div>
      )}

      {/* Estado: resultado */}
      {result && !loading && (
        <div className="audit-result">
          {result.isDemo && (
            <p style={{ fontStyle: "italic", color: "#777" }}>
              Estás viendo una auditoría DEMO. Para resultados reales,
              habilita la ubicación.
            </p>
          )}

          <h3>Resumen</h3>
          <p>{result.summary}</p>

          <h3>Puntuación</h3>
          <strong>{result.score} / 100</strong>

          {result.strengths.length > 0 && (
            <>
              <h3>Fortalezas</h3>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {result.weaknesses.length > 0 && (
            <>
              <h3>Debilidades</h3>
              <ul>
                {result.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Recomendaciones</h3>
          <ul>
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
