import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RiskBadge } from '@/components/RiskBadge';
import { Shadows } from '@/constants/theme';
import { Client } from '@/types/client';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onPress?: (client: Client) => void;
}

// Colores de acento dinámicos para los avatares según el nombre
const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EC4899', // Pink
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function ClientCard({ client, onEdit, onDelete, onPress }: ClientCardProps) {
  const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';
  const avatarBg = getAvatarColor(client.name);

  const handleCall = () => {
    if (client.phone) {
      Linking.openURL(`tel:${client.phone}`).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      <Pressable
        style={({ pressed }) => [styles.cardMain, pressed && Boolean(onPress) && styles.cardMainPressed]}
        onPress={() => onPress?.(client)}>
        {/* Avatar distintivo */}
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        {/* Información central */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameWithBadge}>
              <Text style={styles.name} numberOfLines={1}>
                {client.name}
              </Text>
              {client.riskLevel ? (
                <RiskBadge level={client.riskLevel} size="small" />
              ) : null}
            </View>
            {onPress && (
              <Ionicons name="chevron-forward" size={18} color="#64748B" />
            )}
          </View>

          {/* Teléfono */}
          {client.phone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Llamar a ${client.name}`}
              onPress={handleCall}
              style={({ pressed }) => [styles.detailRow, pressed && styles.detailPressed]}
              hitSlop={4}>
              <Ionicons name="call-outline" size={14} color="#38BDF8" />
              <Text style={styles.phoneText}>{client.phone}</Text>
            </Pressable>
          ) : (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={14} color="#64748B" />
              <Text style={styles.emptyText}>Sin teléfono</Text>
            </View>
          )}

          {/* Dirección */}
          {client.address ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#94A3B8" />
              <Text style={styles.addressText} numberOfLines={1}>
                {client.address}
              </Text>
            </View>
          ) : null}

          {/* Notas (si existen) */}
          {client.notes ? (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text-outline" size={13} color="#FBBF24" />
              <Text style={styles.notesText} numberOfLines={2}>
                {client.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* Botones de acción lateral/inferior */}
      <View style={styles.actionsContainer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Editar a ${client.name}`}
          style={({ pressed }) => [
            styles.actionButton,
            styles.editButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onEdit(client)}
          hitSlop={6}>
          <Ionicons name="pencil" size={15} color="#38BDF8" />
          <Text style={styles.editText}>Editar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar a ${client.name}`}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onDelete(client)}
          hitSlop={6}>
          <Ionicons name="trash-outline" size={15} color="#EF4444" />
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#172033',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  cardMainPressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
    gap: 5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailPressed: {
    opacity: 0.7,
  },
  phoneText: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  addressText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  notesText: {
    fontSize: 12,
    color: '#FDE68A',
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default ClientCard;
