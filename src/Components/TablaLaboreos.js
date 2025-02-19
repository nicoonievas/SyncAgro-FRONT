import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
const { Option } = Select;

const TablaLaboreos = () => {
  const [laboreos, setLaboreos] = useState([]);
  const [empleados, setEmpleados] = useState([]); // Agregar estado para empleados
  const [vehiculos, setVehiculos] = useState([]); // Agregar estado para vehículos
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [laboreoIdToDelete, setLaboreoIdToDelete] = useState(null);
  const [currentLaboreo, setCurrentLaboreo] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [totalLaboreos, setTotalLaboreos] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchLaboreos = async () => {
      const { current, pageSize } = pagination;
      try {
        const response = await axios.get("http://localhost:6001/api/laboreos", {
          params: { page: current, perPage: pageSize },
        });
        if (response.data && Array.isArray(response.data)) {
          setLaboreos(response.data);
          setTotalLaboreos(response.data.total);
        }
      } catch (error) {
        console.error('Error fetching laboreos:', error);
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

    const fetchClientes = async () => {
      try {
        const response = await axios.get('http://localhost:6001/api/clientes'); // URL de la API de vehículos
        setClientes(response.data);
      } catch (error) {
        console.error('Error fetching Clientes:', error);
      }
    };

    fetchLaboreos();
    fetchEmpleados();
    fetchVehiculos();
    fetchClientes();
  }, [pagination, selectedCliente]);

  const showDeleteConfirm = (id) => {
    setLaboreoIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (laboreo) => {
    setCurrentLaboreo(laboreo);
    form.setFieldsValue({
      ...laboreo,
      fechaInicio: laboreo.fechaInicio ? dayjs(laboreo.fechaInicio) : null,
      cliente: laboreo.cliente ? laboreo.cliente._id : null,
      empleados: laboreo.empleados ? laboreo.empleados.map(emp => emp._id) : [],
      vehiculos: laboreo.vehiculos ? laboreo.vehiculos.map(veh => veh._id) : [],
      estado: laboreo.estado
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
        cliente: values.cliente,
        fechaInicio: values.fechaInicio ? values.fechaInicio.format('YYYY-MM-DD') : null,

      };
      await axios.put(`http://localhost:6001/api/laboreo/${currentLaboreo._id}`, formattedValues);

      setLaboreos(prevLaboreos =>
        prevLaboreos.map(laboreo =>
          laboreo._id === currentLaboreo._id ? { ...laboreo, ...formattedValues } : laboreo));
      handleTableChange({ current: pagination.current, pageSize: pagination.pageSize });
      setIsEditModalVisible(false);
      notification.success({ message: 'Laboreo Editado', description: 'El laboreo ha sido editado exitosamente.' });
    } catch (error) {
      console.error('Error editing laboreo:', error);
      notification.error({ message: 'Error', description: 'Hubo un problema al editar el laboreo.' });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/laboreo/${laboreoIdToDelete}`);
      setLaboreos(prevLaboreos => prevLaboreos.filter(laboreo => laboreo._id !== laboreoIdToDelete));
      setIsDeleteModalVisible(false);
      notification.success({ message: 'Laboreo Eliminado', description: 'El laboreo ha sido eliminado exitosamente.' });
    } catch (error) {
      console.error("Error deleting laboreo:", error);
      notification.error({ message: 'Error', description: 'Hubo un problema al eliminar el laboreo.' });
    }
  };
  const estadoMapping = {
    0: "Inactivo",
    1: "Activo",
    2: "Finalizado",
    3: "Cancelado"
  };
  const columns = [
    {
      title: 'Nombre', dataIndex: 'nombre', key: 'nombre',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Cliente', dataIndex: ['cliente', 'nombre'], key: 'cliente',
      render: (_, record) => `${record.cliente.nombre} ${record.cliente.apellido}`
    },
    { title: 'Fecha Inicio', dataIndex: 'fechaInicio', key: 'fechaInicio' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (estado) => estadoMapping[estado] || "Desconocido"
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

  const handleClienteSelect = (clienteId) => {
    const selected = clientes.find((cliente) => cliente._id === clienteId);
    setSelectedCliente(selected);
  };
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={laboreos}
        rowKey="_id"
        // pagination={{
        //   current: pagination.current,
        //   pageSize: pagination.pageSize,
        //   total: totalLaboreos,
        //   onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
        // }}
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
      />

      <Modal title="Confirmar Eliminación" open={isDeleteModalVisible} onOk={handleDelete} onCancel={handleCancel} okText="Eliminar" cancelText="Cancelar">
        <p>¿Estás seguro de que deseas eliminar este laboreo?</p>
      </Modal>

      <Modal title="Editar Laboreo" open={isEditModalVisible} onCancel={handleCancel} footer={null}>
        <Form form={form} onFinish={handleEdit}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Por favor ingresa el nombre del laboreo' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[{ required: true, message: 'Por favor ingresa la descripción' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="resumen" label="Resumen" rules={[{ required: true, message: 'Por favor ingresa el resumen' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tarea" label="Tarea">
            <Input />
          </Form.Item>
          <Form.Item name="grano" label="Grano">
            <Input />
          </Form.Item>
          <Form.Item
            name="cliente"
            label="Cliente"
            rules={[{ required: true, message: 'Debe seleccionar un cliente' }]}
          >
            <Select
              showSearch
              placeholder="Buscar cliente"
              optionFilterProp="children"
              onChange={handleClienteSelect}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {clientes.map((cliente) => (
                <Option key={cliente._id} value={cliente._id}>
                  {`${cliente.nombre} ${cliente.apellido}`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="empleados"
            label="Empleados"
            rules={[{ required: true, message: 'Debe seleccionar al menos un empleado' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar empleados"
              optionLabelProp="children"
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
              optionLabelProp="children"
            >
              {vehiculos.map((vehiculo) => (
                <Option key={vehiculo._id} value={vehiculo._id}>
                  {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="fechaInicio" label="Fecha Inicio"
            rules={[{ required: true, message: 'Por favor ingresa la fecha' }]}>
            <DatePicker format="YYYY-MM-DD" />
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

export default TablaLaboreos;
