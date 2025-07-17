import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/cartcontext';
import { OrdersProvider } from './src/contexts/OrdersContext';
import useColorScheme from './src/hooks/useColorScheme';
import { Slot } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <AuthProvider>
            <OrdersProvider>
                <CartProvider>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <Slot />
                    </ThemeProvider>
                </CartProvider>
            </OrdersProvider>
        </AuthProvider>
    );
}