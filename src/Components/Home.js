import React from 'react';

const Home = ({ usuario, empresa }) => {
  // Definir empresaNombre con un valor predeterminado
  const empresaNombre = empresa ? empresa.razonSocial : "Sin empresa asignada, comuniquese con el Administrador del Sistema";

  return (
    <div>
      <h1>Bienvenido, {usuario.nombre} {usuario.apellido}</h1>
      <h2>Empresa: {empresaNombre}</h2>
    </div>
  );
};

export default Home;
