import React, { useState } from "react";
import { GBPAuditData } from "../types";
import {
  Search,
  MapPin,
  Tag,
  FileText,
  Globe,
  Camera,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface AuditFormProps {
  onAudit: (
    data: GBPAuditData,
    coords?: { lat: number; lng: number }
  ) => void;
  loading: boolean;
}

const AuditForm: React.FC<AuditFormProps> = ({ onAudit, loading }) => {
  const [formData, setFormData] = useState<GBPAuditData>({
    businessName: "",
    city: "",
    category: "",
    description: "",
    website: "",
    hasPhotos: false,
    hasReviews: false,
  });

  const [geoStatus, setGeoStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );

  const requestGeolocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setGeoStatus("denied");
        resolve(null);
        return;
      }

      setGeoStatus("requesting");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(location);
          setGeoStatus("granted");
          resolve(location);
        },
        () => {
          setGeoStatus("denied");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const location = await requestGeolocation();

    onAudit(formData, location || undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100"
    >
      <div className="space-y-6">
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
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
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
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
            Descripción Actual
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
            <textarea
              required
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Sitio Web (Opcional)
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.hasPhotos}
              onChange={(e) =>
                setFormData({ ...formData, hasPhotos: e.target.checked })
              }
            />
            <Camera className="w-4 h-4" /> Tiene Fotos
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.hasReviews}
              onChange={(e) =>
                setFormData({ ...formData, hasReviews: e.target.checked })
              }
            />
            <MessageSquare className="w-4 h-4" /> Tiene Reseñas
          </label>
        </div>

        {/* Geolocalización UX */}
        {geoStatus === "denied" && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <p>
              No se concedió acceso a la ubicación. La auditoría continuará en
              <strong> modo limitado</strong>, sin análisis de proximidad ni
              competencia local real.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          disabled={loading}
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600"
          }`}
        >
          {loading ? (
            <span className="flex justify-center items-center">
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Ejecutando auditoría...
            </span>
          ) : (
            "Realizar Auditoría con IA"
          )}
        </button>
      </div>
    </form>
  );
};

export default AuditForm;
