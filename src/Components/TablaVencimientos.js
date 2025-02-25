import React, { useState, useEffect } from 'react';
import { Table, Space, Modal, Input, Button, DatePicker, Form, notification } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const TablasVencimientos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isVehiculo, setIsVehiculo] = useState(false);
  const [form] = Form.useForm(); 
  const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 10,
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiculosResponse, empleadosResponse] = await Promise.all([
          axios.get('http://localhost:6001/api/vehiculos'),
          axios.get('http://localhost:6001/api/nominas'),
        ]);

        setVehiculos(vehiculosResponse.data);
        setEmpleados(empleadosResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (date, id, isVehiculo) => {
    setSelectedDate(date);
    setSelectedId(id);
    setIsVehiculo(isVehiculo);
    setModalVisible(true);

    // Set the form values (DatePicker) with the current date
    form.setFieldsValue({
      fecha_vencimiento: dayjs(date),  // Convert date to dayjs object
    });
  };

  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();
      let formattedValues = {};
  
      if (isVehiculo) {
        // Si solo se actualiza un campo (como fecha_vencimiento_vtv)
        if (selectedDate) {
          formattedValues = {
            [selectedDate]: values.fecha_vencimiento ? values.fecha_vencimiento.format('YYYY-MM-DD') : null
          };
        } 
      } else {
        // Si es empleado, puedes hacer lo mismo
        formattedValues = {
          [selectedDate]: values.fecha_vencimiento ? values.fecha_vencimiento.format('YYYY-MM-DD') : null
        };
      }
  
      // Enviar al backend el valor del campo o el objeto completo
      if (isVehiculo) {
        await axios.put(`http://localhost:6001/api/vehiculo/${selectedId}`, formattedValues);
        console.log('Vehiculo actualizado:', selectedId, formattedValues);
      } else {
        await axios.put(`http://localhost:6001/api/empleado/${selectedId}`, formattedValues);
      }
  
      notification.success({ message: 'Fecha Editada', description: 'El Vencimiento ha sido editado exitosamente.' });
      setModalVisible(false);
      handleTableChange({ current: pagination.current, pageSize: pagination.pageSize });
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      notification.error({ message: 'Error', description: 'Hubo un problema al editar el Vencimiento.' });
    }
  };
  
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const vehiculosColumns = [
    { title: 'Marca y Modelo', 
      key: 'marca_modelo', 
      render: (_, record) => `${record.marca} ${record.modelo}` },
    { title: 'Dominio', dataIndex: 'dominio', key: 'dominio' },
    { title: 'Alias', dataIndex: 'alias', key: 'alias' },
    { 
      title: 'Seguro Venc.', 
      dataIndex: 'fecha_vencimiento_seguro', 
      key: 'seguro', 
      render: (text, record) => <a onClick={() => handleEditClick(text, record._id, true)}>{text}</a>, 
    },
    { 
      title: 'VTV Venc.', 
      dataIndex: 'fecha_vencimiento_vtv', 
      key: 'vtv', 
      render: (text, record) => <a onClick={() => handleEditClick(text, record._id, true)}>{text}</a>, 
    },
  ];

  const empleadosColumns = [
    {
      title: 'Nombre y Apellido',
      key: 'nombre_apellido',
      render: (_, record) => `${record.firstname} ${record.lastname}`
    },
    { title: 'Documento', dataIndex: 'documento', key: 'documento' },
    { 
      title: 'Licencia Venc.', 
      dataIndex: 'licenciaVencimiento', 
      key: 'licencia', 
      render: (text, record) => <a onClick={() => handleEditClick(text, record._id, false)}>{text}</a>, 
    },
    { 
      title: 'DNI Venc.', 
      dataIndex: 'dniVencimiento', 
      key: 'dni', 
      render: (text, record) => <a onClick={() => handleEditClick(text, record._id, false)}>{text}</a>, 
    },
    { 
      title: 'Apto Físico Venc.', 
      dataIndex: 'aptoFisicoVencimiento', 
      key: 'apto', 
      render: (text, record) => <a onClick={() => handleEditClick(text, record._id, false)}>{text}</a>, 
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <h2>Vehículos</h2>
      <Table 
        columns={vehiculosColumns} 
        dataSource={vehiculos} 
        rowKey="_id" 
        loading={loading} 
        pagination={{ pageSize: 5 }} 
      />
      
      <h2>Empleados</h2>
      <Table 
        columns={empleadosColumns} 
        dataSource={empleados} 
        rowKey="_id" 
        loading={loading} 
        pagination={{ pageSize: 5 }} 
      />

      <Modal
        title="Editar Fecha"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Fecha Vencimiento" name="fecha_vencimiento">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TablasVencimientos;

