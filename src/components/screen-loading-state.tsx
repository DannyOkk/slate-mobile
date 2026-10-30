import { StyleSheet, Text, View } from 'react-native';

import { SlateColors, Typography } from '@/constants/theme';

interface ScreenLoadingStateProps {
  label: string;
  rows?: number;
}

export function ScreenLoadingState({ label, rows = 3 }: ScreenLoadingStateProps) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <View style={styles.heroSkeleton} />
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.rowSkeleton}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.copySkeleton}>
            <View style={styles.titleSkeleton} />
            <View style={styles.subtitleSkeleton} />
          </View>
        </View>
      ))}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 20,
  },
  heroSkeleton: {
    height: 108,
    borderRadius: 16,
    backgroundColor: SlateColors.surface,
    opacity: 0.8,
  },
  rowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: SlateColors.surface,
    opacity: 0.72,
  },
  avatarSkeleton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SlateColors.border,
  },
  copySkeleton: {
    flex: 1,
    gap: 8,
  },
  titleSkeleton: {
    width: '58%',
    height: 14,
    borderRadius: 7,
    backgroundColor: SlateColors.border,
  },
  subtitleSkeleton: {
    width: '78%',
    height: 10,
    borderRadius: 5,
    backgroundColor: SlateColors.border,
  },
  label: {
    ...Typography.caption,
    color: SlateColors.textSecondary,
    textAlign: 'center',
  },
});
