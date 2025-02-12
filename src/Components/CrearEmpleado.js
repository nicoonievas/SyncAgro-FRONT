import React, { useState } from 'react';
import { Button, Form, Input, notification, DatePicker } from 'antd';

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

const CrearEmpleado = () => {
  const [loading, setLoading] = useState(false); // Estado para manejar el loading
  const [form] = Form.useForm(); // Inicializar el formulario

  const onFinish = async (values) => {
    console.log(values); // Para depuración

    const EmpleadoData = {
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      domicilio: values.domicilio,
      celular: values.celular,
      telefono: values.telefonoEmergencia,
      documento: values.documento,
      rol: values.rol,
      // area: values.area,
      licenciaVencimiento: values.licenciaVencimiento?.format('YYYY-MM-DD'),
      dniVencimiento: values.dniVencimiento?.format('YYYY-MM-DD'),
      aptoFisicoVencimiento: values.aptoFisicoVencimiento?.format('YYYY-MM-DD'),
    };

    try {
      setLoading(true); // Iniciar loading

      const url = 'https://prog-iii-swagger-nievas-nicolas.vercel.app/api/Empleado'; 
      const method = 'POST'; 

      // Enviar datos a la API
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(EmpleadoData), 
      });

      if (!response.ok) {
        throw new Error('Error al crear el Empleado');
      }

      const result = await response.json();
      console.log(result); 
      openNotificationWithIcon('success', 'Empleado guardado', 'El Empleado se ha guardado exitosamente.');
      form.resetFields();
     
    } catch (error) {
      console.error('Error al crear el Empleado:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el Empleado.');
 
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
        name="telefonoEmergencia"
        label="Telefono Emergencia"
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

      {/* <Form.Item
        name="area"
        label="Área"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item> */}

      {/* Nuevos campos de fecha */}
      <Form.Item
        name="licenciaVencimiento"
        label="Vencimiento Licencia"
        rules={[{ required: true }]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item
        name="dniVencimiento"
        label="Vencimiento DNI"
        rules={[{ required: true }]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item
        name="aptoFisicoVencimiento"
        label="Vencimiento Apto Físico"
        rules={[{ required: true }]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item
        wrapperCol={{
          ...layout.wrapperCol,
          offset: 8,
        }}
      >
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Empleado
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearEmpleado;
