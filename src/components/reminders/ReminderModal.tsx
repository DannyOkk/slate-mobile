import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ModalSheet } from '@/components/ui/modal-sheet';
import { Shadows } from '@/constants/theme';

interface ReminderModalProps {
  visible: boolean;
  clientName: string;
  debtAmount: number;
  onClose: () => void;
  onConfirm: (date: Date) => Promise<void> | void;
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getInitialReminderDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

export function ReminderModal({
  visible,
  clientName,
  debtAmount,
  onClose,
  onConfirm,
}: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialReminderDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validación de fecha futura sin llamadas impuras durante el render
  const [minTimestamp] = useState(() => Date.now());
  const isPast = selectedDate.getTime() <= minTimestamp;

  // Presets rápidos
  const applyPreset = (type: 'tomorrow_9am' | 'tomorrow_6pm' | 'in_3_days' | 'next_monday') => {
    const d = new Date();
    if (type === 'tomorrow_9am') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (type === 'tomorrow_6pm') {
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
    } else if (type === 'in_3_days') {
      d.setDate(d.getDate() + 3);
      d.setHours(9, 0, 0, 0);
    } else if (type === 'next_monday') {
      const daysUntilMonday = ((1 + 7 - d.getDay()) % 7) || 7;
      d.setDate(d.getDate() + daysUntilMonday);
      d.setHours(9, 0, 0, 0);
    }
    setSelectedDate(d);
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      const updated = new Date(selectedDate);
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(updated);
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      const updated = new Date(selectedDate);
      updated.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setSelectedDate(updated);
    }
  };

  const handleConfirm = async () => {
    if (isPast || isSaving) return;
    try {
      setIsSaving(true);
      await onConfirm(selectedDate);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}>
        <View style={styles.modalContainer}>
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="notifications" size={20} color="#38BDF8" />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.title}>Programar Recordatorio</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {clientName} • {formatCurrency(debtAmount)}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar recordatorio"
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Atajos Rápidos (Presets) */}
          <Text style={styles.sectionLabel}>Atajos Rápidos</Text>
          <View style={styles.presetsGrid}>
            <Pressable
              style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
              onPress={() => applyPreset('tomorrow_9am')}>
              <Ionicons name="sunny-outline" size={13} color="#FBBF24" />
              <Text style={styles.presetText}>Mañana 09:00</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
              onPress={() => applyPreset('tomorrow_6pm')}>
              <Ionicons name="moon-outline" size={13} color="#818CF8" />
              <Text style={styles.presetText}>Mañana 18:00</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
              onPress={() => applyPreset('in_3_days')}>
              <Ionicons name="calendar-outline" size={13} color="#34D399" />
              <Text style={styles.presetText}>En 3 días</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
              onPress={() => applyPreset('next_monday')}>
              <Ionicons name="briefcase-outline" size={13} color="#38BDF8" />
              <Text style={styles.presetText}>Próx. Lunes</Text>
            </Pressable>
          </View>

          {/* Fecha y Hora Personalizada */}
          <Text style={styles.sectionLabel}>Personalizar Fecha y Hora</Text>
          <View style={styles.customPickersRow}>
            <Pressable
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={16} color="#38BDF8" />
              <Text style={styles.pickerButtonText}>
                {selectedDate.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </Pressable>

            <Pressable
              style={styles.pickerButton}
              onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time" size={16} color="#38BDF8" />
              <Text style={styles.pickerButtonText}>
                {selectedDate.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}{' '}
                hs
              </Text>
            </Pressable>
          </View>

          {/* Resumen del Recordatorio */}
          <View style={[styles.summaryCard, isPast && styles.summaryCardError]}>
            <Ionicons
              name={isPast ? 'alert-circle' : 'time-outline'}
              size={18}
              color={isPast ? '#EF4444' : '#38BDF8'}
            />
            <View style={styles.summaryTextContainer}>
              <Text style={[styles.summaryTitle, isPast && styles.summaryTitleError]}>
                {isPast
                  ? 'La fecha y hora deben ser futuras'
                  : `Se avisará el ${formatFullDate(selectedDate)}`}
              </Text>
              <Text style={styles.summarySubtitle}>
                Notificación local con alarma y sonido
              </Text>
            </View>
          </View>

          {/* Botones de Acción */}
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={onClose}
              disabled={isSaving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtn,
                styles.confirmBtn,
                (isPast || isSaving) && styles.disabledBtn,
              ]}
              onPress={handleConfirm}
              disabled={isPast || isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmText}>Programar</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Pickers Nativos */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={handleTimeChange}
            />
          )}
        </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  customPickersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  pickerButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginVertical: 6,
  },
  summaryCardError: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryTitleError: {
    color: '#F87171',
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: '#208AEF',
    ...Shadows.accent,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default ReminderModal;
