import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { ScreenLoadingState } from '@/components/screen-loading-state';
import { clientService } from '@/services/clientService';
import { debtorService } from '@/services/debtorService';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function HomeScreen() {
  const { user, isAuthenticated, isLoading: isSessionLoading } = useAuth();
  const [clientCount, setClientCount] = useState(0);
  const [debtorCount, setDebtorCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isSessionLoading, isAuthenticated]);

  const fetchDashboard = useCallback(async (showFullLoader = true) => {
    try {
      if (showFullLoader) setIsLoading(true);
      setErrorMessage(null);

      const [clients, debtors] = await Promise.all([
        clientService.getClients(),
        debtorService.getDebtors(),
      ]);

      setClientCount(clients.length);
      setDebtorCount(debtors.length);
      setTotalDebt(debtors.reduce((sum, debtor) => sum + (debtor.totalBalance || 0), 0));
    } catch {
      setErrorMessage('No se pudo actualizar el resumen. Verificá la conexión e intentá nuevamente.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Dashboard data is synchronized after the authenticated session is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDashboard();
    }
  }, [isAuthenticated, fetchDashboard]);

  if (isSessionLoading || isLoading) {
    return <ScreenLoadingState label="Preparando tu resumen..." rows={2} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              fetchDashboard(false);
            }}
            tintColor="#38BDF8"
            colors={['#38BDF8']}
          />
        }>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>Slate</Text>
            <Text style={styles.appSubtitle}>Tu negocio, bajo control</Text>
          </View>
          <View style={styles.topBarActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir configuración"
              onPress={() => router.push('/settings')}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
              <Ionicons name="settings-outline" size={21} color="#BAE6FD" />
            </Pressable>
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>{userInitial}</Text>
            </View>
          </View>
        </View>

        <View style={styles.greetingCard}>
          <View style={styles.greetingIcon}>
            <Ionicons name="sparkles-outline" size={22} color="#BAE6FD" />
          </View>
          <View style={styles.greetingContent}>
            <Text style={styles.greetingLabel}>Buen día</Text>
            <Text style={styles.greetingName}>{user?.name || 'Comerciante'}</Text>
            <Text style={styles.greetingHelp}>Este es el estado actual de tu cartera.</Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={22} color="#FCA5A5" />
            <View style={styles.errorContent}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <Pressable onPress={() => fetchDashboard()} hitSlop={8}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resumen</Text>
              <Text style={styles.sectionHint}>Actualizado ahora</Text>
            </View>

            <View style={styles.metricGrid}>
              <Pressable
                style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}
                onPress={() => router.navigate('/clients')}>
                <View style={[styles.metricIcon, styles.clientsIcon]}>
                  <Ionicons name="people-outline" size={21} color="#7DD3FC" />
                </View>
                <Text style={styles.metricValue}>{clientCount}</Text>
                <Text style={styles.metricLabel}>Clientes</Text>
                <Text style={styles.metricAction}>Ver cartera</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}
                onPress={() => router.navigate('/debtors')}>
                <View style={[styles.metricIcon, styles.debtorsIcon]}>
                  <Ionicons name="wallet-outline" size={21} color="#FDA4AF" />
                </View>
                <Text style={styles.metricValue}>{debtorCount}</Text>
                <Text style={styles.metricLabel}>Deudores</Text>
                <Text style={styles.metricAction}>Ver pendientes</Text>
              </Pressable>
            </View>

            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <View>
                  <Text style={styles.balanceLabel}>Total por cobrar</Text>
                  <Text style={styles.balanceHelp}>Saldo pendiente de tus clientes</Text>
                </View>
                <View style={styles.balanceIcon}>
                  <Ionicons name="trending-up-outline" size={20} color="#FDE68A" />
                </View>
              </View>
              <Text selectable style={styles.balanceValue}>{formatCurrency(totalDebt)}</Text>
              <Pressable
                onPress={() => router.navigate('/debtors')}
                style={({ pressed }) => [styles.balanceAction, pressed && styles.pressed]}>
                <Text style={styles.balanceActionText}>Revisar cuentas pendientes</Text>
                <Ionicons name="arrow-forward" size={16} color="#FEF3C7" />
              </Pressable>
            </View>
          </>
        )}

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={20} color="#7DD3FC" />
          <Text style={styles.tipText}>
            Usá las tabs de abajo para administrar clientes y revisar quién te debe.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#164E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBadgeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#172554',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 18,
  },
  greetingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContent: {
    flex: 1,
  },
  greetingLabel: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  greetingName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  greetingHelp: {
    color: '#BFDBFE',
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#64748B',
    fontSize: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientsIcon: {
    backgroundColor: '#0C4A6E',
  },
  debtorsIcon: {
    backgroundColor: '#4C0519',
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 2,
  },
  metricAction: {
    color: '#7DD3FC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  balanceCard: {
    backgroundColor: '#713F12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#A16207',
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabel: {
    color: '#FEF3C7',
    fontSize: 15,
    fontWeight: '700',
  },
  balanceHelp: {
    color: '#FDE68A',
    fontSize: 12,
    marginTop: 3,
  },
  balanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#854D0E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 18,
    fontVariant: ['tabular-nums'],
  },
  balanceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  balanceActionText: {
    color: '#FEF3C7',
    fontSize: 13,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#164E63',
    borderRadius: 14,
    padding: 14,
  },
  tipText: {
    flex: 1,
    color: '#BAE6FD',
    fontSize: 12,
    lineHeight: 18,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#450A0A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    padding: 16,
  },
  errorContent: {
    flex: 1,
    gap: 8,
  },
  errorText: {
    color: '#FECACA',
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default HomeScreen;
