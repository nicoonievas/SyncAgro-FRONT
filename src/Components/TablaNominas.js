import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker } from 'antd';
import axios from 'axios';


const TablaNominas = () => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [nominaIdToDelete, setNominaIdToDelete] = useState(null);
  const [currentNomina, setCurrentNomina] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalNominas, setTotalNominas] = useState(0);
  const [form] = Form.useForm(); // Formulario para el modal de edición

  useEffect(() => {
    const fetchNominas = async () => {
      const { current, pageSize } = pagination;
      try {
        const response = await axios.get("http://localhost:6001/api/nominas", {
          params: { page: current, perPage: pageSize },
        });

        if (response.data && Array.isArray(response.data)) {
          setNominas(response.data);
          setTotalNominas(response.data.length);
        } else {
          console.error('Data is not in expected format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching nominas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNominas();
  }, [pagination]);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setNominaIdToDelete(id); // Guardar el ID de la nómina a eliminar
    setIsDeleteModalVisible(true); // Mostrar el modal de confirmación de eliminación
  };

  const showEditModal = (nomina) => {
    setCurrentNomina(nomina);


    form.setFieldsValue({
      ...nomina,

    });

    setIsEditModalVisible(true);
  };



  const handleCancel = () => {
    setIsDeleteModalVisible(false); // Ocultar el modal de eliminación
    setIsEditModalVisible(false); // Ocultar el modal de edición
    form.resetFields(); // Limpiar los campos del formulario
  };

  // Función para manejar la edición de nóminas
  const handleEdit = async (values) => {
    try {
      // Las fechas ya están en formato YYYY-MM-DD, por lo que las podemos enviar directamente
      await axios.put(`http://localhost:6001/api/nomina/${currentNomina._id}`, values);

      // Actualizar el estado con los nuevos datos
      setNominas((prevNominas) =>
        prevNominas.map((nomina) =>
          nomina._id === currentNomina._id ? { ...nomina, ...values } : nomina
        )
      );

      setIsEditModalVisible(false);
      openNotificationWithIcon('success', 'Nómina Editada', 'La nómina ha sido editada exitosamente.');
    } catch (error) {
      console.error('Error editing nomina:', error);
    }
  };

  // Función para manejar la eliminación de nóminas
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/nomina/${nominaIdToDelete}`);

      // Actualizar el estado para eliminar la nómina
      setNominas((prevNominas) => prevNominas.filter((nomina) => nomina._id !== nominaIdToDelete));

      setIsDeleteModalVisible(false); // Cerrar el modal de eliminación
      openNotificationWithIcon('success', 'Nómina Eliminada', 'La nómina ha sido eliminada exitosamente.');
    } catch (error) {
      console.error("Error deleting nomina:", error);
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'firstname',
      key: 'firstname',
      render: (text, record) => <span>{text} {record.lastname}</span>,
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
        dataSource={nominas}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalNominas,
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
        loading={loading}
      />

      {/* Modal de Confirmación para Eliminación */}
      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDelete} // Manejar la eliminación al confirmar
        onCancel={handleCancel} // Cerrar el modal al cancelar
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar esta nómina?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Nómina"
        open={isEditModalVisible}
        onCancel={handleCancel}
        footer={null} // No usar el footer predeterminado
      >
        <Form
          form={form}
          onFinish={handleEdit}
        >
          <Form.Item
            name="firstname"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="lastname"
            label="Apellido"
            rules={[{ required: true, message: 'Por favor ingresa el apellido del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Por favor ingresa el email del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="domicilio"
            label="Domicilio"
            rules={[{ required: true, message: 'Por favor ingresa el domicilio del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="celular"
            label="Celular"
            rules={[{ required: true, message: 'Por favor ingresa el celular del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Telefono Emergencia"
            rules={[{ required: true, message: 'Por favor ingresa el Telefono de emergencia' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="documento"
            label="Documento"
            rules={[{ required: true, message: 'Por favor ingresa el documento del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="rol"
            label="Rol"
            rules={[{ required: true, message: 'Por favor ingresa el rol del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="area"
            label="Área"
            rules={[{ required: true, message: 'Por favor ingresa el área del empleado' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Vencimiento de Licencia">
  <DatePicker format="YYYY-MM-DD" />
</Form.Item>

<Form.Item label="Vencimiento de Apto Fisico">
  <DatePicker format="YYYY-MM-DD" />
</Form.Item>

<Form.Item label="Vencimiento DNI">
  <DatePicker format="YYYY-MM-DD" />
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

export default TablaNominas;

