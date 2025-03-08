import React, { useEffect, useState } from "react";
import { Space, Table, Modal, Form, Input, Button, notification, Row, Col, Typography } from "antd";
import { DeleteOutlined, EditOutlined, PushpinOutlined } from "@ant-design/icons";
import axios from "axios";
import MapaSelector from "./MapSelector";
const { Title } = Typography;
const TablaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditCamposModalVisible, setIsEditCamposModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [clienteIdToDelete, setClienteIdToDelete] = useState(null);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [form] = Form.useForm();
  const [campos, setCampos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:6001/api/clientes");
        setClientes(response.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({ message, description });
  };

  const showDeleteConfirm = (id) => {
    setClienteIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (cliente) => {
    setCurrentCliente(cliente);
    form.setFieldsValue(cliente);
    setIsEditModalVisible(true);
  };

  const showEditCamposModal = (cliente) => {
    console.log("Abriendo modal para cliente:", cliente);

    if (cliente && cliente.coordenadas) {
      setCurrentCliente(cliente);
      setCampos(cliente.coordenadas); // Cargar coordenadas en campos
    } else {
      setCampos([]); // Si no tiene coordenadas, inicializar como vacío
    }
    setIsEditCamposModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    setIsEditCamposModalVisible(false);
    setIsMapModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:6001/api/cliente/${currentCliente._id}`, values);
      setClientes((prev) =>
        prev.map((cliente) => (cliente._id === currentCliente._id ? { ...cliente, ...values } : cliente))
      );
      setIsEditModalVisible(false);
      openNotificationWithIcon("success", "Cliente Editado", "Los datos del cliente han sido actualizados.");
    } catch (error) {
      console.error("Error al editar cliente:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/cliente/${clienteIdToDelete}`);
      setClientes((prev) => prev.filter((cliente) => cliente._id !== clienteIdToDelete));
      setIsDeleteModalVisible(false);
      openNotificationWithIcon("success", "Cliente Eliminado", "El cliente ha sido eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
    }
  };

  const handleEditCampos = async () => {
    console.log("Enviando campos:", campos);
    const coordenadas = campos;
    try {
      await axios.put(`http://localhost:6001/api/cliente/${currentCliente._id}`, { coordenadas });
      setClientes((prev) =>
        prev.map((cliente) => (cliente._id === currentCliente._id ? { ...cliente, coordenadas } : cliente))
      );
      setIsEditCamposModalVisible(false);
      openNotificationWithIcon("success", "Campos Actualizados", "Los campos del cliente han sido actualizados.");
    } catch (error) {
      console.error("Error al editar campos:", error);
    }
  };

  const addCampo = () => {
    setCampos([...campos, { nombre: "", latitud: "", longitud: "" }]);
  };

  const removeCampo = (index) => {
    setCampos(campos.filter((_, i) => i !== index));
  };

  const updateCampo = (index, key, value) => {
    setCampos((prev) => {
      const updatedCampos = [...prev];
      updatedCampos[index][key] = value;
      return updatedCampos;
    });
  };

  const showMapModal = (index) => {
    console.log("Abriendo modal de mapa para el índice:", index); // Agregar log para depurar
    setCurrentIndex(index);
    setIsMapModalVisible(true);
  };

  const handleMapSelect = (latlng) => {
    if (latlng) {
      setCampos((prev) => {
        const updatedCampos = [...prev];
        updatedCampos[currentIndex] = { ...updatedCampos[currentIndex], latitud: latlng.lat, longitud: latlng.lng };
        return updatedCampos;
      });
    }
    setIsMapModalVisible(false);
  };


  const columns = [
    { title: "Nombre", dataIndex: "nombre", key: "nombre", render: (text, record) => `${text} ${record.apellido}` },
    { title: "Domicilio", dataIndex: "domicilio", key: "domicilio" },
    { title: "Localidad", dataIndex: "localidad", key: "localidad" },
    { title: "Provincia", dataIndex: "provincia", key: "provincia" },
    { title: "Teléfono", dataIndex: "telefono", key: "telefono" },
    { title: "Correo", dataIndex: "mail", key: "mail" },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}><EditOutlined /></a>
          <a onClick={() => showEditCamposModal(record)}><PushpinOutlined /></a>
          <a onClick={() => showDeleteConfirm(record._id)}><DeleteOutlined /></a>
          {/* <Button icon={<EditOutlined />} onClick={() => showEditCamposModal(record)}> </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => showDeleteConfirm(record._id)}></Button> */}
        </Space>
      ),
    },
  ];

  return (
    <>
    <Title level={5} style={{ marginTop: '0px' }}>Gestión de Clientes</Title>
      <Table columns={columns} dataSource={clientes} rowKey="_id" loading={loading} />

      {/* Modal para Editar Datos */}
      <Modal title="Editar Cliente" open={isEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleEdit}>
          {["nombre", "apellido", "domicilio", "localidad", "provincia", "telefono", "mail"].map((field) => (
            <Form.Item key={field} name={field} label={field.charAt(0).toUpperCase() + field.slice(1)} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ))}
          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar Cambios</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Confirmar Eliminación" open={isDeleteModalVisible} onOk={handleDelete} onCancel={handleCancel} okText="Eliminar" cancelText="Cancelar">
        <p>¿Estás seguro de que deseas eliminar este Cliente?</p>
      </Modal>

      {/* Modal para Editar Campos */}
      <Modal title="Editar Campos" open={isEditCamposModalVisible} onCancel={handleCancel} footer={null}
        width={400}>
        {campos.map((campo, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nombre del Campo" style={{ marginBottom: 10 }}>
                  <Input
                    placeholder="Nombre"
                    value={campo.nombre}
                    onChange={(e) => updateCampo(index, "nombre", e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cliente" style={{ marginBottom: 10 }}>
                  <Input
                    placeholder="Nombre"
                    value={currentCliente.nombre + " " + currentCliente.apellido} 
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Fila con Latitud y Longitud */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Latitud" style={{ marginBottom: 10 }}>
                  <Input
                    placeholder="Latitud"
                    value={campo.latitud}
                    onChange={(e) => updateCampo(index, "latitud", e.target.value)}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Longitud" style={{ marginBottom: 10 }}>
                  <Input
                    placeholder="Longitud"
                    value={campo.longitud}
                    onChange={(e) => updateCampo(index, "longitud", e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Button onClick={() => showMapModal(index)}>Seleccionar en Mapa</Button>
            <Button danger onClick={() => removeCampo(index)}>Eliminar</Button>
          </div>
        ))}

        <Button onClick={addCampo}>Agregar Campo</Button>
        <Button type="primary" onClick={handleEditCampos}>Guardar</Button>
      </Modal>

      <Modal
        title="Seleccionar Lugar en el Mapa"
        open={isMapModalVisible}
        onCancel={() => setIsMapModalVisible(false)}
        footer={null} >
        <MapaSelector
          onChange={handleMapSelect}
          isModalVisible={isMapModalVisible} />
      </Modal>

    </>
  );
};

export default TablaClientes;
