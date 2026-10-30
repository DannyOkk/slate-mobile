import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RiskBadge } from '@/components/RiskBadge';
import { ReminderModal } from '@/components/reminders/ReminderModal';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { Shadows } from '@/constants/theme';
import { clientService } from '@/services/clientService';
import { notificationService } from '@/services/notificationService';
import { transactionService } from '@/services/transactionService';
import { RiskLevel } from '@/types/client';
import {
  ClientTransactionsSummary,
  CreateTransactionPayload,
  TransactionType,
} from '@/types/transaction';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function ClientDetailScreen() {
  const params = useLocalSearchParams<{
    clientId: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    riskLevel?: string;
  }>();

  const clientId = Number(params.clientId);

  const [summary, setSummary] = useState<ClientTransactionsSummary | null>(null);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<RiskLevel>(
    (params.riskLevel as RiskLevel) || 'BAJO'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal de Transacción
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('FIADO');

  // Modal de Recordatorio
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);

  const fetchTransactions = useCallback(
    async (showFullLoader = true) => {
      if (!clientId || isNaN(clientId)) return;

      try {
        if (showFullLoader) setIsLoading(true);
        const [transactionsData, clientData] = await Promise.all([
          transactionService.getClientTransactions(clientId),
          clientService.getClientById(clientId).catch(() => null),
        ]);
        setSummary(transactionsData);
        if (clientData?.riskLevel) {
          setCurrentRiskLevel(clientData.riskLevel);
        }
      } catch (error: any) {
        const msg =
          error?.response?.data?.message ||
          'No se pudo cargar el historial de transacciones del cliente.';
        Alert.alert('Error al cargar', msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions(true);
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions(false);
  };

  const handleOpenAddModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleSaveTransaction = async (payload: CreateTransactionPayload) => {
    await transactionService.createTransaction(clientId, payload);
    await fetchTransactions(false);
    Alert.alert(
      'Movimiento Registrado',
      payload.type === 'FIADO'
        ? `Se registró un nuevo fiado por ${formatCurrency(payload.amount)}.`
        : `Se registró un pago por ${formatCurrency(payload.amount)}.`
    );
  };

  const handleCallClient = () => {
    if (params.clientPhone) {
      Linking.openURL(`tel:${params.clientPhone}`).catch(() => {});
    }
  };

  const handleOpenReminderModal = async () => {
    if (!hasDebt) {
      Alert.alert('Sin deuda', 'El cliente no tiene saldo deudor pendiente.');
      return;
    }

    const hasPermission =
      await notificationService.requestNotificationPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permisos de Notificación',
        'Para recibir recordatorios de cobro, necesitás autorizar las notificaciones de Slate en los ajustes del dispositivo.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    setIsReminderModalVisible(true);
  };

  const handleConfirmReminder = async (scheduledDate: Date) => {
    try {
      await notificationService.schedulePaymentReminder(
        clientDisplayName,
        totalBalance,
        scheduledDate
      );
      setIsReminderModalVisible(false);

      const formattedDate = new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(scheduledDate);

      Alert.alert(
        'Recordatorio Programado',
        `Te avisaremos el ${formattedDate} para cobrar a ${clientDisplayName}.`
      );
    } catch (error: any) {
      Alert.alert(
        'Error al programar',
        error?.message || 'No se pudo programar el recordatorio.'
      );
    }
  };

  const clientDisplayName = summary?.clientName || params.clientName || 'Cliente';
  const totalBalance = summary?.totalBalance ?? 0;
  const hasDebt = totalBalance > 0;
  const transactions = summary?.transactions || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera Superior */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
          </Pressable>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {clientDisplayName}
            </Text>
            <Text style={styles.headerSubtitle}>Cuenta Corriente</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {hasDebt ? (
            <Pressable
              onPress={handleOpenReminderModal}
              style={({ pressed }) => [
                styles.reminderHeaderButton,
                pressed && styles.pressed,
              ]}
              hitSlop={6}>
              <Ionicons name="notifications-outline" size={17} color="#38BDF8" />
            </Pressable>
          ) : null}

          {params.clientPhone ? (
            <Pressable
              onPress={handleCallClient}
              style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
              hitSlop={6}>
              <Ionicons name="call" size={17} color="#38BDF8" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Contenido Principal con Scroll / FlatList */}
      {isLoading ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#208AEF" />
          <Text style={styles.loadingText}>Cargando estado de cuenta...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#208AEF"
              colors={['#208AEF']}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              {/* Tarjeta Hero de Saldo Acumulado */}
              <View
                style={[
                  styles.heroCard,
                  hasDebt ? styles.heroCardDebt : styles.heroCardClean,
                ]}>
                <View style={styles.heroTopRow}>
                  <Text style={styles.heroLabel}>Saldo Actual Acumulado</Text>
                  <View style={styles.heroBadgesRow}>
                    <RiskBadge level={currentRiskLevel} size="small" />
                    <View
                      style={[
                        styles.statusPill,
                        hasDebt ? styles.statusPillDebt : styles.statusPillClean,
                      ]}>
                      <Ionicons
                        name={hasDebt ? 'alert-circle' : 'checkmark-circle'}
                        size={14}
                        color={hasDebt ? '#EF4444' : '#10B981'}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          hasDebt ? styles.statusTextDebt : styles.statusTextClean,
                        ]}>
                        {hasDebt ? 'Deuda Pendiente' : 'Al Día'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Importe del Saldo */}
                <Text
                  selectable
                  style={[
                    styles.heroBalanceText,
                    hasDebt ? styles.balanceTextDebt : styles.balanceTextClean,
                  ]}>
                  {formatCurrency(totalBalance)}
                </Text>

                {/* Info adicional de contacto */}
                {params.clientAddress ? (
                  <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color="#94A3B8" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {params.clientAddress}
                    </Text>
                  </View>
                ) : null}

                {/* Botón para programar recordatorio de cobro */}
                {hasDebt ? (
                  <Pressable
                    onPress={handleOpenReminderModal}
                    style={({ pressed }) => [
                      styles.reminderHeroButton,
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons name="notifications-outline" size={15} color="#38BDF8" />
                    <Text style={styles.reminderHeroButtonText}>
                      Programar Recordatorio de Cobro
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {/* Botones de Acción Rápida: Fiado y Pago */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.fiadoButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleOpenAddModal('FIADO')}>
                  <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>+ Registrar Fiado</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    styles.pagoButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleOpenAddModal('PAGO')}>
                  <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>- Registrar Pago</Text>
                </Pressable>
              </View>

              {/* Título de la sección de historial */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Historial de Movimientos</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{transactions.length}</Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={40} color="#64748B" />
              </View>
              <Text style={styles.emptyTitle}>Sin movimientos registrados</Text>
              <Text style={styles.emptySubtitle}>
                Utilizá los botones de arriba para registrar compras a crédito (fiados) o pagos de este cliente.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal para Crear Movimiento */}
      <AddTransactionModal
        visible={isModalVisible}
        initialType={modalType}
        clientName={clientDisplayName}
        currentBalance={totalBalance}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveTransaction}
      />

      {/* Modal para Programar Recordatorio */}
      <ReminderModal
        visible={isReminderModalVisible}
        clientName={clientDisplayName}
        debtAmount={totalBalance}
        onClose={() => setIsReminderModalVisible(false)}
        onConfirm={handleConfirmReminder}
      />
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
    flex: 1,
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
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  reminderHeroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  reminderHeroButtonText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
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
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    ...Shadows.raised,
  },
  heroCardDebt: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: '#1E293B',
  },
  heroCardClean: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: '#1E293B',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heroLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillDebt: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  statusPillClean: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextDebt: {
    color: '#F87171',
  },
  statusTextClean: {
    color: '#34D399',
  },
  heroBalanceText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  balanceTextDebt: {
    color: '#F87171',
  },
  balanceTextClean: {
    color: '#34D399',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  addressText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.raised,
  },
  fiadoButton: {
    backgroundColor: '#EF4444',
  },
  pagoButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  countBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default ClientDetailScreen;
