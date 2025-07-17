import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          color="#E94B7B" 
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
        {showRetryButton && onRetry && (
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRetry}
          >
            <Ionicons name="refresh" size={20} color="white" />
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
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 300,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23B6C7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
