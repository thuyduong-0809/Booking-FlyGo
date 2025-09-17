import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeMode } from '../theme/ThemeProvider';

export function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: 12 + insets.top }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Tài khoản</Text>
      <Text style={[styles.desc, { color: theme.colors.textMuted }]}>Quản lý thông tin cá nhân, đặt chỗ và ưu đãi.</Text>
    </View>
  );
}

export function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: 12 + insets.top }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Giới thiệu</Text>
      <Text style={[styles.desc, { color: theme.colors.textMuted }]}>FlyGo mang trải nghiệm đặt vé nhanh chóng, an toàn và tiện lợi.</Text>
    </View>
  );
}

export function ContactScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: 12 + insets.top }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Liên hệ</Text>
      <Text style={[styles.desc, { color: theme.colors.textMuted }]}>Email: support@flygo.app - Hotline: 1900 1234</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '800' },
  desc: { color: '#94a3b8', marginTop: 8 },
});


