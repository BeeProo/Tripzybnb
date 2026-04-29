import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser, registerHostUser, logoutUser } from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await getMe();
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    setUser(data.data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await registerUser(userData);
    setUser(data.data);
    return data;
  };

  const registerHost = async (userData) => {
    const { data } = await registerHostUser(userData);
    setUser(data.data);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerHost,
        logout,
        isAdmin: user?.role === 'admin',
        isHost: user?.role === 'host',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
