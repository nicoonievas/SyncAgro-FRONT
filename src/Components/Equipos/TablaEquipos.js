import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, Select, Typography } from 'antd';
import { DeleteOutlined, FormOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import useAxiosInterceptor from '../../utils/axiosConfig';
import ModalEquipos from "./ModalEquipos";

const { Option } = Select;
const { Title } = Typography;

const TablaEquipos = ({ empresa }) => {
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
  const [empleadosLibres, setEmpleadosLibres] = useState([]);
  const [vehiculosLibres, setVehiculosLibres] = useState([]);
  const [empresaId, setEmpresaId] = useState(null);
  const [isModalEquiposVisible, setIsModalEquiposVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEquipos, setFilteredEquipos] = useState([]);


  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    setEmpresaId(empresa._id); // Asegúrate de tener el _id de la empresa
  }, [empresa]);

  // Usamos el interceptor con la empresaId para hacer las peticiones con los encabezados correctos
  const api = useAxiosInterceptor(empresaId);

  useEffect(() => {
    const fetchData = async () => {
      if (!empresaId) {
        console.log('Esperando empresaId...');
        return;
      }
      setLoading(true);
      const { current, pageSize } = pagination;

      try {
        const [
          equiposResponse,
          empleadosResponse,
          empleadosLibresResponse,
          vehiculosResponse,
          vehiculosLibresResponse
        ] = await Promise.all([
          api.get("/equipos", { params: { empresaId, page: current, perPage: pageSize } }),
          api.get("/nominas", { params: { empresaId } }),
          api.get("/empleadosLibres", { params: { empresaId } }),
          api.get("/vehiculos", { params: { empresaId } }),
          api.get("/vehiculosLibres", { params: { empresaId } }),
        ]);

        // Seteamos los estados con los datos recibidos
        setEquipos(equiposResponse.data);
        setEmpleados(empleadosResponse.data);
        setEmpleadosLibres(empleadosLibresResponse.data);
        setVehiculos(vehiculosResponse.data);
        setVehiculosLibres(vehiculosLibresResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId, pagination, api]);


 useEffect(() => {
    setFilteredEquipos(equipos);
  }, [equipos]);


  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term) {
      setFilteredEquipos(equipos); // Mostrar todos los datos cuando el input está vacío
      return;
    }

    // Filtrar las empresas por razón social o CUIT
    const filtered = equipos.filter(equipo =>
      equipo.nombre.toLowerCase().includes(term) ||
      equipo.numero.includes(term)
    );

    setFilteredEquipos(filtered);
  };

  const verDetalles = (id) => {
    console.log("Ver detalles del equipo:", id);
  };

  const showDeleteConfirm = (id) => {
    setEquipoIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showModalEquipos = (record) => {
    setSelectedRecord(record);
    setIsModalEquiposVisible(true);
    // console.log(record);
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
      // await axios.delete(`http://localhost:6001/api/equipo/${equipoIdToDelete}`);
      await axios.put(`http://localhost:6001/api/equipo/${equipoIdToDelete}/delete`);
      setEquipos(prevEquipos => prevEquipos.filter(equipo => equipo._id !== equipoIdToDelete));
      setIsDeleteModalVisible(false);
      notification.success({ message: 'Equipo Eliminado', description: 'El Equipo ha sido eliminado exitosamente.' });
    } catch (error) {
      console.error("Error deleting Equipo:", error);
      notification.error({ message: 'Error', description: 'Hubo un problema al eliminar el Equipo.' });
    }
  };

  const colors = {
    Inactivo: "rgba(247, 146, 64, 0.83)", // Verde
    Libre: "rgba(55, 139, 58, 0.8)", // Rojo
    Asignado: "rgba(211, 191, 11, 0.88)", // Amarillo
};

  const columns = [
    {
      title: "Nombre del Equipo",
      dataIndex: "nombre",
      key: "nombre",

      render: (text, record) => (
        <a onClick={() => showModalEquipos(record)}>{text}</a>
      ),

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
      render: empleados => (
        <span>
          {empleados.map((e, index) => (
            <span key={e.id || index}>{e.rol} {e.lastname}{index !== empleados.length - 1 ? " - " : ""}</span>
          ))}
        </span>
      )
    },
    {
      title: "Vehiculos",
      dataIndex: "vehiculos",
      key: "vehiculos",
      render: vehiculos => (
        <span>
          {vehiculos.map((v, index) => (
            <span key={v.id || index}>{v.modelo} {v.dominio}{index !== vehiculos.length - 1 ? " - " : ""}</span>
          ))}
        </span>
      )
    }
    ,
    {
      title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        align: 'center',
        render: (text) => (
            <span
                style={{
                    backgroundColor: colors[text] || 'transparent',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    color: '#fff',
                }}
            >
                {text}
            </span>
        ),
    },
    {
      title: 'Acción', key: 'action', render: (_, record) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}><EditOutlined /></a>
          <a onClick={() => showDeleteConfirm(record._id)}><DeleteOutlined /></a>
        </Space>
      )
    },
  ];

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };




  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={5} style={{ marginTop: '0px' }}>Gestión de Equipos</Title>
        <Input
          style={{ width: 200 }}
          placeholder="Buscar por Nombre o Numero"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <Table dataSource={filteredEquipos}
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
          <Form.Item name="descripcion" label="Descripcion" rules={[{ required: false}]}>
            <Input />
          </Form.Item>

          <Form.Item name="numero"
            label="Numero de Equipo"
            rules={[{ required: true, message: "Campo obligatorio" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="empleados"
            label="Empleados Adicionales"
            rules={[{ required: false, message: 'Debe seleccionar al menos un empleado' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar empleados"
              optionLabelProp="children"
            >
              {empleados.map((empleado) => {
                const estaAsignado = currentEquipo?.empleados?.some(e => e._id === empleado._id);
                const estaLibre = empleadosLibres.some(e => e._id === empleado._id);

                return (
                  <Option key={empleado._id} value={empleado._id} disabled={!estaAsignado && !estaLibre}>
                    {`${empleado.lastname} ${empleado.firstname} - ${empleado.rol}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>


          <Form.Item
            name="vehiculos"
            label="Vehículos Adicionales"
            rules={[{ required: false, message: 'Debe seleccionar al menos un vehículo' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar vehículos"
              optionLabelProp="children"
            >
              {vehiculos.map((vehiculo) => {
                const estaAsignado = currentEquipo?.vehiculos?.some(v => v._id === vehiculo._id);
                const estaLibre = vehiculosLibres.some(v => v._id === vehiculo._id);

                return (
                  <Option key={vehiculo._id} value={vehiculo._id} disabled={!estaAsignado && !estaLibre}>
                    {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item name="estado" label="Estado">
            <Select>
              {/* <Option value="Activo">Activo</Option> */}
              <Option value="Inactivo">Inactivo</Option>
              <Option value="Asignado">Asignado</Option>
              <Option value="Libre">Libre</Option>
            </Select>
          </Form.Item>


          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar Cambios</Button>
          </Form.Item>
        </Form>
      </Modal>

      <ModalEquipos
        open={isModalEquiposVisible}
        onClose={() => setIsModalEquiposVisible(false)}
        equipo={selectedRecord}
      />
    </>
  );
};

export default TablaEquipos;
