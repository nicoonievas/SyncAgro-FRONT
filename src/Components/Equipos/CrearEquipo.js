import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, notification } from 'antd';
import axios from 'axios';
import useAxiosInterceptor from '../../utils/axiosConfig';

const { Option } = Select;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const validateMessages = {
  required: '${label} is required!',
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

const CrearEquipo = ({ equipoToAdd, empresa, usuario}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empresaId, setEmpresaId] = useState(null);


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
        const [empleadosRes, vehiculosRes] = await Promise.all([
          api.get('/empleadosLibres'),
          api.get('/vehiculosLibres'),
        ]);
        setEmpleados(empleadosRes.data);
        setVehiculos(vehiculosRes.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

 


  useEffect(() => {
    if (equipoToAdd) {
      form.setFieldsValue({
        nombre: equipoToAdd.nombre,
        descripcion: equipoToAdd.descripcion,
        empleados: equipoToAdd.empleados,
        vehiculos: equipoToAdd.vehiculos,
      });
    }
  }, [equipoToAdd, form]);


  const onFinish = async (values) => {
    const equipoData = {
      empresaId: empresa._id,
      razonSocial: empresa.razonSocial,
      usuarioCreacion: usuario._id,
      nombre: values.nombre,
      descripcion: values.descripcion,
      numero: values.numero,
      empleados: values.empleados,
      vehiculos: values.vehiculos,
    };

    try {
      setLoading(true);
      const response = await api.post(
        'http://localhost:6001/api/equipo',
        equipoData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Error al crear el equipo');
      }

      openNotificationWithIcon('success', 'Equipo creado', 'El equipo se ha creado exitosamente.');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear el equipo:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al crear el equipo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      {...layout}
      form={form}
      name="crear-equipo"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      validateMessages={validateMessages}
    >
      <h3 style={{ marginTop: '0px'}}>Crear Equipos</h3>
      <Form.Item
        name="nombre"
        label="Nombre del equipo"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="descripcion"
        label="Descripción del equipo"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="numero"
        label="Numero de equipo"
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="empleados"
        label="Empleados"
        rules={[{ required: true, message: 'Debe seleccionar al menos un empleado' }]}
      >
        <Select mode="multiple" placeholder="Seleccionar empleados">
          {empleados.map((empleado) => (
            <Option key={empleado._id} value={empleado._id}>
              {`${empleado.lastname} ${empleado.firstname} - ${empleado.rol}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="vehiculos"
        label="Vehículos"
        rules={[{ required: true, message: 'Debe seleccionar al menos un vehículo' }]}
      >
        <Select mode="multiple" placeholder="Seleccionar vehículos">
          {vehiculos.map((vehiculo) => (
            <Option key={vehiculo._id} value={vehiculo._id}>
              {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear equipo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearEquipo;
