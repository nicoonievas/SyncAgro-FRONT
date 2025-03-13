import React, { useState, useEffect } from 'react';
import { Table, Space, Modal, Input, Button, DatePicker, Form, notification } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import useAxiosInterceptor from '../utils/axiosConfig';

const TablasVencimientos = ({ empresa, usuario }) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [isVehiculo, setIsVehiculo] = useState(false);
  const [form] = Form.useForm();
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [totalVehiculos, setTotalVehiculos] = useState(0);
  const [empresaId, setEmpresaId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    setEmpresaId(empresa._id);
  }, [empresa]);

  // Llama a la API solo cuando empresaId esté disponible
  const api = useAxiosInterceptor(empresaId);

  useEffect(() => {
    if (empresaId) {
      fetchData();
    } else {
      // console.log('Esperando empresaId...');
    }
  }, [empresaId]);

  const fetchData = async () => {
    try {
      const [vehiculosResponse, empleadosResponse] = await Promise.all([
        api.get('/vehiculos'),
        api.get('/nominas'),
      ]);

      setVehiculos(vehiculosResponse.data);
      setTotalVehiculos(vehiculosResponse.data.length);
      setEmpleados(empleadosResponse.data);
      setTotalEmpleados(empleadosResponse.data.length);

      validarVencimientos(vehiculosResponse.data, empleadosResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
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


 const getDateColor = (date) => {
  if (!date) return 'black'; // Si no hay fecha, color por defecto

  const today = dayjs(); // Fecha actual
  const formattedDate = dayjs(date); // `date` ya debería ser un `timestamp` o un objeto `Date`

  const diffDays = formattedDate.diff(today, 'day'); // Comparación real de fechas

  if (diffDays < 15) return 'red'; // Vencido
  if (diffDays <= 30) return 'orange'; // Vence en menos de un mes
  if (diffDays <= 45) return 'blue'; // Vence en menos de un mes
  return 'green'; // Falta más de un mes
};

// Sistema de notificaciones por vencimientos
const mostrarNotificacion = new Set();
const validarVencimientos = (vehiculos, empleados) => {
  const today = dayjs(); // Fecha actual

  vehiculos.forEach((vehiculo) => {
    if (vehiculo.fecha_vencimiento_seguro) {
      const fechaSeguro = dayjs(vehiculo.fecha_vencimiento_seguro); // Usamos el timestamp
      const diffDays = fechaSeguro.diff(today, 'day');
      const key = `seguro-${vehiculo._id}`;
      // Lógica para enviar correo al backend
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
      const fechaVtv = dayjs(vehiculo.fecha_vencimiento_vtv); // Usamos el timestamp
      const diffDays = fechaVtv.diff(today, 'day');
      const key = `vtv-${vehiculo._id}`;
      // Lógica para enviar correo al backend
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
      const fechaLicencia = dayjs(empleado.licenciaVencimiento); // Usamos el timestamp
      const diffDays = fechaLicencia.diff(today, 'day');
      const key = `licencia-${empleado._id}`;
      // Lógica para enviar correo al backend
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
      const fechaDni = dayjs(empleado.dniVencimiento); // Usamos el timestamp
      const diffDays = fechaDni.diff(today, 'day');
      const key = `dni-${empleado._id}`;
      // Lógica para enviar correo al backend
      if (diffDays === 30) {
        console.log(`El DNI del empleado ${empleado.firstname} ${empleado.lastname} vence en un mes.`);
      }
      if (diffDays < 15 && !mostrarNotificacion.has(key)) {
        mostrarNotificacion.add(key);
        notification.warning({
          message: 'Vencimiento de DNI',
          description: `El DNI del empleado ${empleado.firstname} ${empleado.lastname} vence en menos de 15 días.`,
        });
      }
    }
    if (empleado.aptoFisicoVencimiento) {
      const fechaAptoFisico = dayjs(empleado.aptoFisicoVencimiento); // Usamos el timestamp
      const diffDays = fechaAptoFisico.diff(today, 'day');
      const key = `aptoFisico-${empleado._id}`;
      // Lógica para enviar correo al backend
      if (diffDays === 30) {
        console.log(`El Apto Fisico del empleado ${empleado.firstname} ${empleado.lastname} vence en un mes.`);
      }

      if (diffDays < 15 && !mostrarNotificacion.has(key)) {
        mostrarNotificacion.add(key);
        notification.warning({
          message: 'Vencimiento de Apto Fisico',
          description: `El Apto Fisico del empleado ${empleado.firstname} ${empleado.lastname} vence en menos de 15 días.`,
        });
      }
    }
  });
};


  const handleOk = async () => {
    try {
      const values = form.getFieldsValue();

      const formattedValues = {
        [selectedDate]: values.fecha_vencimiento ? values.fecha_vencimiento.valueOf() : null,
      };

      const url = isVehiculo
        ? `http://localhost:6001/api/vehiculo/${selectedId}`
        : `http://localhost:6001/api/nomina/${selectedId}`;

      await axios.put(url, formattedValues);

      notification.success({
        message: 'Fecha Modificada',
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
    {
      title: 'Dominio', dataIndex: 'dominio', key: 'dominio', render: (dominio) => (
        <span style={{ fontWeight: 'bold', border: '1px solid black', padding: '4px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px' }}>
          {dominio}
        </span>
      )
    },
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
          {text ? dayjs(text).format('DD-MM-YYYY') : '-'}

        </a>
      ),
    },
    {
      title: 'VTV Venc.',
      dataIndex: 'fecha_vencimiento_vtv',
      key: 'vtv',
      render: (text, record) => (
        <a onClick={() => handleEditClick('fecha_vencimiento_vtv', text, record._id, true)}
          style={{ color: getDateColor(text) }}>
          {text ? dayjs(text).format('DD-MM-YYYY') : '-'}

        </a>
      ),
    },

  ];

  const empleadosColumns = [
    {
      title: 'Nombre y Apellido',
      key: 'nombre_apellido',
      render: (_, record) => `${record.firstname} ${record.lastname}`
    },
    {
      title: 'Documento', dataIndex: 'documento', key: 'documento', render: (documento) => (
        <span style={{ fontWeight: 'bold' }}>
          {documento}
        </span>)
    },
    {
      title: 'Licencia Venc.',
      dataIndex: 'licenciaVencimiento',
      key: 'licencia',
      render: (text, record) => (
        <a onClick={() => handleEditClick('licenciaVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >
          {text ? dayjs(text).format('DD-MM-YYYY') : '-'}

        </a>
      ),
    },
    {
      title: 'DNI Venc.',
      dataIndex: 'dniVencimiento',
      key: 'dni',
      render: (text, record) => (
        <a onClick={() => handleEditClick('dniVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >
          {text ? dayjs(text).format('DD-MM-YYYY') : '-'}

        </a>
      ),
    },
    {
      title: 'Apto Físico Venc.',
      dataIndex: 'aptoFisicoVencimiento',
      key: 'apto',
      render: (text, record) => (
        <a onClick={() => handleEditClick('aptoFisicoVencimiento', text, record._id, false)}
          style={{ color: getDateColor(text) }}
        >
          {text ? dayjs(text).format('DD-MM-YYYY') : '-'}

        </a>
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
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalEmpleados,
          // showSizeChanger: true, // Habilita el selector de cantidad de registros por página
          // pageSizeOptions: ['5', '10', '20', '50'], // Opciones disponibles en el selector
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}

      />

      <h3>Documentacion de Empleados</h3>
      <Table
        columns={empleadosColumns}
        dataSource={empleados}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: totalVehiculos,
          showSizeChanger: true, // Habilita el selector de cantidad de registros por página
          pageSizeOptions: ['5', '10', '20', '50'], // Opciones disponibles en el selector
          onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        }}
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
            <DatePicker format='DD-MM-YYYY' />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TablasVencimientos;

