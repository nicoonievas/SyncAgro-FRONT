import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './Auth0/AuthProvider';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-ewcddx7xc8jwb37h.us.auth0.com"
        clientId="ROeQGa2ZOGynxQIRaQrthjB2iDrNMDBj"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
        audience="https://syncagro.com/api/"
      >
        <AuthProvider>  {/* Envolver la aplicación con AuthProvider */}
          <App />
        </AuthProvider>
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>
);
