import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useThemeMode } from '../theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { mode, toggle, theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: 12 + insets.top }] }>
      <Text style={[styles.title, { color: theme.colors.text }]}>Cài đặt</Text>
      <View style={[styles.row, { borderColor: theme.colors.border } ]}>
        <Text style={[styles.rowText, { color: theme.colors.text }]}>Chế độ tối</Text>
        <Switch value={mode === 'dark'} onValueChange={toggle} trackColor={{ true: theme.colors.primary }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1 },
  rowText: { fontSize: 16 },
});


