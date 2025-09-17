import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeMode } from '../theme/ThemeProvider';

const MOCK_FLIGHTS = [
  { id: 'VN123', from: 'SGN', to: 'HAN', time: '07:30 - 09:40', price: '1.250.000đ', logo: require('../assets/image/flygo.png') },
  { id: 'VJ456', from: 'SGN', to: 'DAD', time: '12:10 - 13:30', price: '980.000đ', logo: require('../assets/image/flygo_2.png') },
  { id: 'QH789', from: 'HAN', to: 'PQC', time: '18:00 - 20:10', price: '1.450.000đ', logo: require('../assets/image/flygo_3.png') },
  { id: 'VN234', from: 'DAD', to: 'SGN', time: '09:00 - 10:20', price: '1.020.000đ', logo: require('../assets/image/flygo.png') },
];

export default function FlightsScreen({ navigation, route }) {
  const params = route?.params || {};
  const insets = useSafeAreaInsets();
  const { theme } = useThemeMode();
  const normalized = (s) => (s || '').split(' ')[0];
  const from = normalized(params.from);
  const to = normalized(params.to);
  const filtered = MOCK_FLIGHTS.filter((f) => (!from || f.from === from) && (!to || f.to === to));
  const list = filtered.length ? filtered : MOCK_FLIGHTS;
  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.colors.background }]} contentContainerStyle={[styles.content, { paddingTop: 12 + insets.top }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Chuyến bay</Text>
      {Boolean(params.from || params.to) && (
        <Text style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
          {params.from || '...'} → {params.to || '...'} • {params.date || 'Chọn ngày'}
        </Text>
      )}
      <View style={styles.searchRow}>
        <View style={styles.inputCol}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Nơi đi</Text>
          <TextInput placeholder="SGN" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.card }]} />
        </View>
        <View style={styles.inputCol}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Nơi đến</Text>
          <TextInput placeholder="HAN" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.card }]} />
        </View>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.inputCol}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Ngày đi</Text>
          <TextInput placeholder="20/09/2025" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.card }]} />
        </View>
        <View style={styles.inputCol}>
          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Hành khách</Text>
          <TextInput placeholder="1 người lớn" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.card }]} />
        </View>
      </View>
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryTxt}>Tìm chuyến</Text>
      </TouchableOpacity>

      <Text style={[styles.subTitle, { color: theme.colors.text }]}>Kết quả nổi bật</Text>
      {list.map((f) => (
        <TouchableOpacity key={f.id} style={[styles.card, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('FlightDetail', { id: f.id })}>
          <Image source={f.logo} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{f.from} → {f.to}</Text>
            <Text style={[styles.cardSub, { color: theme.colors.textMuted }]}>{f.id} • {f.time}</Text>
          </View>
          <Text style={styles.price}>{f.price}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  searchRow: { flexDirection: 'row', marginBottom: 12 },
  // spacing between inputs
  
  inputCol: { flex: 1, marginRight: 12 },
  
  label: { fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12 },
  primaryBtn: { backgroundColor: '#5b6cff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', padding: 12, borderRadius: 12, marginBottom: 10 },
  logo: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  cardTitle: { fontWeight: '700' },
  cardSub: { marginTop: 4 },
  price: { color: '#34d399', fontWeight: '800' },
});


