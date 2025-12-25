import React from "react";

interface Competitor {
  name: string;
  rating: number;
  reviews: number;
}

interface AuditResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywords: string[];
  competitors: Competitor[];
}

interface AuditDashboardProps {
  result: {
    success: boolean;
    mode: "demo" | "full";
    audit: AuditResult;
    warnings?: string[];
  } | null;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ result }) => {
  if (!result || !result.audit) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No hay resultados de auditoría para mostrar.
      </div>
    );
  }

  const { audit, mode, warnings } = result;

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-2">
          Resultado de Auditoría SEO Local
        </h2>

        <p className="text-gray-600 mb-4">{audit.summary}</p>

        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-blue-600">
            {audit.score}/100
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100">
            Modo {mode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <ul className="list-disc list-inside text-yellow-800 text-sm">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="font-bold text-green-700 mb-3">Fortalezas</h3>
          <ul className="list-disc list-inside space-y-1">
            {audit.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 rounded-xl p-6">
          <h3 className="font-bold text-red-700 mb-3">Debilidades</h3>
          <ul className="list-disc list-inside space-y-1">
            {audit.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-3">Recomendaciones Prioritarias</h3>
        <ol className="list-decimal list-inside space-y-1">
          {audit.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-3">Keywords sugeridas</h3>
        <div className="flex flex-wrap gap-2">
          {audit.keywords.map((k, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Competitors */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-3">Competidores locales</h3>
        <div className="space-y-3">
          {audit.competitors.map((c, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b pb-2"
            >
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-gray-600">
                ⭐ {c.rating} · {c.reviews} reseñas
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
