import React, { useEffect, useState } from 'react';
import { GBPAuditData } from '../types';
import {
  Search,
  MapPin,
  Tag,
  FileText,
  Globe,
  Camera,
  MessageSquare,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface AuditFormProps {
  onAudit: (
    data: GBPAuditData,
    coords?: { lat: number; lng: number }
  ) => void;
  loading: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ onAudit, loading }) => {
  const [formData, setFormData] = useState<GBPAuditData>({
    businessName: '',
    city: '',
    category: '',
    description: '',
    website: '',
    hasPhotos: false,
    hasReviews: false,
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [geoDenied, setGeoDenied] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);

  /* ────────────────────────────────
     Solicitud de geolocalización REAL
  ──────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoDenied(true);
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      () => {
        setGeoDenied(true);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit(formData, coords);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100"
    >
      <div className="space-y-6">

        {/* Advertencia de ubicación */}
        {!geoLoading && geoDenied && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <p className="text-sm font-medium">
              No se concedió acceso a la ubicación.
              <br />
              La auditoría se ejecutará en <strong>modo limitado</strong> y
              puede perder precisión en la comparación con competidores cercanos.
            </p>
          </div>
        )}

        {!geoLoading && coords && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-xl">
            <MapPin className="w-4 h-4" />
            Ubicación detectada correctamente para análisis local preciso
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre del Negocio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>
        </div>

        {/* Ciudad y categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ciudad / Localidad
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Categoría Principal
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción actual del negocio
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
            <textarea
              required
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Web */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Sitio Web (opcional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4" />
            <input
              type="checkbox"
              checked={formData.hasPhotos}
              onChange={(e) =>
                setFormData({ ...formData, hasPhotos: e.target.checked })
              }
            />
            Tiene fotos
          </label>

          <label className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4" />
            <input
              type="checkbox"
              checked={formData.hasReviews}
              onChange={(e) =>
                setFormData({ ...formData, hasReviews: e.target.checked })
              }
            />
            Tiene reseñas
          </label>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Ejecutando auditoría…
            </span>
          ) : (
            'Realizar auditoría con IA'
          )}
        </button>
      </div>
    </form>
  );
};

export default AuditForm;
