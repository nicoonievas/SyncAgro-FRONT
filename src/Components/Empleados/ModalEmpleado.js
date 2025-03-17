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

const ModalEmpleado = ({ empleado, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (empleado) {
            setVisible(true);
        }
    }, [empleado]);

    const handleClose = () => {
        setVisible(false);
        onClose(); // Notificar al componente padre
    };

    return (
        <Modal
            title="Detalles del empleado"
            open={visible}
            onOk={handleClose}
            onCancel={handleClose}
        >
            {empleado ? (
                <>
                    <p><strong>Nombre:</strong> {empleado.firstname}</p>
                    <p><strong>Apellido:</strong> {empleado.lastname}</p>
                    <p><strong>Documento:</strong> {empleado.documento}</p>
                    <p><strong>Email:</strong> {empleado.email}</p>
                    <p><strong>Domicilio:</strong> {empleado.domicilio}</p>
                    <p><strong>Celular:</strong> {empleado.celular}</p>
                    <p><strong>Telefono de Emergencia:</strong> {empleado.telefono}</p>  
                    <p><strong>Rol:</strong> {empleado.rol}</p>
                    <p><strong>Fecha de creación:</strong> {formatDate(empleado.fechaCreacion)}</p>
                    <p><strong>Fecha de actualización:</strong> {formatDate(empleado.fechaEdicion)}</p>

                </>
            ) : (
                <p>Cargando datos...</p>
            )}
        </Modal>
    );
};

export default ModalEmpleado;
