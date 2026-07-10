import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Clave del token y URL de la API
const TOKEN_KEY = "my_jwt";
export const API_URL = "http://192.168.0.103:3000";
const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: null
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log(`AuthContext:34 ~ stored: ${token}`);

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setAuthState({
          token: token,
          authenticated: true
        });
      }
    };
    loadToken();
  }, []);

  // Registro de Usuarios
  const register = async (username, password) => {
    try {
      return await axios.post(`${API_URL}/register`, { username, password });
    } catch (e) {
      return { error: true, msg: e.response.data.msg };
    }
  };

  // Login de usuarios
  const login = async (username, password) => {
    try {
      const result = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      setAuthState({
        token: result.data,
        authenticated: true
      });

      axios.defaults.headers.common["Authorization"] = `Bearer ${result.data}`;

      await SecureStore.setItemAsync(TOKEN_KEY, result.data);

      return result;
    } catch (e) {
      return { error: true, msg: e.response.data.msg };
    }
  };

  // Logout de usuarios
  const logout = async () => {
    // Eliminar de almacenamiento
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    // Actualizar cabeceras HTTP
    axios.defaults.headers.common["Authorization"] = "";

    // Actualizar estado
    setAuthState({
      token: null,
      authenticated: false
    });
  };
  
  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
