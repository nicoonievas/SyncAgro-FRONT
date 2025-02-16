import React, { useEffect, useState } from 'react';
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  UserOutlined,
  CarOutlined,
  SolutionOutlined,
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
import TablaTasks from './TablaTasks';
// import TablaVehiculos from './TablaVehiculos';
// import TablaClientes from './TablaClientes';

const { Header, Sider, Content } = Layout;

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
  <Sider trigger={null} collapsible collapsed={collapsed}>
    <div className="demo-logo-vertical" />
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} 
          items={[
            {
              key: 'logo',
              icon: <img src="https://i.imgur.com/ycOHrOl.png" alt="SyncAgro" style={{ width: '80px' }} />,
            },
            {
              key: '1',
              icon: <HomeOutlined />,
              label: <Link to="/home">Home</Link>
            },
            {
              key: '2',
              icon: <SolutionOutlined />,
              label: <Link to="/verPersonal">Ver Nóminas</Link>
            },
            {
              key: '3',
              icon: <ToolOutlined />,
              label: <Link to="/verLaboreos">Ver Campañas</Link>
            },
            {
              key: '8',
              icon: <CarOutlined />,
              label: <Link to="/verVehiculos">Ver Vehículos</Link>
            },
            {
              key: '9',
              icon: <UserOutlined />,
              label: <Link to="/verClientes">Ver Clientes</Link>
            },
            {
              key: '4',
              icon: <SolutionOutlined />,
              label: <Link to="/agregarEmpleado">Agregar Personal</Link>
            },
            {
              key: '5',
              icon: <ToolOutlined />,
              label: <Link to="/agregarLaboreo">Agregar Campaña</Link>
            },
            {
              key: '6',
              icon: <CarOutlined />,
              label: <Link to="/agregarVehiculo">Agregar Vehículo</Link>
            },
            {
              key: '7',
              icon: <UserOutlined />,
              label: <Link to="/agregarCliente">Agregar Cliente</Link>
            }
          ]} 
    />
  </Sider>
  <Layout>

        <Header style={{ padding: 0, background: colorBgContainer }}>
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
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            marginTop: '20px',
          }}
        >
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/agregarCliente" element={<CrearCliente />} />
            <Route path="/agregarEmpleado" element={<CrearEmpleado />} />
            <Route path="/agregarVehiculo" element={<CrearVehiculo />} />
            <Route path="/agregarLaboreo" element={<CrearLaboreo />} />
            <Route path="/verClientes" element={<TablaTasks />} />
            <Route path="/verPersonal" element={<TablaNominas />} />
            <Route path="/verVehiculos" element={<TablaTasks />} />
            <Route path="/verLaboreos" element={<TablaLaboreos />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LeftMenu;
