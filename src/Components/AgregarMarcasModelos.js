import React, { useState, useEffect } from 'react';
import { Button, Form, Input, notification, Select } from 'antd';

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

const CrearMarcaTipoModelo = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [modelos, setModelos] = useState([]);

  // Cargar marcas y tipos existentes al inicio
  useEffect(() => {
    const fetchMarcasYTipos = async () => {
      try {
        const response = await fetch('http://localhost:6001/api/marcasModelos');
        if (!response.ok) {
          throw new Error('Error al cargar marcas y tipos');
        }
        const data = await response.json();
        const marcas = data.map(item => item.marca);
        const tipos = data.flatMap(item => item.vehiculos.map(vehiculo => vehiculo.tipo));
        setMarcas(marcas);
        setTipos(tipos);
      } catch (error) {
        console.error('Error al cargar marcas y tipos:', error);
        openNotificationWithIcon('error', 'Error', 'Hubo un problema al cargar marcas y tipos.');
      }
    };
    fetchMarcasYTipos();
  }, []);

  const fetchMarcaYTipo = async (marca, tipo) => {
    const response = await fetch(`http://localhost:6001/api/marcasModelos/${marca}`);
    if (!response.ok) {
      throw new Error(`Error al cargar marca ${marca}`);
    }
    const data = await response.json();
    return data.vehiculos.find((vehiculo) => vehiculo.tipo === tipo);
  };

  const onFinish = async (values) => {
    const nuevosModelos = [values.modelo];

    setLoading(true);

    try {
      // Buscar si la marca y tipo ya existen en la base de datos
      const vehiculoExistente = await fetchMarcaYTipo(values.marca, values.tipo);

      if (vehiculoExistente) {
        // Si la marca y tipo ya existen, agregamos los modelos
        vehiculoExistente.modelos = [...new Set([...vehiculoExistente.modelos, ...nuevosModelos])];

        // Actualizar la base de datos con los nuevos modelos
        const response = await fetch(`http://localhost:6001/api/marcasModelos/${values.marca}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            marca: values.marca,
            vehiculos: [
              {
                tipo: values.tipo,
                modelos: vehiculoExistente.modelos
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error('Error al actualizar los modelos');
        }
        openNotificationWithIcon('success', 'Modelos agregados', 'Los nuevos modelos han sido agregados exitosamente.');
      } else {
        // Si la marca y tipo no existen, creamos una nueva entrada
        const nuevaMarcaTipoModelo = {
          marca: values.marca,
          vehiculos: [
            {
              tipo: values.tipo,
              modelos: nuevosModelos
            }
          ]
        };

        const response = await fetch('http://localhost:6001/api/marcasModelos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaMarcaTipoModelo)
        });

        if (!response.ok) {
          throw new Error('Error al crear la nueva marca');
        }
        openNotificationWithIcon('success', 'Marca y Tipo creados', 'La nueva marca y tipo han sido creados exitosamente.');
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al procesar la solicitud.');
    } finally {
      form.resetFields();
      setLoading(false);
    }
  };

  return (
    <Form {...layout} form={form} name="crear-marca-tipo-modelo" onFinish={onFinish} style={{ maxWidth: 600 }} validateMessages={validateMessages}>
      <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
        <Select
          showSearch
          allowClear
          placeholder="Seleccione o ingrese una marca"
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          mode="tags" // Permite ingresar nuevos valores
        >
          {marcas.map((marca) => (
            <Option key={marca} value={marca}>
              {marca}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
        <Select
          showSearch
          allowClear
          placeholder="Seleccione o ingrese un tipo"
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          mode="tags" // Permite ingresar nuevos valores
        >
          {tipos.map((tipo) => (
            <Option key={tipo} value={tipo}>
              {tipo}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="modelo" label="Modelo" rules={[{ required: true }]}>
        <Input placeholder="Ingrese el modelo" />
      </Form.Item>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CrearMarcaTipoModelo;
