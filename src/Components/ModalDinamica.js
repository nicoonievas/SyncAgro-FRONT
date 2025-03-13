import { Modal, Button, Descriptions } from "antd";

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

const DynamicModal = ({ open, onClose, record, camposPermitidos }) => {
  if (!record) return null;

  const renderValue = (key, value) => {
    if (value === null) {
      return "Sin información";
    }
    if (value.length < 1) {
      return "Sin equipos";
    }
    if (Array.isArray(value)) {
      // Si es un array, mostramos una lista con los valores clave permitidos
      return value.map((item, index) => (
        <div key={index}>
          {typeof item === "object"
            ? camposPermitidos
              .filter((campo) => campo.startsWith(`${key}.`))
              .map((campo) => {
                const subKey = campo.split(".")[1]; // Extrae la clave después del punto
                return (
                  <div key={subKey}>
                    {item[subKey]}
                  </div>
                );
              })
            : item}
        </div>
      ));
    }

    // Si el valor es un número y tiene 13 caracteres (es un timestamp)
    if (typeof value === "number" && value.toString().length === 13) {
      return formatDate(value); // Convertimos el timestamp a DD-MM-YYYY
    }

    return typeof value === "object" ? JSON.stringify(value) : value;
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Detalle">
      <Descriptions bordered column={1}>
        {Object.entries(record)
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
