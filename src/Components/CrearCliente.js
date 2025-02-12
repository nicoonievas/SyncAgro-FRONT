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
    console.log(values);

    const clienteData = {
      idcliente: values.idcliente,
      nombre: values.nombre,
      apellido: values.apellido,
      domicilio: values.domicilio,
      localidad: values.localidad,
      provincia: values.provincia,
      telefono: values.telefono,
      mail: values.mail,
      estado: values.estado,
      coordenadas: values.coordenadas,
    };

    try {
      setLoading(true);
      
      const url = 'https://api.example.com/clientes'; 
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
      <Form.Item name="idcliente" label="ID Cliente" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

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

      <Form.Item name="mail" label="Mail" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>

      <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
        <Select>
          <Option value="activo">Activo</Option>
          <Option value="inactivo">Inactivo</Option>
        </Select>
      </Form.Item>

      <Form.Item name="coordenadas" label="Coordenadas" rules={[{ required: true }]}>
        <Input />
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
