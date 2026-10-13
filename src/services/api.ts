import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * URL base de la API backend.
 * En Expo SDK 49+, las variables de entorno que inician con `EXPO_PUBLIC_`
 * se exponen automáticamente en el cliente sin librerías adicionales.
 *
 * Defaults de fallback según el entorno de prueba:
 * - Emulador Android: 10.0.2.2 mapea al localhost de la máquina host.
 * - Simulador iOS: localhost funciona directamente.
 * - Dispositivo físico (Expo Go): debe usarse la IP local de la red (ej. 192.168.1.X)
 *   configurada en el archivo .env (ver .env.example).
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api';

/**
 * Instancia principal de Axios configurada para slate-mobile.
 */
// eslint-disable-next-line import/no-named-as-default-member
export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de Peticiones (Request)
 * Inyecta automáticamente el token de autenticación JWT si existe.
 */
API.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // TODO: Conectar con el servicio de persistencia (ej. Expo SecureStore o AsyncStorage)
      // Ejemplo con expo-secure-store:
      // const token = await SecureStore.getItemAsync('user_token');
      const token: string | null = null;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[API Request Interceptor] Error al recuperar token:', error);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuestas (Response)
 * Centraliza el manejo de respuestas y errores HTTP comunes.
 */
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;

      switch (status) {
        case 401:
          // Token expirado o credenciales inválidas.
          // TODO: Limpiar sesión en SecureStore/Context y redirigir al login
          console.warn('[API 401] Sesión expirada o no autorizada');
          break;
        case 403:
          console.warn('[API 403] Acceso denegado');
          break;
        case 404:
          console.warn('[API 404] Recurso no encontrado');
          break;
        case 500:
          console.error('[API 500] Error interno del servidor');
          break;
        default:
          console.warn(`[API ${status}] Error en la respuesta del servidor`);
      }
    } else if (error.request) {
      // La petición fue realizada pero no se recibió respuesta (ej. backend apagado o IP inaccesible)
      console.error(
        '[API Error de Red] No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que la URL/IP sea alcanzable:',
        error.config?.baseURL
      );
    } else {
      console.error('[API Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
