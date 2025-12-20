
import React from 'react';
import { AuditResult, UserPlan } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, RefreshCw, Key, Tags, FileEdit, Award, MapPin, MousePointer2, Lock, Sparkles } from 'lucide-react';

interface AuditDashboardProps {
  result: AuditResult;
  onReset: () => void;
  plan: UserPlan;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ result, onReset, plan }) => {
  const isPaid = plan === 'paid';
  
  const chartData = [
    { name: 'Puntuación', value: result.score },
    { name: 'Restante', value: 100 - result.score },
  ];

  const COLORS = ['#2563eb', '#e2e8f0'];

  const getImpactLabel = (impact: string) => {
    switch(impact) {
      case 'High': return 'Impacto Alto';
      case 'Medium': return 'Impacto Medio';
      case 'Low': return 'Impacto Bajo';
      default: return impact;
    }
  };

  const copyToClipboard = (text: string) => {
    if (!isPaid) return;
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Banner de Upgrade si es Free */}
      {!isPaid && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-wider">Modo Demo Activo</p>
              <p className="text-xs opacity-90">Estás perdiendo el 80% de las recomendaciones críticas. Desbloquea el informe completo.</p>
            </div>
          </div>
          <button className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            Actualizar a Premium
          </button>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-2xl shadow-sm border border-gray-100 gap-6 relative overflow-hidden">
        {isPaid && <div className="absolute top-0 right-0 p-1 bg-amber-500 text-[8px] font-black text-white px-3 rotate-45 translate-x-3 translate-y-1">PREMIUM</div>}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{result.businessName}</h2>
          <p className="text-gray-500 mt-2 max-w-xl">{result.summary}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="text-4xl font-black text-blue-600">{result.score}/100</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Salud SEO</div>
          </div>
          <button onClick={onReset} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mapa de Keywords */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <MousePointer2 className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Implementación de Keywords</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 relative">
              {result.keywords.slice(0, isPaid ? undefined : 2).map((kw, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden group">
                  <div className="w-full md:w-1/3 p-4 bg-white border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Palabra Clave</div>
                    <div className="text-lg font-bold text-slate-800">{kw.term}</div>
                  </div>
                  <div className="w-full md:w-2/3 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> Ubicación en Google:
                      </div>
                      <div className="text-sm font-semibold text-slate-700 italic">"{kw.placement}"</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {!isPaid && (
                <div className="relative">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-6 blur-sm opacity-30 mt-4">
                      <div className="h-4 bg-slate-300 w-full rounded"></div>
                    </div>
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-amber-100 shadow-xl text-center max-w-xs">
                      <Lock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-900">+15 Palabras Clave Ocultas</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">Solo para usuarios Premium</p>
                      <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Desbloquear</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Acción Plan */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Award className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Plan Estratégico</h3>
            </div>
            <div className="space-y-4">
              {result.actionPlan.slice(0, isPaid ? undefined : 2).map((action, idx) => (
                <div key={idx} className="flex items-start p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`mt-1 p-1 rounded-full ${action.impact === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{action.description}</p>
                  </div>
                </div>
              ))}
              {!isPaid && (
                <div className="p-4 bg-slate-100 rounded-xl text-center border-2 border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 italic">... 8 tareas de alto impacto restantes ocultas ...</p>
                </div>
              )}
            </div>
          </section>

          {/* Descripción */}
          <section className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-100 transition-all ${!isPaid ? 'opacity-70' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileEdit className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Descripción Optimizada</h3>
              </div>
              {!isPaid && <Lock className="w-5 h-5 text-amber-500" />}
            </div>
            <div className={`relative p-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 italic leading-relaxed ${!isPaid ? 'blur-content' : ''}`}>
              "{result.descriptionOptimization}"
            </div>
            {isPaid ? (
              <button onClick={() => copyToClipboard(result.descriptionOptimization)} className="mt-4 flex items-center text-sm font-bold text-blue-600">
                Copiar descripción completa <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            ) : (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-sm font-bold text-blue-600">Pásate a Premium para obtener el texto final</p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4 text-purple-600">
              <Tags className="w-5 h-5" />
              <h3 className="font-bold text-gray-900">Categorías Sugeridas</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm font-bold text-blue-900">{result.categories.primary}</div>
              <div className="flex flex-wrap gap-2">
                {result.categories.suggested.map((cat, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{cat}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Análisis de Mercado (Fuentes) - SOLO PAID */}
          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {!isPaid && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center p-6 text-center">
                <div>
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs font-bold leading-tight">Accede a las fuentes de datos reales que consultó la IA</p>
                </div>
              </div>
            )}
            <h3 className="font-bold mb-4 flex items-center text-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Fuentes de Inteligencia Local
            </h3>
            <div className="space-y-3">
              {result.sources.map((source, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-[10px] text-slate-400 truncate">{source.uri}</div>
                  <div className="text-xs font-semibold text-blue-300 truncate mt-1">{source.title}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
