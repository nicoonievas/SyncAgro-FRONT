import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';

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

const CrearUser = () => {
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
  const [form] = Form.useForm(); // Inicializar el formulario

  const onFinish = async (values) => {
    console.log(values); // Para depuración

    const userData = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      domicilio: values.domicilio,
      celular: values.celular,
      documento: values.documento,
      rol: values.rol,
      area: values.area,
    };

    try {
      setLoading(true); // Iniciar loading

      const url = 'https://prog-iii-swagger-nievas-nicolas.vercel.app/api/user'; 
      const method = 'POST'; 

      // Enviar datos a la API
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), 
      });

      
      if (!response.ok) {
        throw new Error('Error al crear el usuario');
      }

      const result = await response.json();
      console.log(result); 
      openNotificationWithIcon('success', 'Usuario guardado', 'El usuario se ha guardado exitosamente.');
      form.resetFields();
     
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el usuario.');
 
    } finally {
      setLoading(false); // Detener loading
    }
  };

  return (
    <Form
      {...layout}
      form={form} // Asociar el formulario
      name="nest-messages"
      onFinish={onFinish}
      style={{
        maxWidth: 600,
      }}
      validateMessages={validateMessages}
    >
      <Form.Item
        name="firstname"
        label="Nombre"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="lastname"
        label="Apellido"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Correo Electrónico"
        rules={[{ type: 'email', required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="domicilio"
        label="Domicilio"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="celular"
        label="Celular"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="documento"
        label="Documento"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="rol"
        label="Rol"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="area"
        label="Área"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        wrapperCol={{
          ...layout.wrapperCol,
          offset: 8,
        }}
      >
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Usuario
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearUser;

