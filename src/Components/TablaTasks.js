import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification } from 'antd';
import axios from 'axios';

const TablaTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalTasks, setTotalTasks] = useState(0);
  const [form] = Form.useForm(); // Formulario para el modal de edición

  useEffect(() => {
    const fetchTasks = async () => {
      const { current, pageSize } = pagination;
      try {
        const response = await axios.get("https://prog-iii-swagger-nievas-nicolas.vercel.app/api/task", {
          params: { page: current, perPage: pageSize },
        });

        if (response.data.data && Array.isArray(response.data.data)) {
          setTasks(response.data.data);
          setTotalTasks(response.data.total);
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [pagination]);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };
  const showDeleteConfirm = (id) => {
    setTaskIdToDelete(id); // Guardar el ID de la tarea a eliminar
    setIsDeleteModalVisible(true); // Mostrar el modal de confirmación de eliminación
  };

  const showEditModal = (task) => {
    setCurrentTask(task); // Guardar la tarea actual a editar
    form.setFieldsValue(task); // Rellenar el formulario con los valores actuales de la tarea
    setIsEditModalVisible(true); // Mostrar el modal de edición
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false); // Ocultar el modal de eliminación
    setIsEditModalVisible(false); // Ocultar el modal de edición
    form.resetFields(); // Limpiar los campos del formulario
  };

  // Función para manejar la edición de tareas
  const handleEdit = async (values) => {
    try {
      await axios.put(`https://prog-iii-swagger-nievas-nicolas.vercel.app/api/task/${currentTask._id}`, values);
      
      // Actualizar el estado con los nuevos datos
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === currentTask._id ? { ...task, ...values } : task
        )
      );

      console.log(`Tarea con ID ${currentTask._id} actualizada.`);
      setIsEditModalVisible(false); // Cerrar el modal de edición
      openNotificationWithIcon('success', 'Tarea Editada', 'La tarea ha sido editada exitosamente.');

    } catch (error) {
      console.error('Error editing task:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al editar la tarea.');
    }
  };

  // Función para manejar la eliminación de tareas
  const handleDelete = async () => {
    try {
      await axios.delete(`https://prog-iii-swagger-nievas-nicolas.vercel.app/api/task/${taskIdToDelete}`);

      // Actualizar el estado para eliminar la tarea
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskIdToDelete));
    
      setIsDeleteModalVisible(false); // Cerrar el modal de eliminación
       // Mostrar notificación de éxito
       openNotificationWithIcon('success', 'Tarea Eliminada', 'La tarea ha sido eliminada exitosamente.');

    } catch (error) {
      console.error("Error deleting task:", error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al eliminar la tarea.');
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Usuario',
      key: 'user.lastname',
      render: (_, record) => (
        <span>{record.user && record.user.lastname ? record.user.lastname : 'sin usuario'}</span>
      ),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Resumen',
      dataIndex: 'resume',
      key: 'resume',
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
        dataSource={tasks}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalTasks,
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
        <p>¿Estás seguro de que deseas eliminar esta tarea?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Tarea"
        visible={isEditModalVisible}
        onCancel={handleCancel}
        footer={null} // No usar el footer predeterminado
      >
        <Form
          form={form}
          onFinish={handleEdit}
        >
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[{ required: true, message: 'Por favor ingresa la descripción de la tarea' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="resume"
            label="Resumen"
            rules={[{ required: true, message: 'Por favor ingresa el resumen de la tarea' }]}
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

export default TablaTasks;
