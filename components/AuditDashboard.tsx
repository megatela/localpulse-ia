import React from 'react';
import { AuditResult, UserPlan } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Tags,
  FileEdit,
  Award,
  MapPin,
  MousePointer2,
  Lock,
  Sparkles
} from 'lucide-react';

interface AuditDashboardProps {
  result: AuditResult;
  onReset: () => void;
  plan: UserPlan;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ result, onReset, plan }) => {
  const isPaid = plan === 'paid';

  /** 🛡️ NORMALIZACIÓN ROBUSTA (CLAVE) */
  const safeResult = {
    businessName: result.businessName ?? 'Negocio',
    summary: result.summary ?? 'No se pudo generar el análisis.',
    score: typeof result.score === 'number' ? result.score : 0,

    keywords: Array.isArray(result.keywords) ? result.keywords : [],
    actionPlan: Array.isArray(result.actionPlan) ? result.actionPlan : [],
    sources: Array.isArray(result.sources) ? result.sources : [],

    categories: {
      primary: result.categories?.primary ?? 'No definida',
      suggested: Array.isArray(result.categories?.suggested)
        ? result.categories.suggested
        : []
    },

    descriptionOptimization:
      result.descriptionOptimization ??
      'No se pudo generar la descripción optimizada.'
  };

  const chartData = [
    { name: 'Puntuación', value: safeResult.score },
    { name: 'Restante', value: Math.max(0, 100 - safeResult.score) }
  ];

  const COLORS = ['#2563eb', '#e2e8f0'];

  const copyToClipboard = (text: string) => {
    if (!isPaid) return;
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* 🚨 Banner FREE */}
      {!isPaid && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl flex justify-between items-center text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5" />
            <div>
              <p className="font-black text-sm">Modo Demo</p>
              <p className="text-xs opacity-90">
                Estás viendo una versión limitada del informe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{safeResult.businessName}</h2>
          <p className="text-gray-500 mt-2 max-w-xl">{safeResult.summary}</p>
        </div>

        <div className="flex items-center space-x-6">
          <div className="h-24 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="text-4xl font-black text-blue-600">
              {safeResult.score}/100
            </div>
            <div className="text-sm font-bold text-gray-400">SALUD SEO</div>
          </div>

          <button
            onClick={onReset}
            className="p-3 rounded-xl hover:bg-blue-50"
          >
            <RefreshCw />
          </button>
        </div>
      </div>

      {/* KEYWORDS */}
      <section className="bg-white p-8 rounded-2xl border">
        <h3 className="text-xl font-bold flex items-center mb-4">
          <MousePointer2 className="mr-2" /> Implementación de Keywords
        </h3>

        {safeResult.keywords.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            No se pudieron generar keywords.
          </p>
        )}

        {safeResult.keywords
          .slice(0, isPaid ? undefined : 2)
          .map((kw, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border mb-3">
              <div className="font-bold">{kw.term}</div>
              <div className="text-sm text-gray-600 italic">
                {kw.placement}
              </div>
            </div>
          ))}
      </section>

      {/* PLAN DE ACCIÓN */}
      <section className="bg-white p-8 rounded-2xl border">
        <h3 className="text-xl font-bold flex items-center mb-4">
          <Award className="mr-2" /> Plan Estratégico
        </h3>

        {safeResult.actionPlan.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            No se pudo generar el plan de acción.
          </p>
        )}

        {safeResult.actionPlan
          .slice(0, isPaid ? undefined : 2)
          .map((action, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl border mb-3">
              <h4 className="font-bold">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          ))}
      </section>

      {/* DESCRIPCIÓN */}
      <section className="bg-white p-8 rounded-2xl border">
        <h3 className="text-xl font-bold flex items-center mb-4">
          <FileEdit className="mr-2" /> Descripción Optimizada
        </h3>

        <div className="p-4 bg-gray-50 rounded-xl italic">
          {safeResult.descriptionOptimization}
        </div>

        {isPaid && (
          <button
            onClick={() =>
              copyToClipboard(safeResult.descriptionOptimization)
            }
            className="mt-4 text-blue-600 font-bold flex items-center"
          >
            Copiar descripción <ArrowRight className="ml-2" />
          </button>
        )}
      </section>

      {/* FUENTES */}
      <section className="bg-slate-900 text-white p-8 rounded-2xl">
        <h3 className="font-bold flex items-center mb-4">
          <ExternalLink className="mr-2" /> Fuentes
        </h3>

        {safeResult.sources.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            No hay fuentes disponibles.
          </p>
        )}

        {safeResult.sources.map((s, i) => (
          <div key={i} className="p-3 bg-slate-800 rounded-xl mb-2">
            <div className="text-xs text-slate-400">{s.uri}</div>
            <div className="text-sm font-semibold text-blue-300">
              {s.title}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AuditDashboard;
