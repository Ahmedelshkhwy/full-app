import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';

export default function TabLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 12,
          paddingTop: 12,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen 
        name="home/index" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'الرئيسية',
        }}
      />
      <Tabs.Screen 
        name="offers/index" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
          tabBarLabel: 'العروض',
        }}
      />
      <Tabs.Screen 
        name="cart/index" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarLabel: 'السلة',
        }}
      />
      <Tabs.Screen 
        name="e-medicin/index" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse-outline" size={size} color={color} />
          ),
          tabBarLabel: 'الطبيب',
        }}
      />
      <Tabs.Screen 
        name="profile/index" 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: 'حسابي',
        }}
      />
      {isAdmin && (
        <Tabs.Screen 
          name="admin" 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
            tabBarLabel: 'الإدارة',
          }}
        />
      )}
    </Tabs>
  );
}