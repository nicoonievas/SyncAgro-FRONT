import React, { useState, useEffect } from 'react';
import { Button, Form, Input, notification, DatePicker, Select } from 'antd';
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
  required: '${label} es requerido!',
  types: {
    email: '${label} no es un email válido!',
  },
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

const CrearEmpleado = ({ empresa, usuario }) => {
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
  const [form] = Form.useForm(); // Inicializar el formulario
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);


  const api = useAxiosInterceptor();

  useEffect(() => {
    // Cargar provincias al montar el componente
    const fetchProvincias = async () => {
      try {
        const response = await api.get('/provincias');
        setProvincias(response.data);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
        openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las provincias.');
      }
    };

    fetchProvincias();
  }, [api]);

  useEffect(() => {
    // Si hay provincia seleccionada, cargar las localidades
    if (selectedProvincia) {
      const fetchLocalidades = async () => {
        try {
          const response = await api.get(`/localidades/${selectedProvincia}`);
          setLocalidades(response.data);
        } catch (error) {
          console.error('Error al cargar localidades:', error);
          openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las localidades.');
        }
      };

      fetchLocalidades();
    }
  }, [selectedProvincia, api]);


  useEffect(() => {
    if (empresa?.roles) {
      setRoles(empresa.roles);
    }
  }, [empresa]);


  const onFinish = async (values) => {
    console.log(values); // Para depuración
    const provinciaName = provincias.find(provincia => provincia.code === values.provincia)?.name;
    const EmpleadoData = {
      empresaId: empresa._id,
      razonSocial: empresa.razonSocial,
      usuarioCreacion: usuario._id,
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      domicilio: values.domicilio,
      localidad: values.localidad,
      provincia: provinciaName,
      celular: values.celular,
      telefono: values.telefonoEmergencia,
      documento: values.documento,
      rol: values.rol,
      licenciaVencimiento: values.licenciaVencimiento
        ? values.licenciaVencimiento.valueOf() : null,
      dniVencimiento: values.dniVencimiento
        ? values.dniVencimiento.valueOf() : null,
      aptoFisicoVencimiento: values.aptoFisicoVencimiento
        ? values.aptoFisicoVencimiento.valueOf() : null,
    };

    try {
      setLoading(true); // Iniciar loading

      const response = await api.post('/nomina', EmpleadoData);

      // Verificar la respuesta
      if (response.status === 201) {
        openNotificationWithIcon('success', 'Empleado guardado', 'El Empleado se ha guardado exitosamente.');
        form.resetFields();
      } else {
        throw new Error('Error al crear el Empleado');
      }
    } catch (error) {
      console.error('Error al crear el Empleado:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el Empleado.');
    } finally {
      setLoading(false); // Detener loading
    }
  };



  return (
    <Form
      layout="vertical"
      form={form}
      name="nest-messages"
      onFinish={onFinish}
      style={{ maxWidth: 500, marginLeft: '10%' }}
      validateMessages={validateMessages}

    >
      <h3 style={{ marginTop: '0px' }}>Agregar Nómina de Empleados</h3>
  
      {/* Nombre y Apellido */}
      <div style={{ display: 'flex',  gap: '8px' }}>
        <Form.Item name="firstname" label="Nombre" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
  
        <Form.Item name="lastname" label="Apellido" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </div>
  
      {/* Correo Electrónico */}
      <Form.Item name="email" label="Correo Electrónico" rules={[{ type: 'email', required: true }]}>
        <Input />
      </Form.Item>
  
      {/* Provincia y Localidad */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item name="provincia" label="Provincia" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Select
            value={selectedProvincia}
            onChange={value => {
              setSelectedProvincia(value);
              form.setFieldsValue({ provincia: value });
            }}
            placeholder="Selecciona una provincia"
          >
            {provincias.map(provincia => (
              <Option key={provincia.code} value={provincia.code}>
                {provincia.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
  
        <Form.Item name="localidad" label="Localidad" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Select
            value={selectedLocalidad}
            onChange={value => {
              setSelectedLocalidad(value);
              form.setFieldsValue({ localidad: value });
            }}
            placeholder="Selecciona una localidad"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {localidades.map(localidad => (
              <Option key={localidad.name} value={localidad.name}>
                {localidad.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
  
      {/* Domicilio */}
      <Form.Item name="domicilio" label="Domicilio" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
  
      {/* Celular y Teléfono de Emergencia */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item name="celular" label="Celular" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
  
        <Form.Item name="telefonoEmergencia" label="Teléfono de Emergencia" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </div>
  
      {/* Documento y Rol/Cargo */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item name="documento" label="Documento" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input />
        </Form.Item>
  
        <Form.Item name="rol" label="Rol / Cargo" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Select placeholder="Selecciona un rol" onChange={value => setSelectedRoles(value)}>
            {roles.map((rol, index) => (
              <Option key={index} value={rol}>
                {rol}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </div>
  
      {/* Fechas de Vencimiento */}
      <h3 style={{ marginTop: '16px' }}>Fechas de Vencimiento</h3>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Form.Item name="licenciaVencimiento" label="Licencia Conducir" style={{ flex: 1 }} rules={[{ required: true }]}>
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
  
        <Form.Item name="dniVencimiento" label="DNI" style={{ flex: 1 }} rules={[{ required: true }]}>
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
  
        <Form.Item name="aptoFisicoVencimiento" label="Apto Físico" style={{ flex: 1 }} rules={[{ required: true }]}>
          <DatePicker format="DD-MM-YYYY" />
        </Form.Item>
      </div>
  
      {/* Botón de Envío */}
      <Form.Item style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Empleado
        </Button>
      </Form.Item>
    </Form>
  );
  
};

export default CrearEmpleado;
