import { useEffect, useState } from "react";
import { Modal } from "antd";

const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";
    const date = new Date(timestamp);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
};

const ModalCliente = ({ cliente, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (cliente) {
            setVisible(true); // Se abre solo si cliente tiene un valor
    }}, [cliente]);

    const handleClose = () => {
        setVisible(false);
        onClose(); // Notificar al padre
    };

    return (
        <Modal
            title="Detalles del cliente"
            open={visible}
            onOk={handleClose}
            onCancel={handleClose}
        >
            {cliente ? (
                <>
                    <p><strong>Nombre:</strong> {cliente.nombre}</p>
                    <p><strong>Apellido:</strong> {cliente.apellido}</p>
                    <p><strong>Email:</strong> {cliente.email}</p>
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                    <p><strong>Fecha de registro:</strong> {formatDate(cliente.fechaRegistro)}</p>
                </>
            ) : (
                <p>Cargando datos...</p>
            )}
        </Modal>
    );
};

export default ModalCliente;
