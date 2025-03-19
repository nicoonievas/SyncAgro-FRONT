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

const ModalLaboreo = ({ laboreo, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (laboreo) {
            setVisible(true);
        }
    }, [laboreo]);

    console.log("Laboreo en Modal:", laboreo);

    const handleClose = () => {
        setVisible(false);
        onClose(); // Notificar al componente padre
    };

    return (
        <Modal
            title="Detalles del laboreo"
            open={visible}
            onOk={handleClose}
            onCancel={handleClose}
        >
            {laboreo ? (
                <>
                    <p><strong>Nombre:</strong> {laboreo.nombre}</p>
                    <p><strong>Cliente:</strong> {laboreo.cliente?.nombre} {laboreo.cliente?.apellido}</p>
                    <p><strong>Campos Afectados:</strong></p>

                    {/* Mostrar Campos Afectados */}
                    {laboreo.camposAfectados?.length > 0 ? (
                        <ul>
                            {laboreo.camposAfectados.map((campo, index) => (
                                <li key={index}>{campo}</li> // Muestra directamente el nombre
                            ))}
                        </ul>
                    ) : (
                        <p>No hay campos afectados.</p>
                    )}

                    {/* Mostrar Equipos */}
                    <p><strong>Equipos:</strong></p>
                    {laboreo.equipos?.length > 0 ? (
                        <ul>
                            {laboreo.equipos.map((equipo, index) => (
                                <li key={index}>{equipo.nombre}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay equipos asignados.</p>
                    )}


                    {laboreo.empleados?.length > 0 && (
                        <ul>
                            <p><strong>Empleados adicionales:</strong></p>
                            {laboreo.empleados.map((empleado, index) => (
                                <li key={index}>{empleado.firstname} {empleado.lastname} ({empleado.rol})</li>
                            ))}
                        </ul>
                    )}

                    {/* Mostrar Vehículos */}

                    {laboreo.vehiculos?.length > 0 && (
                        <ul>
                            <p><strong>Vehículos adicionales:</strong></p>
                            {laboreo.vehiculos.map((vehiculo, index) => (
                                <li key={index}>{vehiculo.marca} {vehiculo.modelo} - Dominio: <strong>{vehiculo.dominio}</strong></li>
                            ))}
                        </ul>
                    )}



                    <p><strong>Tarea:</strong> {laboreo.tarea}</p>
                    <p><strong>Grano:</strong> {laboreo.grano}</p>
                    <p><strong>Estado:</strong> {laboreo.estado}</p>
                    <p><strong>Fecha de Inicio:</strong> {formatDate(laboreo.fechaInicio)}</p>
                    <p><strong>Fecha de Fin:</strong> {laboreo.fechaFin ? `${formatDate(laboreo.fechaFin) }` : 'Laboreo no finalizado'}</p>
                    <p><strong>Días trabajados:</strong> {laboreo.tiempoTrabajo ? `${laboreo.tiempoTrabajo} Dias` : 'Laboreo no finalizado'}</p>
                    <p><strong>Rentabilidad:</strong> {laboreo.rentabilidadLaboreo ? `${Math.round(laboreo.rentabilidadLaboreo)}%` : 'Laboreo no finalizado'}</p>
                </>
            ) : (
                <p>Cargando datos...</p>
            )}
        </Modal>
    );
};

export default ModalLaboreo;
