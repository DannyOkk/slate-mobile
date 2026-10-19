import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';

export function HomeScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Si no está autenticado y ya terminó la carga inicial, redirigir al login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseás salir de tu cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  // Si aún no hay sesión, evitar flash de contenido
  if (!isAuthenticated) {
    return null;
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const apiEndpoint = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Barra Superior */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>Slate</Text>
            <Text style={styles.appSubtitle}>Panel de Control</Text>
          </View>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>{userInitial}</Text>
          </View>
        </View>

        {/* Tarjeta de Bienvenida del Usuario */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>¡Hola de nuevo!</Text>
              <Text style={styles.userName}>{user?.name || 'Comerciante'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>ID de Comercio</Text>
              <Text style={styles.metaValue}>#{user?.id ?? '1'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estado</Text>
              <Text style={styles.statusActive}>Conectado</Text>
            </View>
          </View>
        </View>

        {/* Información del Backend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conexión con el Backend</Text>
          <Text style={styles.cardDescription}>
            El cliente HTTP está sincronizado con el servidor Spring Boot (slate-backend).
          </Text>
          <View style={styles.endpointBox}>
            <Text style={styles.endpointLabel}>Base URL:</Text>
            <Text style={styles.endpointUrl}>{apiEndpoint}</Text>
          </View>
        </View>

        {/* Accesos Rápidos para los siguientes Sprints */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Módulos Disponibles</Text>
          <View style={styles.moduleRow}>
            <Pressable
              style={({ pressed }) => [
                styles.moduleCard,
                styles.moduleCardActive,
                pressed && styles.moduleCardPressed,
              ]}
              onPress={() => router.push('/clients')}>
              <Text style={styles.moduleEmoji}>👥</Text>
              <Text style={styles.moduleTitle}>Clientes</Text>
              <Text style={styles.moduleStatusActive}>Administrar →</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.moduleCard,
                styles.moduleCardDebtors,
                pressed && styles.moduleCardPressed,
              ]}
              onPress={() => router.push('/debtors')}>
              <Text style={styles.moduleEmoji}>💸</Text>
              <Text style={styles.moduleTitle}>Quién me debe</Text>
              <Text style={styles.moduleStatusDebtors}>Ver deudores →</Text>
            </Pressable>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  userBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 2,
  },
  statusActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  endpointBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  endpointLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  endpointUrl: {
    fontSize: 13,
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
  moduleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  moduleCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  moduleEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  moduleStatus: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  moduleCardActive: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(32, 138, 239, 0.08)',
  },
  moduleCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  moduleStatusActive: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
  },
  moduleCardDebtors: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  moduleStatusDebtors: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '700',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#7F1D1D',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#991B1B',
    marginTop: 10,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutButtonText: {
    color: '#FEE2E2',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
