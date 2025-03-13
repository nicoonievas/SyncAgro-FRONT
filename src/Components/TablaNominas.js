import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker, Checkbox, Typography, Select } from 'antd';
import { DeleteOutlined, FormOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import useAxiosInterceptor from '../utils/axiosConfig';


const { Title } = Typography;
const { Option } = Select;

const TablaNominas = ({ empresa }) => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [nominaIdToDelete, setNominaIdToDelete] = useState(null);
  const [currentNomina, setCurrentNomina] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [totalNominas, setTotalNominas] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    setEmpresaId(empresa._id);
  }, [empresa]);

  // Llama a la API solo cuando empresaId esté disponible
  const api = useAxiosInterceptor(empresaId);

  useEffect(() => {
    if (empresaId) {
      fetchNominas();
    } else {
      // console.log('Esperando empresaId...');
    }
  }, [empresaId]);

  const fetchNominas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/nominas');
      setNominas(response.data);
      setTotalNominas(response.data.length);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setLoading(false);
    }
  };

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  const showDeleteConfirm = (id) => {
    setNominaIdToDelete(id);
    setIsDeleteModalVisible(true);
  };
  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    form.resetFields();
  };

  const showEditModal = (nomina) => {
    setCurrentNomina(nomina);
    form.setFieldsValue({
      ...nomina,
      // Convirtiendo las fechas a dayjs para su visualización en formato 'DD-MM-YYYY'
      licenciaVencimiento: nomina.licenciaVencimiento ? dayjs(nomina.licenciaVencimiento) : null,
      aptoFisicoVencimiento: nomina.aptoFisicoVencimiento ? dayjs(nomina.aptoFisicoVencimiento) : null,
      dniVencimiento: nomina.dniVencimiento ? dayjs(nomina.dniVencimiento) : null,
      estado: nomina.estado === 1
    });
    setIsEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      // Formateando las fechas en formato 'YYYY-MM-DD' (timestamp) antes de enviarlas
      const formattedValues = {
        ...values,
        licenciaVencimiento: values.licenciaVencimiento ? values.licenciaVencimiento.valueOf() : null,
        aptoFisicoVencimiento: values.aptoFisicoVencimiento ? values.aptoFisicoVencimiento.valueOf() : null,
        dniVencimiento: values.dniVencimiento ? values.dniVencimiento.valueOf() : null,
        estado: values.estado
      };

      // Enviando los datos al backend
      await axios.put(`http://localhost:6001/api/nomina/${currentNomina._id}`, formattedValues);

      // Actualizando la lista de nóminas con la nueva información
      setNominas((prevNominas) =>
        prevNominas.map((nomina) =>
          nomina._id === currentNomina._id ? { ...nomina, ...formattedValues } : nomina
        )
      );

      // Cerrando el modal y mostrando notificación
      setIsEditModalVisible(false);
      openNotificationWithIcon('success', 'Nómina Editada', 'La nómina ha sido editada exitosamente.');
    } catch (error) {
      console.error('Error editing nomina:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un error al editar la nómina.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/nomina/${nominaIdToDelete}`);

      setNominas((prevNominas) => prevNominas.filter((nomina) => nomina._id !== nominaIdToDelete));

      setIsDeleteModalVisible(false);
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
          <a onClick={() => showEditModal(record)}><EditOutlined /></a>
          <a onClick={() => showDeleteConfirm(record._id)}><DeleteOutlined /></a>
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
      <Title level={5} style={{ marginTop: '0px' }}>Gestión de Empleados</Title>
      <Table
        columns={columns}
        dataSource={nominas}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalNominas,
          showSizeChanger: true, // Habilita el selector de cantidad de registros por página
          pageSizeOptions: ['5', '10', '20', '50'], // Opciones disponibles en el selector
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
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
        <p>¿Estás seguro de que deseas eliminar esta nómina?</p>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        title="Editar Nómina"
        open={isEditModalVisible}
        onCancel={handleCancel}
        footer={null}
      >

        <Form form={form} onFinish={handleEdit}>
          <Form.Item name="firstname" label="Nombre" rules={[{ required: true, message: 'Por favor ingresa el nombre del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lastname" label="Apellido" rules={[{ required: true, message: 'Por favor ingresa el apellido del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Por favor ingresa el email del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="domicilio" label="Domicilio" rules={[{ required: true, message: 'Por favor ingresa el domicilio del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="celular" label="Celular" rules={[{ required: true, message: 'Por favor ingresa el celular del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono Emergencia" rules={[{ required: true, message: 'Por favor ingresa el teléfono de emergencia' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="documento" label="Documento" rules={[{ required: true, message: 'Por favor ingresa el documento del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="rol" label="Rol / Cargo" rules={[{ required: true, message: 'Por favor ingresa el rol del empleado' }]}>
            <Input />
          </Form.Item>

          <Form.Item name="area" label="Área">
            <Input />
          </Form.Item>

          <Form.Item label="Vencimiento de Licencia" name="licenciaVencimiento"
            rules={[{ required: true, message: 'Ingresa la fecha de vencimiento' }]}>
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item label="Vencimiento de Apto Físico" name="aptoFisicoVencimiento"
            rules={[{ required: true, message: 'Ingresa la fecha de vencimiento' }]}>
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item label="Vencimiento DNI" name="dniVencimiento"
            rules={[{ required: true, message: 'Ingresa la fecha de vencimiento' }]}>
            <DatePicker format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item name="estado" label="Estado">
            <Select>
              <Option value="Activo">Activo</Option>
              <Option value="Inactivo">Inactivo</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar Cambios</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TablaNominas;
