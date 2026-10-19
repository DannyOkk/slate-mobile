import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DebtorCard } from '@/components/debtors/DebtorCard';
import { debtorService } from '@/services/debtorService';
import { Debtor } from '@/types/debtor';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function DebtorsScreen() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDebtors = useCallback(async (showFullLoader = true) => {
    try {
      if (showFullLoader) setIsLoading(true);
      const data = await debtorService.getDebtors();
      setDebtors(data);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'No se pudo cargar la lista de deudores. Verificá la conexión con el servidor.';
      Alert.alert('Error al cargar', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDebtors(true);
  }, [fetchDebtors]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDebtors(false);
  };

  // Filtrado de deudores en tiempo real
  const filteredDebtors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return debtors;

    return debtors.filter((d) => {
      const matchName = d.clientName?.toLowerCase().includes(q);
      const matchPhone = d.clientPhone?.toLowerCase().includes(q);
      return matchName || matchPhone;
    });
  }, [debtors, searchQuery]);

  // Cálculo del total acumulado de deudas
  const totalDebt = useMemo(() => {
    return debtors.reduce((sum, d) => sum + (d.totalBalance || 0), 0);
  }, [debtors]);

  // Navegación a la cuenta corriente del deudor
  const handleSelectDebtor = (debtor: Debtor) => {
    router.push({
      pathname: '/client-detail',
      params: {
        clientId: debtor.clientId.toString(),
        clientName: debtor.clientName,
        clientPhone: debtor.clientPhone || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera Principal */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
          </Pressable>
          <View>
            <Text style={styles.headerTitle}>Quién me debe</Text>
            <Text style={styles.headerSubtitle}>Cuentas por cobrar</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/clients')}
          style={({ pressed }) => [styles.headerClientsButton, pressed && styles.pressed]}
          hitSlop={6}>
          <Ionicons name="people-outline" size={16} color="#38BDF8" />
          <Text style={styles.headerClientsButtonText}>Clientes</Text>
        </Pressable>
      </View>

      {/* Contenido con Loading o FlatList */}
      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Calculando saldos pendientes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDebtors}
          keyExtractor={(item) => item.clientId.toString()}
          renderItem={({ item }) => (
            <DebtorCard debtor={item} onPress={handleSelectDebtor} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#EF4444"
              colors={['#EF4444']}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              {/* Tarjeta Hero de Métrica Total de Deuda */}
              {debtors.length > 0 ? (
                <View style={styles.heroMetricCard}>
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroLabelRow}>
                      <Ionicons name="wallet-outline" size={16} color="#F87171" />
                      <Text style={styles.heroLabel}>Total por Cobrar</Text>
                    </View>
                    <View style={styles.debtorsCountBadge}>
                      <Text style={styles.debtorsCountText}>
                        {debtors.length === 1 ? '1 deudor' : `${debtors.length} deudores`}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.heroDebtText}>{formatCurrency(totalDebt)}</Text>
                  <Text style={styles.heroHelpText}>
                    Monto total adeudado por tus clientes ordenado de mayor a menor.
                  </Text>
                </View>
              ) : null}

              {/* Barra de Búsqueda */}
              {debtors.length > 0 ? (
                <View style={styles.searchContainer}>
                  <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar deudor por nombre o teléfono..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'checkmark-circle-outline'}
                  size={52}
                  color={searchQuery ? '#64748B' : '#10B981'}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? 'Sin coincidencias'
                  : '¡Al día! No tenés deudas pendientes'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No se encontraron deudores que coincidan con "${searchQuery}".`
                  : 'Todos tus clientes están al día con sus pagos o no registran fiados pendientes por cobrar.'}
              </Text>

              {!searchQuery && (
                <Pressable
                  style={({ pressed }) => [styles.emptyActionButton, pressed && styles.pressed]}
                  onPress={() => router.push('/clients')}>
                  <Ionicons name="people" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyActionButtonText}>Ver todos los clientes</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  headerClientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  headerClientsButtonText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listHeaderContainer: {
    paddingTop: 16,
    marginBottom: 6,
  },
  heroMetricCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: 12,
    color: '#F87171',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debtorsCountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  debtorsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  heroDebtText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: -0.6,
    marginVertical: 4,
  },
  heroHelpText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#F8FAFC',
    padding: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#208AEF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default DebtorsScreen;
