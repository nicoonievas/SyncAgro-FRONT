import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, notification, DatePicker } from 'antd';
import axios from 'axios';

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

const CrearLaboreo = ({ laboreoToAdd }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tareas, setTareas] = useState(['Sembrar', 'Cosechar', 'Fumigar', 'Picar', 'Embolsar']);
  const [granos, setGranos] = useState(['Soja', 'Sorgo', 'Trigo', 'Girasol']);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);

  useEffect(() => {
    if (laboreoToAdd) {
      form.setFieldsValue({
        nombre: laboreoToAdd.nombre,
        descripcion: laboreoToAdd.descripcion,
        resumen: laboreoToAdd.resumen,
        empleados: laboreoToAdd.empleados,
        vehiculos: laboreoToAdd.vehiculos,
        equipo: laboreoToAdd.equipo,
        tarea: laboreoToAdd.tarea,
        grano: laboreoToAdd.grano,
        cliente: laboreoToAdd.cliente,
        fechaInicio: laboreoToAdd.fechaInicio,
      });
    }
  }, [laboreoToAdd, form]);

  // Obtener los empleados, vehículos y clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empleadosRes, vehiculosRes, clientesRes, equiposRes] = await Promise.all([
          axios.get('http://localhost:6001/api/empleadosLibres'),
          axios.get('http://localhost:6001/api/vehiculosLibres'),
          axios.get('http://localhost:6001/api/clientes'),
          axios.get('http://localhost:6001/api/equiposLibres'),
        ]);

        setEmpleados(empleadosRes.data);
        setVehiculos(vehiculosRes.data);
        setClientes(clientesRes.data);
        setEquipos(equiposRes.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, []);



  const onFinish = async (values) => {
    const laboreoData = {
      nombre: values.nombre,
      descripcion: values.descripcion,
      resumen: values.resumen,
      equipo: values.equipo,
      empleados: values.empleados,  // Array de empleados seleccionados
      vehiculos: values.vehiculos,  // Array de vehículos seleccionados
      tarea: values.tarea,          // Tarea seleccionada
      grano: values.grano,          // Grano seleccionado
      cliente: selectedCliente?._id, // Usar el ID del cliente seleccionado
      fechaInicio: values.fechaInicio
        ? values.fechaInicio.format('YYYY-MM-DD')
        : null,
    };

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:6001/api/laboreo',
        laboreoData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Error al crear el laboreo');
      }

      openNotificationWithIcon('success', 'laboreo creado', 'El laboreo se ha creado exitosamente.');
      form.resetFields();

      // setSelectedCliente(null);
    } catch (error) {
      console.error('Error al crear el laboreo:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al crear el laboreo.');
    } finally {
      setLoading(false);
    }
  };


  const handleClienteSelect = (clienteId) => {
    const selected = clientes.find((cliente) => cliente._id === clienteId);
    setSelectedCliente(selected);
  };
  const handleEquipoSelect = (equipoId) => {
    const selected = equipos.find((equipo) => equipo._id === equipoId);
    setSelectedEquipo(selected);
  };

  return (
    <Form
      {...layout}
      form={form}
      name="crear-laboreo"
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
      validateMessages={validateMessages}
    >
      <Form.Item
        name="nombre"
        label="Nombre del laboreo"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="descripcion"
        label="Descripción del laboreo"
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="resumen"
        label="Resumen del laboreo"
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="equipo"
        label="Equipo"
        rules={[{ required: true }]}
      >
        <Select
          showSearch
          placeholder="Buscar equipo"
          optionFilterProp="children"
          onChange={handleEquipoSelect}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {equipos.map((equipo) => (
            <Option key={equipo._id} value={equipo._id}>
              Equipo: {equipo.nombre} - Numero: {equipo.numero} {/* Suponiendo que el campo es 'nombre' */}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="empleados"
        label="Empleados Adicionales"
        rules={[{ required: false, message: 'Debe seleccionar al menos un empleado' }]}
      >
        <Select
          mode="multiple"
          placeholder="Seleccionar empleados"
          optionLabelProp="children"
        >
          {empleados.map((empleado) => (
            <Option key={empleado._id} value={empleado._id}>
              {`${empleado.lastname} ${empleado.firstname} - ${empleado.rol}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="vehiculos"
        label="Vehículos Adicionales"
        rules={[{ required: false, message: 'Debe seleccionar al menos un vehículo' }]}
      >
        <Select
          mode="multiple"
          placeholder="Seleccionar vehículos"
          optionLabelProp="children"
        >
          {vehiculos.map((vehiculo) => (
            <Option key={vehiculo._id} value={vehiculo._id}>
              {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="tarea"
        label="Tarea"
        rules={[{ required: true }]}
      >
        <Select placeholder="Seleccionar tarea">
          {tareas.map((tarea, index) => (
            <Option key={index} value={tarea}>
              {tarea}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="grano"
        label="Grano"
        rules={[{ required: true }]}
      >
        <Select placeholder="Seleccionar tipo de grano">
          {granos.map((grano, index) => (
            <Option key={index} value={grano}>
              {grano}
            </Option>
          ))}
        </Select>
      </Form.Item>

      


      <Form.Item
        name="cliente"
        label="Cliente Seleccionado"
        rules={[{ required: true, message: 'Debe seleccionar un cliente' }]}
      >
        <Select
          showSearch
          placeholder="Buscar cliente"
          optionFilterProp="children"
          onChange={handleClienteSelect}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {clientes.map((cliente) => (
            <Option key={cliente._id} value={cliente._id}>
              {cliente.nombre} - {cliente.apellido} {/* Suponiendo que el campo es 'nombre' */}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="fechaInicio"
        label="Fecha de inicio"
        rules={[{ required: true }]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear laboreo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearLaboreo;
