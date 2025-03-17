import { useState, useEffect } from "react";
import { Modal, Button, Descriptions } from "antd";
import useAxiosInterceptor from '../utils/axiosConfig';

// Función para convertir una cadena en formato camelCase
const toCamelCase = (str) => {
  return str
    .replace(/([A-Z])/g, " $1") // Separa las palabras donde hay mayúsculas
    .replace(/^./, (s) => s.toUpperCase()); // Capitaliza la primera letra
};

// Función para formatear el timestamp a DD-MM-YYYY
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses en JS van de 0 a 11
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const DynamicModal = ({ open, onClose, record, camposPermitidos, empresa, procedencia }) => {
  const api = useAxiosInterceptor(empresa);
  const [recordData, setRecordData] = useState(record);

  useEffect(() => {
    if (!record || !procedencia) return;

    const fetchRecordData = async () => {
      const endpoints = {
        empleados: `/nomina/${record._id}`,
        vehiculos: `/vehiculo/${record._id}`,
        equipos: `/equipo/${record._id}`,
        clientes: `/cliente/${record._id}`,
        laboreos: `/laboreo/${record._id}`,
      };
  
      if (!endpoints[procedencia]) {
        console.error("Procedencia no válida:", procedencia);
        return;
      }

      try {
        const response = await api.get(endpoints[procedencia]);
        console.log(`Datos obtenidos de ${procedencia}:`, response.data);
        setRecordData(response.data);
      } catch (error) {
        console.error(`Error al obtener datos de ${procedencia}:`, error);

      }
    };

    fetchRecordData();
  }, [record, procedencia, api]); // Se ejecuta cuando cambian estos valores

  if (!recordData) return null;

  const renderValue = (key, value) => {
    if (value === null) return "Sin información";
    if (Array.isArray(value) && value.length === 0) return "Sin Campos";
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <div key={index}>
          {typeof item === "object"
            ? camposPermitidos
              .filter((campo) => campo.startsWith(`${key}.`))
              .map((campo) => {
                const subKey = campo.split(".")[1]; // Extrae la clave después del punto
                return <div key={subKey}>{item[subKey]}</div>;
              })
            : item}
        </div>
      ));
    }
    if (typeof value === "number" && value.toString().length === 13) {
      return formatDate(value);
    }
    return typeof value === "object" ? JSON.stringify(value) : value;
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Detalle">
      <Descriptions bordered column={1}>
        {Object.entries(recordData)
          .filter(([key]) => camposPermitidos.some((campo) => campo.startsWith(key)))
          .map(([key, value]) => (
            <Descriptions.Item key={key} label={toCamelCase(key)}>
              {renderValue(key, value)}
            </Descriptions.Item>
          ))}
      </Descriptions>
    </Modal>
  );
};

export default DynamicModal;