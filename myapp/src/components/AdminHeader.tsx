import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

interface AdminHeaderProps {
  title: string;
  onBack?: () => void;
  actionIcon?: string;
  onAction?: () => void;
  actionBadge?: string;
}

export default function AdminHeader({ title, onBack, actionIcon, onAction, actionBadge }: AdminHeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.primary} />
      <TouchableOpacity style={styles.backButton} onPress={onBack || (() => router.back())}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {actionIcon ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Ionicons name={actionIcon as any} size={24} color="white" />
          {actionBadge ? (
            <View style={styles.badge}><Text style={styles.badgeText}>{actionBadge}</Text></View>
          ) : null}
        </TouchableOpacity>
      ) : <View style={{ width: 32 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary,
    borderBottomLeftRadius: Theme.borderRadius.xxl,
    borderBottomRightRadius: Theme.borderRadius.xxl,
    ...Theme.shadows.small,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 32,
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#FF5252',
    borderRadius: 8,
    paddingHorizontal: 4,
    marginLeft: 2,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 