import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  iconName = 'document-outline',
  title = 'لا توجد بيانات',
  subtitle = 'لا توجد عناصر لعرضها في الوقت الحالي',
  actionText = 'إعادة التحميل',
  onAction,
  showAction = true
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={iconName} 
          size={80} 
          color={Theme.colors.gray[300]} 
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {showAction && onAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onAction}
          >
            <Ionicons name="refresh" size={18} color={Theme.colors.primary} />
            <Text style={styles.actionText}>{actionText}</Text>
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
    padding: Theme.spacing.xxl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: Theme.spacing.lg,
    opacity: 0.6,
  },
  title: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.gray[700],
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    color: Theme.colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Theme.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    gap: Theme.spacing.sm,
  },
  actionText: {
    color: Theme.colors.primary,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semiBold,
  },
});
