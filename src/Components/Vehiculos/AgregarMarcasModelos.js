import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, notification } from 'antd';
import axios from 'axios';

const { Option } = Select;

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({ message, description });
};


const CrearMarcaTipoModelo = () => {
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [modelo, setModelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);

  // Obtener todas las marcas y modelos
  useEffect(() => {
    axios.get('http://localhost:6001/api/marcasModelos')
      .then(response => setMarcas(response.data))
      .catch(error => message.error('Error al cargar marcas y modelos'));
  }, []);

  // Obtener tipos y modelos para una marca seleccionada
  const handleMarcaChange = (marca) => {
    setSelectedMarca(marca);
    axios.get(`http://localhost:6001/api/marcasModelos/${marca}`)
      .then(response => {
        const vehiculos = response.data.vehiculos;
        setTipos(vehiculos.map(vehiculo => vehiculo.tipo));
        setModelos(vehiculos.flatMap(vehiculo => vehiculo.modelos));
      })
      .catch(error => message.error('Error al cargar los vehículos de la marca'));
  };

  // Formulario 1: Ingresar una nueva marca
  const onFinishMarca = (values) => {
    setLoading(true);
    axios.post('http://localhost:6001/api/marcas', { marca: values.marca })
      .then(response => {
        openNotificationWithIcon('success', 'Marca agregada con éxito', 'La marca se ha agregado correctamente.');
      })
      .catch(error => message.error('Error al agregar marca'))
      .finally(() => setLoading(false));
  };

  // Formulario 2: Ingresar un nuevo tipo según la marca seleccionada
  const onFinishTipo = (values) => {
    setLoading(true);
    axios.post(`http://localhost:6001/api/tipos/${selectedMarca}`, { tipo: values.tipo })
      .then(response => {
        openNotificationWithIcon('success', 'Tipo agregado con éxito', 'El tipo se ha agregado correctamente.');
      })
      .catch(error => message.error('Error al agregar tipo'))
      .finally(() => setLoading(false));
  };

  // Formulario 3: Ingresar un nuevo modelo según la marca y tipo seleccionados
  const onFinishModelo = (values) => {
    setLoading(true);
    // Asegurarse de que 'modelos' es un array
    axios.post(`http://localhost:6001/api/modelos/${selectedMarca}/${selectedTipo}`, { modelos: [values.modelo] })
      .then(response => {
        openNotificationWithIcon('success', 'Modelo agregado con éxito', 'El modelo se ha agregado correctamente.');
        console.log("Modelo Ingresado,", values.modelo)
      })
      .catch(error => {
        message.error('Error al agregar modelo');
      })
      .finally(() => setLoading(false));
  };


  return (
    <div style={{ width: '40%'}}>
      <h3>Crear Marcas</h3>
      {/* Formulario 1: Ingresar una nueva marca */}
      <Form name="crear-marca" onFinish={onFinishMarca} style={{ marginBottom: '20px'  }}>
        <Form.Item name="marca" label="Nueva Marca" rules={[{ required: true, message: 'Por favor ingrese una marca' }]}>
          <Input placeholder="Ingrese el nombre de la marca" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Marca
          </Button>
        </Form.Item>
      </Form>




      <h3>Crear Tipos</h3>
      {/* Formulario 2: Ingresar un nuevo tipo según la marca seleccionada */}
      <Form name="crear-tipo" onFinish={onFinishTipo} style={{ marginBottom: '20px' }}>
        <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
          <Select
            showSearch
            allowClear
            placeholder="Seleccione una marca"
            onChange={handleMarcaChange}
          >
            {marcas.map((marca, index) => (
              <Option key={`marca-${index}`} value={marca.marca}>{marca.marca}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedMarca && (
          <Form.Item name="tipo" label="Nuevo Tipo" rules={[{ required: true, message: 'Por favor ingrese un tipo' }]}>
            <Input placeholder="Ingrese el nombre del tipo" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Tipo
          </Button>
        </Form.Item>
      </Form>




      <h3>Crear Modelos</h3>
      {/* Formulario 3: Ingresar un nuevo modelo según la marca y tipo seleccionados */}
      <Form name="crear-modelo" onFinish={onFinishModelo}>
        <Form.Item name="marca" label="Marca" rules={[{ required: true }]}>
          <Select
            showSearch
            allowClear
            placeholder="Seleccione una marca"
            onChange={handleMarcaChange}
          >
            {marcas.map((marca, index) => (
              <Option key={`marca-${index}`} value={marca.marca}>{marca.marca}</Option>
            ))}
          </Select>
        </Form.Item>

        {selectedMarca && (
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Select
              showSearch
              allowClear
              placeholder="Seleccione un tipo"
              onChange={(tipo) => setSelectedTipo(tipo)}
            >
              {tipos.map((tipo, index) => (
                <Option key={`tipo-${index}`} value={tipo}>{tipo}</Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {selectedMarca && selectedTipo && (
          <Form.Item name="modelo" label="Nuevo Modelo" rules={[{ required: true, message: 'Por favor ingrese un modelo' }]}>
            <Input placeholder="Ingrese el nombre del modelo" />
          </Form.Item>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar Modelo
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CrearMarcaTipoModelo;
