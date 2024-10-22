import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification } from 'antd';
import axios from 'axios';

const TablaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [usuarioIdToDelete, setUsuarioIdToDelete] = useState(null);
  const [currentUsuario, setCurrentUsuario] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [form] = Form.useForm(); // Formulario para el modal de edición

  useEffect(() => {
    const fetchUsuarios = async () => {
      const { current, pageSize } = pagination;
      try {
        const response = await axios.get("https://prog-iii-swagger-nievas-nicolas.vercel.app/api/user", {
          params: { page: current, perPage: pageSize },
        });

        if (response.data.data && Array.isArray(response.data.data)) {
          setUsuarios(response.data.data);
          setTotalUsuarios(response.data.total);
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [pagination]);


  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setUsuarioIdToDelete(id); // Guardar el ID del usuario a eliminar
    setIsDeleteModalVisible(true); // Mostrar el modal de confirmación de eliminación
  };

  const showEditModal = (usuario) => {
    setCurrentUsuario(usuario); // Guardar el usuario actual a editar
    form.setFieldsValue(usuario); // Rellenar el formulario con los valores actuales del usuario
    setIsEditModalVisible(true); // Mostrar el modal de edición
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false); // Ocultar el modal de eliminación
    setIsEditModalVisible(false); // Ocultar el modal de edición
    form.resetFields(); // Limpiar los campos del formulario
  };

  // Función para manejar la edición de usuarios
  const handleEdit = async (values) => {
    try {
      await axios.put(`https://prog-iii-swagger-nievas-nicolas.vercel.app/api/user/${currentUsuario._id}`, values);
      
      // Actualizar el estado con los nuevos datos
      setUsuarios((prevUsuarios) =>
        prevUsuarios.map((usuario) =>
          usuario._id === currentUsuario._id ? { ...usuario, ...values } : usuario
        )
      );

      console.log(`Usuario con ID ${currentUsuario._id} actualizado.`);
      setIsEditModalVisible(false); // Cerrar el modal de edición

      openNotificationWithIcon('success', 'Usuario Editado', 'El usuario ha sido editado exitosamente.');

    } catch (error) {
      console.error('Error editing user:', error);
    }
  };

  // Función para manejar la eliminación de usuarios
  const handleDelete = async () => {
    try {
      await axios.delete(`https://prog-iii-swagger-nievas-nicolas.vercel.app/api/user/${usuarioIdToDelete}`);

      // Actualizar el estado para eliminar el usuario
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario._id !== usuarioIdToDelete));
    
      setIsDeleteModalVisible(false); // Cerrar el modal de eliminación
      openNotificationWithIcon('success', 'Usuario Eliminado', 'El usuario ha sido eliminado exitosamente.');
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const columns = [
    {
      title: 'Apellido',
      dataIndex: 'lastname',
      key: 'lastname',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Domicilio',
      dataIndex: 'domicilio',
      key: 'domicilio',
    },
    {
      title: 'Celular',
      dataIndex: 'celular',
      key: 'celular',
    },
    {
      title: 'Documento',
      dataIndex: 'documento',
      key: 'documento',
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
    },
    {
      title: 'Área',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>Editar</a>
          <a onClick={() => showDeleteConfirm(record._id)}>Eliminar</a>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalUsuarios,
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        loading={loading}
      />

      {/* Modal de Confirmación para Eliminación */} 
      <Modal
        title="Confirmar Eliminación"
        visible={isDeleteModalVisible}
        onOk={handleDelete} // Manejar la eliminación al confirmar
        onCancel={handleCancel} // Cerrar el modal al cancelar
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Usuario"
        visible={isEditModalVisible}
        onCancel={handleCancel}
        footer={null} // No usar el footer predeterminado
      >
        <Form
          form={form}
          onFinish={handleEdit}
        >
          <Form.Item
            name="lastname"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingresa el apellido del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Por favor ingresa el email del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="domicilio"
            label="Domicilio"
            rules={[{ required: true, message: 'Por favor ingresa el domicilio del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="celular"
            label="Celular"
            rules={[{ required: true, message: 'Por favor ingresa el celular del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="documento"
            label="Documento"
            rules={[{ required: true, message: 'Por favor ingresa el documento del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor ingresa el rol del usuario' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="area"
            label="Área"
            rules={[{ required: true, message: 'Por favor ingresa el área del usuario' }]}
          >
            <Input />
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
