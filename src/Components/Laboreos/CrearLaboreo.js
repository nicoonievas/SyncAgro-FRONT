import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, notification, DatePicker, Row, Col } from 'antd';
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

const CrearLaboreo = ({ laboreoToAdd, empresa, usuario }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tareas, setTareas] = useState([
    "Cosechar",
    "Sembrar",
    "Riego",
    "Fumigar",
    "Arar",
    "Embolsar",
    "Fertilizar",
    "Desmalezar",
    "Labrar",
    "Aplicar herbicida",
    "Aplicar insecticida",
    "Aplicar fungicida",
    "Secado",
    "Almacenamiento",
    "Transporte",
    "Siembra directa",
    "Laboreo mínimo"
  ]);

  const [granos, setGranos] = useState([
    "Soja",
    "Maíz",
    "Trigo",
    "Arroz",
    "Girasol",
    "Cebada",
    "Sorgo",
    "Avena",
    "Centeno",
    "Lentejas",
    "Poroto",
    "Maní",
    "Algodón",
    "Quinoa",
    "Mijo",
    "Chía",
    "Cártamo"
  ]);

  const [selectedCliente, setSelectedCliente] = useState(null);
  const [campos, setCampos] = useState([]);
  const [selectedCampos, setSelectedCampos] = useState([]);
  const [empresaId, setEmpresaId] = useState('');

  useEffect(() => {
    if (empresa) {
      setEmpresaId(empresa._id);
    }
  }, [empresa]);

  // Configuración de la API
  const api = useAxiosInterceptor(empresaId);

  // Llama a la API solo cuando empresaId esté disponible
  useEffect(() => {
    if (empresaId) {
      fetchData();
    }
  }, [empresaId]);

  // Obtener los empleados, vehículos, clientes y equipos
  const fetchData = async () => {
    try {
      const [empleadosRes, vehiculosRes, clientesRes, equiposRes] = await Promise.all([
        api.get(`/empleadosLibres?empresaId=${empresaId}`),
        api.get(`/vehiculosLibres?empresaId=${empresaId}`),
        api.get(`/clientes?empresaId=${empresaId}`),
        api.get(`/equiposLibres?empresaId=${empresaId}`)
      ]);

      setEmpleados(empleadosRes.data);
      setVehiculos(vehiculosRes.data);
      setClientes(clientesRes.data);
      setEquipos(equiposRes.data);
      console.log('Datos obtenidos:', { empleadosRes, vehiculosRes, clientesRes, equiposRes });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      openNotificationWithIcon('error', 'Error', 'No se pudo cargar los datos.');
    }
  };

  useEffect(() => {
    if (laboreoToAdd) {
      form.setFieldsValue({
        nombre: laboreoToAdd.nombre,
        descripcion: laboreoToAdd.descripcion,
        resumen: laboreoToAdd.resumen,
        empleados: laboreoToAdd.empleados,
        vehiculos: laboreoToAdd.vehiculos,
        equipos: laboreoToAdd.equipos,
        tarea: laboreoToAdd.tarea,
        grano: laboreoToAdd.grano,
        cliente: laboreoToAdd.cliente,
        camposAfectados: laboreoToAdd.camposAfectados,
        fechaInicio: laboreoToAdd.fechaInicio,
      });
    }
  }, [laboreoToAdd, form]);

  // Obtener los empleados, vehículos y clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empleadosRes, vehiculosRes, clientesRes, equiposRes] = await Promise.all([
          api.get('/empleadosLibres'),
          api.get('/vehiculosLibres'),
          api.get('/clientes'),
          api.get('/equiposLibres'),
        ]);

        setEmpleados(empleadosRes.data);
        setVehiculos(vehiculosRes.data);
        setClientes(clientesRes.data);
        setEquipos(equiposRes.data);
        console.log('Campos obtenidos:', clientesRes.data);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values) => {
    const laboreoData = {
      empresaId: empresa._id,
      razonSocial: empresa.razonSocial,
      usuarioCreacion: usuario._id,
      nombre: values.nombre,
      descripcion: values.descripcion,
      resumen: values.resumen,
      equipos: values.equipos,
      empleados: values.empleados,  // Array de empleados seleccionados
      vehiculos: values.vehiculos,  // Array de vehículos seleccionados
      tarea: values.tarea,          // Tarea seleccionada
      grano: values.grano,          // Grano seleccionado
      cliente: selectedCliente?._id, // Usar el ID del cliente seleccionado
      camposAfectados: selectedCampos,
      fechaInicio: values.fechaInicio
        ? values.fechaInicio.valueOf() : null,
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


      //Actualizar estado de Equipos
      if (values.equipos && values.equipos.length > 0) {
        await Promise.all(
          values.equipos.map(async (equipoId) => {
            try {
              await axios.put(`http://localhost:6001/api/equipo/${equipoId}/estado`, {
                estado: "Asignado",
              });
            } catch (error) {
              console.error(`Error al actualizar el equipo ${equipoId}:`, error);
            }
          })
        );
      }


      form.resetFields();
      setSelectedCampos([]);
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

    // Cargar los campos de ese cliente
    if (selected) {
      setCampos(selected.coordenadas || []);
    } else {
      setCampos([]);
    }
  };
  const handleCamposSelect = (selectedCampoIds) => {
    setSelectedCampos(selectedCampoIds);
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
      <h3 style={{ marginTop: '0px'}}>Crear Laboreo / Campaña</h3>
      <Form.Item
        name="nombre"
        label="Nombre del laboreo"
        rules={[{ required: true }]}
        labelAlign="right" // Alineación de la etiqueta
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="descripcion"
        label="Descripción del laboreo"
        labelAlign="right" // Alineación de la etiqueta
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="resumen"
        label="Resumen del laboreo"
        labelAlign="right" // Alineación de la etiqueta
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="equipos"
        label="Equipos"
        rules={[{ required: false }]}
        labelAlign="right" // Alineación de la etiqueta
      >
        <Select
          showSearch
          placeholder="Buscar equipos"
          mode="multiple"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: '100%' }} // Ajusta el tamaño del Select
        >
          {equipos.map((equipo) => (
            <Option key={equipo._id} value={equipo._id}>
              Equipo: {equipo.nombre} - Numero: {equipo.numero}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="empleados"
        label="Empleados Adicionales"
        labelAlign="right" // Alineación de la etiqueta
      >
        <Select
          mode="multiple"
          placeholder="Seleccionar empleados"
          optionLabelProp="children"
          style={{ width: '100%' }} // Ajusta el tamaño del Select
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
        labelAlign="right" // Alineación de la etiqueta
      >
        <Select
          mode="multiple"
          placeholder="Seleccionar vehículos"
          optionLabelProp="children"
          style={{ width: '100%' }} // Ajusta el tamaño del Select
        >
          {vehiculos.map((vehiculo) => (
            <Option key={vehiculo._id} value={vehiculo._id}>
              {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Agrupar Tarea y Grano en un Row */}
      <Row gutter={12}
        style={{ justifyContent: 'right' }}>
        <Col span={9}>
          <Form.Item
            name="tarea"
            label="Tarea"
            rules={[{ required: true }]}
            labelAlign="right" // Alineación de la etiqueta
          >
            <Select placeholder="Seleccionar tarea" style={{ width: '100%' }}>
              {tareas.map((tarea, index) => (
                <Option key={index} value={tarea}>
                  {tarea}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={10}>
          <Form.Item
            name="grano"
            label="Grano"
            rules={[{ required: true }]}
            labelAlign="right" // Alineación de la etiqueta
          >
            <Select placeholder="Seleccionar tipo de grano" style={{ width: '100%' }}>
              {granos.map((grano, index) => (
                <Option key={index} value={grano}>
                  {grano}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="cliente"
        label="Cliente Seleccionado"
        rules={[{ required: true, message: 'Debe seleccionar un cliente' }]}
        labelAlign="right" // Alineación de la etiqueta
      >
        <Select
          showSearch
          placeholder="Buscar cliente"
          optionFilterProp="children"
          onChange={handleClienteSelect}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: '100%' }} // Ajusta el tamaño del Select
        >
          {clientes.map((cliente) => (
            <Option key={cliente._id} value={cliente._id}>
              {cliente.nombre} - {cliente.apellido}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="camposAfectados"
        label="Campos Afectados"
        labelAlign="right"
      >
        <Select
          mode="multiple"
          placeholder="Seleccionar campos afectados"
          onChange={handleCamposSelect}
          style={{ width: '100%' }}
          disabled={!selectedCliente}
        >
          {campos.map((campo, index) => (
            <Option key={index} value={campo.nombre}>
              {campo.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="fechaInicio"
        label="Fecha de inicio"
        rules={[{ required: true }]}
        labelAlign="right" // Alineación de la etiqueta
      >
        <DatePicker format="DD-MM-YYYY" style={{ width: '100%' }} />
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
