import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { User } from '@/types/auth';

const TOKEN_KEY = 'slate_auth_token';
const USER_KEY = 'slate_auth_user';

/**
 * Capa de almacenamiento seguro.
 * Utiliza Keychain (iOS) y Keystore (Android) a través de expo-secure-store.
 * Cuenta con fallback a localStorage en entornos Web para evitar excepciones.
 */
export const storage = {
  /**
   * Guarda el token JWT de manera segura.
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(TOKEN_KEY, token);
        }
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('[Storage] Error al guardar token:', error);
      throw error;
    }
  },

  /**
   * Obtiene el token JWT guardado.
   */
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(TOKEN_KEY);
        }
        return null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[Storage] Error al recuperar token:', error);
      return null;
    }
  },

  /**
   * Elimina el token JWT guardado.
   */
  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(TOKEN_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[Storage] Error al eliminar token:', error);
    }
  },

  /**
   * Guarda los datos del usuario en almacenamiento local.
   */
  async saveUser(user: User): Promise<void> {
    try {
      const json = JSON.stringify(user);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(USER_KEY, json);
        }
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, json);
    } catch (error) {
      console.error('[Storage] Error al guardar usuario:', error);
    }
  },

  /**
   * Obtiene los datos del usuario guardado.
   */
  async getUser(): Promise<User | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          raw = window.localStorage.getItem(USER_KEY);
        }
      } else {
        raw = await SecureStore.getItemAsync(USER_KEY);
      }

      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch (error) {
      console.error('[Storage] Error al recuperar usuario:', error);
      return null;
    }
  },

  /**
   * Elimina los datos del usuario guardado.
   */
  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(USER_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.error('[Storage] Error al eliminar usuario:', error);
    }
  },

  /**
   * Limpia toda la información de autenticación de la sesión.
   */
  async clearAuth(): Promise<void> {
    await Promise.all([this.removeToken(), this.removeUser()]);
  },
};

export default storage;
