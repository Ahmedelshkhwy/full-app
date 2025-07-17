import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

type ThemedViewProps = ViewProps & {
  children: React.ReactNode;
};

export const ThemedView: React.FC<ThemedViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.view, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  view: {
    backgroundColor: '#fff', // يمكنك تخصيص اللون حسب الثيم
    flex: 1,
  },
});

export default ThemedView;