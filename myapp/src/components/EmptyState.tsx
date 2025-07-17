import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          color="#ccc" 
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {showAction && onAction && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onAction}
          >
            <Ionicons name="refresh" size={18} color="#23B6C7" />
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
    padding: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#23B6C7',
    gap: 8,
  },
  actionText: {
    color: '#23B6C7',
    fontSize: 16,
    fontWeight: '600',
  },
});
