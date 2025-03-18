import React from 'react';

const WebView = ({ empresa }) => {

  const url = empresa?.urlSistemaProveedor;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url ? (
        <iframe
          src={url}
          title="Página Externa"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      ) : (
        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#555' }}>Configurar URL</p>
      )}
    </div>
  );
};

export default WebView;

