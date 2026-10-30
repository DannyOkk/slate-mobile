import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Debtor } from '@/types/debtor';

interface DebtorCardProps {
  debtor: Debtor;
  onPress: (debtor: Debtor) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'Sin fecha registrada';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function DebtorCard({ debtor, onPress }: DebtorCardProps) {
  const initial = debtor.clientName ? debtor.clientName.charAt(0).toUpperCase() : 'D';

  const handleCall = () => {
    if (debtor.clientPhone) {
      Linking.openURL(`tel:${debtor.clientPhone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (debtor.clientPhone) {
      // Limpiar caracteres no numéricos
      const cleanPhone = debtor.clientPhone.replace(/\D/g, '');
      const msg = encodeURIComponent(
        `Hola ${debtor.clientName}, te escribo de Slate para coordinar el saldo pendiente de ${formatCurrency(debtor.totalBalance)}.`
      );
      Linking.openURL(`https://wa.me/${cleanPhone}?text=${msg}`).catch(() => {
        // Fallback a tel si WhatsApp no está disponible
        handleCall();
      });
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(debtor)}>
      {/* Sección Superior: Avatar, Info y Monto */}
      <View style={styles.topRow}>
        {/* Avatar con borde de alerta */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Información del Cliente */}
        <View style={styles.infoCol}>
          <Text style={styles.clientName} numberOfLines={1}>
            {debtor.clientName}
          </Text>

          {debtor.clientPhone ? (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={13} color="#38BDF8" />
              <Text style={styles.phoneText}>{debtor.clientPhone}</Text>
            </View>
          ) : (
            <Text style={styles.noPhoneText}>Sin teléfono</Text>
          )}

          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={12} color="#64748B" />
            <Text style={styles.dateText}>
              Último movimiento: {formatDate(debtor.lastTransactionDate)}
            </Text>
          </View>
        </View>

        {/* Monto de la Deuda */}
        <View style={styles.debtCol}>
          <Text style={styles.debtLabel}>Debe</Text>
          <Text style={styles.debtAmount} numberOfLines={1} selectable>
            {formatCurrency(debtor.totalBalance)}
          </Text>
        </View>
      </View>

      {/* Barra Inferior de Acciones Rápidas */}
      <View style={styles.actionsBar}>
        <View style={styles.quickContactRow}>
          {debtor.clientPhone ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Llamar a ${debtor.clientName}`}
                style={({ pressed }) => [
                  styles.contactButton,
                  styles.callButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleCall}
                hitSlop={6}>
                <Ionicons name="call" size={13} color="#38BDF8" />
                <Text style={styles.callButtonText}>Llamar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Enviar WhatsApp a ${debtor.clientName}`}
                style={({ pressed }) => [
                  styles.contactButton,
                  styles.whatsappButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleWhatsApp}
                hitSlop={6}>
                <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                <Text style={styles.whatsappButtonText}>WhatsApp</Text>
              </Pressable>
            </>
          ) : null}
        </View>

        <View style={styles.viewAccountRow}>
          <Text style={styles.viewAccountText}>Ver cuenta</Text>
          <Ionicons name="chevron-forward" size={15} color="#38BDF8" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#172033',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.25)',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7F1D1D',
    borderWidth: 2,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FEE2E2',
    fontSize: 19,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
    gap: 3,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '500',
  },
  noPhoneText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
  },
  debtCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  debtLabel: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debtAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: -0.4,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  callButton: {
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  whatsappButton: {
    backgroundColor: 'rgba(37, 211, 102, 0.08)',
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  whatsappButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
  },
  viewAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAccountText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default DebtorCard;
