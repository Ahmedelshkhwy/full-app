import React from 'react';
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      presentation: 'modal',
    }}>
      <Stack.Screen name="checkout" />
      <Stack.Screen name="product-details" />
      <Stack.Screen name="order-details" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
} 