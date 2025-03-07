import React, { useEffect, useState } from "react";
import { Space, Table, Modal, Form, Input, Button, notification, Select } from "antd";
import {DeleteOutlined, FormOutlined, EditOutlined} from '@ant-design/icons';
import axios from "axios";

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]); // Estado para las empresas
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [usuarioIdToDelete, setUsuarioIdToDelete] = useState(null);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:6001/api/usuarios");
        if (response.data && Array.isArray(response.data)) {
          setUsuarios(response.data);
        } else {
          console.error("Los datos no tienen el formato esperado:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmpresas = async () => {
      try {
        const response = await axios.get("http://localhost:6001/api/empresas"); // Obtener empresas
        if (response.data && Array.isArray(response.data)) {
          setEmpresas(response.data);
        } else {
          console.error("Los datos de empresas no tienen el formato esperado:", response.data);
        }
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    fetchUsuarios();
    fetchEmpresas(); // Llamar para obtener empresas
  }, []);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setUsuarioIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (usuario) => {
    setCurrentUsuario(usuario);
    form.setFieldsValue({
      ...usuario,
      empresa: usuario.empresa ? usuario.empresa._id : null, // Asignar el ID de la empresa al campo empresa
    });
    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const handleEmpresaSelect = (value) => {
    const selectedEmpresa = empresas.find((empresa) => empresa._id === value);
    setSelectedEmpresa(selectedEmpresa);
  };
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleEdit = async (values) => {
    try {
      // Si se ha seleccionado una empresa, incluirla en los datos del usuario
      if (values.empresa) {
        values.empresa = values.empresa; // No es necesario cambiar nada aquí
      } else {
        values.empresa = null; // Si no se asigna empresa, dejar como null
      }
  
      // Actualizar el usuario en el backend
      await axios.put(`http://localhost:6001/api/usuario/${currentUsuario._id}`, values);
  
      // Actualizar el usuario en el estado local
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario._id === currentUsuario._id ? { ...usuario, ...values } : usuario
        )
      );
  
      // Cerrar el modal de edición
      setIsEditModalVisible(false);
  
      // Mostrar la notificación de éxito
      openNotificationWithIcon("success", "Usuario Editado", "El usuario ha sido editado exitosamente.");
  
      // Opcionalmente, podemos recargar la lista de usuarios
      const response = await axios.get("http://localhost:6001/api/usuarios");
      if (response.data && Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        console.error("Los datos no tienen el formato esperado:", response.data);
      }
    } catch (error) {
      console.error("Error al editar usuario:", error);
    }
  };
  

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/usuarios/${usuarioIdToDelete}`);
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario._id !== usuarioIdToDelete));
      setIsDeleteModalVisible(false);
      openNotificationWithIcon("success", "Usuario Eliminado", "El usuario ha sido eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
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
      title: "Correo Electrónico",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
    },
    {
      title: "Empresa",
      dataIndex: "empresa",
      key: "empresa",
      render: (empresa) => empresa ? empresa.razonSocial : "Sin asignar", // Mostrar nombre de la empresa si existe
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
      <Table columns={columns} dataSource={usuarios} rowKey="_id" loading={loading} />

      {/* Modal de Confirmación para Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal title="Editar Usuario" open={isEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleEdit}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: "Por favor ingresa el nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: false, message: "Por favor ingresa el apellido" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, message: "Por favor ingresa el correo" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="telefono" label="Teléfono" rules={[{ required: false, message: "Por favor ingresa el teléfono" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rol" label="Rol" rules={[{ required: true, message: "Por favor ingresa el rol" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="empresa"
            label="Empresa">
            <Select
              showSearch
              placeholder="Seleccionar empresa"
              optionFilterProp="children"
              onChange={handleEmpresaSelect}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {empresas.map((empresa) => (
                <Select.Option key={empresa._id} value={empresa._id}>
                  {`${empresa.razonSocial} - CUIT: ${empresa.cuit}`}
                </Select.Option>
              ))}
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

export default TablaUsuarios;
