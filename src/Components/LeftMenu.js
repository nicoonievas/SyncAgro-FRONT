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
  ExportOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import CrearEmpleado from './CrearEmpleado';
import { useAuth0 } from '@auth0/auth0-react';
import CrearLaboreo from './CrearLaboreo';
import TablaLaboreos from './TablaLaboreos';
import TablaNominas from './TablaNominas';
import CrearVehiculo from './CrearVehiculo';
import CrearCliente from './CrearCliente';
import TablaVehiculos from './TablaVehiculos';
import TablaClientes from './TablaClientes';
import CrearEquipo from './CrearEquipo';
import TablaEquipos from './TablaEquipos';
import TablasVencimientos from './TablaVencimientos';
import CrearEmpresa from './CrearEmpresa';
import TablaUsuarios from './TablaUsuarios';
import CrearMarcaTipoModelo from './AgregarMarcasModelos';
import WebView from './webView';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;



const handleOpenPopup = () => {
  window.open('https://map.deere.com/', 'MapaDeere', 'width=800,height=600');
};

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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null}
        collapsible collapsed={collapsed}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
        }}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
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


          <Menu.Item key="verSistemaProveedor" icon={<ExportOutlined />} onClick={handleOpenPopup}>
            Ver Sistema Proveedor
          </Menu.Item>
        </Menu>
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
            <Route path="/agregarEmpresa" element={<CrearEmpresa usuario={usuario} empresa={empresa} />} />
            <Route path="/verUsuarios" element={<TablaUsuarios usuario={usuario} empresa={empresa} />} />
            <Route path="/agregarMarcasModelos" element={<CrearMarcaTipoModelo usuario={usuario} empresa={empresa} />} />
            <Route path="/verSistemaProveedor" element={<WebView usuario={usuario} empresa={empresa} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LeftMenu;
