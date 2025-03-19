import { useEffect, useState } from "react";
import { Modal } from "antd";

// Función para formatear la fecha (DD-MM-YYYY)
const formatDate = (timestamp) => {
  if (!timestamp) return "Fecha no disponible";
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses en JS van de 0 a 11
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const ModalEquipos = ({ equipo, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (equipo) {
      setVisible(true);
    }
  }, [equipo]);

  const handleClose = () => {
    setVisible(false);
    onClose(); // Notificar al componente padre
  };

  return (
    <Modal
      title="Detalles del equipo"
      open={visible}
      onOk={handleClose}
      onCancel={handleClose}
    >
      {equipo ? (
        <>
          <p><strong>Nombre:</strong> {equipo.nombre}</p>
          <p><strong>Numero:</strong> {equipo.numero}</p>
          <p><strong>Estado:</strong> {equipo.estado}</p>
          <p><strong>Descripcion:</strong> {equipo.descripcion}</p>
          <p><strong>Empleados incluidos:</strong></p>
          {equipo.empleados?.length > 0 ? (
            <ul>
              {equipo.empleados.map((empleado, index) => (
                <li key={index}>{empleado.firstname} {empleado.lastname} ({empleado.rol})</li> // Muestra directamente el nombre
              ))}
            </ul>
          ) : (
            <p>No hay empleados asignados.</p>
          )}

          {/* Mostrar Vehículos */}
          <p><strong>Vehiculos incluidos:</strong></p>
          {equipo.vehiculos?.length > 0 ? (
            <ul>
              {equipo.vehiculos.map((vehiculo, index) => (
                <li key={index}>{vehiculo.marca} {vehiculo.modelo} - Dominio: <strong>{vehiculo.dominio}</strong></li>
              ))}
            </ul>
          ) : (
            <p>No hay vehículos asignados.</p>
          )}

          <p><strong>Fecha de actualización:</strong> {formatDate(equipo.fechaEdicion)}</p>
        </>
      ) : (
        <p>Cargando datos...</p>
      )}
    </Modal>
  );
};

export default ModalEquipos;
