import React from 'react';

const Home = ({ usuario, empresa }) => {
  console.log("usuario:", usuario);
  console.log("razonSocial:", empresa);
  return (
    <div>
      <h1>Bienvenido, {usuario.nombre} {usuario.apellido}</h1>
      <h2>Empresa: {empresa}</h2>
    </div>
  );
};

export default Home;
