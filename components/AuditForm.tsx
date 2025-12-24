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
  onAudit: (data: GBPAuditData & { latitude?: number; longitude?: number }) => void;
  loading: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ onAudit, loading }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.');
      onAudit(formData);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        onAudit({
          ...formData,
          latitude,
          longitude,
        });
      },
      (error) => {
        console.warn('Geolocalización rechazada:', error);
        setLocationError(
          'No se concedió acceso a la ubicación. La auditoría continuará en modo limitado.'
        );

        onAudit(formData);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100"
    >
      <div className="space-y-6">

        {/* MENSAJE DE UBICACIÓN */}
        {locationError && (
          <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <p>{locationError}</p>
          </div>
        )}

        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-semibold mb-1">Nombre del Negocio</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              required
              className="w-full pl-10 py-3 rounded-xl border"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>
        </div>

        {/* CIUDAD */}
        <div>
          <label className="block text-sm font-semibold mb-1">Ciudad</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              required
              className="w-full pl-10 py-3 rounded-xl border"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
        </div>

        {/* CATEGORÍA */}
        <div>
          <label className="block text-sm font-semibold mb-1">Categoría</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              required
              className="w-full pl-10 py-3 rounded-xl border"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-semibold mb-1">Descripción</label>
          <textarea
            required
            rows={4}
            className="w-full p-4 rounded-xl border"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        {/* WEBSITE */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Sitio Web (opcional)
          </label>
          <input
            type="url"
            className="w-full p-4 rounded-xl border"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
          />
        </div>

        {/* CHECKBOXES */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
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

          <label className="flex items-center gap-2">
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

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold"
        >
          {loading ? 'Ejecutando auditoría…' : 'Realizar auditoría con IA'}
        </button>
      </div>
    </form>
  );
};

export default AuditForm;
