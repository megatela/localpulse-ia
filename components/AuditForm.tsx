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
  AlertTriangle
} from 'lucide-react';

interface AuditFormProps {
  onAudit: (data: GBPAuditData & {
    coords: { lat: number; lng: number } | null;
    locationMode: 'FULL' | 'LIMITED';
  }) => void;
  loading: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ onAudit, loading }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMode, setLocationMode] = useState<'FULL' | 'LIMITED'>('LIMITED');
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GBPAuditData>({
    businessName: '',
    city: '',
    category: '',
    description: '',
    website: '',
    hasPhotos: false,
    hasReviews: false,
  });

  const requestLocation = () => {
    setLocationAttempted(true);

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationMode('FULL');
        setLocationError(null);
      },
      () => {
        setLocationMode('LIMITED');
        setLocationError(
          'No se concedió acceso a la ubicación. La auditoría se realizará en modo limitado.'
        );
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAudit({
      ...formData,
      coords,
      locationMode,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100 space-y-6"
    >
      {/* GEOLOCATION BLOCK */}
      <div className="p-4 rounded-xl border border-dashed border-blue-300 bg-blue-50">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">
              Precisión Local (Recomendado)
            </p>
            <p className="text-xs text-blue-700 mt-1">
              La auditoría es más precisa si conocemos tu ubicación real. Puedes continuar sin
              concederla, pero el análisis será limitado.
            </p>

            {!locationAttempted && (
              <button
                type="button"
                onClick={requestLocation}
                className="mt-3 inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Permitir ubicación
              </button>
            )}

            {locationMode === 'FULL' && (
              <p className="mt-3 text-xs font-bold text-green-700">
                ✓ Ubicación detectada correctamente para análisis local preciso
              </p>
            )}

            {locationError && (
              <p className="mt-3 text-xs text-amber-700 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {locationError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FORM FIELDS */}
      <div>
        <label className="text-sm font-semibold text-gray-700">Nombre del Negocio</label>
        <input
          required
          className="w-full mt-1 p-3 rounded-xl border"
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700">Ciudad / Localidad</label>
        <input
          required
          className="w-full mt-1 p-3 rounded-xl border"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" />
            Ejecutando auditoría…
          </span>
        ) : (
          'Realizar Auditoría con IA'
        )}
      </button>
    </form>
  );
};

export default AuditForm;
