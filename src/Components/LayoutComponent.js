// Components/LayoutComponent.js
import React from 'react';
import LeftMenu from './LeftMenu'; // Asegúrate de importar el menú
import { Layout } from 'antd';

const { Header, Content } = Layout;

const LayoutComponent = ({ children }) => {
    return (
        <Layout>
            <LeftMenu /> {/* Renderizar el menú aquí */}
            <Layout>
                <Header> {/* Si necesitas un encabezado adicional */} </Header>
                <Content style={{ padding: '24px', minHeight: '280px' }}>
                    {children} {/* Renderizar el contenido aquí */}
                </Content>
            </Layout>
        </Layout>
    );
};

export default LayoutComponent;
