import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = async () => {
    const storedUser = await AsyncStorage.getItem('@verde:user');
    const storedToken = await AsyncStorage.getItem('@verde:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  };

  const signIn = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { usuario: userData, token } = response.data;

      await AsyncStorage.setItem('@verde:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@verde:token', token);

      setUser(userData);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Erro ao fazer login',
      };
    }
  };

  const signUp = async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      const { user: userData, token } = response.data;

      await AsyncStorage.setItem('@verde:user', JSON.stringify(userData));
      await AsyncStorage.setItem('@verde:token', token);

      setUser(userData);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Erro ao criar conta',
      };
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@verde:user');
    await AsyncStorage.removeItem('@verde:token');
    setUser(null);
  };

  const updateUser = async (data) => {
    setUser(data);
    await AsyncStorage.setItem('@verde:user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, updateUser, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
