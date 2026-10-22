import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RiskLevel } from '@/types/client';

interface RiskBadgeProps {
  level?: RiskLevel;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

interface RiskConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  BAJO: {
    label: 'Riesgo Bajo',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    textColor: '#34D399',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    iconName: 'shield-checkmark',
  },
  MEDIO: {
    label: 'Riesgo Medio',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    textColor: '#FBBF24',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    iconName: 'shield',
  },
  ALTO: {
    label: 'Riesgo Alto',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    textColor: '#F87171',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    iconName: 'alert-circle',
  },
};

export function RiskBadge({
  level = 'BAJO',
  size = 'medium',
  showIcon = true,
}: RiskBadgeProps) {
  const config = RISK_CONFIG[level] || RISK_CONFIG.BAJO;
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          paddingHorizontal: isSmall ? 7 : 10,
          paddingVertical: isSmall ? 2.5 : 4,
          borderRadius: isSmall ? 6 : 8,
        },
      ]}>
      {showIcon && (
        <Ionicons
          name={config.iconName}
          size={isSmall ? 11 : 14}
          color={config.textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.textColor,
            fontSize: isSmall ? 10 : 12,
            fontWeight: isSmall ? '600' : '700',
          },
        ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    letterSpacing: 0.1,
  },
});

export default RiskBadge;
