import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  color = '#23B6C7',
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
    backgroundColor: '#f5f5f5',
  },
  loadingBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
