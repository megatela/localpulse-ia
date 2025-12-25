import React, { useState } from "react";
import AuditForm from "./components/AuditForm";
import AuditDashboard from "./components/AuditDashboard";
import { AuditResult, UserPlan } from "./types";

const App: React.FC = () => {
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<UserPlan>("demo"); // demo | paid

  const runAudit = async (data: any) => {
    setLoading(true);

    try {
      const response = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          plan,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const result = await response.json();

      if (!result || !result.score) {
        throw new Error("Respuesta inválida de auditoría");
      }

      // 🔴 AQUÍ ESTABA EL PROBLEMA: ahora sí se guarda el resultado
      setAuditResult(result);

    } catch (error) {
      console.error("Audit error:", error);
      alert("No se pudo generar la auditoría con IA");
    } finally {
      setLoading(false);
    }
  };

  const resetAudit = () => {
    setAuditResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="py-6 text-center">
        <h1 className="text-3xl font-black text-slate-900">
          Auditoría SEO Local con IA
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Análisis real del perfil de Google Mi Negocio
        </p>
      </header>

      {!auditResult && (
        <AuditForm
          onAudit={runAudit}
          loading={loading}
        />
      )}

      {auditResult && (
        <AuditDashboard
          result={auditResult}
          onReset={resetAudit}
          plan={plan}
        />
      )}
    </div>
  );
};

export default App;
