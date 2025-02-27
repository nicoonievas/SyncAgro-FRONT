import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';
import Style from "./App.module.css";
import { Button } from 'antd';

function AppAuth0() {
  const { user, loginWithRedirect, logout, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (!isAuthenticated) return;
      try {
        const accessToken = await getAccessTokenSilently();
        setToken(accessToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token:", error);
      }
    };

    fetchToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className={Style.Container}>
      {!isAuthenticated ? (
        <div className={Style.LoginContainer}>
          <img src="https://i.imgur.com/ycOHrOl.png" alt="Imagen" height={200} className={Style.LoginImage} />
          <Button type="primary" className={Style.BotonLogin} onClick={() => loginWithRedirect()}>
            Log In
          </Button>
        </div>
      ) : (
        <Button type="primary" danger className={Style.BotonLogout} onClick={() => logout()}>
          Log Out
        </Button>
      )}

      {isAuthenticated && (
        <div className={Style.UserInfo}>
          <img src={user.picture} alt={user.name} className={Style.UserImage} />
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}

export default AppAuth0;
