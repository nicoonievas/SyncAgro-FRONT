import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const { BaseLayer } = LayersControl;

const icons = {
  Activo: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    iconSize: [25, 25],
    iconAnchor: [12, 41],
  }),
  Finalizado: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [25, 25],
    iconAnchor: [12, 41],
  }),
  Pendiente: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    iconSize: [25, 25],
    iconAnchor: [12, 41],
  }),
};

// Colores de fondo para el tooltip según el estado
const tooltipColors = {
  Activo: "rgba(76, 127, 175, 0.8)", // Verde
  Finalizado: "rgba(76, 175, 80, 0.8)", // Rojo
  Pendiente: "rgba(240, 202, 90, 0.8)", // Amarillo
};

const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

export default function MapComponent({ locations }) {
  const mapRef = useRef(null);

  return (
    <MapContainer
      center={[-32.101680, -63.029615]} // Centro inicial
      zoom={5}
      style={{ height: "500px", width: "100%" }}
      ref={mapRef}
    >
      <LayersControl position="topright">
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OSM contributors"
          />
        </BaseLayer>

        <BaseLayer name="Satélite (Esri)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
          />
        </BaseLayer>
      </LayersControl>

      {/* Ajustar vista a los marcadores */}
      {locations.length > 0 && <FitBounds locations={locations.map((loc) => [loc.latitud, loc.longitud])} />}

      {/* Renderizar múltiples marcadores con Tooltip de color dinámico */}
      {locations.map((loc, index) => (
        <Marker key={index} 
        position={[loc.latitud, loc.longitud]}
        icon={icons[loc.estado]}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
     
            className="custom-tooltip"
            opacity={1} // Hace que el color de fondo sea visible
          >
            <div
              style={{
                backgroundColor: tooltipColors[loc.estado] || "rgba(0,0,0,0.8)",
                color: "white",
                padding: "5px 10px",
                borderRadius: "5px",
                fontSize: "12px",
                textAlign: "center",
         
              }}
            >
              <strong>{loc.apellido} {loc.cliente} </strong> <br />
              Campo: {loc.nombre}
              <br />
              Grano: {loc.grano}
              <br />
              Tarea: {loc.tarea}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
