import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Configurar icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const { BaseLayer } = LayersControl;

// Ajusta la vista para incluir todos los marcadores
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

  console.log("locations en mapa:", locations);
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
      {locations.length > 0 && <FitBounds locations={locations.map((loc) => [loc.latitud, loc.longitud])} />
      }

      {/* Renderizar múltiples marcadores */}
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.latitud, loc.longitud]} />
      ))}

    </MapContainer>
  );
}
