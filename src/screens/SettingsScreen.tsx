import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModalSheet } from '@/components/ui/modal-sheet';
import { Radius, SlateColors, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

function getErrorMessage(error: any, fallback: string): string {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.details?.email ||
    error?.response?.data?.details?.name ||
    fallback
  );
}

export function SettingsScreen() {
  const {
    user,
    logout,
    refreshProfile,
    updateProfile,
    changePassword,
  } = useAuth();
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    refreshProfile()
      .then((profile) => {
        if (!isMounted) return;
        setName(profile.name);
        setEmail(profile.email);
        setPhone(profile.phone || '');
      })
      .catch(() => {
        if (isMounted) {
          setProfileError('No se pudo actualizar el perfil. Se muestran los datos guardados.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingProfile(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshProfile]);

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseás salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setProfileError('El nombre y el email son obligatorios.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    try {
      await updateProfile({ name, email, phone });
      setIsProfileModalVisible(false);
      Alert.alert('Perfil actualizado', 'Tus datos personales se guardaron correctamente.');
    } catch (error) {
      setProfileError(
        getErrorMessage(error, 'No se pudieron guardar tus datos. Revisá la información e intentá nuevamente.')
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError('Completá la contraseña actual y la nueva contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('La nueva contraseña debe ser diferente de la actual.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalVisible(false);
      Alert.alert('Contraseña actualizada', 'Tu contraseña se cambió correctamente.');
    } catch (error) {
      setPasswordError(
        getErrorMessage(error, 'No se pudo cambiar la contraseña. Verificá la contraseña actual.')
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color="#F8FAFC" />
          </Pressable>
          <Text style={styles.title}>Configuración</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Comerciante'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'Sin email'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.settingsCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar datos personales"
            onPress={() => {
              setProfileError(null);
              setIsProfileModalVisible(true);
            }}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
            <View style={[styles.settingIcon, styles.blueIcon]}>
              <Ionicons name="person-outline" size={19} color="#7DD3FC" />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Cambiar mis datos</Text>
              <Text style={styles.actionDescription}>Nombre, email y teléfono</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#64748B" />
          </Pressable>
          <View style={styles.separator} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar contraseña"
            onPress={() => {
              setPasswordError(null);
              setIsPasswordModalVisible(true);
            }}
            style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}>
            <View style={[styles.settingIcon, styles.purpleIcon]}>
              <Ionicons name="lock-closed-outline" size={19} color="#C4B5FD" />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>Cambiar contraseña</Text>
              <Text style={styles.actionDescription}>Actualizá tu contraseña de acceso</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#64748B" />
          </Pressable>
        </View>

        <ModalSheet
          visible={isProfileModalVisible}
          onClose={() => setIsProfileModalVisible(false)}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cambiar mis datos</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={() => setIsProfileModalVisible(false)}
                  style={styles.modalCloseButton}
                  hitSlop={8}>
                  <Ionicons name="close" size={24} color="#CBD5E1" />
                </Pressable>
              </View>
              <Text style={styles.modalDescription}>Actualizá la información de tu cuenta.</Text>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor="#64748B"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                editable={!isLoadingProfile && !isSavingProfile}
              />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isLoadingProfile && !isSavingProfile}
              />
              <Text style={styles.inputLabel}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Opcional"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                editable={!isLoadingProfile && !isSavingProfile}
              />
              {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
              <Pressable
                onPress={handleSaveProfile}
                disabled={isLoadingProfile || isSavingProfile}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || isSavingProfile) && styles.pressed,
                  (isLoadingProfile || isSavingProfile) && styles.disabled,
                ]}>
                {isSavingProfile ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar datos</Text>
                )}
              </Pressable>
                </View>
          </ScrollView>
        </ModalSheet>

        <ModalSheet
          visible={isPasswordModalVisible}
          onClose={() => setIsPasswordModalVisible(false)}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cambiar contraseña</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={() => setIsPasswordModalVisible(false)}
                  style={styles.modalCloseButton}
                  hitSlop={8}>
                  <Ionicons name="close" size={24} color="#CBD5E1" />
                </Pressable>
              </View>
              <Text style={styles.modalDescription}>Elegí una contraseña segura de al menos 6 caracteres.</Text>
              <Text style={styles.inputLabel}>Contraseña actual</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Ingresá tu contraseña actual"
                placeholderTextColor="#64748B"
                secureTextEntry
                autoComplete="current-password"
                textContentType="password"
                editable={!isChangingPassword}
              />
              <Text style={styles.inputLabel}>Nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748B"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isChangingPassword}
              />
              <Text style={styles.inputLabel}>Repetir nueva contraseña</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repetí la nueva contraseña"
                placeholderTextColor="#64748B"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isChangingPassword}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              <Pressable
                onPress={handleChangePassword}
                disabled={isChangingPassword}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  (pressed || isChangingPassword) && styles.pressed,
                  isChangingPassword && styles.disabled,
                ]}>
                {isChangingPassword ? (
                  <ActivityIndicator color="#C4B5FD" />
                ) : (
                  <Text style={styles.secondaryButtonText}>Cambiar contraseña</Text>
                )}
              </Pressable>
                </View>
          </ScrollView>
        </ModalSheet>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}>
          <Ionicons name="log-out-outline" size={19} color="#FCA5A5" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SlateColors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, gap: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: SlateColors.surface, justifyContent: 'center', alignItems: 'center' },
  headerSpacer: { width: 38 },
  title: { color: SlateColors.text, ...Typography.heading },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: SlateColors.surfaceRaised, borderRadius: Radius.extraLarge, borderWidth: 1, borderColor: '#1E40AF', padding: 18 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#0284C7', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { color: SlateColors.text, fontSize: 19, fontWeight: '700' },
  profileEmail: { color: '#BAE6FD', fontSize: 13 },
  sectionTitle: { color: '#F8FAFC', fontSize: 17, fontWeight: '700' },
  settingsCard: { backgroundColor: SlateColors.surface, borderRadius: Radius.large, borderWidth: 1, borderColor: SlateColors.border, paddingHorizontal: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  blueIcon: { backgroundColor: '#0C4A6E' },
  purpleIcon: { backgroundColor: '#4C1D95' },
  actionCopy: { flex: 1, gap: 4 },
  actionTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },
  actionDescription: { color: '#94A3B8', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#334155' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: SlateColors.surface, borderTopLeftRadius: Radius.sheet, borderTopRightRadius: Radius.sheet, padding: 20, gap: 10 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalCloseButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '700' },
  modalDescription: { color: '#94A3B8', fontSize: 13, lineHeight: 18, marginBottom: 6 },
  inputLabel: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },
  input: { backgroundColor: '#0F172A', borderRadius: 10, borderWidth: 1, borderColor: '#475569', color: '#F8FAFC', paddingHorizontal: 13, paddingVertical: 12, fontSize: 14 },
  errorText: { color: '#FCA5A5', fontSize: 12, lineHeight: 17 },
  primaryButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#0284C7', borderRadius: 11, minHeight: 46, paddingHorizontal: 16, marginTop: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#4C1D95', borderRadius: 11, minHeight: 46, paddingHorizontal: 16, marginTop: 4 },
  secondaryButtonText: { color: '#EDE9FE', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#450A0A', borderRadius: 14, borderWidth: 1, borderColor: '#7F1D1D', paddingVertical: 15 },
  logoutText: { color: '#FCA5A5', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});

export default SettingsScreen;
