import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker, Select } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const TablaVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [vehiculoIdToDelete, setVehiculoIdToDelete] = useState(null);
  const [currentVehiculo, setCurrentVehiculo] = useState(null);
  const [form] = Form.useForm();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:6001/api/vehiculos", {
          params: { page: pagination.current, perPage: pagination.pageSize },
        });

        if (Array.isArray(response.data)) {
          setVehiculos(response.data);
        } else {
          console.error('Formato de datos inesperado:', response.data);
        }
      } catch (error) {
        console.error('Error al obtener vehículos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculos();
  }, [pagination]);

  const openNotificationWithIcon = (type, message, description) => {
    notification[type]({ message, description });
  };

  const showDeleteConfirm = (id) => {
    setVehiculoIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showEditModal = (vehiculo) => {
    setCurrentVehiculo(vehiculo);

    form.setFieldsValue({
      tipo: vehiculo.tipo || "",
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      dominio: vehiculo.dominio || "",
      alias: vehiculo.alias || "",
      numero: vehiculo.numero || "",
      estado: vehiculo.estado !== undefined ? String(vehiculo.estado) : "0",
      fecha_vencimiento_seguro: vehiculo.fecha_vencimiento_seguro ? dayjs(vehiculo.fecha_vencimiento_seguro) : null,
      fecha_vencimiento_vtv: vehiculo.fecha_vencimiento_vtv ? dayjs(vehiculo.fecha_vencimiento_vtv) : null,
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
        fecha_vencimiento_seguro: values.fecha_vencimiento_seguro ? values.fecha_vencimiento_seguro.format('YYYY-MM-DD') : null,
        fecha_vencimiento_vtv: values.fecha_vencimiento_vtv ? values.fecha_vencimiento_vtv.format('YYYY-MM-DD') : null,
        estado: Number(values.estado), // Asegurar que el estado sea un número
      };

      await axios.put(`http://localhost:6001/api/vehiculo/${currentVehiculo._id}`, formattedValues);

      setVehiculos((prevVehiculos) =>
        prevVehiculos.map((vehiculo) =>
          vehiculo._id === currentVehiculo._id ? { ...vehiculo, ...formattedValues } : vehiculo
        )
      );

      setIsEditModalVisible(false);
      openNotificationWithIcon('success', 'Vehículo Editado', 'El vehículo ha sido editado exitosamente.');
    } catch (error) {
      console.error('Error editando vehículo:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:6001/api/vehiculo/${vehiculoIdToDelete}`);

      setVehiculos((prevVehiculos) => prevVehiculos.filter((vehiculo) => vehiculo._id !== vehiculoIdToDelete));

      setIsDeleteModalVisible(false);
      openNotificationWithIcon('success', 'Vehículo Eliminado', 'El vehículo ha sido eliminado exitosamente.');
    } catch (error) {
      console.error("Error eliminando vehículo:", error);
    }
  };

  const estadoMapping = {
    0: "Inactivo",
    1: "Activo",
    // 2: "Finalizado",
    // 3: "Cancelado",
    // 5: "Asignado",
    // 6: "Libre",
    7: "En reparación"
  };

  const columns = [
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Marca', dataIndex: 'marca', key: 'marca' },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo' },
    { title: 'Dominio', dataIndex: 'dominio', key: 'dominio' },
    { title: 'Alias', dataIndex: 'alias', key: 'alias' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => estadoMapping[estado] || "Desconocido",
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>Editar</a>
          <a onClick={() => showDeleteConfirm(record._id)}>Eliminar</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={vehiculos}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: vehiculos.length,
          onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        }}
        loading={loading}
      />

      <Modal
        title="Confirmar Eliminación"
        open={isDeleteModalVisible}
        onOk={handleDelete}
        onCancel={handleCancel}
        okText="Eliminar"
        cancelText="Cancelar"
      >
        <p>¿Estás seguro de que deseas eliminar este vehículo?</p>
      </Modal>

      <Modal
        title="Editar Vehículo"
        open={isEditModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleEdit} >
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
          <Select>
            <Option value="Auto">Auto</Option>
            <Option value="Cabezal">Cabezal</Option>
            <Option value="Camion">Camion</Option>
            <Option value="Camioneta">Camioneta</Option>
            <Option value="Casilla">Casilla</Option>
            <Option value="Cisterna">Cisterna</Option>
            <Option value="Cosechadora">Cosechadora</Option>
            <Option value="Elevador">Elevador</Option>
            <Option value="Semirremolque">Semirremolque</Option>
            <Option value="Tolva">Tolva</Option>
            <Option value="Tractor">Tractor</Option>
            <Option value="Trailer">Trailer</Option>
          </Select>
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

        

          <Form.Item name="alias" label="Alias">
            <Input />
          </Form.Item>

          <Form.Item name="numero" label="Numero" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="fecha_vencimiento_seguro" label="Vencimiento Seguro">
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item name="fecha_vencimiento_vtv" label="Vencimiento VTV">
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

export default TablaVehiculos;
