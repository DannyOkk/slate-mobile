import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Client, ClientFormData } from '@/types/client';

interface ClientFormModalProps {
  visible: boolean;
  clientToEdit: Client | null;
  onClose: () => void;
  onSave: (data: ClientFormData, id?: number) => Promise<void>;
}

interface ClientFormContentProps {
  clientToEdit: Client | null;
  onClose: () => void;
  onSave: (data: ClientFormData, id?: number) => Promise<void>;
}

function ClientFormContent({
  clientToEdit,
  onClose,
  onSave,
}: ClientFormContentProps) {
  const [name, setName] = useState(clientToEdit?.name || '');
  const [phone, setPhone] = useState(clientToEdit?.phone || '');
  const [address, setAddress] = useState(clientToEdit?.address || '');
  const [notes, setNotes] = useState(clientToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEditing = Boolean(clientToEdit);

  const handleSubmit = async () => {
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      const msg = 'El nombre del cliente es obligatorio.';
      setErrorMessage(msg);
      Alert.alert('Campo requerido', msg);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          name: trimmedName,
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        },
        clientToEdit?.id
      );
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Ocurrió un error al guardar los datos del cliente.';
      setErrorMessage(msg);
      Alert.alert('Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.modalContent}>
      {/* Cabecera del Modal */}
      <View style={styles.header}>
        <View>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Text>
          <Text style={styles.modalSubtitle}>
            {isEditing
              ? 'Actualizá los datos de contacto y notas'
              : 'Ingresá la información del nuevo cliente'}
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          disabled={isSubmitting}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          hitSlop={8}>
          <Ionicons name="close" size={22} color="#94A3B8" />
        </Pressable>
      </View>

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Campos del Formulario */}
      <ScrollView
        style={styles.formScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Campo Nombre */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Nombre y Apellido <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ej. Mariana Torres"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage(null);
            }}
            autoCapitalize="words"
            editable={!isSubmitting}
          />
        </View>

        {/* Campo Teléfono */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono de Contacto</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. 261 555-1234"
            placeholderTextColor="#64748B"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isSubmitting}
          />
        </View>

        {/* Campo Dirección */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección / Domicilio</Text>
          <TextInput
            style={styles.input}
            placeholder="ej. Av. San Martín 450, Ciudad"
            placeholderTextColor="#64748B"
            value={address}
            onChangeText={setAddress}
            autoCapitalize="sentences"
            editable={!isSubmitting}
          />
        </View>

        {/* Campo Notas */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Notas u Observaciones</Text>
            <Text style={styles.charCounter}>{notes.length}/255</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="ej. Viene los viernes por la tarde. Empleado de comercio."
            placeholderTextColor="#64748B"
            value={notes}
            onChangeText={(text) => {
              if (text.length <= 255) setNotes(text);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
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
            isSubmitting && styles.buttonDisabled,
            pressed && !isSubmitting && styles.pressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Guardando...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function ClientFormModal({
  visible,
  clientToEdit,
  onClose,
  onSave,
}: ClientFormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}>
          {visible ? (
            <ClientFormContent
              key={clientToEdit ? String(clientToEdit.id) : 'new'}
              clientToEdit={clientToEdit}
              onClose={onClose}
              onSave={onSave}
            />
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  charCounter: {
    fontSize: 11,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#F8FAFC',
  },
  textArea: {
    minHeight: 75,
    paddingTop: 10,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
    backgroundColor: '#208AEF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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

export default ClientFormModal;
