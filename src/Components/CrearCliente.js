import React, { useState } from 'react';
import { Button, Form, Input, Select, notification } from 'antd';

const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const validateMessages = {
  required: '${label} es requerido!',
};

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({ message, description });
};

const CrearCliente = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log("Enviando datos:", values);
  
    const clienteData = {
      nombre: values.nombre,
      apellido: values.apellido,
      domicilio: values.domicilio,
      localidad: values.localidad,
      provincia: values.provincia,
      telefono: values.telefono,
      mail: values.mail,
      coordenadas: {
        latitud: parseFloat(values.coordenadas.latitud),
        longitud: parseFloat(values.coordenadas.longitud),
      },
    };

    try {
      setLoading(true);

      const url = 'http://localhost:6001/api/cliente';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el cliente');
      }

      openNotificationWithIcon('success', 'Cliente guardado', 'El cliente se ha guardado exitosamente.');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...layout} form={form} name="crear-cliente" onFinish={onFinish} style={{ maxWidth: 600 }} validateMessages={validateMessages}>

      <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="domicilio" label="Domicilio" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="localidad" label="Localidad" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="provincia" label="Provincia" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="mail" label="Mail" rules={[{ required: false, type: 'email' }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Latitud" name={['coordenadas', 'latitud']} rules={[{ required: false, message: 'Ingresa la latitud' }]}>
        <Input type="number" step="any" placeholder="Ej: -34.603722" />
      </Form.Item>

      <Form.Item label="Longitud" name={['coordenadas', 'longitud']} rules={[{ required: false, message: 'Ingresa la longitud' }]}>
        <Input type="number" step="any" placeholder="Ej: -58.381592" />
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Cliente
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearCliente;
