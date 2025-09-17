import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FlightDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Chi tiết chuyến bay</Text>
      <Text style={styles.sub}>Mã chuyến: {id}</Text>
      <View style={styles.card}>
        <Text style={styles.row}>SGN → HAN</Text>
        <Text style={styles.row}>Giờ bay: 07:30 - 09:40</Text>
        <Text style={styles.row}>Giá: 1.250.000đ</Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Checkout')}>
        <Text style={styles.primaryTxt}>Chọn và tiếp tục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '800' },
  sub: { color: '#94a3b8', marginTop: 8, marginBottom: 16 },
  card: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16 },
  row: { color: '#e5e7eb', marginBottom: 10 },
  primaryBtn: { backgroundColor: '#5b6cff', paddingVertical: 12, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
});


