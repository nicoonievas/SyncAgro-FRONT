import React, { useEffect, useState } from "react";
import { Space, Table, Modal, Form, Input, Button, notification, Row, Col, Typography, Select } from "antd";
import { DeleteOutlined, EditOutlined, PushpinOutlined, PlusOutlined, VerticalAlignBottomOutlined, EnvironmentOutlined } from "@ant-design/icons";
import axios from "axios";
import MapaSelector from "../MapSelector";
import useAxiosInterceptor from "../../utils/axiosConfig";

const { Option } = Select;
const { Title } = Typography;
const TablaClientes = ({ empresa, usuario }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditCamposModalVisible, setIsEditCamposModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [clienteIdToDelete, setClienteIdToDelete] = useState(null);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [form] = Form.useForm();
  const [campos, setCampos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);



  // console.log("empresaId en tabla:", empresa._id);

  useEffect(() => {
    setEmpresaId(empresa._id);
  }, [empresa]);

  // Llama a la API solo cuando empresaId esté disponible
  const api = useAxiosInterceptor(empresaId);

  useEffect(() => {
    if (empresaId) {
      fetchClientes();
    } else {
      // console.log('Esperando empresaId...');
    }
  }, [empresaId]);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await api.get('/provincias');
        setProvincias(response.data);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
        openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las provincias.');
      }
    };

    fetchProvincias();
  }, [api]);

  useEffect(() => {
    // Si hay provincia seleccionada, cargar las localidades
    if (selectedProvincia) {
      const fetchLocalidades = async () => {
        try {
          const response = await api.get(`/localidades/${selectedProvincia}`);
          setLocalidades(response.data);
        } catch (error) {
          console.error('Error al cargar localidades:', error);
          openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las localidades.');
        }
      };

      fetchLocalidades();
    }
  }, [selectedProvincia, api]);


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
    const coordenadasIniciales = campos[index]?.latitud && campos[index]?.longitud
      ? { lat: campos[index].latitud, lng: campos[index].longitud }
      : null; // Si no hay coordenadas, dejarlo en null

    setCurrentIndex(index);
    setSelectedCoords(coordenadasIniciales); // Guardar las coordenadas en el estado
    setIsMapModalVisible(true);
  };

  const handleMapSelect = (latlng) => {
    if (latlng) {
      setCampos((prev) => {
        const updatedCampos = [...prev];
        updatedCampos[currentIndex] = {
          ...updatedCampos[currentIndex],
          latitud: latlng.lat,
          longitud: latlng.lng
        };
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
          <a onClick={() => showEditCamposModal(record)}><EnvironmentOutlined /></a>
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
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
            <Input />
          </Form.Item>



          <Form.Item name="provincia" label="Provincia" rules={[{ required: true }]}>
            <Select
              value={selectedProvincia}
              onChange={value => {
                setSelectedProvincia(value);  // Aquí 'value' es el código de la provincia
                form.setFieldsValue({ provincia: value });  // Esto actualizará el formulario con el código
              }}
              placeholder="Selecciona una provincia"
            >
              {provincias.map((provincia) => (
                <Option key={provincia.code} value={provincia.code}>
                  {provincia.name}
                </Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item name="localidad" label="Localidad" rules={[{ required: true }]}>
            <Select
              value={selectedLocalidad}
              onChange={value => {
                setSelectedLocalidad(value);
                form.setFieldsValue({ localidad: value }); // Actualizar el valor en el formulario
              }}
              placeholder="Selecciona una localidad"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {localidades.map((localidad) => (
                <Option key={localidad.name} value={localidad.name}>
                  {localidad.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

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
                    disabled
                    onChange={(e) => updateCampo(index, "latitud", e.target.value)}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Longitud" style={{ marginBottom: 10 }}>
                  <Input
                    placeholder="Longitud"
                    value={campo.longitud}
                    disabled
                    onChange={(e) => updateCampo(index, "longitud", e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={8}>
              <Col span={12}>
                <Button block onClick={() => showMapModal(index)}> <EnvironmentOutlined /> Seleccionar en Mapa</Button>
              </Col>
              <Col span={12}>
                <Button danger block onClick={() => removeCampo(index)}>Eliminar</Button>
              </Col>
            </Row>
          </div>
        ))}
        <Row gutter={8}>
          <Col span={12}>
            <Button block onClick={addCampo}> <PlusOutlined /> Agregar Campo</Button>
          </Col>
          <Col span={12}>
            <Button block type="primary" onClick={handleEditCampos}>Guardar</Button>
          </Col>
        </Row>
      </Modal>

      <Modal
        title="Seleccionar Lugar en el Mapa"
        open={isMapModalVisible}
        onCancel={() => setIsMapModalVisible(false)}
        footer={null} >
        <MapaSelector
          onChange={handleMapSelect}
          isModalVisible={isMapModalVisible}
          coordenadasIniciales={selectedCoords}
        />
      </Modal>

    </>
  );
};

export default TablaClientes;
