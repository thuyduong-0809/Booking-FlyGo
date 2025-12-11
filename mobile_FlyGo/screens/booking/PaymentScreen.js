import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { updatePayment, confirmBooking, setBookingStep } from '../../stores/slices/bookingSlice';

const PAYMENT_METHODS = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: 'card',
    description: 'Thanh toán qua VNPay',
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: 'phone-portrait',
    description: 'Thanh toán qua ví MoMo',
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng',
    icon: 'card',
    description: 'Visa, Mastercard, JCB',
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business',
    description: 'Chuyển khoản trực tiếp',
  },
];

export default function PaymentScreen({ navigation }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { currentBooking } = useAppSelector(state => state.bookings);
  const { selectedOutboundFlight } = useAppSelector(state => state.flights);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    if (!currentBooking || !selectedOutboundFlight) return 0;

    const basePrice = selectedOutboundFlight.price.economy;
    const seatFees = currentBooking.flights.outbound.seats?.reduce((total, seat) => total + (seat.price || 0), 0) || 0;
    const taxes = basePrice * 0.1; // 10% tax
    const serviceFee = 50000; // Service fee

    return basePrice + seatFees + taxes + serviceFee;
  };

  const handlePayment = () => {
    if (!selectedPayment) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const bookingReference = `FG${Date.now().toString().slice(-6)}`;

      dispatch(updatePayment({
        method: selectedPayment.name,
        status: 'completed',
        totalAmount: calculateTotal(),
      }));

      dispatch(confirmBooking({
        id: `booking_${Date.now()}`,
        bookingReference,
      }));

      setIsProcessing(false);
      navigation.navigate('BookingConfirmation');
    }, 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderFlightSummary = () => (
    <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
        Thông tin chuyến bay
      </Text>

      <View style={styles.flightInfo}>
        <View style={styles.flightRoute}>
          <Text style={[styles.flightText, { color: theme.colors.text }]}>
            {selectedOutboundFlight?.departure.airport.code} → {selectedOutboundFlight?.arrival.airport.code}
          </Text>
          <Text style={[styles.flightDate, { color: theme.colors.textMuted }]}>
            {selectedOutboundFlight?.departure.date}
          </Text>
        </View>

        <View style={styles.flightDetails}>
          <Text style={[styles.flightNumber, { color: theme.colors.text }]}>
            {selectedOutboundFlight?.flightNumber}
          </Text>
          <Text style={[styles.flightTime, { color: theme.colors.textMuted }]}>
            {selectedOutboundFlight?.departure.time} - {selectedOutboundFlight?.arrival.time}
          </Text>
        </View>
      </View>

      <Text style={[styles.passengerText, { color: theme.colors.textMuted }]}>
        {currentBooking?.passengers.length || 1} hành khách
      </Text>
    </View>
  );

  const renderPriceBreakdown = () => {
    const basePrice = selectedOutboundFlight?.price.economy || 0;
    const seatFees = currentBooking?.flights.outbound.seats?.reduce((total, seat) => total + (seat.price || 0), 0) || 0;
    const taxes = basePrice * 0.1;
    const serviceFee = 50000;
    const total = calculateTotal();

    return (
      <View style={[styles.priceCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.priceTitle, { color: theme.colors.text }]}>
          Chi tiết giá
        </Text>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>
            Giá vé máy bay
          </Text>
          <Text style={[styles.priceValue, { color: theme.colors.text }]}>
            {formatPrice(basePrice)}
          </Text>
        </View>

        {seatFees > 0 && (
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>
              Phí chọn ghế
            </Text>
            <Text style={[styles.priceValue, { color: theme.colors.text }]}>
              {formatPrice(seatFees)}
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>
            Thuế và phí
          </Text>
          <Text style={[styles.priceValue, { color: theme.colors.text }]}>
            {formatPrice(taxes)}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>
            Phí dịch vụ
          </Text>
          <Text style={[styles.priceValue, { color: theme.colors.text }]}>
            {formatPrice(serviceFee)}
          </Text>
        </View>

        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
            Tổng cộng
          </Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
            {formatPrice(total)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPaymentMethods = () => (
    <View style={[styles.paymentCard, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.paymentTitle, { color: theme.colors.text }]}>
        Chọn phương thức thanh toán
      </Text>

      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            {
              backgroundColor: selectedPayment?.id === method.id
                ? theme.colors.primary + '20'
                : 'transparent',
              borderColor: selectedPayment?.id === method.id
                ? theme.colors.primary
                : theme.colors.border,
            }
          ]}
          onPress={() => setSelectedPayment(method)}
        >
          <View style={styles.paymentMethodContent}>
            <Ionicons
              name={method.icon}
              size={24}
              color={selectedPayment?.id === method.id ? theme.colors.primary : theme.colors.textMuted}
            />
            <View style={styles.paymentMethodText}>
              <Text style={[
                styles.paymentMethodName,
                { color: theme.colors.text }
              ]}>
                {method.name}
              </Text>
              <Text style={[
                styles.paymentMethodDescription,
                { color: theme.colors.textMuted }
              ]}>
                {method.description}
              </Text>
            </View>
          </View>

          <View style={[
            styles.radioButton,
            {
              borderColor: selectedPayment?.id === method.id ? theme.colors.primary : theme.colors.border,
              backgroundColor: selectedPayment?.id === method.id ? theme.colors.primary : 'transparent',
            }
          ]}>
            {selectedPayment?.id === method.id && (
              <Ionicons name="checkmark" size={16} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderFlightSummary()}
          {renderPriceBreakdown()}
          {renderPaymentMethods()}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.totalSection}>
          <Text style={[styles.totalText, { color: theme.colors.textMuted }]}>
            Tổng thanh toán:
          </Text>
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>
            {formatPrice(calculateTotal())}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            {
              backgroundColor: selectedPayment && !isProcessing
                ? theme.colors.primary
                : theme.colors.textMuted,
            }
          ]}
          onPress={handlePayment}
          disabled={!selectedPayment || isProcessing}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <Text style={styles.payButtonText}>Đang xử lý...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>Thanh toán</Text>
          )}
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
    paddingBottom: 120,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  flightInfo: {
    marginBottom: 12,
  },
  flightRoute: {
    marginBottom: 8,
  },
  flightText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  flightDate: {
    fontSize: 14,
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  flightTime: {
    fontSize: 14,
  },
  passengerText: {
    fontSize: 14,
  },
  priceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  payButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});