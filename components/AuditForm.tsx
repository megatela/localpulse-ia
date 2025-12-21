import React, { useState } from 'react';
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
  Navigation,
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

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    setRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationDenied(false);
        setRequestingLocation(false);
      },
      () => {
        setLocationDenied(true);
        setRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit(formData, coords ?? undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100"
    >
      <div className="space-y-6">

        {/* BLOQUE GEOLOCALIZACIÓN */}
        <div
          className={`rounded-xl p-4 border ${
            coords
              ? 'bg-green-50 border-green-200'
              : locationDenied
              ? 'bg-amber-50 border-amber-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {coords ? (
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            ) : locationDenied ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            ) : (
              <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
            )}

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                Auditoría SEO Local basada en proximidad
              </p>

              {!coords && !locationDenied && (
                <p className="text-xs text-gray-700 mt-1">
                  Para una auditoría precisa, necesitamos tu ubicación
                  geográfica (latitud y longitud).
                </p>
              )}

              {coords && (
                <p className="text-xs text-green-700 mt-1 font-semibold">
                  ✔ Ubicación detectada correctamente. Auditoría completa activada.
                </p>
              )}

              {locationDenied && (
                <p className="text-xs text-amber-700 mt-1 font-semibold">
                  ⚠ No se concedió acceso a la ubicación. La auditoría continuará
                  en modo limitado, sin análisis de proximidad ni competencia local.
                </p>
              )}

              {!coords && (
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={requestingLocation}
                  className="mt-3 inline-flex items-center text-sm font-bold text-blue-600 hover:underline"
                >
                  {requestingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obteniendo ubicación…
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Usar mi ubicación
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <input
          required
          placeholder="Nombre del negocio"
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
          value={formData.businessName}
          onChange={(e) =>
            setFormData({ ...formData, businessName: e.target.value })
          }
        />

        <input
          required
          placeholder="Ciudad"
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
          value={formData.city}
          onChange={(e) =>
            setFormData({ ...formData, city: e.target.value })
          }
        />

        <input
          required
          placeholder="Categoría"
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />

        <textarea
          required
          rows={4}
          placeholder="Descripción actual del negocio"
          className="w-full px-4 py-3 rounded-xl border border-gray-200"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <button
          disabled={loading}
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}
        >
          {loading ? 'Ejecutando Auditoría…' : 'Realizar Auditoría con IA'}
        </button>
      </div>
    </form>
  );
};

export default AuditForm;
