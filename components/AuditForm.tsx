import { useState } from "react";

type Coords = {
  lat: number;
  lng: number;
};

type Props = {
  onAudit: (data: {
    businessName: string;
    address: string;
    coords: Coords | null;
    isDemo: boolean;
  }) => void;
};

export default function AuditForm({ onAudit }: Props) {
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<
    "idle" | "locating" | "ready" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const requestLocationAndAudit = () => {
    if (!businessName.trim()) {
      setStatus("error");
      setMessage("Debes ingresar el nombre del negocio.");
      return;
    }

    setStatus("locating");
    setMessage("Detectando tu ubicación…");

    if (!navigator.geolocation) {
      // Fallback DEMO
      setMessage("Geolocalización no disponible. Usando modo DEMO.");
      onAudit({
        businessName,
        address,
        coords: null,
        isDemo: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMessage("Ubicación detectada. Analizando negocio…");
        onAudit({
          businessName,
          address,
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isDemo: false,
        });
        setStatus("ready");
      },
      () => {
        // Usuario rechazó permiso → DEMO controlado
        setMessage(
          "No se permitió la ubicación. Continuando en modo DEMO."
        );
        onAudit({
          businessName,
          address,
          coords: null,
          isDemo: true,
        });
        setStatus("ready");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="audit-form">
      <h2>Auditoría de Perfil de Negocio</h2>

      <input
        type="text"
        placeholder="Nombre del negocio"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Dirección (opcional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button onClick={requestLocationAndAudit}>
        Realizar auditoría
      </button>

      {message && (
        <p
          style={{
            marginTop: "1rem",
            color: status === "error" ? "red" : "#555",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
