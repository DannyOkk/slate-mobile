import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CreateTransactionPayload, TransactionType } from '@/types/transaction';
import { ModalSheet } from '@/components/ui/modal-sheet';
import { Shadows } from '@/constants/theme';

interface AddTransactionModalProps {
  visible: boolean;
  initialType: TransactionType;
  clientName: string;
  currentBalance: number;
  onClose: () => void;
  onSave: (payload: CreateTransactionPayload) => Promise<void>;
}

interface FormContentProps {
  initialType: TransactionType;
  clientName: string;
  currentBalance: number;
  onClose: () => void;
  onSave: (payload: CreateTransactionPayload) => Promise<void>;
}

function FormContent({
  initialType,
  clientName,
  currentBalance,
  onClose,
  onSave,
}: FormContentProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFiado = type === 'FIADO';
  const themeColor = isFiado ? '#EF4444' : '#10B981';

  // Parser seguro para montos con coma o punto
  const parseAmount = (str: string): number => {
    const sanitized = str.replace(',', '.').trim();
    return parseFloat(sanitized);
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseAmount(amountStr) || 0;
    const nextVal = (current + val).toString();
    setAmountStr(nextVal);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSetTotalDebt = () => {
    if (currentBalance > 0) {
      setAmountStr(currentBalance.toString());
      if (errorMessage) setErrorMessage(null);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const numericAmount = parseAmount(amountStr);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const msg = 'Ingresá un monto válido mayor a 0.';
      setErrorMessage(msg);
      Alert.alert('Monto inválido', msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        amount: numericAmount,
        type,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Ocurrió un error al registrar el movimiento. Intentá nuevamente.';
      setErrorMessage(msg);
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.modalContent}>
      {/* Cabecera */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.modalTitle}>Registrar Movimiento</Text>
          <Text style={styles.modalSubtitle} numberOfLines={1}>
            Cliente: <Text style={styles.clientHighlight}>{clientName}</Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar registro de movimiento"
          onPress={onClose}
          disabled={isSubmitting}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          hitSlop={8}>
          <Ionicons name="close" size={22} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Selector de Tipo (Fiado vs Pago) */}
      <View style={styles.typeSelectorContainer}>
        <Pressable
          style={[
            styles.typeTab,
            isFiado && styles.typeTabFiadoActive,
          ]}
          onPress={() => {
            setType('FIADO');
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isSubmitting}>
          <Ionicons
            name="arrow-up-circle"
            size={18}
            color={isFiado ? '#FFFFFF' : '#94A3B8'}
          />
          <Text
            style={[
              styles.typeTabText,
              isFiado && styles.typeTabTextActive,
            ]}>
            Nuevo Fiado (+)
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeTab,
            !isFiado && styles.typeTabPagoActive,
          ]}
          onPress={() => {
            setType('PAGO');
            if (errorMessage) setErrorMessage(null);
          }}
          disabled={isSubmitting}>
          <Ionicons
            name="arrow-down-circle"
            size={18}
            color={!isFiado ? '#FFFFFF' : '#94A3B8'}
          />
          <Text
            style={[
              styles.typeTabText,
              !isFiado && styles.typeTabTextActive,
            ]}>
            Registrar Pago (-)
          </Text>
        </Pressable>
      </View>

      {/* Banner de Error */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Campo Monto */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Monto a registrar <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <View style={[styles.amountInputRow, { borderColor: themeColor }]}>
            <Text style={[styles.currencyPrefix, { color: themeColor }]}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              value={amountStr}
              onChangeText={(text) => {
                setAmountStr(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="decimal-pad"
              autoFocus
              editable={!isSubmitting}
            />
          </View>
        </View>

        {/* Chips de montos rápidos */}
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>Accesos directos:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            <Pressable
              style={styles.chip}
              onPress={() => handleAddQuickAmount(500)}
              disabled={isSubmitting}>
              <Text style={styles.chipText}>+$500</Text>
            </Pressable>
            <Pressable
              style={styles.chip}
              onPress={() => handleAddQuickAmount(1000)}
              disabled={isSubmitting}>
              <Text style={styles.chipText}>+$1.000</Text>
            </Pressable>
            <Pressable
              style={styles.chip}
              onPress={() => handleAddQuickAmount(2000)}
              disabled={isSubmitting}>
              <Text style={styles.chipText}>+$2.000</Text>
            </Pressable>
            <Pressable
              style={styles.chip}
              onPress={() => handleAddQuickAmount(5000)}
              disabled={isSubmitting}>
              <Text style={styles.chipText}>+$5.000</Text>
            </Pressable>

            {!isFiado && currentBalance > 0 && (
              <Pressable
                style={[styles.chip, styles.chipTotalDebt]}
                onPress={handleSetTotalDebt}
                disabled={isSubmitting}>
                <Text style={styles.chipTotalDebtText}>Saldar Total (${currentBalance.toFixed(2)})</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>

        {/* Campo Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción / Detalle (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder={
              isFiado
                ? 'ej. Compra de fideos, pan y gaseosa'
                : 'ej. Abono en efectivo / transferencia'
            }
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
          />
        </View>
      </ScrollView>

      {/* Botones de Acción */}
      <View style={styles.footerActions}>
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          onPress={onClose}
          disabled={isSubmitting}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: themeColor },
            isSubmitting && styles.buttonDisabled,
            pressed && !isSubmitting && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Registrando...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>
              {isFiado ? 'Guardar Fiado' : 'Guardar Pago'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function AddTransactionModal({
  visible,
  initialType,
  clientName,
  currentBalance,
  onClose,
  onSave,
}: AddTransactionModalProps) {
  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}>
      {visible ? (
        <FormContent
          key={`${clientName}-${initialType}`}
          initialType={initialType}
          clientName={clientName}
          currentBalance={currentBalance}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 0,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  clientHighlight: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  typeTabFiadoActive: {
    backgroundColor: '#EF4444',
  },
  typeTabPagoActive: {
    backgroundColor: '#10B981',
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#FCA5A5',
    fontSize: 13,
    flex: 1,
  },
  formScroll: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  currencyPrefix: {
    fontSize: 26,
    fontWeight: '800',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC',
    padding: 0,
  },
  chipsSection: {
    marginBottom: 16,
  },
  chipsLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTotalDebt: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  chipTotalDebtText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.raised,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default AddTransactionModal;
