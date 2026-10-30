import { API } from './api';
import { storage } from './storage';
import {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '@/types/auth';

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

  async getProfile(): Promise<User> {
    const response = await API.get<User>('/auth/profile');
    return response.data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await API.put<User>('/auth/profile', {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim(),
    });
    const user = response.data;
    await storage.saveUser(user);
    return user;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await API.put('/auth/password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
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
