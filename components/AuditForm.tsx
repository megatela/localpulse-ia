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
  Loader2
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
    hasReviews: false
  });

  /**
   * Solicita la ubicación SOLO cuando el usuario envía el formulario
   * (esto es obligatorio para que el navegador muestre el popup)
   */
  const requestLocation = (): Promise<{ lat: number; lng: number } | undefined> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Usuario denegó permisos o error
          resolve(undefined);
        },
        {
          enableHighAccuracy: false,
          timeout: 5000
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 AQUÍ se dispara el popup del navegador
    const coords = await requestLocation();

    onAudit(formData, coords);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100"
    >
      <div className="space-y-6">
        {/* Nombre del negocio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre del Negocio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              placeholder="ej. Panadería Artesanal de Juan"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
            />
          </div>
        </div>

        {/* Ciudad + Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Ciudad / Localidad
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="ej. Madrid"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Categoría Principal Actual
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="ej. Panadería"
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
            Descripción Actual del Negocio
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
            <textarea
              required
              rows={4}
              placeholder="Pega aquí la descripción actual de tu perfil de Google..."
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
            Sitio Web (Opcional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasPhotos}
              onChange={(e) =>
                setFormData({ ...formData, hasPhotos: e.target.checked })
              }
            />
            <span className="flex items-center text-sm">
              <Camera className="w-4 h-4 mr-2" /> Tiene Fotos
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasReviews}
              onChange={(e) =>
                setFormData({ ...formData, hasReviews: e.target.checked })
              }
            />
            <span className="flex items-center text-sm">
              <MessageSquare className="w-4 h-4 mr-2" /> Tiene Reseñas
            </span>
          </label>
        </div>

        {/* Botón */}
        <button
          disabled={loading}
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Ejecutando Auditoría...
            </span>
          ) : (
            'Realizar Auditoría con IA'
          )}
        </button>
      </div>
    </form>
  );
};

export default AuditForm;
