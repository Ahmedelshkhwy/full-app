import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'عذراً!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>هذه الصفحة غير موجودة.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>العودة للصفحة الرئيسية</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#23b7c9',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: '#007aff',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});