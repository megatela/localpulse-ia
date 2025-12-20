
import React, { useState } from 'react';
import { GBPAuditData } from '../types';
// Fixed: Added Loader2 to the list of icons imported from lucide-react
import { Search, MapPin, Tag, FileText, Globe, Camera, MessageSquare, Loader2 } from 'lucide-react';

interface AuditFormProps {
  onAudit: (data: GBPAuditData) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAudit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Negocio</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              required
              type="text"
              placeholder="ej. Panadería Artesanal de Juan"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ciudad / Localidad</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="ej. Madrid"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría Principal Actual</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="ej. Panadería"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción Actual del Negocio</label>
          <div className="relative">
            <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
            <textarea
              required
              rows={4}
              placeholder="Pega aquí la descripción actual de tu perfil de Google..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Sitio Web (Opcional)</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              placeholder="https://..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.hasPhotos}
                onChange={(e) => setFormData({ ...formData, hasPhotos: e.target.checked })}
              />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
              <Camera className="w-4 h-4 mr-2" /> Tiene Fotos
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.hasReviews}
                onChange={(e) => setFormData({ ...formData, hasReviews: e.target.checked })}
              />
              <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">
              <MessageSquare className="w-4 h-4 mr-2" /> Tiene Reseñas
            </div>
          </label>
        </div>

        <button
          disabled={loading}
          type="submit"
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              {/* Added Loader2 here, correctly referenced after import fix */}
              <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
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
