import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Select, Modal, notification } from 'antd';
import MapaSelector from "./MapSelector";
import useAxiosInterceptor from '../utils/axiosConfig';

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [selectedProvincia, setSelectedProvincia] = useState(null);
  const [selectedLocalidad, setSelectedLocalidad] = useState(null);
  const [campos, setCampos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  const api = useAxiosInterceptor();

  useEffect(() => {
    // Cargar provincias al montar el componente
    const fetchProvincias = async () => {
      try {
        const response = await api.get('/provincias');
        setProvincias(response.data);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
        openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las provincias.');
      }
    };

    fetchProvincias();
  }, [api]);

  useEffect(() => {
    // Si hay provincia seleccionada, cargar las localidades
    if (selectedProvincia) {
      const fetchLocalidades = async () => {
        try {
          const response = await api.get(`/localidades/${selectedProvincia}`);
          setLocalidades(response.data);
        } catch (error) {
          console.error('Error al cargar localidades:', error);
          openNotificationWithIcon('error', 'Error', 'No se pudieron cargar las localidades.');
        }
      };

      fetchLocalidades();
    }
  }, [selectedProvincia, api]);

  const addCampo = () => {
    setCampos([...campos, { nombre: '', latitud: '', longitud: '' }]);
  };

  const removeCampo = (index) => {
    setCampos(campos.filter((_, i) => i !== index));
  };

  const updateCampo = (index, key, value) => {
    const nuevosCampos = [...campos];
    nuevosCampos[index][key] = value;
    setCampos(nuevosCampos);
  };

  const handleMapSelect = (latlng) => {
    if (currentIndex !== null) {
      updateCampo(currentIndex, 'latitud', latlng.lat);
      updateCampo(currentIndex, 'longitud', latlng.lng);
    }
    setIsEditModalVisible(false);
  };

  const onFinish = async (values) => {
    console.log("Enviando datos:", values);
    
    const provinciaName = provincias.find(provincia => provincia.code === values.provincia)?.name;

    const clienteData = {
      nombre: values.nombre,
      apellido: values.apellido,
      domicilio: values.domicilio,
      localidad: values.localidad,
      provincia: provinciaName,
      telefono: values.telefono,
      mail: values.mail,
      coordenadas: campos,
    };

    try {
      setLoading(true);

      // Usamos el método `api.post` para enviar los datos
      const response = await api.post('/cliente', clienteData);

      openNotificationWithIcon('success', 'Cliente guardado', 'El cliente se ha guardado exitosamente.');
      form.resetFields();
      setCampos([]);
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      openNotificationWithIcon('error', 'Error', 'Hubo un problema al guardar el cliente.');
    } finally {
      setLoading(false);
    }
  };

  // const handleMapSelect = (latlng) => {
  //   form.setFieldsValue({
  //     coordenadas: { latitud: latlng.lat, longitud: latlng.lng },
  //   });
  //   setIsEditModalVisible(false); // Cerrar el modal después de seleccionar
  // };

  const handleCancel = () => {
    setIsEditModalVisible(false); // Cerrar modal
    form.resetFields();
  };

  const showMapModal = () => {
    setIsEditModalVisible(true); // Mostrar el modal cuando el usuario quiera seleccionar la ubicación
  };

  return (
    <>
      <Form {...layout} form={form} name="crear-cliente" onFinish={onFinish} style={{ maxWidth: 600 }} validateMessages={validateMessages}>
        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
          <Input />
        </Form.Item>



        <Form.Item name="provincia" label="Provincia" rules={[{ required: true }]}>
          <Select
            value={selectedProvincia}
            onChange={value => {
              setSelectedProvincia(value);  // Aquí 'value' es el código de la provincia
              form.setFieldsValue({ provincia: value });  // Esto actualizará el formulario con el código
            }}
            placeholder="Selecciona una provincia"
          >
            {provincias.map((provincia) => (
              <Option key={provincia.code} value={provincia.code}>
                {provincia.name}
              </Option>
            ))}
          </Select>
        </Form.Item>


        <Form.Item name="localidad" label="Localidad" rules={[{ required: true }]}>
          <Select
            value={selectedLocalidad}
            onChange={value => {
              setSelectedLocalidad(value);
              form.setFieldsValue({ localidad: value }); // Actualizar el valor en el formulario
            }}
            placeholder="Selecciona una localidad"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {localidades.map((localidad) => (
              <Option key={localidad.name} value={localidad.name}>
                {localidad.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="domicilio" label="Domicilio" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="mail" label="Mail" rules={[{ required: false, type: 'email' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="campos" label="Campos" rules={[{ required: false }]}>
        {campos.map((campo, index) => (
          <div key={index} style={{ marginBottom: 10, border: '1px solid #ddd', padding: 10, borderRadius: 5 }}>
            <Input placeholder="Nombre del campo" value={campo.nombre} onChange={e => updateCampo(index, 'nombre', e.target.value)} style={{ marginBottom: 5 }} />
            <Button type="default" onClick={() => { setCurrentIndex(index); setIsEditModalVisible(true); }}>Seleccionar Ubicación</Button>
            <Input placeholder="Latitud" value={campo.latitud} readOnly style={{ marginTop: 5 }} />
            <Input placeholder="Longitud" value={campo.longitud} readOnly style={{ marginTop: 5 }} />
            <Button type="link" danger onClick={() => removeCampo(index)}>Eliminar</Button>
          </div>
        ))}
        <Button type="dashed" onClick={addCampo}>Agregar Campo</Button>
        </Form.Item>

        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Crear Cliente
          </Button>
        </Form.Item>
      </Form>

      <Modal title="Seleccionar Lugar en el Mapa" visible={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
        <MapaSelector onChange={handleMapSelect} isModalVisible={isEditModalVisible} />
      </Modal>
    </>
  );
};

export default CrearCliente;
