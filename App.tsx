import React, { useState, useCallback, useEffect } from 'react';
import { GBPAuditData, AuditResult, AppState, Profile } from './types';
import { performGBPAudit } from './services/gemini';
import { supabase } from './lib/supabase';
import AuditForm from './components/AuditForm';
import AuditDashboard from './components/AuditDashboard';
import { Auth } from './components/Auth';
import { ShieldCheck, Zap, Globe, BarChart3, AlertCircle, Loader2, LogOut, User } from 'lucide-react';

const LOADING_MESSAGES = [
  "Conectando con el ecosistema de búsqueda local...",
  "Analizando la categoría principal de tu perfil...",
  "Escaneando competidores locales en tu área...",
  "Evaluando la densidad y relevancia de palabras clave...",
  "Verificando la optimización de fotos y reseñas...",
  "Sintetizando el plan de acción SEO...",
  "Generando recomendaciones de alto impacto...",
  "Finalizando la descripción optimizada por IA...",
  "Preparando tu panel de rendimiento..."
];

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [coords, setCoords] = useState<{lat: number, lng: number} | undefined>();

  // Check if Supabase is using placeholder keys
  const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

  // Manejar sesión y perfil
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase environment variables are missing. Auth will not function correctly.");
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Por defecto si no existe perfil o falla la conexión, plan free para permitir testing
      setProfile({ id: userId, email: session?.user?.email || '', plan: 'free' });
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    if (appState === AppState.AUDITING) {
      setLoadingMessageIndex(0);
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [appState]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Ubicación no disponible", error)
      );
    }
  }, []);

  const handleAudit = useCallback(async (data: GBPAuditData) => {
    setAppState(AppState.AUDITING);
    setError(null);
    try {
      const result = await performGBPAudit(data, coords);
      setAuditResult(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
      setAppState(AppState.ERROR);
    }
  }, [coords]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setAuditResult(null);
    setError(null);
  };

  const handleSignOut = () => supabase.auth.signOut();

  // Para fines de desarrollo/demo si no hay Supabase configurado, permitimos ver la interfaz
  const shouldShowAuth = !session && isSupabaseConfigured;
  const isDemoMode = !isSupabaseConfigured;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">LocalPulse<span className="text-blue-600">IA</span></span>
          </div>
          
          {(session || isDemoMode) ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {isDemoMode ? 'Modo Desarrollo' : profile?.email}
                </span>
                <span
  className={`text-[10px] font-black uppercase tracking-tighter ${
    profile?.plan === 'paid'
      ? 'text-amber-500'
      : 'text-slate-400'
  }`}
>
  Plan {profile?.plan === 'paid' ? 'Full Access' : 'Demo'}
</span>

              </div>
              {!isDemoMode && (
                <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-500">
              <a href="#" className="hover:text-blue-600">Producto</a>
              <a href="#" className="hover:text-blue-600">Precios</a>
              <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all text-sm">Prueba Gratis</button>
            </div>
          )}
        </div>
      </nav>

      {isDemoMode && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-center text-xs font-bold flex items-center justify-center space-x-2">
          <AlertCircle className="w-3 h-3" />
          <span>Configuración de Supabase no detectada. Ejecutando en modo demostración local.</span>
        </div>
      )}

      <main className="px-6 py-12 md:py-20">
        {shouldShowAuth ? (
          <Auth />
        ) : (
          <>
            {appState === AppState.IDLE && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-6">
                  <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auditoría certificada para { (profile?.plan === 'paid' || isDemoMode) ? 'Empresas' : 'Usuarios Demo'}</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                    Optimización de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Perfil Local</span> <br className="hidden md:block" /> con Inteligencia Real
                  </h1>
                  <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Analiza tu ranking frente a la competencia real. {(profile?.plan === 'free' && !isDemoMode) && 'Actualiza para ver el informe completo.'}
                  </p>
                  
                  {!coords && (
                    <div className="max-w-lg mx-auto bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-sm flex items-start space-x-3 text-left">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>
                        <strong>Precisión Local:</strong> Usamos tu ubicación para analizar cómo Google muestra tu negocio a clientes cercanos. Sin esto, el análisis pierde contexto geográfico.
                      </p>
                    </div>
                  )}
                </div>
                <AuditForm onAudit={handleAudit} loading={false} />
              </div>
            )}

            {appState === AppState.AUDITING && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white p-8 rounded-full shadow-2xl border border-blue-50">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div className="space-y-6 max-w-md w-full px-6">
                  <h2 className="text-2xl font-bold text-gray-900 transition-all duration-500 h-12">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </h2>
                  <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-[2500ms] ease-linear"
                      style={{ width: `${((loadingMessageIndex + 1) / LOADING_MESSAGES.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {appState === AppState.RESULT && auditResult && (
              <AuditDashboard 
                result={auditResult} 
                onReset={handleReset} 
                plan={profile?.plan ?? 'free'}
              />
            )}

            {appState === AppState.ERROR && (
              <div className="max-w-xl mx-auto text-center space-y-6 py-20">
                <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Fallo en el servidor</h2>
                  <p className="text-red-500/80 mb-6">{error}</p>
                  <button onClick={handleReset} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Volver</button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
