import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => 
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );
  
  const [user, setUser] = useState(null); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loginUser = async (username, password) => {
    try {
      const response = await api.post('/token/', {
        username: username,
        password: password
      });
      const data = response.data;
      if (response.status === 200) {
        setAuthTokens(data);
        localStorage.setItem('authTokens', JSON.stringify(data));
        await fetchUserDetails(data.access);
        setIsAuthenticated(true);
        navigate('/obras');
      }
    } catch (error) {
      console.error('Erro no login!', error);
      alert('Utilizador ou senha inválidos!');
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authTokens');
    navigate('/login');
  };

  const hasRole = (allowedRoles) => {
    if (!user || !user.groups) {
      return false;
    }
    return user.groups.some(group => allowedRoles.includes(group.name));
  };
  
  const fetchUserDetails = async (accessToken) => {
    try {
        const decodedToken = jwtDecode(accessToken);
        const userId = decodedToken.user_id;
        const response = await api.get(`/users/${userId}/`);
        setUser(response.data);
    } catch (error) {
        console.error("Não foi possível obter os detalhes do utilizador", error);
        logoutUser();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            const parsedTokens = JSON.parse(storedTokens);
            setAuthTokens(parsedTokens);
            await fetchUserDetails(parsedTokens.access); 
            setIsAuthenticated(true);
        }
        setLoading(false);
    }
    initializeAuth();
  }, []);

  const contextData = {
    user,
    authTokens,
    isAuthenticated,
    loading,
    loginUser,
    logoutUser,
    hasRole
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>A carregar...</p> : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

