import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

import { Radius, SlateColors } from '@/constants/theme';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  scroll?: boolean;
}

export function ModalSheet({ visible, onClose, children, scroll = false }: ModalSheetProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}>
          <View style={styles.content}>{content}</View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: SlateColors.scrim,
  },
  keyboardContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  content: {
    backgroundColor: SlateColors.surface,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    borderWidth: 1,
    borderColor: SlateColors.border,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
