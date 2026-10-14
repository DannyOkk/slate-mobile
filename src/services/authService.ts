import { API } from './api';
import { storage } from './storage';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth';

/**
 * Servicio de Autenticación para interactuar con los endpoints de Spring Boot /auth/*.
 */
export const authService = {
  /**
   * Inicia sesión con email y contraseña.
   * Guarda el token devuelto en SecureStore.
   */
  async login(credentials: LoginPayload): Promise<{ user: User; token: string }> {
    const response = await API.post<AuthResponse>('/auth/login', {
      email: credentials.email.trim(),
      password: credentials.password,
    });

    const data = response.data;
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
    };

    await storage.saveToken(data.token);
    await storage.saveUser(user);

    return { user, token: data.token };
  },

  /**
   * Registra un nuevo usuario en la plataforma.
   * Guarda el token devuelto en SecureStore.
   */
  async register(payload: RegisterPayload): Promise<{ user: User; token: string }> {
    const response = await API.post<AuthResponse>('/auth/register', {
      name: payload.name.trim(),
      email: payload.email.trim(),
      password: payload.password,
      phone: payload.phone.trim(),
    });

    const data = response.data;
    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: payload.phone.trim(),
    };

    await storage.saveToken(data.token);
    await storage.saveUser(user);

    return { user, token: data.token };
  },

  /**
   * Cierra sesión eliminando el token y datos del usuario del almacenamiento seguro.
   */
  async logout(): Promise<void> {
    await storage.clearAuth();
  },

  /**
   * Recupera el token JWT guardado.
   */
  async getToken(): Promise<string | null> {
    return await storage.getToken();
  },

  /**
   * Recupera los datos del usuario guardados localmente.
   */
  async getUser(): Promise<User | null> {
    return await storage.getUser();
  },
};

export default authService;
