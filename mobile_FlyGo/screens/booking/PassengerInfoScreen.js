import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { updatePassengers, updateContactInfo, setBookingStep } from '../../stores/slices/bookingSlice';

export default function PassengerInfoScreen({ navigation }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { currentBooking } = useAppSelector(state => state.bookings);

  const [passengers, setPassengers] = useState([
    {
      id: '1',
      title: 'Ông',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'VN',
      passportNumber: '',
      passportExpiry: '',
      type: 'adult',
    }
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate passengers
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        newErrors[`passenger_${index}_firstName`] = 'Vui lòng nhập tên';
      }
      if (!passenger.lastName.trim()) {
        newErrors[`passenger_${index}_lastName`] = 'Vui lòng nhập họ';
      }
      if (!passenger.dateOfBirth.trim()) {
        newErrors[`passenger_${index}_dateOfBirth`] = 'Vui lòng nhập ngày sinh';
      }
    });

    // Validate contact info
    if (!contactInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!contactInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(contactInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    dispatch(updatePassengers(passengers));
    dispatch(updateContactInfo(contactInfo));
    dispatch(setBookingStep('payment'));
    navigation.navigate('Payment');
  };

  const updatePassenger = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    };
    setPassengers(updatedPassengers);

    // Clear error for this field
    const errorKey = `passenger_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const updateContact = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderPassengerForm = (passenger, index) => (
    <View key={index} style={[styles.passengerCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.passengerTitle, { color: theme.colors.text }]}>
        Hành khách {index + 1}
      </Text>

      {/* Title Selection */}
      <View style={styles.titleContainer}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Danh xưng</Text>
        <View style={styles.titleButtons}>
          {['Ông', 'Bà', 'Cô'].map((title) => (
            <TouchableOpacity
              key={title}
              style={[
                styles.titleButton,
                {
                  backgroundColor: passenger.title === title ? theme.colors.primary : 'transparent',
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => updatePassenger(index, 'title', title)}
            >
              <Text
                style={[
                  styles.titleButtonText,
                  { color: passenger.title === title ? '#fff' : theme.colors.text }
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Name Fields */}
      <View style={styles.nameRow}>
        <View style={styles.nameField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Tên *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors[`passenger_${index}_firstName`] ? '#ef4444' : theme.colors.border,
                color: theme.colors.text,
              }
            ]}
            value={passenger.firstName}
            onChangeText={(text) => updatePassenger(index, 'firstName', text)}
            placeholder="Nhập tên"
            placeholderTextColor={theme.colors.textMuted}
          />
          {errors[`passenger_${index}_firstName`] && (
            <Text style={styles.errorText}>{errors[`passenger_${index}_firstName`]}</Text>
          )}
        </View>

        <View style={styles.nameField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Họ *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: errors[`passenger_${index}_lastName`] ? '#ef4444' : theme.colors.border,
                color: theme.colors.text,
              }
            ]}
            value={passenger.lastName}
            onChangeText={(text) => updatePassenger(index, 'lastName', text)}
            placeholder="Nhập họ"
            placeholderTextColor={theme.colors.textMuted}
          />
          {errors[`passenger_${index}_lastName`] && (
            <Text style={styles.errorText}>{errors[`passenger_${index}_lastName`]}</Text>
          )}
        </View>
      </View>

      {/* Date of Birth */}
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Ngày sinh *</Text>
        <TouchableOpacity
          style={[
            styles.dateInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: errors[`passenger_${index}_dateOfBirth`] ? '#ef4444' : theme.colors.border,
            }
          ]}
          onPress={() => {
            // In real app, show date picker
            Alert.alert('Chọn ngày sinh', 'Tính năng đang phát triển');
          }}
        >
          <Text
            style={[
              styles.dateText,
              { color: passenger.dateOfBirth ? theme.colors.text : theme.colors.textMuted }
            ]}
          >
            {passenger.dateOfBirth || 'Chọn ngày sinh'}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
        {errors[`passenger_${index}_dateOfBirth`] && (
          <Text style={styles.errorText}>{errors[`passenger_${index}_dateOfBirth`]}</Text>
        )}
      </View>

      {/* Nationality */}
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Quốc tịch</Text>
        <TouchableOpacity
          style={[
            styles.selectInput,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
          ]}
          onPress={() => {
            Alert.alert('Chọn quốc tịch', 'Tính năng đang phát triển');
          }}
        >
          <Text style={[styles.selectText, { color: theme.colors.text }]}>
            {passenger.nationality === 'VN' ? 'Việt Nam' : passenger.nationality}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContactForm = () => (
    <View style={[styles.contactCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Thông tin liên hệ
      </Text>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Email *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: errors.email ? '#ef4444' : theme.colors.border,
              color: theme.colors.text,
            }
          ]}
          value={contactInfo.email}
          onChangeText={(text) => updateContact('email', text)}
          placeholder="example@email.com"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Số điện thoại *</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: errors.phone ? '#ef4444' : theme.colors.border,
              color: theme.colors.text,
            }
          ]}
          value={contactInfo.phone}
          onChangeText={(text) => updateContact('phone', text)}
          placeholder="0123 456 789"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {passengers.map((passenger, index) => renderPassengerForm(passenger, index))}
          {renderContactForm()}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  passengerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passengerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  titleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  titleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  continueButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});