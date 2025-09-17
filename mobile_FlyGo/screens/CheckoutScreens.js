import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export function CheckoutScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Thanh toán</Text>
      <View style={styles.card}>
        <Text style={styles.row}>Hành khách: 1 người lớn</Text>
        <Text style={styles.row}>Tổng tiền: 1.250.000đ</Text>
      </View>
      <Text style={[styles.title, { fontSize: 16, marginTop: 16 }]}>Thông tin liên hệ</Text>
      <TextInput placeholder="Họ và tên" placeholderTextColor="#94a3b8" style={styles.input} />
      <TextInput placeholder="Số điện thoại" placeholderTextColor="#94a3b8" style={styles.input} />
      <TextInput placeholder="Email" placeholderTextColor="#94a3b8" style={styles.input} />
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.replace('PayDone')}>
        <Text style={styles.primaryTxt}>Thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PayDoneScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Thanh toán thành công 🎉</Text>
      <Text style={{ color: '#94a3b8', marginTop: 8 }}>Vé đã được gửi về email của bạn.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '800' },
  card: { backgroundColor: '#0f172a', borderRadius: 12, padding: 16, marginTop: 12 },
  row: { color: '#e5e7eb', marginBottom: 8 },
  input: { color: '#e5e7eb', backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginTop: 10 },
  primaryBtn: { backgroundColor: '#5b6cff', paddingVertical: 12, borderRadius: 12, marginTop: 16, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
});


