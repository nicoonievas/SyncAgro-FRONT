import React, { useEffect, useState } from 'react';
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  UserOutlined,
  CarOutlined,
  SolutionOutlined,
  CarryOutOutlined,
  TeamOutlined
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

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;

const LeftMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { user, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const tokenClaims = await getIdTokenClaims();
      setToken(tokenClaims?.__raw || "");
    };
    fetchToken();
  }, [getIdTokenClaims]);

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

          {/* Campañas */}
          <SubMenu key="laboreos" icon={<ToolOutlined />} title="Campañas">
            <Menu.Item key="verLaboreos"><Link to="/verLaboreos">Ver Campañas</Link></Menu.Item>
            <Menu.Item key="agregarLaboreo"><Link to="/agregarLaboreo">Agregar Campaña</Link></Menu.Item>
          </SubMenu>

          {/* Clientes */}
          <SubMenu key="clientes" icon={<UserOutlined />} title="Clientes">
            <Menu.Item key="verClientes"><Link to="/verClientes">Ver Clientes</Link></Menu.Item>
            <Menu.Item key="agregarCliente"><Link to="/agregarCliente">Agregar Cliente</Link></Menu.Item>
          </SubMenu>

          {/* Equipos */}
          <SubMenu key="equipos" icon={<TeamOutlined />} title="Equipos">
            <Menu.Item key="verEquipos"><Link to="/verEquipos">Ver Equipos</Link></Menu.Item>
            <Menu.Item key="agregarEquipo"><Link to="/agregarEquipo">Agregar Equipo</Link></Menu.Item>
          </SubMenu>

          {/* Vencimientos */}
          <Menu.Item key="verVencimientos" icon={<CarryOutOutlined />}>
            <Link to="/verVencimientos">Ver Vencimientos</Link>
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
            marginLeft: 15,
            width: collapsed ? '92%' : '85%',
            top: 0,
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
                  <img src={user.picture} alt={user.name} style={{ width: '40px', borderRadius: '50%', marginRight: '10px' }} />
                  <span>{user.name}</span>
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
            <Route path="/home" element={<Home />} />
            <Route path="/agregarCliente" element={<CrearCliente />} />
            <Route path="/agregarEmpleado" element={<CrearEmpleado />} />
            <Route path="/agregarVehiculo" element={<CrearVehiculo />} />
            <Route path="/agregarLaboreo" element={<CrearLaboreo />} />
            <Route path="/agregarEquipo" element={<CrearEquipo />} />
            <Route path="/verClientes" element={<TablaClientes />} />
            <Route path="/verPersonal" element={<TablaNominas />} />
            <Route path="/verVehiculos" element={<TablaVehiculos />} />
            <Route path="/verLaboreos" element={<TablaLaboreos />} />
            <Route path="/verEquipos" element={<TablaEquipos />} />
            <Route path="/verVencimientos" element={<TablasVencimientos />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LeftMenu;
