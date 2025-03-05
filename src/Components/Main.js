import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Home from "./Home";
import AppAuth0 from '../Auth0/AppAuth0';

function Main() {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("isAuthenticated:", isAuthenticated);
        if (isAuthenticated) {
            navigate("/home");

            // Registrar usuario en el backend
            const registerUser = async () => {
                try {
                    const response = await fetch("http://localhost:6001/api/usuario", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            nombre: user.given_name || user.name,
                            apellido: user.family_name || "",
                            email: user.email,
                            picture: user.picture,
                            auth0Id: user.sub, // Guardar el ID único de Auth0
                        }),
                    });

                    if (!response.ok) {
                        console.error("Error al registrar usuario en el backend");
                    }
                } catch (error) {
                    console.error("Error en la solicitud:", error);
                }
            };

            registerUser();
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div>
            {!isAuthenticated ? (
                <AppAuth0 />
            ) : (
                <Routes>
                    <Route path="/home" element={<Home />} />

                </Routes>
            )}
        </div>
    );
}

export default Main;
