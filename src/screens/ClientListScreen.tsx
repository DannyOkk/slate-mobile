import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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

import { ClientCard } from '@/components/clients/ClientCard';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { ScreenLoadingState } from '@/components/screen-loading-state';
import { MaxContentWidth, Shadows } from '@/constants/theme';
import { clientService } from '@/services/clientService';
import { Client, ClientFormData } from '@/types/client';

export function ClientListScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado del Modal de Formulario
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Carga inicial de clientes
  const fetchClients = useCallback(async (showFullLoader = true) => {
    try {
      if (showFullLoader) setIsLoading(true);
      const data = await clientService.getClients();
      setClients(data);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'No se pudieron cargar los clientes. Verificá la conexión con el servidor.';
      Alert.alert('Error al cargar', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients(true);
  }, [fetchClients]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchClients(false);
  };

  // Filtrado de clientes en tiempo real
  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients;

    return clients.filter((c) => {
      const matchName = c.name?.toLowerCase().includes(q);
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchAddress = c.address?.toLowerCase().includes(q);
      return matchName || matchPhone || matchAddress;
    });
  }, [clients, searchQuery]);

  // Apertura de modal para creación
  const handleOpenCreateModal = () => {
    setSelectedClient(null);
    setIsModalVisible(true);
  };

  // Apertura de modal para edición
  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsModalVisible(true);
  };

  // Guardado de cliente (Creación o Edición)
  const handleSaveClient = async (formData: ClientFormData, id?: number) => {
    if (id) {
      // Modo Edición
      const updated = await clientService.updateClient(id, formData);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      Alert.alert('Éxito', `Cliente "${updated.name}" actualizado correctamente.`);
    } else {
      // Modo Creación
      const created = await clientService.createClient(formData);
      setClients((prev) => [created, ...prev]);
      Alert.alert('Éxito', `Cliente "${created.name}" registrado con éxito.`);
    }
  };

  // Eliminación con confirmación
  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de que deseás eliminar a "${client.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientService.deleteClient(client.id);
              setClients((prev) => prev.filter((c) => c.id !== client.id));
              Alert.alert('Eliminado', 'El cliente ha sido eliminado.');
            } catch (error: any) {
              const msg =
                error?.response?.data?.message ||
                'No se pudo eliminar el cliente. Intentá nuevamente.';
              Alert.alert('Error al eliminar', msg);
            }
          },
        },
      ]
    );
  };

  // Navegación al detalle y cuenta corriente del cliente
  const handleSelectClient = (client: Client) => {
    router.push({
      pathname: '/client-detail',
      params: {
        clientId: client.id.toString(),
        clientName: client.name,
        clientPhone: client.phone || '',
        clientAddress: client.address || '',
        riskLevel: client.riskLevel || 'BAJO',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabecera Principal */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View>
            <Text style={styles.headerTitle}>Clientes</Text>
            <Text style={styles.headerSubtitle}>
              {clients.length === 1 ? '1 cliente registrado' : `${clients.length} clientes registrados`}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleOpenCreateModal}
            style={({ pressed }) => [styles.headerAddButton, pressed && styles.pressed]}
            hitSlop={6}>
            <Ionicons name="person-add" size={16} color="#FFFFFF" />
            <Text style={styles.headerAddButtonText}>Nuevo</Text>
          </Pressable>
        </View>
      </View>

      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          accessibilityLabel="Buscar clientes"
          accessibilityHint="Filtra por nombre, teléfono o dirección"
          placeholder="Buscar por nombre, teléfono o dirección..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda de clientes"
            onPress={() => setSearchQuery('')}
            hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      {/* Contenido Principal */}
      {isLoading ? (
        <ScreenLoadingState label="Cargando cartera de clientes..." />
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteClient}
              onPress={handleSelectClient}
            />
          )}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={searchQuery ? 'search-outline' : 'people-outline'}
                  size={42}
                  color="#64748B"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Sin coincidencias' : 'Aún no tenés clientes'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No se encontraron clientes que coincidan con "${searchQuery}".`
                  : 'Agregá a tus clientes para comenzar a llevar el registro de sus fiados y cuentas corrientes.'}
              </Text>

              {!searchQuery && (
                <Pressable
                  style={({ pressed }) => [
                    styles.emptyActionButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleOpenCreateModal}>
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyActionButtonText}>Crear primer cliente</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      {/* Botón Flotante (FAB) */}
      {!isLoading && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Crear nuevo cliente"
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          onPress={handleOpenCreateModal}
          hitSlop={8}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Modal de Creación / Edición */}
      <ClientFormModal
        visible={isModalVisible}
        clientToEdit={selectedClient}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveClient}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#208AEF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
    ...Shadows.accentCompact,
  },
  headerAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    maxWidth: MaxContentWidth - 40,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#334155',
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90, // Espacio para el FAB
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 18,
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
    maxWidth: 290,
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
    ...Shadows.accent,
  },
  emptyActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.accentRaised,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  pressed: {
    opacity: 0.75,
  },
});

export default ClientListScreen;
