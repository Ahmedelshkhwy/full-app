import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';
import SafeScreen from './SafeScreen';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  showSafeArea?: boolean;
}

export default function AppHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  backgroundColor = Theme.colors.primary,
  titleColor = Theme.colors.white,
  showSafeArea = true
}: AppHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const HeaderContent = (
    <>
      <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
      <View style={[styles.header, { backgroundColor }]}>
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color={titleColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacer} />
          )}
          
          <Text style={[styles.headerTitle, { color: titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          
          {rightComponent ? (
            <View style={styles.rightComponent}>
              {rightComponent}
            </View>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>
      </View>
    </>
  );

  if (showSafeArea) {
    return (
      <SafeScreen backgroundColor={backgroundColor} edges={['top']}>
        {HeaderContent}
      </SafeScreen>
    );
  }

  return HeaderContent;
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  rightComponent: {
    width: 40,
    alignItems: 'center',
  },
});