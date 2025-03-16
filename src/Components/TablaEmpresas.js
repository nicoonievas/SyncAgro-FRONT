import React, { useEffect, useState } from "react";
import { Table, Modal, Form, Input, Button, notification, Space, Select, Typography } from "antd";
import { DeleteOutlined, FormOutlined, EditOutlined } from '@ant-design/icons';
import axios from "axios";
import CrearEmpresa from './CrearEmpresa';

const { Option } = Select;
const { Title } = Typography;

const TablaEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]); // Estado para empresas filtradas
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [empresaIdToDelete, setEmpresaIdToDelete] = useState(null);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [mostrarCrearEmpresas, setMostrarCrearEmpresas] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState(''); // Estado para almacenar el término de búsqueda
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get("http://localhost:6001/api/empresas");
      if (response.data && Array.isArray(response.data)) {
        setEmpresas(response.data);
        setFilteredEmpresas(response.data); // Inicialmente, no hay filtro
      } else {
        console.error("Los datos de empresas no tienen el formato esperado:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // Filtrar las empresas por razón social o CUIT
    const filtered = empresas.filter(empresa =>
      empresa.razonSocial.toLowerCase().includes(term) || empresa.cuit.includes(term)
    );

    setFilteredEmpresas(filtered);
  };

  const handleClick = () => {
    setMostrarCrearEmpresas(prevState => !prevState);  // Invierte el estado
    fetchEmpresas();
  };

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setEmpresaIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (empresa) => {
    setCurrentEmpresa(empresa);
    form.setFieldsValue({
      ...empresa,
    });
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`http://localhost:6001/api/empresa/${currentEmpresa._id}`, values);
      setEmpresas((prevEmpresas) =>
        prevEmpresas.map((empresa) =>
          empresa._id === currentEmpresa._id ? { ...empresa, ...values } : empresa
        )
      );
      setIsEditModalVisible(false);
      openNotificationWithIcon("success", "Empresa Editada", "La empresa ha sido editada exitosamente.");
      fetchEmpresas();
    } catch (error) {
      console.error("Error al editar empresa:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/empresa/${empresaIdToDelete}`);
      setEmpresas((prevEmpresas) => prevEmpresas.filter((empresa) => empresa._id !== empresaIdToDelete));
      setIsDeleteModalVisible(false);
      openNotificationWithIcon("success", "Empresa Eliminada", "La empresa ha sido eliminada exitosamente.");
    } catch (error) {
      console.error("Error al eliminar empresa:", error);
    }
  };

  const handleCreateEmpresaSuccess = () => {
    setMostrarCrearEmpresas(false);
    fetchEmpresas();
  };

  const columns = [
    {
      title: "Razón Social",
      dataIndex: "razonSocial",
      key: "razonSocial",
    },
    {
      title: "CUIT",
      dataIndex: "cuit",
      key: "cuit",
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
    },
    {
      title: "Localidad",
      dataIndex: "localidad",
      key: "localidad",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado"
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}><EditOutlined /></a>
          <a onClick={() => showDeleteConfirm(record._id)}><DeleteOutlined /></a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={5} style={{ marginTop: '0px' }}>Gestión de Empresas</Title>
        <Input 
          style={{ width: 200 }} 
          placeholder="Buscar por Razón Social o CUIT"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredEmpresas}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <br />

      <Button type="primary" onClick={handleClick}>
        {mostrarCrearEmpresas ? "Cerrar Formulario" : "Crear Empresa"}
      </Button>

      {mostrarCrearEmpresas && <CrearEmpresa onSuccess={handleCreateEmpresaSuccess} />}

      {/* Modal de Confirmación para Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar esta empresa?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal title="Editar Empresa" open={isEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleEdit}>
          <Form.Item
            name="razonSocial"
            label="Razón Social"
            rules={[{ required: true, message: "Por favor ingresa la razón social" }]}

          >
            <Input />
          </Form.Item>
          <Form.Item
            name="cuit"
            label="CUIT"
            rules={[{ required: true, message: "Por favor ingresa el CUIT" }]}

          >
            <Input />
          </Form.Item>
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ required: false, message: "Por favor ingresa la dirección" }]}

          >
            <Input />
          </Form.Item>
          <Form.Item
            name="localidad"
            label="Localidad"
            rules={[{ required: false, message: "Por favor ingresa la localidad" }]}

          >
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="estado" label="Estado">
            <Select>
              <Option value="Activo">Activo</Option>
              <Option value="Inactivo">Inactivo</Option>
              <Option value="En Reparación">En reparación</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TablaEmpresas;
