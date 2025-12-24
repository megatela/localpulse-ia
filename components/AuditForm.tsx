import React, { useEffect, useState } from "react";
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
  CheckCircle2
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
    hasReviews: false
  });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");

  // Solicita geolocalización REAL al cargar
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoStatus("granted");
      },
      () => {
        setGeoStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit(formData, coords ?? undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100 space-y-6"
    >
      {/* Estado de Geolocalización */}
      {geoStatus === "requesting" && (
        <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-3 rounded-xl">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Solicitando acceso a tu ubicación para análisis local preciso…
        </div>
      )}

      {geoStatus === "granted" && (
        <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Ubicación detectada correctamente para análisis local preciso
        </div>
      )}

      {geoStatus === "denied" && (
        <div className="flex items-start text-sm text-amber-700 bg-amber-50 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 mr-2 mt-0.5" />
          <div>
            <p className="font-semibold">
              No se pudo acceder a tu ubicación.
            </p>
            <p className="text-xs mt-1">
              La auditoría continuará en modo limitado. Algunas recomendaciones
              de proximidad, competencia local y keywords geolocalizadas pueden
              ser menos precisas.
            </p>
          </div>
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
          Descripción Actual del Negocio
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
          Sitio Web (Opcional)
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
      <div className="flex gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={formData.hasPhotos}
            onChange={(e) =>
              setFormData({ ...formData, hasPhotos: e.target.checked })
            }
          />
          <Camera className="w-4 h-4" /> Tiene Fotos
        </label>

        <label className="flex items-center gap-2 text-sm font-medium">
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

      {/* Submit */}
      <button
        disabled={loading}
        type="submit"
        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 w-5 h-5" />
            Ejecutando Auditoría…
          </span>
        ) : (
          "Realizar Auditoría con IA"
        )}
      </button>
    </form>
  );
};

export default AuditForm;
