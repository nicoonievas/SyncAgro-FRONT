import React, { useEffect, useState } from 'react';
import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
  UserOutlined,
  CarOutlined,
  SolutionOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, ConfigProvider, theme } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import CrearEmpleado from './CrearEmpleado';
import { useAuth0 } from '@auth0/auth0-react';
import CrearLaboreo from './CrearLaboreo';
import TablaTasks from './TablaTasks';
import TablaUsers from './TablaUsers';
import CrearVehiculo from './CrearVehiculo';
import CrearCliente from './CrearCliente';
import { SketchPicker } from 'react-color';

const { Header, Sider, Content } = Layout;

const LeftMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [themeColor, setThemeColor] = useState(localStorage.getItem("themeColor") || "#1677ff");
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
  const { user, isAuthenticated, logout, getIdTokenClaims } = useAuth0();
  const [token, setToken] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const tokenClaims = await getIdTokenClaims();
      setToken(tokenClaims?.__raw || "");
    };
    fetchToken();
  }, [getIdTokenClaims]);

  // Guardar el color en localStorage
  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: themeColor } }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} style={{ backgroundColor: themeColor }}>
          <div className="demo-logo-vertical" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} style={{ backgroundColor: themeColor }}>
            <Menu.Item icon={<img src="https://i.imgur.com/ycOHrOl.png" alt="SyncAgro" style={{ width: '80px' }} />} />
            <Menu.Item key="1" icon={<HomeOutlined />}><Link to="/home">Home</Link></Menu.Item>
            <Menu.Item key="2" icon={<SolutionOutlined />}><Link to="/verPersonal">Ver Nóminas</Link></Menu.Item>
            <Menu.Item key="3" icon={<ToolOutlined />}><Link to="/verLaboreos">Ver Campañas</Link></Menu.Item>
            <Menu.Item key="8" icon={<CarOutlined />}><Link to="/verVehiculos">Ver Vehículos</Link></Menu.Item>
            <Menu.Item key="9" icon={<UserOutlined />}><Link to="/verClientes">Ver Clientes</Link></Menu.Item>
            <Menu.Item key="4" icon={<SolutionOutlined />}><Link to="/agregarEmpleado">Agregar Personal</Link></Menu.Item>
            <Menu.Item key="5" icon={<ToolOutlined />}><Link to="/agregarLaboreo">Agregar Campaña</Link></Menu.Item>
            <Menu.Item key="6" icon={<CarOutlined />}><Link to="/agregarVehiculo">Agregar Vehículo</Link></Menu.Item>
            <Menu.Item key="7" icon={<UserOutlined />}><Link to="/agregarCliente">Agregar Cliente</Link></Menu.Item>
          </Menu>

          {/* 📌 Botón para abrir el selector de color */}
          <div style={{ padding: 10, textAlign: 'center' }}>
            <Button icon={<BgColorsOutlined />} onClick={() => setShowColorPicker(!showColorPicker)}>
              Cambiar Tema
            </Button>
            {showColorPicker && (
              <div style={{ marginTop: 10 }}>
                <SketchPicker
                  color={themeColor}
                  onChange={(color) => setThemeColor(color.hex)}
                />
              </div>
            )}
          </div>
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
              <Route path="/verPersonal" element={<TablaUsers />} />
              <Route path="/verVehiculos" element={<TablaTasks />} />
              <Route path="/verLaboreos" element={<TablaTasks />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default LeftMenu;
