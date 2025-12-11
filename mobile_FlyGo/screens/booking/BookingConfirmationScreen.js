import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { clearCurrentBooking } from '../../stores/slices/bookingSlice';

export default function BookingConfirmationScreen({ navigation }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { currentBooking } = useAppSelector(state => state.bookings);
  const { selectedOutboundFlight } = useAppSelector(state => state.flights);

  const handleDone = () => {
    dispatch(clearCurrentBooking());
    navigation.navigate('Root');
  };

  const handleViewBookings = () => {
    navigation.navigate('Root', {
      screen: 'Bookings',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: theme.colors.success }]}>
              <Ionicons name="checkmark" size={48} color="#ffffff" />
            </View>
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
              Đặt vé thành công!
            </Text>
            <Text style={[styles.successSubtitle, { color: theme.colors.textMuted }]}>
              Cảm ơn bạn đã sử dụng dịch vụ của FlyGo
            </Text>
          </View>

          {/* Booking Reference */}
          <View style={[styles.referenceCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.referenceLabel, { color: theme.colors.textMuted }]}>
              Mã đặt chỗ
            </Text>
            <Text style={[styles.referenceNumber, { color: theme.colors.primary }]}>
              {currentBooking?.bookingReference}
            </Text>
          </View>

          {/* Flight Details */}
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Chi tiết chuyến bay
            </Text>

            <View style={styles.flightHeader}>
              <Text style={[styles.flightNumber, { color: theme.colors.text }]}>
                {selectedOutboundFlight?.flightNumber} - {selectedOutboundFlight?.airline.name}
              </Text>
              <Text style={[styles.aircraft, { color: theme.colors.textMuted }]}>
                {selectedOutboundFlight?.aircraft}
              </Text>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Text style={[styles.routeTime, { color: theme.colors.text }]}>
                  {formatTime(selectedOutboundFlight?.departure.time)}
                </Text>
                <Text style={[styles.routeAirport, { color: theme.colors.text }]}>
                  {selectedOutboundFlight?.departure.airport.code}
                </Text>
                <Text style={[styles.routeCity, { color: theme.colors.textMuted }]}>
                  {selectedOutboundFlight?.departure.airport.city}
                </Text>
                <Text style={[styles.routeDate, { color: theme.colors.textMuted }]}>
                  {formatDate(selectedOutboundFlight?.departure.date)}
                </Text>
              </View>

              <View style={styles.routeCenter}>
                <View style={[styles.routeLine, { backgroundColor: theme.colors.border }]} />
                <Ionicons
                  name="airplane"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.routeIcon}
                />
                <Text style={[styles.duration, { color: theme.colors.textMuted }]}>
                  {selectedOutboundFlight?.duration}
                </Text>
              </View>

              <View style={styles.routePoint}>
                <Text style={[styles.routeTime, { color: theme.colors.text }]}>
                  {formatTime(selectedOutboundFlight?.arrival.time)}
                </Text>
                <Text style={[styles.routeAirport, { color: theme.colors.text }]}>
                  {selectedOutboundFlight?.arrival.airport.code}
                </Text>
                <Text style={[styles.routeCity, { color: theme.colors.textMuted }]}>
                  {selectedOutboundFlight?.arrival.airport.city}
                </Text>
                <Text style={[styles.routeDate, { color: theme.colors.textMuted }]}>
                  {formatDate(selectedOutboundFlight?.arrival.date)}
                </Text>
              </View>
            </View>

            {/* Seat Information */}
            {currentBooking?.flights.outbound.seats && currentBooking.flights.outbound.seats.length > 0 && (
              <View style={styles.seatsSection}>
                <Text style={[styles.seatsTitle, { color: theme.colors.text }]}>
                  Ghế đã chọn
                </Text>
                <View style={styles.seatsContainer}>
                  {currentBooking.flights.outbound.seats.map((seat, index) => (
                    <View key={index} style={[styles.seatBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.seatText, { color: theme.colors.primary }]}>
                        {seat.seatNumber}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Passenger Information */}
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Thông tin hành khách
            </Text>

            {currentBooking?.passengers.map((passenger, index) => (
              <View key={index} style={styles.passengerRow}>
                <View style={styles.passengerInfo}>
                  <Text style={[styles.passengerName, { color: theme.colors.text }]}>
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </Text>
                  <Text style={[styles.passengerType, { color: theme.colors.textMuted }]}>
                    {passenger.type === 'adult' ? 'Người lớn' :
                      passenger.type === 'child' ? 'Trẻ em' : 'Em bé'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Thông tin thanh toán
            </Text>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: theme.colors.textMuted }]}>
                Phương thức thanh toán
              </Text>
              <Text style={[styles.paymentValue, { color: theme.colors.text }]}>
                {currentBooking?.payment.method}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: theme.colors.textMuted }]}>
                Tổng tiền
              </Text>
              <Text style={[styles.paymentTotal, { color: theme.colors.primary }]}>
                {formatPrice(currentBooking?.payment.totalAmount)}
              </Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { color: theme.colors.textMuted }]}>
                Trạng thái
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: theme.colors.success + '20' }]}>
                <Text style={[styles.statusText, { color: theme.colors.success }]}>
                  Đã thanh toán
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Thông tin liên hệ
            </Text>

            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color={theme.colors.textMuted} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {currentBooking?.contactInfo.email}
              </Text>
            </View>

            <View style={styles.contactRow}>
              <Ionicons name="call" size={20} color={theme.colors.textMuted} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>
                {currentBooking?.contactInfo.phone}
              </Text>
            </View>
          </View>

          {/* Important Notice */}
          <View style={[styles.noticeCard, { backgroundColor: theme.colors.warning + '20' }]}>
            <Ionicons name="information-circle" size={24} color={theme.colors.warning} />
            <View style={styles.noticeContent}>
              <Text style={[styles.noticeTitle, { color: theme.colors.warning }]}>
                Lưu ý quan trọng
              </Text>
              <Text style={[styles.noticeText, { color: theme.colors.text }]}>
                • Vui lòng có mặt tại sân bay trước giờ khởi hành 2 tiếng{'\n'}
                • Mang theo CMND/CCCD hoặc hộ chiếu hợp lệ{'\n'}
                • Kiểm tra kỹ thông tin trên vé máy bay
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
          onPress={handleViewBookings}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
            Xem đặt chỗ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleDone}
        >
          <Text style={styles.primaryButtonText}>Hoàn tất</Text>
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
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  referenceCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  referenceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  referenceNumber: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  flightHeader: {
    marginBottom: 16,
  },
  flightNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aircraft: {
    fontSize: 14,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    flex: 1,
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeAirport: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeCity: {
    fontSize: 12,
    marginBottom: 2,
  },
  routeDate: {
    fontSize: 12,
  },
  routeCenter: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  routeLine: {
    height: 1,
    width: 40,
    marginBottom: 8,
  },
  routeIcon: {
    marginBottom: 8,
  },
  duration: {
    fontSize: 12,
  },
  seatsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  seatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  seatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seatText: {
    fontSize: 14,
    fontWeight: '600',
  },
  passengerRow: {
    marginBottom: 12,
  },
  passengerInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  passengerType: {
    fontSize: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
  noticeCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  secondaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});