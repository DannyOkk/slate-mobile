import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Transaction } from '@/types/transaction';
import { Shadows } from '@/constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isFiado = transaction.type === 'FIADO';

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        {/* Ícono distintivo */}
        <View
          style={[
            styles.iconBadge,
            isFiado ? styles.iconBadgeFiado : styles.iconBadgePago,
          ]}>
          <Ionicons
            name={isFiado ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={22}
            color={isFiado ? '#EF4444' : '#10B981'}
          />
        </View>

        {/* Tipo y Fecha */}
        <View style={styles.metaContainer}>
          <View style={styles.typeBadgeRow}>
            <View
              style={[
                styles.typePill,
                isFiado ? styles.typePillFiado : styles.typePillPago,
              ]}>
              <Text
                style={[
                  styles.typePillText,
                  isFiado ? styles.typeTextFiado : styles.typeTextPago,
                ]}>
                {isFiado ? 'FIADO' : 'PAGO'}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate(transaction.createdAt)}</Text>
          </View>

          {/* Descripción */}
          <Text style={styles.descriptionText} numberOfLines={2}>
            {transaction.description?.trim() || (isFiado ? 'Compra a crédito' : 'Abono a cuenta')}
          </Text>
        </View>
      </View>

      {/* Monto */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amountText,
            isFiado ? styles.amountFiado : styles.amountPago,
          ]}>
          {isFiado ? `+${formatCurrency(transaction.amount)}` : `-${formatCurrency(transaction.amount)}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.card,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBadgeFiado: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  iconBadgePago: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  metaContainer: {
    flex: 1,
    gap: 3,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  typePillFiado: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  typePillPago: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeTextFiado: {
    color: '#F87171',
  },
  typeTextPago: {
    color: '#34D399',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  descriptionText: {
    fontSize: 13,
    color: '#E2E8F0',
    marginTop: 2,
  },
  amountContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  amountFiado: {
    color: '#F87171',
  },
  amountPago: {
    color: '#34D399',
  },
});

export default TransactionItem;
