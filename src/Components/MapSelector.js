import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  LayersControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Configurar ícono de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const { BaseLayer, Overlay } = LayersControl;

// Componente que maneja eventos del mapa
const MapEventsHandler = ({ onChange, isModalVisible, position, setPosition }) => {
  const map = useMap();

  // Ajustar tamaño cuando el modal se abre
  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [isModalVisible, map]);

  // Capturar clic en el mapa para actualizar la posición del marcador
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng);
    },
  });

  return null; // No renderiza nada
};

export default function MapSelector({ onChange, isModalVisible, coordenadasIniciales }) {
  // Estado para la posición del marcador
  const [position, setPosition] = useState(coordenadasIniciales || { lat: -32.101680, lng: -63.029615 });

  useEffect(() => {
    if (coordenadasIniciales) {
      setPosition(coordenadasIniciales);
    }
  }, [coordenadasIniciales]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
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

        <Overlay name="Etiquetas Claras (ArcGIS)" checked>
          <TileLayer
            url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            opacity={1}
          />
        </Overlay>
      </LayersControl>

      {/* Manejo de eventos */}
      <MapEventsHandler 
        onChange={onChange} 
        isModalVisible={isModalVisible} 
        position={position} 
        setPosition={setPosition} 
      />

      {/* Marcador con opción de arrastre */}
      {position && (
        <Marker
          position={position}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const newPos = e.target.getLatLng();
              setPosition(newPos);
              onChange(newPos);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
