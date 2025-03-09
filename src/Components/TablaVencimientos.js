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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiculosResponse, empleadosResponse] = await Promise.all([
        axios.get('http://localhost:6001/api/vehiculos'),
        axios.get('http://localhost:6001/api/nominas'),
      ]);

      setVehiculos(vehiculosResponse.data);
      setEmpleados(empleadosResponse.data);

      validarVencimientos(vehiculosResponse.data, empleadosResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateColor = (date) => {
    if (!date) return 'black'; // Si no hay fecha, color por defecto

    const today = dayjs();
    const diffDays = dayjs(date).diff(today, 'day');

    if (diffDays < 15) return 'red'; // Vencido
    if (diffDays <= 30) return 'orange'; // Vence en menos de una semana
    if (diffDays <= 45) return 'blue'; // Vence en menos de un mes
    return 'green'; // Falta más de un mes
  };


  const handleEditClick = (fieldName, date, id, isVehiculo) => {
    setSelectedDate(fieldName); // Guardar el campo específico que se va a editar
    setSelectedId(id);
    setIsVehiculo(isVehiculo);
    setModalVisible(true);

    form.setFieldsValue({
      fecha_vencimiento: date ? dayjs(date) : null,
    });
  };

  //sistema de notificaciones por vencimientos
  const mostrarNotificacion = new Set();
  const validarVencimientos = (vehiculos, empleados) => {
    const today = dayjs();

    vehiculos.forEach((vehiculo) => {
      if (vehiculo.fecha_vencimiento_seguro) {
        const diffDays = dayjs(vehiculo.fecha_vencimiento_seguro).diff(today, 'day');
        const key = `seguro-${vehiculo._id}`;
        //pasar logica al back para enviar correo
        if (diffDays === 30) {
          console.log(`El seguro del vehículo ${vehiculo.marca} ${vehiculo.modelo} vence en un mes.`);
        }

        if (diffDays < 15 && !mostrarNotificacion.has(key)) {
          mostrarNotificacion.add(key);
          notification.warning({
            message: 'Vencimiento de Seguro',
            description: `El seguro del vehículo ${vehiculo.marca} ${vehiculo.modelo} vence en menos de 15 días.`,
          });
        }
      }
      if (vehiculo.fecha_vencimiento_vtv) {
        const diffDays = dayjs(vehiculo.fecha_vencimiento_vtv).diff(today, 'day');
        const key = `vtv-${vehiculo._id}`;
        //pasar logica al back para enviar correo
        if (diffDays === 30) {
          console.log(`El VTV del vehículo ${vehiculo.marca} ${vehiculo.modelo} vence en un mes.`);
        }
        if (diffDays < 15 && !mostrarNotificacion.has(key)) {
          mostrarNotificacion.add(key);
          notification.warning({
            message: 'Vencimiento de VTV',
            description: `El VTV del vehículo ${vehiculo.marca} ${vehiculo.modelo} vence en menos de 15 días.`,
          });
        }
      }
    });

    empleados.forEach((empleado) => {
      if (empleado.licenciaVencimiento) {
        const diffDays = dayjs(empleado.licenciaVencimiento).diff(today, 'day');
        const key = `licencia-${empleado._id}`;
        //pasar logica al back para enviar correo
        if (diffDays === 30) {
          console.log(`La licencia del empleado ${empleado.firstname} ${empleado.lastname} vence en un mes.`);
        }
        if (diffDays < 15 && !mostrarNotificacion.has(key)) {
          mostrarNotificacion.add(key);
          notification.warning({
            message: 'Vencimiento de Licencia',
            description: `La licencia del empleado ${empleado.firstname} ${empleado.lastname} vence en menos de 15 días.`,
          });
        }
      }
      if (empleado.dniVencimiento) {
        const diffDays = dayjs(empleado.dniVencimiento).diff(today, 'day');
        const key = `dni-${empleado._id}`;
        //pasar logica al back para enviar correo
        if (diffDays === 30) {
          console.log(`El DNI del empleado ${empleado.firstname} ${empleado.lastname} vence en un mes.`);
        }
        if (diffDays < 15 && !mostrarNotificacion.has(key)) {
          mostrarNotificacion.add(key);
          notification.warning({
            message: 'Vencimiento de DNI',
            description: `El DNI del empleado ${empleado.firstname} ${empleado.lastname} vence en menos de 15 días.`,
          });
        }
      }
      if (empleado.aptoFisicoVencimiento) {
        const diffDays = dayjs(empleado.aptoFisicoVencimiento).diff(today, 'day');
        const key = `aptoFisico-${empleado._id}`;
        //pasar logica al back para enviar correo
        if (diffDays === 30) {
          console.log(`El Apto Fisico del empleado ${empleado.firstname} ${empleado.lastname} vence en un mes.`);
        }

        if (diffDays < 15 && !mostrarNotificacion.has(key)) {
          mostrarNotificacion.add(key);
          notification.warning({
            message: 'Vencimiento de Apto Fisico',
            description: `El Apto Fisico del empleado ${empleado.firstname} ${empleado.lastname} vence en menos de 15 días.`,
          });
        }
      }
    });
  };


  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();

      const formattedValues = {
        [selectedDate]: values.fecha_vencimiento ? values.fecha_vencimiento.format('YYYY-MM-DD') : null
      };

      const url = isVehiculo
        ? `http://localhost:6001/api/vehiculo/${selectedId}`
        : `http://localhost:6001/api/nomina/${selectedId}`;

      await axios.put(url, formattedValues);

      notification.success({
        message: 'Fecha Editada',
        description: 'El Vencimiento ha sido editado exitosamente.',
      });

      setModalVisible(false);
      fetchData();

    } catch (error) {
      console.error('Error al actualizar fecha:', error);
      notification.error({
        message: 'Error',
        description: 'Hubo un problema al editar el Vencimiento.'
      });
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
    {
      title: 'Marca y Modelo',
      key: 'marca_modelo',
      render: (_, record) => `${record.marca} ${record.modelo}`
    },
    { title: 'Dominio', dataIndex: 'dominio', key: 'dominio',  render: (dominio) => (
      <span style={{ fontWeight: 'bold', border: '1px solid black', padding: '4px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px' }}>
        {dominio}
      </span>
    ) },
    { title: 'Alias', dataIndex: 'alias', key: 'alias' },
    {
      title: 'Seguro Venc.',
      dataIndex: 'fecha_vencimiento_seguro',
      key: 'seguro',
      render: (text, record) => (
        <a
          onClick={() => handleEditClick('fecha_vencimiento_seguro', text, record._id, true)}
          style={{ color: getDateColor(text) }}
        >
          {text}
        </a>
      ),
    },
    {
      title: 'VTV Venc.',
      dataIndex: 'fecha_vencimiento_vtv',
      key: 'vtv',
      render: (text, record) => (
        <a onClick={() => handleEditClick('fecha_vencimiento_vtv', text, record._id, true)}
          style={{ color: getDateColor(text) }}>{text}</a>
      ),
    },

  ];

  const empleadosColumns = [
    {
      title: 'Nombre y Apellido',
      key: 'nombre_apellido',
      render: (_, record) => `${record.firstname} ${record.lastname}`
    },
    { title: 'Documento', dataIndex: 'documento', key: 'documento',  render: (documento) => (
      <span style={{ fontWeight: 'bold'}}>
        {documento}
      </span> )
      },
    {
      title: 'Licencia Venc.',
      dataIndex: 'licenciaVencimiento',
      key: 'licencia',
      render: (text, record) => (
        <a onClick={() => handleEditClick('licenciaVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >{text}</a>
      ),
    },
    {
      title: 'DNI Venc.',
      dataIndex: 'dniVencimiento',
      key: 'dni',
      render: (text, record) => (
        <a onClick={() => handleEditClick('dniVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >{text}</a>
      ),
    },
    {
      title: 'Apto Físico Venc.',
      dataIndex: 'aptoFisicoVencimiento',
      key: 'apto',
      render: (text, record) => (
        <a onClick={() => handleEditClick('aptoFisicoVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >{text}</a>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <h3>Documentacion de Vehículos</h3>
      <Table
        columns={vehiculosColumns}
        dataSource={vehiculos}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 4 }}
      />

      <h3>Documentacion de Empleados</h3>
      <Table
        columns={empleadosColumns}
        dataSource={empleados}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 4 }}
      />

      <Modal
        title="Editar Fecha"
        visible={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={300}
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

