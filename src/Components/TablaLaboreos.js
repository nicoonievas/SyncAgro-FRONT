import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Button, notification, DatePicker, Select, Typography,
Row, Col} from 'antd';
import { DeleteOutlined, FormOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import FinishModal from './FinishModal';
import useAxiosInterceptor from '../utils/axiosConfig';
const { Option } = Select;
const { Title } = Typography;


const TablaLaboreos = ({empresa}) => {
  const [laboreos, setLaboreos] = useState([]);
  const [empleados, setEmpleados] = useState([]); // Agregar estado para empleados
  const [empleadosLibres, setEmpleadosLibres] = useState([]);
  const [vehiculos, setVehiculos] = useState([]); // Agregar estado para vehículos
  const [vehiculosLibres, setVehiculosLibres] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [equiposLibres, setEquiposLibres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [laboreoIdToDelete, setLaboreoIdToDelete] = useState(null);
  const [currentLaboreo, setCurrentLaboreo] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [tareas, setTareas] = useState(['Sembrar', 'Cosechar', 'Fumigar', 'Picar', 'Embolsar']);
  const [granos, setGranos] = useState(['Soja', 'Sorgo', 'Trigo', 'Girasol']);
  const [totalLaboreos, setTotalLaboreos] = useState(0);
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null);
  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);


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
          laboreosResponse,
          equiposResponse,
          equiposLibresResponse,
          empleadosResponse,
          empleadosLibresResponse,
          vehiculosResponse,
          vehiculosLibresResponse,
          clientesResponse
        ] = await Promise.all([
          api.get("/laboreos", { params: { page: current, perPage: pageSize } }),
          api.get("/equipos"),
          api.get("/equiposLibres"),
          api.get("/nominas"),
          api.get("/empleadosLibres"),
          api.get("/vehiculos"),
          api.get("/vehiculosLibres"),
          api.get("/clientes")
        ]);

        // Seteamos los estados con los datos recibidos
        setLaboreos(laboreosResponse.data);
        setTotalLaboreos(laboreosResponse.data.total);
        setEquipos(equiposResponse.data);
        setEquiposLibres(equiposLibresResponse.data);
        setEmpleados(empleadosResponse.data);
        setEmpleadosLibres(empleadosLibresResponse.data);
        setVehiculos(vehiculosResponse.data);
        setVehiculosLibres(vehiculosLibresResponse.data);
        setClientes(clientesResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId, pagination, selectedCliente, selectedEquipo]);


  const showDeleteConfirm = (id) => {
    setLaboreoIdToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const showFinishModal = (record) => {
    console.log("ID del laboreo a finalizar:", record);
    setSelectedRecord(record);  // Pasamos el record completo
    setIsFinishModalVisible(true);
  };


  const handleFinishModalClose = () => {
    setIsFinishModalVisible(false);
    setSelectedRecord(null);
  };


  const showEditModal = (laboreo) => {
    setCurrentLaboreo(laboreo);
    form.setFieldsValue({
      ...laboreo,
      fechaInicio: laboreo.fechaInicio ? dayjs(laboreo.fechaInicio) : null,
      cliente: laboreo.cliente ? laboreo.cliente._id : null,
      empleados: laboreo.empleados ? laboreo.empleados.map(emp => emp._id) : [],
      vehiculos: laboreo.vehiculos ? laboreo.vehiculos.map(veh => veh._id) : [],
      equipos: laboreo.equipos ? laboreo.equipos.map(eq => eq._id) : [],
      estado: laboreo.estado
    });

    setIsEditModalVisible(true);
  };

  const showViewModal = (record) => {
    console.log(record);
    setRecord(record);
    setIsViewModalVisible(true); // Abre el modal
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsEditModalVisible(false);
    setIsViewModalVisible(false);
    form.resetFields();
  };

  const handleEdit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        equipos: values.equipos,
        vehiculos: values.vehiculos,
        empleados: values.empleados,
        cliente: values.cliente,
        fechaInicio: values.fechaInicio ? values.fechaInicio.format('DD-MM-YYYY') : null,

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
    // 2: "Finalizado",
    3: "Cancelado"
  };
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (text, record) => (
        <a onClick={() => showViewModal(record)}>{text}</a>
      ),

    },
    {
      title: 'Cliente',
      dataIndex: ['cliente', 'nombre'],
      key: 'cliente',
      render: (_, record) =>
        record.cliente ? `${record.cliente.nombre} ${record.cliente.apellido}` : "Sin cliente",
    },
    {
      title: 'Equipos',
      dataIndex: 'equipos',
      key: 'equipos',
      render: (equipos) =>
        equipos && equipos.length > 0
          ? equipos.map(equipo => `${equipo.nombre} (${equipo.numero})`).join(', ')
          : "Sin equipos"
    },
    { title: 'Fecha Inicio', dataIndex: 'fechaInicio', key: 'fechaInicio' },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => estadoMapping[estado] || estado,
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={(e) => {
              if (record.estado === "Finalizado") {
                e.preventDefault(); // Evita que el clic se ejecute
              } else {
                showEditModal(record);
              }
            }}
            disabled={record.estado === "Finalizado"}
          >      <EditOutlined />
          </a>
          <a onClick={() => showDeleteConfirm(record._id)}><DeleteOutlined /></a>
          <a
            onClick={(e) => {
              if (record.estado === "Finalizado") {
                e.preventDefault(); // Evita que el clic se ejecute
              } else {
                showFinishModal(record);
              }
            }}
            disabled={record.estado === "Finalizado"}
          >
            <CheckCircleOutlined />

          </a>
        </Space >
      ),
    },
  ];


  const handleClienteSelect = (clienteId) => {
    const selected = clientes.find((cliente) => cliente._id === clienteId);
    setSelectedCliente(selected);
  };

  const handleEquipoSelect = (equipoId) => {
    const selected = equipos.find((equipo) => equipo._id === equipoId);
    setSelectedEquipo(selected);
  }
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };
  const handleUpdate = () => {
    console.log("Actualizar datos después de finalizar laboreo");
    // Aquí puedes recargar la tabla o actualizar el estado según sea necesario
  };
  return (

    <>
      <Title level={5} style={{ marginTop: '0px' }}>Gestión de Campañas</Title>
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
          <Form.Item name="equipos" label="Equipos">
            <Select
              showSearch
              mode="multiple"
              placeholder="Buscar equipo"
              optionFilterProp="children"
              onChange={handleEquipoSelect}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {equipos.map((equipo) => {
                const estaAsignado = currentLaboreo?.equipos?.some(e => e._id === equipo._id);
                const estaLibre = equiposLibres.some(e => e._id === equipo._id);

                return (
                  <Option key={equipo._id} value={equipo._id} disabled={!estaAsignado && !estaLibre}>
                    {`Equipo: ${equipo.nombre} - Número: ${equipo.numero}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tarea"
                label="Tarea"
                rules={[{ required: true }]}
                labelAlign="right" // Alineación de la etiqueta
              >
                <Select placeholder="Seleccionar tarea" style={{ width: '100%' }}>
                  {tareas.map((tarea, index) => (
                    <Option key={index} value={tarea}>
                      {tarea}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="grano"
                label="Grano"
                rules={[{ required: true }]}
                labelAlign="right" // Alineación de la etiqueta
              >
                <Select placeholder="Seleccionar tipo de grano" style={{ width: '100%' }}>
                  {granos.map((grano, index) => (
                    <Option key={index} value={grano}>
                      {grano}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
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
            label="Empleados Adicionales"
            rules={[{ required: false, message: 'Debe seleccionar al menos un empleado' }]}
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar empleados"
              optionLabelProp="children"
            >
              {empleados.map((empleado) => {
                const estaAsignado = currentLaboreo?.empleados?.some(e => e._id === empleado._id);
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
                const estaAsignado = currentLaboreo?.vehiculos?.some(v => v._id === vehiculo._id);
                const estaLibre = vehiculosLibres.some(v => v._id === vehiculo._id);

                return (
                  <Option key={vehiculo._id} value={vehiculo._id} disabled={!estaAsignado && !estaLibre}>
                    {`${vehiculo.tipo} - ${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.numero} - ${vehiculo.alias}`}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>


          <Form.Item name="fechaInicio" label="Fecha Inicio"
            rules={[{ required: true, message: 'Por favor ingresa la fecha' }]}>
            <DatePicker format="DD-MM-YYYY" />
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

      <Modal title="Detalles del Laboreo" open={isViewModalVisible} onCancel={handleCancel} footer={null}>
        {record && (
          <div>
            <p><strong>Nombre:</strong> {record.nombre}</p>
            <p><strong>Cliente:</strong> {record.cliente ? `${record.cliente.nombre} ${record.cliente.apellido}` : "Sin cliente"}</p>
            <p><strong>Equipos:</strong> {record.equipos?.map(equipo => `${equipo.nombre} (${equipo.numero})`).join(', ') || "Sin equipos"}</p>
            <p><strong>Fecha Inicio:</strong> {record.fechaInicio ? new Date(record.fechaInicio).toLocaleDateString('es-ES') : "No iniciado"}</p>
            <p><strong>Fecha Fin:</strong> {record.fechaCierre ? new Date(record.fechaCierre).toLocaleDateString('es-ES') : "No finalizado"}</p>
            <p><strong>Estado:</strong> {record.estado || "Desconocido"}</p>
          </div>
        )}
      </Modal>

      <FinishModal
        visible={isFinishModalVisible}
        onClose={handleFinishModalClose}
        laboreo={selectedRecord}  // Pasamos el record completo
        onUpdate={handleUpdate}
      />




    </>
  );
};

export default TablaLaboreos;
