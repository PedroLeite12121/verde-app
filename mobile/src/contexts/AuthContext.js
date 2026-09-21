import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@verde:user');
      const storedToken = await AsyncStorage.getItem('@verde:token');
      const storedTipo = await AsyncStorage.getItem('@verde:tipo');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setTipo(storedTipo || 'comum');
      }
    } catch {
      // Se o storage falhar, segue sem sessão em vez de travar em tela branca
    } finally {
      setLoading(false);
    }
  };

  const persist = async (userData, token, tipoValue) => {
    await AsyncStorage.setItem('@verde:user', JSON.stringify(userData));
    await AsyncStorage.setItem('@verde:token', token);
    await AsyncStorage.setItem('@verde:tipo', tipoValue || 'comum');
    setUser(userData);
    setTipo(tipoValue || 'comum');
  };

  // Backend espera { email, senha } (não "password")
  const signIn = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { usuario, token, tipo: tipoValue } = response.data;

      await persist(usuario, token, tipoValue);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Erro ao fazer login',
      };
    }
  };

  // Backend espera { nome, email, senha, cpf?, dataNasc? }
  const signUp = async ({ nome, email, senha, cpf, dataNasc }) => {
    try {
      const body = { nome, email, senha };
      if (cpf) body.cpf = cpf.replace(/\D/g, '');
      if (dataNasc) body.dataNasc = dataNasc;

      const response = await api.post('/auth/register', body);
      const { usuario, token } = response.data;

      await persist(usuario, token, 'comum');

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
    await AsyncStorage.removeItem('@verde:tipo');
    setUser(null);
    setTipo(null);
  };

  const updateUser = async (data) => {
    setUser(data);
    await AsyncStorage.setItem('@verde:user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{ user, tipo, loading, signIn, signUp, signOut, updateUser, isAdmin: tipo === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
