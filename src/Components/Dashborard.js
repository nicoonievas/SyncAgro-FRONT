import React, { useEffect, useState } from 'react';
import { Select, message, Input, Button, Statistic, Card, Row, Col, Table, Typography } from 'antd';
import useAxiosInterceptor from '../utils/axiosConfig';
import dayjs from 'dayjs';
import { ArrowDownOutlined, DollarOutlined, ArrowUpOutlined, ToolOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import MapComponent from './GeneralMapViewer';

const { Option } = Select;
const { Title } = Typography

const Dashboard = ({ empresa }) => {
    const [laboreos, setLaboreos] = useState([]);
    const [filtros, setFiltros] = useState({ mes: null, grano: null, tarea: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [estadoContadores, setEstadoContadores] = useState({
        finalizados: 0,
        activos: 0,
        pendientes: 0
    });


    const empresaId = empresa._id;
    const api = useAxiosInterceptor(empresaId);

    useEffect(() => {
        fetchData();
    }, [empresaId]);

    useEffect(() => {
        if (filtros.mes || filtros.grano || filtros.tarea) {
            aplicarFiltros();
        }
    }, [filtros]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get("/laboreos");
            setLaboreos(data);

            // Extraer coordenadas de los campos afectados
            const coordenadasAfectadas = data.map(laboreo => {
                // Verificar si el laboreo tiene cliente y camposAfectados
                if (!laboreo.cliente || !laboreo.camposAfectados || !Array.isArray(laboreo.cliente.coordenadas)) return [];

                return laboreo.cliente.coordenadas
                    .filter(campo => {
                        // Asegurarse de que el nombre del campo está incluido en los camposAfectados
                        return laboreo.camposAfectados.some(afectado => afectado.toLowerCase() === campo.nombre.toLowerCase());
                    })
                    .map(campo => ({
                        nombre: campo.nombre,

                        latitud: campo.latitud,
                        longitud: campo.longitud,
                        cliente: laboreo.cliente.nombre, // Opcional, para identificar al cliente
                        apellido: laboreo.cliente.apellido,
                        grano: laboreo.grano, // Opcional, para identificar el grano
                        tarea: laboreo.tarea, // Opcional, para identificar la tarea
                        estado: laboreo.estado, // Opcional, para identificar el estado
                    }));
            }).flat(); // Aplana el arreglo resultante para obtener una lista simple de coordenadas

            setLocations(coordenadasAfectadas); // Guardamos en el estado

            const estados = calcularEstados(data);
            setEstadoContadores(estados);

        } catch (error) {
            // Manejar errores si es necesario
        } finally {
            setLoading(false);
        }
    };


    const aplicarFiltros = () => {
        const { mes, grano, tarea } = filtros;
        let filteredData = [...laboreos];

        if (mes || grano || tarea) {
            const filtro = {};
            filtro.empresaId = empresaId;

            if (mes) filtro.mes = mes;
            if (grano) filtro.grano = grano;
            if (tarea) filtro.tarea = tarea;

            setLoading(true);
            setError(null);
            api.get("/laboreos/filter", { params: filtro })
                .then(({ data }) => {
                    setLaboreos(data);
                    const estados = calcularEstados(data);
                    setEstadoContadores(estados); // Guardamos los resultados en el estado
                    const coordenadasAfectadas = data.map(laboreo => {
                        // Verificar si el laboreo tiene cliente y camposAfectados
                        if (!laboreo.cliente || !laboreo.camposAfectados || !Array.isArray(laboreo.cliente.coordenadas)) return [];

                        return laboreo.cliente.coordenadas
                            .filter(campo => {
                                // Asegurarse de que el nombre del campo está incluido en los camposAfectados
                                return laboreo.camposAfectados.some(afectado => afectado.toLowerCase() === campo.nombre.toLowerCase());
                            })
                            .map(campo => ({
                                nombre: campo.nombre,

                                latitud: campo.latitud,
                                longitud: campo.longitud,
                                cliente: laboreo.cliente.nombre, // Opcional, para identificar al cliente
                                apellido: laboreo.cliente.apellido,
                                grano: laboreo.grano, // Opcional, para identificar el grano
                                tarea: laboreo.tarea, // Opcional, para identificar la tarea
                                estado: laboreo.estado
                            }));
                    }).flat(); // Aplana el arreglo resultante para obtener una lista simple de coordenadas

                    setLocations(coordenadasAfectadas); // Guardamos en el estado
                })
                .catch((error) => {
                    setError('Error al obtener datos');
                    console.error("Error al obtener datos", error);
                })
                .finally(() => setLoading(false));
        } else {
            setLaboreos(filteredData);
        }
    };

    const limpiarFiltros = () => {
        setFiltros({ mes: null, grano: null, tarea: null });
        fetchData(); // Recargar todos los laboreos

    };
    const calcularEstados = (laboreos) => {
        const estados = laboreos.reduce((acc, laboreo) => {
            acc[laboreo.estado] = (acc[laboreo.estado] || 0) + 1;
            return acc;
        }, {});

        return {
            finalizados: estados["Finalizado"] || 0,
            activos: estados["Activo"] || 0,
            pendientes: estados["Pendiente"] || 0
        };
    };

    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return 'Fecha inválida'; // Valida la fecha
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };
    // Función para calcular rentabilidad mensual
    const calcularRentabilidadTotal = () => {
        const datos = rentabilidadMensual();
        
        if (!Array.isArray(datos) || datos.length === 0) return 0; // Verificar que haya datos válidos
    
        // Sumar las rentabilidades promedio de cada mes y evitar valores inválidos
        const totalRentabilidad = datos.reduce((acc, item) => {
            const rentabilidad = parseFloat(item.rentabilidadPromedio); // Asegurar que es numérico
            return acc + (isNaN(rentabilidad) ? 0 : rentabilidad);
        }, 0);
    
        return (datos.length > 0 ? (totalRentabilidad / datos.length).toFixed(2) : 0); // Evitar división por cero
    };
    
    
    const rentabilidadMensual = () => {
        // Filtrar los laboreos con estado "Finalizado"
        const laboreosFinalizados = laboreos.filter(laboreo => laboreo.estado === "Finalizado");
    
        // Calcular la rentabilidad solo para los laboreos finalizados
        const rentabilidad = laboreosFinalizados.reduce((acc, laboreo) => {
            const mes = new Date(laboreo.fechaFin).getMonth() + 1;
            const rentabilidadLaboreo = parseFloat(laboreo.rentabilidadLaboreo) || 0; // Asegurar que es un número
    
            if (!acc[mes]) {
                acc[mes] = { mes, rentabilidadTotal: 0, count: 0 };
            }
    
            // Sumar la rentabilidad solo si es un número válido
            if (!isNaN(rentabilidadLaboreo)) {
                acc[mes].rentabilidadTotal += rentabilidadLaboreo;
                acc[mes].count += 1;
            }
    
            return acc;
        }, {});
    
        // Retornar los promedios de rentabilidad por mes
        return Object.values(rentabilidad).map(item => ({
            mes: item.mes,
            rentabilidadPromedio: item.count > 0 ? (item.rentabilidadTotal / item.count).toFixed(2) : 0 // Evitar división por 0
        }));
    };
    
    const sumarUtilidadesNetasFinalizados = () => {
        // Filtrar los laboreos con estado "Finalizado"
        const laboreosFinalizados = laboreos.filter(laboreo => laboreo.estado === "Finalizado");

        // Sumar las utilidades netas de los laboreos finalizados
        const totalUtilidadNeta = laboreosFinalizados.reduce((acc, laboreo) => {
            // Sumar la utilidad neta de cada laboreo finalizado
            return acc + (laboreo.utilidadNeta || 0); // Asegurarse de que no sea undefined o null
        }, 0);

        return totalUtilidadNeta; // Retorna la suma total de las utilidades netas
    };
    // const totalUtilidad = sumarUtilidadesNetasFinalizados();
    // Función para obtener tareas discriminadas
    const tareasDiscriminadas = () => {
        return laboreos.reduce((acc, laboreo) => {
            acc[laboreo.tarea] = acc[laboreo.tarea] || 0;
            acc[laboreo.tarea] += 1;
            return acc;
        }, {});
    };

    // Función para obtener granos discriminados
    const granosDiscriminados = () => {
        return laboreos.reduce((acc, laboreo) => {
            acc[laboreo.grano] = acc[laboreo.grano] || 0;
            acc[laboreo.grano] += 1;
            return acc;
        }, {});
    };
    const colores = [
        '#FF5733', // Rojo cálido vibrante
        '#FFBF00', // Amarillo brillante
        '#33FF57', // Verde brillante
        '#33A1FF', // Azul claro
        // '#FF33A1', // Rosa fuerte
        '#8033FF', // Morado vibrante
        '#FFD700', // Amarillo dorado
        '#FF8C00', // Naranja fuerte
        '#00FFEF', // Cian brillante
        '#A52A2A'  // Marrón, para contraste
      ];
      
      

    const colors = {
        Activo: "rgba(76, 127, 175, 0.8)", // Verde
        Finalizado: "rgba(76, 175, 80, 0.8)", // Rojo
        Pendiente: "rgba(235, 178, 7, 0.8)", // Amarillo
    };

    const columns = [
    {
        title: 'Nombre',
        dataIndex: 'nombre',
        key: 'nombre',
    },
    {
        title: 'Cliente',
        dataIndex: ['cliente', 'nombre'],
        key: 'cliente',
        render: (_, record) =>
            record.cliente ? `${record.cliente.nombre} ${record.cliente.apellido}` : "Sin cliente",
    },
    {
        title: 'Fecha Inicio',
        dataIndex: 'fechaInicio',
        key: 'fechaInicio',
        render: (text) => text ? dayjs(text).format('DD-MM-YYYY') : '',
    },
    {
        title: 'Fecha Fin',
        dataIndex: 'fechaFin',
        key: 'fechaFin',
        render: (text) => text ? dayjs(text).format('DD-MM-YYYY') : '',
    },
    {
        title: 'Dias Trabajados',
        dataIndex: 'tiempoTrabajo',
        key: 'tiempoTrabajo',
        render: (text) => text ? `${text} Dias` : '',
        align: 'center',
    },
    {
        title: 'Utilidad Neta',
        dataIndex: 'utilidadNeta',
        key: 'utilidadNeta',
        render: (text) =>
            text ? `$${text.toLocaleString()}` : '',
        align: 'center',
    },
    {
        title: 'Rentabilidad',
        dataIndex: 'rentabilidadLaboreo',
        key: 'rentabilidadLaboreo',
        render: (text) =>
            text ? `${Math.round(text)}%` : '',
        align: 'center',
    },
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
];




    return (
        <div>
            <h3
            style={{ marginTop: '0px' }}>Panel de Estadisticas</h3>

            {/* Filtros */}
            <Select
                value={filtros.mes}
                placeholder="Seleccionar Mes"
                style={{ width: 200, margin: '0 10px' }}
                onChange={(value) => setFiltros((prev) => ({ ...prev, mes: value }))}
            >
                <Option value="">Seleccionar Mes</Option>
                <Option value={1}>Enero</Option>
                <Option value={2}>Febrero</Option>
                <Option value={3}>Marzo</Option>
                <Option value={4}>Abril</Option>
                <Option value={5}>Mayo</Option>
                <Option value={6}>Junio</Option>
                <Option value={7}>Julio</Option>
                <Option value={8}>Agosto</Option>
                <Option value={9}>Septiembre</Option>
                <Option value={10}>Octubre</Option>
                <Option value={11}>Noviembre</Option>
                <Option value={12}>Diciembre</Option>
            </Select>

            <Select
                value={filtros.grano}
                placeholder="Seleccionar Grano"
                style={{ width: 200, margin: '0 10px' }}
                onChange={(value) => setFiltros((prev) => ({ ...prev, grano: value }))}
            >

                <Option value="Soja">Soja</Option>
                <Option value="Maiz">Maíz</Option>
                <Option value="Trigo">Trigo</Option>
                <Option value="Arroz">Arroz</Option>
                <Option value="Girasol">Girasol</Option>
                <Option value="Cebada">Cebada</Option>
                <Option value="Sorgo">Sorgo</Option>
                <Option value="Avena">Avena</Option>
                <Option value="Centeno">Centeno</Option>
                <Option value="Lentejas">Lentejas</Option>
                <Option value="Poroto">Poroto</Option>
                <Option value="Maní">Maní</Option>
                <Option value="Algodón">Algodón</Option>
                <Option value="Quinoa">Quinoa</Option>
                <Option value="Mijo">Mijo</Option>
                <Option value="Chía">Chía</Option>
                <Option value="Cártamo">Cártamo</Option>

            </Select>

            <Select
                value={filtros.tarea}
                placeholder="Seleccionar Tarea"
                style={{ width: 200, margin: '0 10px' }}
                onChange={(value) => setFiltros((prev) => ({ ...prev, tarea: value }))}
            >

                <Option value="Cosechar">Cosechar</Option>
                <Option value="Sembrar">Sembrar</Option>
                <Option value="Riego">Riego</Option>
                <Option value="Fumigar">Fumigar</Option>
                <Option value="Arar">Arar</Option>
                <Option value="Embolsar">Embolsar</Option>
                <Option value="Fertilizar">Fertilizar</Option>
                <Option value="Desmalezar">Desmalezar</Option>
                <Option value="Labrar">Labrar</Option>
                <Option value="Aplicar herbicida">Aplicar herbicida</Option>
                <Option value="Aplicar insecticida">Aplicar insecticida</Option>
                <Option value="Aplicar fungicida">Aplicar fungicida</Option>
                <Option value="Secado">Secado</Option>
                <Option value="Almacenamiento">Almacenamiento</Option>
                <Option value="Transporte">Transporte</Option>
                <Option value="Siembra directa">Siembra directa</Option>
                <Option value="Laboreo mínimo">Laboreo mínimo</Option>

            </Select>
            {/* Botón para limpiar filtros */}
            <Button onClick={limpiarFiltros} style={{ marginLeft: '10px' }}>Limpiar Filtros</Button>


            <div style={{ padding: '20px' }}>
                {/* Primera fila: Gráfico de barras y Rentabilidad Promedio Total */}
                <Row gutter={20}>
                    {/* Gráfico de Barras a la Izquierda */}
                    <Col span={12}>
                        <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Rentabilidad Promedio Mensual
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            {rentabilidadMensual().length > 0 ? (
                                <BarChart data={rentabilidadMensual()}>
                                    <XAxis dataKey="mes" label={{ value: 'Mes', position: 'insideBottom', dy: 10 }} />
                                    <YAxis label={{ value: 'Rentabilidad Promedio', angle: -90, position: 'insideLeft', dy: 60 }} />
                                    <Bar
                                        dataKey="rentabilidadPromedio"
                                        fill="rgba(8, 134, 86, 0.8)"
                                        label={{
                                            position: 'inside',
                                            fontSize: 12,
                                            fill: '#fff',
                                            content: ({ value, x, y, width, height }) => (
                                                <text
                                                    x={x + width / 2}
                                                    y={y + height / 2}
                                                    fill="#fff"
                                                    fontSize={12}
                                                    textAnchor="middle"
                                                    alignmentBaseline="middle"
                                                >
                                                    {Math.trunc(value)}%
                                                </text>
                                            ),
                                        }}
                                    />
                                    {/* <Tooltip /> */}
                                </BarChart>
                            ) : (
                                <div style={{ textAlign: "center", paddingTop: "100px", fontSize: "16px", color: "#888" }}>
                                    No hay datos para el filtro establecido
                                </div>
                            )}
                        </ResponsiveContainer>

                    </Col>

                    {/* Rentabilidad Promedio Total a la Derecha */}
                    <Col span={12}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    Rentabilidad Promedio Total
                                </h3>
                                <Card
                                    variant="borderless"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        margin: '0 auto',
                                    }}
                                >
                                    <Statistic
                                        value={calcularRentabilidadTotal()}
                                        precision={0} // Sin decimales
                                        valueStyle={{ color: '#3f8600' }}
                                     
                                        suffix="%"
                                    />
                                </Card>
                            </Col>

                            <Col span={12}>
                                <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    Utilidad Total
                                </h3>
                                <Card
                                    variant="borderless"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        margin: '0 auto',
                                    }}
                                >
                                    <Statistic
                                        value={sumarUtilidadesNetasFinalizados()}
                                        precision={0} // Sin decimales
                                        valueStyle={{ color: '#3f8600' }}
                                        prefix={<DollarOutlined />}

                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Fila de contadores de laboreos debajo de las cards */}
                        <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Estados de Laboreos
                        </h3>
                        <Row gutter={16} style={{ marginTop: '20px' }}>
                            {/* Laboreos Finalizados */}
                            <Col span={8}>
                                <Card variant="borderless">
                                    <Statistic
                                        title="Finalizados"
                                        value={estadoContadores.finalizados}
                                        valueStyle={{ color: '#3f8600' }} // Verde para finalizados
                                        prefix={<CheckOutlined />}
                                    />
                                </Card>
                            </Col>

                            {/* Laboreos Activos */}
                            <Col span={8}>
                                <Card variant="borderless">
                                    <Statistic
                                        title="Activos"
                                        value={estadoContadores.activos}
                                        valueStyle={{ color: '#1890ff' }} // Azul para activos
                                        prefix={<ToolOutlined />}
                                    />
                                </Card>
                            </Col>

                            {/* Laboreos Pendientes */}
                            <Col span={8}>
                                <Card variant="borderless">
                                    <Statistic
                                        title="Pendientes"
                                        value={estadoContadores.pendientes}
                                        valueStyle={{ color: "rgba(228, 167, 0, 0.98)" }} // Rojo para pendientes
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>


                {/* Segunda fila: Gráficos de Dona */}
                <Row gutter={20} style={{ marginTop: '20px' }}>
                    {/* Gráfico de Tareas */}
                    <Col span={12}>
                        <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Distribución de Tareas
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            {Object.keys(tareasDiscriminadas()).length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={Object.entries(tareasDiscriminadas()).map(([key, value]) => ({ name: key, value }))}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        innerRadius={50}
                                        fill="#82ca9d"
                                        label={({ value }) => `${value}`}
                                    >
                                        {Object.keys(tareasDiscriminadas()).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                </PieChart>
                            ) : (
                                <div style={{ textAlign: "center", paddingTop: "100px", fontSize: "16px", color: "#888" }}>
                                    No hay datos para el filtro establecido
                                </div>
                            )}
                        </ResponsiveContainer>
                    </Col>

                    {/* Gráfico de Granos */}
                    <Col span={12}>
                        <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Distribución de Granos
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            {Object.keys(granosDiscriminados()).length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={Object.entries(granosDiscriminados()).map(([key, value]) => ({ name: key, value }))}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                        innerRadius={50}
                                        fill="#8884d8"
                                        label={({ value }) => `${value}`}
                                    >
                                        {Object.keys(granosDiscriminados()).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                                </PieChart>
                            ) : (
                                <div style={{ textAlign: "center", paddingTop: "100px", fontSize: "16px", color: "#888" }}>
                                    No hay datos para el filtro establecido
                                </div>
                            )}
                        </ResponsiveContainer>
                    </Col>
                </Row>

            </div>


            <hr />

            <div>
                <h2>Mapa de Ubicaciones</h2>
                <MapComponent
                    locations={locations}
                />
            </div>
            <hr />

            <h2>Campañas</h2>
            <Table
                columns={columns}
                dataSource={laboreos}
                rowKey="_id"
                loading={loading}
            />

            {/* Mensaje de error */}
            {error && message.error(error)}
        </div >
    );
};

export default Dashboard;
