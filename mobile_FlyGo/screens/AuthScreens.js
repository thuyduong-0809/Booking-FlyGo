import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94a3b8" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" placeholderTextColor="#94a3b8" secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryTxt}>Đăng nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{ marginTop: 12 }}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Đăng ký</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94a3b8" style={styles.input} />
      <TextInput value={password} onChangeText={setPassword} placeholder="Mật khẩu" placeholderTextColor="#94a3b8" secureTextEntry style={styles.input} />
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryTxt}>Tạo tài khoản</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0b1220', padding: 16 },
  title: { color: '#e5e7eb', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  input: { color: '#e5e7eb', backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 10 },
  primaryBtn: { backgroundColor: '#5b6cff', paddingVertical: 12, borderRadius: 12, marginTop: 8, alignItems: 'center' },
  primaryTxt: { color: '#fff', fontWeight: '700' },
  link: { color: '#93c5fd' },
});


