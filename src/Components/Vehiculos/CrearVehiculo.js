import React, { useState, useEffect } from 'react';
import { Button, Form, Input, DatePicker, Select, notification, Row, Col } from 'antd';

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

const CrearVehiculo = ({ usuario, empresa }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [marcasModelos, setMarcasModelos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [modelos, setModelos] = useState([]);


  useEffect(() => {
    const fetchMarcasModelos = async () => {
      try {
        const response = await fetch('http://localhost:6001/api/marcasModelos');
        const data = await response.json();
        setMarcasModelos(data);
      } catch (error) {
        console.error('Error al obtener marcas y modelos:', error);
      }
    };

    fetchMarcasModelos();
  }, []);


 const handleMarcaChange = (marca) => {
    const marcaSeleccionada = marcasModelos.find((m) => m.marca === marca);
    setTipos(marcaSeleccionada ? marcaSeleccionada.vehiculos || [] : []);
    setModelos([]); // Reiniciar modelos al cambiar la marca
    form.setFieldsValue({ tipo: undefined, modelo: undefined });
  };

  const handleTipoChange = (tipo) => {
    const tipoSeleccionado = tipos.find((t) => t.tipo === tipo);
    setModelos(tipoSeleccionado ? tipoSeleccionado.modelos || [] : []);
    form.setFieldsValue({ modelo: undefined });
  };

  const onFinish = async (values) => {
    console.log(values);

    const vehiculoData = {
      empresaId: empresa._id,
      razonSocial: empresa.razonSocial,
      usuarioCreacion: usuario._id,
      tipo: values.tipo,
      marca: values.marca,
      modelo: values.modelo,
      dominio: values.dominio,
      numero: values.numero,
      alias: values.alias,
      // estado: values.estado,
      fecha_vencimiento_seguro: values.fecha_vencimiento_seguro ? values.fecha_vencimiento_seguro.valueOf() : null,
      fecha_vencimiento_vtv: values.fecha_vencimiento_vtv ? values.fecha_vencimiento_vtv.valueOf() : null,
    };

    try {
      setLoading(true);

      const url = 'http://localhost:6001/api/vehiculo';
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
    <Form
      layout="vertical"
      form={form}
      name="crear-vehiculo"
      onFinish={onFinish}
      style={{ maxWidth: 400, marginLeft: '10%' }}
      validateMessages={validateMessages}
    >
      <h3 style={{ marginTop: '0px' }}>Agregar Vehículos</h3>
  
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Form.Item name="marca" label="Marca" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
          <Select onChange={handleMarcaChange} placeholder="Selecciona una marca">
            {marcasModelos.map((marca) => (
              <Option key={marca.marca} value={marca.marca}>
                {marca.marca}
              </Option>
            ))}
          </Select>
        </Form.Item>
  
        <div style={{ display: 'flex', gap: '8px' }}>
          <Form.Item name="tipo" label="Tipo" style={{ flex: 1, marginBottom: 8 }} rules={[{ required: true }]}>
            <Select onChange={handleTipoChange} placeholder="Selecciona un tipo" disabled={tipos.length === 0}>
              {tipos.map((tipo) => (
                <Option key={tipo.tipo} value={tipo.tipo}>
                  {tipo.tipo}
                </Option>
              ))}
            </Select>
          </Form.Item>
  
          <Form.Item name="modelo" label="Modelo" style={{ flex: 1, marginBottom: 8 }} rules={[{ required: true }]}>
            <Select placeholder="Selecciona un modelo" disabled={modelos.length === 0}>
              {modelos.map((modelo) => (
                <Option key={modelo} value={modelo}>
                  {modelo}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
  
        <Form.Item name="dominio" label="Dominio" rules={[{ required: true }]} style={{ marginBottom: 8 }}>
          <Input />
        </Form.Item>
  
        <div style={{ display: 'flex', gap: '8px' }}>
          <Form.Item name="numero" label="Número" style={{ flex: 1, marginBottom: 8 }}>
            <Input />
          </Form.Item>
  
          <Form.Item name="alias" label="Alias" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 8 }}>
            <Input />
          </Form.Item>
        </div>
  
        <div style={{ display: 'flex', gap: '8px' }}>
          <Form.Item name="fecha_vencimiento_seguro" label="Venc. Seguro" style={{ flex: 1, marginBottom: 8 }} rules={[{ required: true }]}>
            <DatePicker format={'DD-MM-YYYY'} style={{ width: '100%' }} />
          </Form.Item>
  
          <Form.Item name="fecha_vencimiento_vtv" label="Venc. VTV" style={{ flex: 1, marginBottom: 8 }} rules={[{ required: true }]}>
            <DatePicker format={'DD-MM-YYYY'} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </div>
  
      <Form.Item style={{ textAlign: 'center', marginTop: '8px' }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Crear Vehículo
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearVehiculo;

