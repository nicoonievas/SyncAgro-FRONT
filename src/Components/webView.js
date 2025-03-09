import React from 'react';

const WebView = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://map.deere.com/"
        title="Página Externa"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default WebView;
