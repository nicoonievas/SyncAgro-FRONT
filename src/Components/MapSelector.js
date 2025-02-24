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

// Corrige el icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const { BaseLayer, Overlay } = LayersControl;

// Componente encargado de manejar los eventos del mapa y de llamar a invalidateSize()
const MapEventsHandler = ({ onChange, isModalVisible }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  // Invalidamos el tamaño del mapa cuando el modal se abra
  useEffect(() => {
    if (isModalVisible) {
      setTimeout(() => {
        map.invalidateSize();
      }, 200); // Puedes ajustar el delay según la animación del modal
    }
  }, [isModalVisible, map]);

  // Capturamos clics en el mapa
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

export default function MapSelector({ onChange, isModalVisible }) {
  return (
    <MapContainer
      center={[-32.101680, -63.029615]}
      zoom={13}
      style={{ height: "400px", width: "100%" }} // Aseguramos que el contenedor tenga ancho y alto definidos
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

        {/* <Overlay name="Etiquetas (ArcGIS)" checked>
          <TileLayer
            url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Reference_Overlay/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
          />
        </Overlay> */}
        <Overlay name="Etiquetas Claras (ArcGIS)" checked>
          <TileLayer
            url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            opacity={1}
          />
        </Overlay>
      </LayersControl>

      {/* Incluir el componente que maneja los eventos e invalida el tamaño */}
      <MapEventsHandler onChange={onChange} isModalVisible={isModalVisible} />
    </MapContainer>

  );
}
