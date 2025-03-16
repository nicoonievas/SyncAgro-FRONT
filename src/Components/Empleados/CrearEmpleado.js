import React, { useState } from 'react';
import { Button, Form, Input, notification, DatePicker } from 'antd';
import useAxiosInterceptor from '../../utils/axiosConfig';

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

  const api = useAxiosInterceptor();

  const onFinish = async (values) => {
    console.log(values); // Para depuración

    const EmpleadoData = {
      empresaId: empresa._id,
      razonSocial: empresa.razonSocial,
      usuarioCreacion: usuario._id,
      firstname: values.firstname,
      lastname: values.lastname,
      email: values.email,
      domicilio: values.domicilio,
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
        label="Rol / Cargo"
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
        <DatePicker format="DD-MM-YYYY" />
      </Form.Item>

      <Form.Item
        name="dniVencimiento"
        label="Vencimiento DNI"
        rules={[{ required: true }]}
      >
        <DatePicker format="DD-MM-YYYY" />
      </Form.Item>

      <Form.Item
        name="aptoFisicoVencimiento"
        label="Vencimiento Apto Físico"
        rules={[{ required: true }]}
      >
        <DatePicker format="DD-MM-YYYY" />
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
