import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface ErrorComponentProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  showRetryButton?: boolean;
}

export default function ErrorComponent({
  message = 'حدث خطأ غير متوقع',
  onRetry,
  retryText = 'إعادة المحاولة',
  iconName = 'alert-circle',
  showRetryButton = true
}: ErrorComponentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.errorBox}>
        <Ionicons 
          name={iconName} 
          size={64} 
          color={Theme.colors.status.error} 
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
        {showRetryButton && onRetry && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color={Theme.colors.white} />
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.lg,
  },
  errorBox: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
    maxWidth: 300,
  },
  icon: {
    marginBottom: Theme.spacing.md,
    opacity: 0.8,
  },
  message: {
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  retryText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.semibold,
  },
});
