import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const TablaEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [equipoActual, setEquipoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [equipoIdToDelete, setEquipoIdToDelete] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [currentEquipo, setCurrentEquipo] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchEquipos = async () => {
      const { current, pageSize } = pagination;
      try {
        const response = await axios.get("http://localhost:6001/api/equipos", {
          params: { page: current, perPage: pageSize },
        });
        if (response.data && Array.isArray(response.data)) {
          setEquipos(response.data);
          // setTotalEquipos(response.data.total);
        }
      } catch (error) {
        console.error('Error fetching equipos:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmpleados = async () => {
      try {
        const response = await axios.get('http://localhost:6001/api/nominas'); // URL de la API de empleados
        setEmpleados(response.data);
      } catch (error) {
        console.error('Error fetching empleados:', error);
      }
    };

    const fetchVehiculos = async () => {
      try {
        const response = await axios.get('http://localhost:6001/api/vehiculos'); // URL de la API de vehículos
        setVehiculos(response.data);
      } catch (error) {
        console.error('Error fetching vehiculos:', error);
      }
    };
    fetchEquipos();
    fetchEmpleados();
    fetchVehiculos();

  }, [pagination]);

  const verDetalles = (id) => {
    console.log("Ver detalles del equipo:", id);
  };

  const showDeleteConfirm = (id) => {
    setEquipoIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (equipo) => {
    setCurrentEquipo(equipo);
    form.setFieldsValue({
      ...equipo,
      fechaInicio: equipo.fechaInicio ? dayjs(equipo.fechaInicio) : null,
      empleados: equipo.empleados ? equipo.empleados.map(emp => emp._id) : [],
      vehiculos: equipo.vehiculos ? equipo.vehiculos.map(veh => veh._id) : [],
      estado: equipo.estado
    });

    setIsEditModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    form.resetFields();
  };




  const handleEdit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        vehiculos: values.vehiculos,
        empleados: values.empleados,
        fechaInicio: values.fechaInicio ? values.fechaInicio.format('YYYY-MM-DD') : null,

      };
      await axios.put(`http://localhost:6001/api/equipo/${currentEquipo._id}`, formattedValues);

      setEquipos(prevEquipos =>
        prevEquipos.map(equipo =>
          equipo._id === currentEquipo._id ? { ...equipo, ...formattedValues } : equipo));
      handleTableChange({ current: pagination.current, pageSize: pagination.pageSize });
      setIsEditModalVisible(false);
      notification.success({ message: 'Equipo Editado', description: 'El equipo ha sido editado exitosamente.' });
    } catch (error) {
      console.error('Error editing equipo:', error);
      notification.error({ message: 'Error', description: 'Hubo un problema al editar el equipo.' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/equipo/${equipoIdToDelete}`);
      setEquipos(prevEquipos => prevEquipos.filter(equipo => equipo._id !== equipoIdToDelete));
      setIsDeleteModalVisible(false);
      notification.success({ message: 'Equipo Eliminado', description: 'El Equipo ha sido eliminado exitosamente.' });
    } catch (error) {
      console.error("Error deleting Equipo:", error);
      notification.error({ message: 'Error', description: 'Hubo un problema al eliminar el Equipo.' });
    }
  };
  const estadoMapping = {
    0: "Inactivo",
    1: "Activo",
    // 2: "Finalizado",
    // 3: "Cancelado",
    5: "Asignado",
    6: "Libre",
    // 7: "En reparación"
  };
  const columns = [
    {
      title: "Nombre del Equipo",
      dataIndex: "nombre",
      key: "nombre"
    },
    // {
    //   title: "Numero del Equipo",
    //   dataIndex: "numero",
    //   key: "numero"
    // },
    // {
    //   title: "Responsable",
    //   dataIndex: "responsable",
    //   key: "responsable"
    // },
    {
      title: "Empleados",
      dataIndex: "empleados",
      key: "empleados",
      render: empleados => empleados.map(e => `${e.rol} ${e.lastname}`).join(" - ")
    },
    {
      title: "Vehiculos",
      dataIndex: 'vehiculos',
      key: "vehiculos",
      render: vehiculos => vehiculos.map(v => `${v.modelo} ${v.dominio}`).join(" - ")
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado"
    },
    {
      title: 'Acción', key: 'action', render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>Editar</a>
          <a onClick={() => showDeleteConfirm(record._id)}>Eliminar</a>
        </Space>
      )
    },
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <>
      <Table dataSource={equipos}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <Modal title="Confirmar Eliminación" open={isDeleteModalVisible} onOk={handleDelete} onCancel={handleCancel} okText="Eliminar" cancelText="Cancelar">
        <p>¿Estás seguro de que deseas eliminar este equipo?</p>
      </Modal>

      <Modal title="Editar Equipo" open={isEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleEdit}>
          <Form.Item name="nombre" 
          label="Nombre del Equipo" 
          rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item>
          {/* <Form.Item name="responsable" label="Responsable" rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item> */}

          <Form.Item name="numero" 
          label="Numero de Equipo"
          rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="empleados"
            label="Empleados"
            rules={[{ required: true, message: 'Debe seleccionar al menos un empleado' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar empleados"
              optionLabelProp="items"
            >
              {empleados.map((empleado) => (
                <Option key={empleado._id} value={empleado._id}>
                  {`${empleado.lastname} ${empleado.firstname} - ${empleado.rol}`}
                </Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item
            name="vehiculos"
            label="Vehículos"
            rules={[{ required: true, message: 'Debe seleccionar al menos un vehículo' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar vehículos"
              optionLabelProp="items"
            >
              {vehiculos.map((vehiculo) => (
                <Option key={vehiculo._id} value={vehiculo._id}>
                  {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="estado" label="Estado">
            <Select>
              {Object.entries(estadoMapping).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar Cambios</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TablaEquipos;
