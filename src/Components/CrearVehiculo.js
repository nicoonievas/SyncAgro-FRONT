import React, { useState } from 'react';
import { Button, Form, Input, DatePicker, Select, notification } from 'antd';

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

const CrearVehiculo = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log(values);

    const vehiculoData = {
      idvehiculo: values.idvehiculo,
      marca: values.marca,
      modelo: values.modelo,
      dominio: values.dominio,
      numero: values.numero,
      alias: values.alias,
      estado: values.estado,
      fecha_vencimiento_seguro: values.fecha_vencimiento_seguro.format('YYYY-MM-DD'),
      fecha_vencimiento_vtv: values.fecha_vencimiento_vtv.format('YYYY-MM-DD'),
    };

    try {
      setLoading(true);
      
      const url = 'https://api.example.com/vehiculos'; 
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehiculoData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el vehículo');
      }

      openNotificationWithIcon('success', 'Vehículo guardado', 'El vehículo se ha guardado exitosamente.');
      form.resetFields();
    } catch (error) {
      console.error('Error al crear el vehículo:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el vehículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...layout} form={form} name="crear-vehiculo" onFinish={onFinish} style={{ maxWidth: 600 }} validateMessages={validateMessages}>
      <Form.Item name="idvehiculo" label="ID Vehículo" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="modelo" label="Modelo" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="dominio" label="Dominio" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="numero" label="Número" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="alias" label="Alias" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
        <Select>
          <Option value="activo">Activo</Option>
          <Option value="inactivo">Inactivo</Option>
          <Option value="en reparación">En reparación</Option>
        </Select>
      </Form.Item>

      <Form.Item name="fecha_vencimiento_seguro" label="Vencimiento Seguro" rules={[{ required: true }]}>
        <DatePicker format={'YYYY-MM-DD'} />
      </Form.Item>

      <Form.Item name="fecha_vencimiento_vtv" label="Vencimiento VTV" rules={[{ required: true }]}>
        <DatePicker format={'YYYY-MM-DD'} />
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Vehículo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearVehiculo;
