import React from 'react';
import Style from "./App.css";
import { Routes, Route } from "react-router-dom";
import LeftMenu from "./Components/LeftMenu";
import { useAuth } from './Auth0/AuthProvider'; // Usar el hook de AuthProvider
import Main from "./Components/Main";

function App() {
  const { isAuthenticated } = useAuth(); // Obtener el estado de autenticación desde el contexto

  return (
    <div className={Style.App}>
      {isAuthenticated && <LeftMenu />} {/* Renderiza el menú lateral solo si está autenticado */}
      <Routes>
        <Route path="/" element={<Main />} /> {/* Ruta base para Main */}
      </Routes>
    </div>
  );
}

export default App;
