import React, { useEffect, useState } from 'react';
import axios from "axios";
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  UserOutlined,
  CarOutlined,
  SolutionOutlined,
  CarryOutOutlined,
  TeamOutlined,
  ExportOutlined,
  LineChartOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import CrearEmpleado from './Empleados/CrearEmpleado';
import { useAuth0 } from '@auth0/auth0-react';
import CrearLaboreo from './Laboreos/CrearLaboreo';
import TablaLaboreos from './Laboreos/TablaLaboreos';
import TablaNominas from './Empleados/TablaNominas';
import CrearVehiculo from './Vehiculos/CrearVehiculo';
import CrearCliente from './Clientes/CrearCliente';
import TablaVehiculos from './Vehiculos/TablaVehiculos';
import TablaClientes from './Clientes/TablaClientes';
import CrearEquipo from './Equipos/CrearEquipo';
import TablaEquipos from './Equipos/TablaEquipos';
import TablasVencimientos from './TablaVencimientos';
import CrearEmpresa from './CrearEmpresa';
import TablaUsuarios from './TablaUsuarios';
import CrearMarcaTipoModelo from './Vehiculos/AgregarMarcasModelos';
import WebView from './webView';
import TablaEmpresas from './TablaEmpresas';
import Dashboard from './Dashborard';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;






const LeftMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState([]);
  const [empresa, setEmpresa] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const { user, isAuthenticated, logout,


    // claim, getIdTokenClaims 
  } = useAuth0();
  // const [token, setToken] = useState("");

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     const tokenClaims = await getIdTokenClaims();
  //     setToken(tokenClaims?.__raw || "");
  //     console.log(tokenClaims.__raw);
  //   };
  //   fetchToken();
  // }, [getIdTokenClaims]);



  useEffect(() => {
    axios.get("http://localhost:6001/api/usuarios")  // Reemplaza con tu URL real
      .then(response => {
        setUsuarios(response.data);
        // Buscar el usuario logueado en la lista de usuarios
        const usuarioEncontrado = response.data.find(u => u.email === user?.email);
        // console.log("empresa:", usuarioEncontrado.empresa);
        if (usuarioEncontrado) {
          setEmpresa(usuarioEncontrado.empresa || "No asignado");
          setUsuario(usuarioEncontrado);
          setRazonSocial(usuarioEncontrado.empresa.razonSocial);

        }
      })
      .catch(error => console.error("Error al obtener usuarios:", error));
  }, [user]);

  const handleOpenPopup = (empresa) => {
    const empresaUrl = empresa?.urlSistemaProveedor;

    if (!empresaUrl) {
      alert("No hay URL configurada para esta empresa.");
      return;
    }

    window.open(empresaUrl, 'Sistema Proveedor', 'width=800,height=600');
  };

  const administrador = "nicolasnievas1@gmail.com"

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
        }}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" >
          {/* Logo */}
          <Menu.Item key="logo"
            style={{
              height: collapsed ? '10vh' : '15vh',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center'
            }}>
            <img src="https://i.imgur.com/ycOHrOl.png" alt="SyncAgro"
              style={{
                width: collapsed ? '12vh' : '20vh',
                height: 'auto',
                transition: 'width 0.3s, height 0.3s',
              }}
            />
          </Menu.Item>

          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/home">Home</Link>
          </Menu.Item>

          {/* Clientes */}
          <SubMenu key="clientes" icon={<UserOutlined />} title="Clientes">
            <Menu.Item key="verClientes"><Link to="/verClientes">Ver Clientes</Link></Menu.Item>
            <Menu.Item key="agregarCliente"><Link to="/agregarCliente">Agregar Cliente</Link></Menu.Item>
          </SubMenu>

          {/* Vehículos */}
          <SubMenu key="vehiculos" icon={<CarOutlined />} title="Vehículos">
            <Menu.Item key="verVehiculos"><Link to="/verVehiculos">Ver Vehículos</Link></Menu.Item>
            <Menu.Item key="agregarVehiculo"><Link to="/agregarVehiculo">Agregar Vehículo</Link></Menu.Item>
          </SubMenu>

          {/* Empleados */}
          <SubMenu key="empleados" icon={<SolutionOutlined />} title="Empleados">
            <Menu.Item key="verPersonal"><Link to="/verPersonal">Ver Nóminas</Link></Menu.Item>
            <Menu.Item key="agregarEmpleado"><Link to="/agregarEmpleado">Agregar Personal</Link></Menu.Item>
          </SubMenu>

          {/* Equipos */}
          <SubMenu key="equipos" icon={<TeamOutlined />} title="Equipos">
            <Menu.Item key="verEquipos"><Link to="/verEquipos">Ver Equipos</Link></Menu.Item>
            <Menu.Item key="agregarEquipo"><Link to="/agregarEquipo">Agregar Equipo</Link></Menu.Item>
          </SubMenu>

          {/* Campañas */}
          <SubMenu key="laboreos" icon={<ToolOutlined />} title="Campañas">
            <Menu.Item key="verLaboreos"><Link to="/verLaboreos">Ver Campañas</Link></Menu.Item>
            <Menu.Item key="agregarLaboreo"><Link to="/agregarLaboreo">Agregar Campaña</Link></Menu.Item>
          </SubMenu>


          {/* Vencimientos */}
          <Menu.Item key="verVencimientos" icon={<CarryOutOutlined />}>
            <Link to="/verVencimientos">Ver Vencimientos</Link>
          </Menu.Item>

          <Menu.Item key="verDashboard" icon={<LineChartOutlined />}>
            <Link to="/verEstadisticas">Ver Estadisticas</Link>
          </Menu.Item>
          <Menu.Item key="verSistemaProveedor" icon={<ExportOutlined />} onClick={() => handleOpenPopup(empresa)}>
            Sistema Proveedor
          </Menu.Item>


          {usuario.email === administrador && (
            <SubMenu key="configuracion" icon={<SettingOutlined />} title="Configuracion">
              <Menu.Item key="verUsuarios"><Link to="/verUsuarios">Ver Usuarios</Link></Menu.Item>
              <Menu.Item key="verEmpresas"><Link to="/verEmpresas">Ver Empresas</Link></Menu.Item>
              <Menu.Item key="agregarEmpresa"><Link to="/agregarEmpresa">Agregar Empresa</Link></Menu.Item>
              <Menu.Item key="agregarMarcasModelos"><Link to="/agregarMarcasModelos">Agregar Marcas y Modelos</Link></Menu.Item>

            </SubMenu>
          )}


        </Menu>
        {/* <Layout.Footer 
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#001529',
        color: '#fff',
      }}
    >
      <span>Nievas Nicolas</span>
    </Layout.Footer> */}
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: 'margin-left 0.3s',
          overflow: 'hidden'
        }}>

        <Header
          style={{
            position: 'fixed',
            width: collapsed ? '93%' : '85%',
            left: collapsed ? 80 : 200,
            transition: 'left 0.3s',
            top: 0,
            right: 0,
            zIndex: 1000,
            padding: 0,

            background: colorBgContainer,
            borderBottom: '1px solid #d9d9d9',
            borderRadius: borderRadiusLG
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div className="Container" style={{ display: 'flex', alignItems: 'center' }}>
              {isAuthenticated && (
                <div className="UserInfo" style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={user.picture}
                    style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                    <span>{usuario.nombre} {usuario.apellido}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{empresa.razonSocial}</span>
                  </div>

                  <Button
                    type="primary"
                    onClick={() => logout({ returnTo: window.location.origin })}
                    style={{ marginLeft: '10px' }}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>

          </div>
        </Header>

        <Content
          style={{
            margin: '80px 16px 24px 16px', // Ajusta según la altura del Header
            padding: 24,
            minHeight: 'calc(100vh - 80px)', // Resta la altura del Header
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/home" element={<Home usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarCliente" element={<CrearCliente usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarEmpleado" element={<CrearEmpleado usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarVehiculo" element={<CrearVehiculo usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarLaboreo" element={<CrearLaboreo usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarEquipo" element={<CrearEquipo usuario={usuario} empresa={empresa} />} />
            <Route path="/verClientes" element={<TablaClientes usuario={usuario} empresa={empresa} />} />
            <Route path="/verPersonal" element={<TablaNominas usuario={usuario} empresa={empresa} />} />
            <Route path="/verVehiculos" element={<TablaVehiculos usuario={usuario} empresa={empresa} />} />
            <Route path="/verLaboreos" element={<TablaLaboreos usuario={usuario} empresa={empresa} />} />
            <Route path="/verEquipos" element={<TablaEquipos usuario={usuario} empresa={empresa} />} />
            <Route path="/verVencimientos" element={<TablasVencimientos usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarEmpresa" element={usuario.email == administrador ? <CrearEmpresa usuario={usuario} empresa={empresa} /> : <div>No tienes permisos para ver esta página.</div>} />
            <Route path="/verEmpresas" element={usuario.email == administrador ? <TablaEmpresas /> : <div>No tienes permisos para ver esta página.</div>} />
            <Route path="/verUsuarios" element={usuario.email == administrador ? <TablaUsuarios /> : <div>No tienes permisos para ver esta página.</div>} />
            <Route path="/agregarMarcasModelos" element={usuario.email == administrador ? <CrearMarcaTipoModelo usuario={usuario} empresa={empresa} /> : <div>No tienes permisos para ver esta página.</div>} />
            <Route path="/verEstadisticas" element={<Dashboard usuario={usuario} empresa={empresa} />} />
            <Route path="/verSistemaProveedor" element={<WebView empresa={empresa} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LeftMenu;
