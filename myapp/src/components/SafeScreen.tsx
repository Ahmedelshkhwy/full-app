import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
}

export default function SafeScreen({ 
  children, 
  backgroundColor = '#E6F3F7',
  edges = ['top'],
  style
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();
  
  const dynamicStyle: ViewStyle = {
    backgroundColor,
    ...(edges.includes('top') && { paddingTop: insets.top }),
    ...(edges.includes('bottom') && { paddingBottom: insets.bottom }),
    ...(edges.includes('left') && { paddingLeft: insets.left }),
    ...(edges.includes('right') && { paddingRight: insets.right }),
  };
  
  return (
    <SafeAreaView style={[styles.container, dynamicStyle, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});