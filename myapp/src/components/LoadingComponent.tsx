import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../constants/Theme';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  showIcon?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function LoadingComponent({
  message = 'جاري التحميل...',
  size = 'large',
  color = Theme.colors.primary,
  showIcon = true,
  iconName = 'refresh'
}: LoadingComponentProps) {
  return (
    <View style={styles.container}>
      <View style={styles.loadingBox}>
        {showIcon && (
          <Ionicons 
            name={iconName} 
            size={48} 
            color={color} 
            style={styles.icon}
          />
        )}
        <ActivityIndicator 
          size={size} 
          color={color} 
          style={styles.spinner}
        />
        <Text style={[styles.message, { color }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.gray[100],
  },
  loadingBox: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    ...Theme.shadows.medium,
    minWidth: 200,
  },
  icon: {
    marginBottom: Theme.spacing.md,
    opacity: 0.8,
  },
  spinner: {
    marginBottom: Theme.spacing.md,
  },
  message: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
    textAlign: 'center',
  },
});
