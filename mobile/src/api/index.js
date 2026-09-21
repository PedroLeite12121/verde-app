import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// No celular físico, "localhost" é o próprio celular e não alcança o PC.
// Rode o Expo com: EXPO_PUBLIC_API_URL=http://<IP-DO-PC>:3333/api npx expo start
// (ex: EXPO_PUBLIC_API_URL=http://192.168.0.12:3333/api). No emulador/web,
// o fallback localhost funciona.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333/api';

export const API_BASE_URL = BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@verde:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@verde:token');
      await AsyncStorage.removeItem('@verde:user');
    }
    return Promise.reject(error);
  }
);

export default api;
