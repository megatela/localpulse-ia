import React from "react";

type AuditResult = {
  mode?: "DEMO" | "FULL";
  locationUsed?: boolean;
  summary?: {
    score?: number;
    verdict?: string;
  };
  optimizedDescription?: string | null;
  keywords?: {
    primary?: string[] | null;
    secondary?: string[] | null;
  } | null;
  categories?: string[] | null;
  attributes?: string[] | null;
  notes?: string | null;
};

interface Props {
  audit: AuditResult | null;
}

export default function AuditDashboard({ audit }: Props) {
  // 🛡️ Blindaje total
  if (!audit) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay resultados de auditoría para mostrar.
      </div>
    );
  }

  const mode = audit.mode ?? "DEMO";
  const score = audit.summary?.score ?? 0;
  const verdict =
    audit.summary?.verdict ??
    "No se pudo generar un veredicto automático.";

  const description =
    audit.optimizedDescription ??
    "No se generó una descripción optimizada en este análisis.";

  const primaryKeywords = audit.keywords?.primary ?? [];
  const secondaryKeywords = audit.keywords?.secondary ?? [];

  const categories = audit.categories ?? [];
  const attributes = audit.attributes ?? [];

  return (
    <div className="space-y-8 p-6">
      {/* HEADER */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold">
          Auditoría de Perfil Google Business
        </h2>
        <p className="text-sm text-gray-500">
          Modo: <strong>{mode}</strong>{" "}
          {mode === "DEMO" && "— análisis limitado sin ubicación exacta"}
        </p>
      </div>

      {/* SCORE */}
      <section>
        <h3 className="font-medium">Puntuación General</h3>
        <p className="text-3xl font-bold">{score}/100</p>
        <p className="text-gray-600">{verdict}</p>
      </section>

      {/* DESCRIPTION */}
      <section>
        <h3 className="font-medium mb-2">Descripción Optimizada</h3>
        <p className="text-gray-700 whitespace-pre-line">
          {description}
        </p>
      </section>

      {/* KEYWORDS */}
      <section>
        <h3 className="font-medium mb-2">Palabras Clave</h3>

        <div className="mb-2">
          <strong>Primarias:</strong>
          {primaryKeywords.length ? (
            <ul className="list-disc ml-6">
              {primaryKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No se identificaron keywords primarias.
            </p>
          )}
        </div>

        <div>
          <strong>Secundarias:</strong>
          {secondaryKeywords.length ? (
            <ul className="list-disc ml-6">
              {secondaryKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              No se identificaron keywords secundarias.
            </p>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <h3 className="font-medium mb-2">Categorías Recomendadas</h3>
        {categories.length ? (
          <ul className="list-disc ml-6">
            {categories.map((cat, i) => (
              <li key={i}>{cat}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No se pudieron sugerir categorías.
          </p>
        )}
      </section>

      {/* ATTRIBUTES */}
      <section>
        <h3 className="font-medium mb-2">Atributos Sugeridos</h3>
        {attributes.length ? (
          <ul className="list-disc ml-6">
            {attributes.map((attr, i) => (
              <li key={i}>{attr}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            Atributos no disponibles en este modo.
          </p>
        )}
      </section>

      {/* FOOTER DEMO NOTICE */}
      {mode === "DEMO" && (
        <div className="mt-6 rounded border border-yellow-300 bg-yellow-50 p-4 text-sm">
          <strong>Nota:</strong> Este análisis se ejecutó en modo DEMO.
          Para una auditoría completa con datos locales precisos,
          es necesario permitir la geolocalización y usar el plan FULL.
        </div>
      )}
    </div>
  );
}
