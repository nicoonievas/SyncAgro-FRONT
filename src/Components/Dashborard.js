import React, { useEffect, useState } from 'react';
import { Select, message, Input, Button, Statistic, Card, Row, Col } from 'antd';
import useAxiosInterceptor from '../utils/axiosConfig';
import { ArrowDownOutlined, DollarOutlined, ArrowUpOutlined, ToolOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import MapComponent from './GeneralMapViewer';

const { Option } = Select;

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
                        grano: laboreo.grano, // Opcional, para identificar el grano
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
                                grano: laboreo.grano, // Opcional, para identificar el grano
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
        if (datos.length === 0) return 0; // Evitar división por cero
    
        // Sumar las rentabilidades promedio de cada mes y calcular el promedio total
        const totalRentabilidad = datos.reduce((acc, item) => acc + item.rentabilidadPromedio, 0);
        return (totalRentabilidad / datos.length).toFixed(2); // Formato a 2 decimales
    };
    
    const rentabilidadMensual = () => {
        // Filtrar los laboreos con estado "Finalizado"
        const laboreosFinalizados = laboreos.filter(laboreo => laboreo.estado === "Finalizado");
    
        // Calcular la rentabilidad solo para los laboreos finalizados
        const rentabilidad = laboreosFinalizados.reduce((acc, laboreo) => {
            const mes = new Date(laboreo.fechaFin).getMonth() + 1;
            acc[mes] = acc[mes] || { mes, rentabilidadTotal: 0, count: 0 };
            
            // Sumar la rentabilidadLaboreo directamente
            acc[mes].rentabilidadTotal += laboreo.rentabilidadLaboreo;
            acc[mes].count += 1;
    
            return acc;
        }, {});
    
        // Retornar los promedios de rentabilidad por mes
        return Object.values(rentabilidad).map(item => ({
            mes: item.mes,
            rentabilidadPromedio: item.rentabilidadTotal / item.count // Promedio de la rentabilidad en porcentaje
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
    const colores = ['#ff8042', '#00C49F', '#FFBB28'];
    return (
        <div>
            <h2>Dashboard de Rentabilidad</h2>

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
                <Option value="">Seleccionar Grano</Option>
                <Option value="Soja">Soja</Option>
                <Option value="Maiz">Maíz</Option>
                <Option value="Trigo">Trigo</Option>
                <Option value="Arroz">Arroz</Option>
                <Option value="Girasol">Girasol</Option>
            </Select>

            <Select
                value={filtros.tarea}
                placeholder="Seleccionar Tarea"
                style={{ width: 200, margin: '0 10px' }}
                onChange={(value) => setFiltros((prev) => ({ ...prev, tarea: value }))}
            >
                <Option value="">Seleccionar Tarea</Option>
                <Option value="Cosechar">Cosechar</Option>
                <Option value="Sembrar">Sembrar</Option>
                <Option value="Riego">Riego</Option>
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
                        <BarChart data={rentabilidadMensual()}>
                            <XAxis dataKey="mes" label={{ value: 'Mes', position: 'insideBottom', dy: 10 }} />
                            <YAxis label={{ value: 'Rentabilidad Promedio', angle: -90, position: 'insideLeft', dy: 60 }} />
                            <Bar
                                dataKey="rentabilidadPromedio"
                                fill="#8884d8"
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
                                            {value}%
                                        </text>
                                    ),
                                }}
                            />
                            <Tooltip />
                        </BarChart>
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
                                    prefix={<ArrowUpOutlined />}
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
                                    prefix={<DollarOutlined /> }
                                    
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
                                    valueStyle={{ color: '#cf1322' }} // Rojo para pendientes
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
                            Distribución de Tareas</h3>
                        <ResponsiveContainer width="100%" height={250}>
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
                        </ResponsiveContainer>
                    </Col>

                    {/* Gráfico de Granos */}
                    <Col span={12}>
                        <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            Distribución de Granos</h3>
                        <ResponsiveContainer width="100%" height={250}>
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
                        </ResponsiveContainer>
                    </Col>
                </Row>
            </div>




            <div>
                <h2>Mapa de Ubicaciones</h2>
                <MapComponent
                    locations={locations}
                    
                />
            </div>










            {/* Mostrar la información de cada laboreo */}
            <div>
                {laboreos.length > 0 ? (
                    laboreos.map((laboreo) => (
                        <div key={laboreo._id} style={{ marginBottom: '20px' }}>
                            <h3>{laboreo.nombre}</h3>
                            <p><strong>Grano:</strong> {laboreo.grano}</p>
                            <p><strong>Tarea:</strong> {laboreo.tarea}</p>
                            <p><strong>Fecha:</strong> {formatDate(laboreo.fechaFin)}</p>
                            <p><strong>Rentabilidad:</strong> {laboreo.rentabilidadLaboreo}%</p>
                        </div>
                    ))
                ) : (
                    <p>No se encontraron laboreos.</p>
                )}
            </div>

            {/* Mensaje de error */}
            {error && message.error(error)}
        </div >
    );
};

export default Dashboard;
