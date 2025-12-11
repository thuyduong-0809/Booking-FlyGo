import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { updateUser } from '../../stores/slices/authSlice';

export default function ProfileScreen({ navigation }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'male',
  });

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ');
      return;
    }

    dispatch(updateUser(formData));
    setIsEditing(false);
    Alert.alert('Thành công', 'Cập nhật thông tin thành công');
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || 'male',
    });
    setIsEditing(false);
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Camera', onPress: () => console.log('Camera') },
        { text: 'Thư viện', onPress: () => console.log('Gallery') }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.notAuthenticatedContainer}>
          <Ionicons name="person-circle-outline" size={80} color={theme.colors.textMuted} />
          <Text style={[styles.notAuthenticatedTitle, { color: theme.colors.text }]}>
            Đăng nhập để xem thông tin
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderField = (label, value, key, placeholder, keyboardType = 'default') => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }
          ]}
          value={formData[key]}
          onChangeText={(text) => setFormData(prev => ({ ...prev, [key]: text }))}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          keyboardType={keyboardType}
        />
      ) : (
        <View style={[styles.fieldValue, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldText, { color: value ? theme.colors.text : theme.colors.textMuted }]}>
            {value || placeholder}
          </Text>
        </View>
      )}
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Giới tính</Text>
      {isEditing ? (
        <View style={styles.genderContainer}>
          {[
            { key: 'male', label: 'Nam' },
            { key: 'female', label: 'Nữ' },
            { key: 'other', label: 'Khác' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.genderOption,
                {
                  backgroundColor: formData.gender === option.key ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, gender: option.key }))}
            >
              <Text
                style={[
                  styles.genderText,
                  { color: formData.gender === option.key ? '#fff' : theme.colors.text }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={[styles.fieldValue, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.fieldText, { color: theme.colors.text }]}>
            {formData.gender === 'male' ? 'Nam' :
              formData.gender === 'female' ? 'Nữ' : 'Khác'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="person" size={40} color={theme.colors.primary} />
                </View>
              )}
              <View style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.fullName || 'Người dùng'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, { backgroundColor: theme.colors.card }]}>
            {renderField('Họ và tên', formData.fullName, 'fullName', 'Nhập họ và tên')}
            {renderField('Email', formData.email, 'email', 'Nhập email', 'email-address')}
            {renderField('Số điện thoại', formData.phoneNumber, 'phoneNumber', 'Nhập số điện thoại', 'phone-pad')}

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Ngày sinh</Text>
              {isEditing ? (
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => Alert.alert('Chọn ngày sinh', 'Tính năng đang phát triển')}
                >
                  <Text
                    style={[
                      styles.dateText,
                      { color: formData.dateOfBirth ? theme.colors.text : theme.colors.textMuted }
                    ]}
                  >
                    {formData.dateOfBirth || 'Chọn ngày sinh'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.fieldValue, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[
                    styles.fieldText,
                    { color: formData.dateOfBirth ? theme.colors.text : theme.colors.textMuted }
                  ]}>
                    {formData.dateOfBirth || 'Chưa cập nhật'}
                  </Text>
                </View>
              )}
            </View>

            {renderGenderSelector()}
          </View>

          {/* Account Info Section */}
          <View style={[styles.infoSection, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Thông tin tài khoản
            </Text>

            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
              <View style={styles.infoText}>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                  Xác thực email
                </Text>
                <Text style={[styles.infoDescription, { color: theme.colors.success }]}>
                  Đã xác thực
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color={theme.colors.textMuted} />
              <View style={styles.infoText}>
                <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
                  Thành viên từ
                </Text>
                <Text style={[styles.infoDescription, { color: theme.colors.textMuted }]}>
                  Tháng 1, 2024
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  notAuthenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  notAuthenticatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  formSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  fieldValue: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fieldText: {
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});