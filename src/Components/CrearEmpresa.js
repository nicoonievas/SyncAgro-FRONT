import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, Modal, notification } from 'antd';
import useAxiosInterceptor from "../utils/axiosConfig";

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: "${label} es requerido!",
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({ message, description });
};

const CrearEmpresa = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);

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


  const onFinish = async (values) => {
    console.log("Enviando datos de empresa:", values);

    const empresaData = {
      razonSocial: values.razonSocial,
      cuit: values.cuit,
      direccion: values.direccion,
      localidad: values.localidad,
      provincia: values.provincia,
      email: values.email,
      telefono: values.telefono,
    };

    try {
      setLoading(true);

      // Usamos el método `api.post` para enviar los datos
      const response = await api.post("/empresa", empresaData);

      openNotificationWithIcon(
        "success",
        "Empresa guardada",
        "La empresa se ha registrado exitosamente."
      );
      form.resetFields();
    } catch (error) {
      console.error("Error al crear la empresa:", error);
      openNotificationWithIcon(
        "error",
        "Error",
        "Hubo un problema al registrar la empresa."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>

      <Form
        {...layout}
        form={form}
        name="crear-empresa"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
        validateMessages={validateMessages}
      >
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <h2>Crear Empresa </h2>
        </Form.Item>

        <Form.Item name="razonSocial" label="Razón Social" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="cuit" label="CUIT" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="direccion" label="Dirección" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="provincia" label="Provincia" rules={[{ required: true }]}>
          <Select
            value={selectedProvincia}
            onChange={value => {
              setSelectedProvincia(value);  // Aquí 'value' es el código de la provincia
              form.setFieldsValue({ provincia: value });  // Esto actualizará el formulario con el código
            }}
            placeholder="Selecciona una provincia"
          >
            {provincias.map((provincia) => (
              <Option key={provincia.code} value={provincia.code}>
                {provincia.name}
              </Option>
            ))}
          </Select>
        </Form.Item>


        <Form.Item name="localidad" label="Localidad" rules={[{ required: true }]}>
          <Select
            value={selectedLocalidad}
            onChange={value => {
              setSelectedLocalidad(value);
              form.setFieldsValue({ localidad: value }); // Actualizar el valor en el formulario
            }}
            placeholder="Selecciona una localidad"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {localidades.map((localidad) => (
              <Option key={localidad.name} value={localidad.name}>
                {localidad.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
          <Input />
        </Form.Item>


        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Empresa
          </Button>
        </Form.Item>
      </Form>

    </>
  );
};

export default CrearEmpresa;
