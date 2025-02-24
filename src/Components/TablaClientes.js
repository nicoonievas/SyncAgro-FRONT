import React, { useEffect, useState } from "react";
import { Space, Table, Modal, Form, Input, Button, notification } from "antd";
import axios from "axios";
import MapaSelector from "./MapSelector";

const TablaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false); // Nuevo estado para el modal del mapa
  const [clienteIdToDelete, setClienteIdToDelete] = useState(null);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [form] = Form.useForm();
  const [mapCoordinates, setMapCoordinates] = useState(null);
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:6001/api/clientes");

        if (response.data && Array.isArray(response.data)) {
          setClientes(response.data);
        } else {
          console.error("Los datos no tienen el formato esperado:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]( {
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setClienteIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (cliente) => {
    setCurrentCliente(cliente);
    form.setFieldsValue(cliente);
    
    // Si el cliente tiene coordenadas, las enviamos al mapa
    const initialLatLng = cliente.coordenadas ? cliente.coordenadas : null;
    setMapCoordinates(initialLatLng);
    console.log("Coordenadas iniciales:", mapCoordinates);
  
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    setIsMapModalVisible(false); // Cerrar modal del mapa
    form.resetFields();
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:6001/api/cliente/${currentCliente._id}`, values);

      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>
          cliente._id === currentCliente._id ? { ...cliente, ...values } : cliente
        )
      );

      setIsEditModalVisible(false);
      openNotificationWithIcon("success", "Cliente Editado", "El cliente ha sido editado exitosamente.");
    } catch (error) {
      console.error("Error al editar cliente:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/cliente/${clienteIdToDelete}`);

      setClientes((prevClientes) => prevClientes.filter((cliente) => cliente._id !== clienteIdToDelete));

      setIsDeleteModalVisible(false);
      openNotificationWithIcon("success", "Cliente Eliminado", "El cliente ha sido eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      render: (text, record) => <span>{text} {record.apellido}</span>,
    },
    {
      title: "Domicilio",
      dataIndex: "domicilio",
      key: "domicilio",
    },
    {
      title: "Localidad",
      dataIndex: "localidad",
      key: "localidad",
    },
    {
      title: "Provincia",
      dataIndex: "provincia",
      key: "provincia",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
    },
    {
      title: "Correo",
      dataIndex: "mail",
      key: "mail",
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>Editar</a>
          <a onClick={() => showDeleteConfirm(record._id)}>Eliminar</a>
        </Space>
      ),
    },
  ];

  const showMapModal = () => {
    setIsMapModalVisible(true); // Mostrar el modal del mapa
  };

  const handleMapSelect = (latlng) => {
    form.setFieldsValue({
      coordenadas: { latitud: latlng.lat, longitud: latlng.lng },
    });
    setIsMapModalVisible(false); // Cerrar el modal después de seleccionar
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={clientes}
        rowKey="_id"
        loading={loading}
      />

      {/* Modal de Confirmación para Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar este cliente?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Cliente"
        open={isEditModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleEdit}>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: "Por favor ingresa el nombre del cliente" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="apellido"
            label="Apellido"
            rules={[{ required: true, message: "Por favor ingresa el apellido del cliente" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="domicilio"
            label="Domicilio"
            rules={[{ required: true, message: "Por favor ingresa el domicilio" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="localidad"
            label="Localidad"
            rules={[{ required: true, message: "Por favor ingresa la localidad" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="provincia"
            label="Provincia"
            rules={[{ required: true, message: "Por favor ingresa la provincia" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
            rules={[{ required: true, message: "Por favor ingresa el teléfono" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="mail"
            label="Correo Electrónico"
            rules={[{ required: true, message: "Por favor ingresa el correo" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Ubicación en Mapa">
            <Button type="default" onClick={showMapModal}>Seleccionar Ubicación en Mapa</Button>
          </Form.Item>

          <Form.Item label="Latitud" name={["coordenadas", "latitud"]} rules={[{ required: false, message: "Ingresa la latitud" }]}>
            <Input type="number" step="any" placeholder="Ej: -34.603722" />
          </Form.Item>

          <Form.Item label="Longitud" name={["coordenadas", "longitud"]} rules={[{ required: false, message: "Ingresa la longitud" }]}>
            <Input type="number" step="any" placeholder="Ej: -58.381592" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal del Mapa */}
      <Modal
              title="Seleccionar Lugar en el Mapa"
              visible={isMapModalVisible}
              onOk={handleCancel}
              onCancel={handleCancel}
              okText="Guardar"
              cancelText="Cancelar"
              width={800}
            >
              <MapaSelector
                onChange={handleMapSelect}
                isModalVisible={isEditModalVisible}
                initialCoordinates={mapCoordinates}
              
              />
            </Modal>
           
    </>
  );
  
};

export default TablaClientes;
