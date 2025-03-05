import React, { useState } from "react";
import { Button, Form, Input, Modal, notification } from "antd";
import useAxiosInterceptor from "../utils/axiosConfig";

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

  const api = useAxiosInterceptor();

  const onFinish = async (values) => {
    console.log("Enviando datos de empresa:", values);

    const empresaData = {
      razonSocial: values.razonSocial,
      cuit: values.cuit,
      direccion: values.direccion,
      localidad: values.localidad,
      provincia: values.provincia,
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
          <Input />
        </Form.Item>

        <Form.Item name="localidad" label="Localidad" rules={[{ required: true }]}>
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
