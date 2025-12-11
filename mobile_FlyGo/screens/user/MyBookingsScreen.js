import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { setBookingHistory } from '../../stores/slices/bookingSlice';

// Mock booking data
const mockBookings = [
  {
    id: 'booking_1',
    bookingReference: 'FG123456',
    status: 'confirmed',
    flights: {
      outbound: {
        id: '1',
        flightNumber: 'VJ123',
        departure: {
          airport: 'SGN',
          time: '08:30',
          date: '2024-01-15'
        },
        arrival: {
          airport: 'HAN',
          time: '10:45',
          date: '2024-01-15'
        },
        seats: [{ seatNumber: '12A', class: 'economy', price: 0 }]
      }
    },
    passengers: [
      {
        id: '1',
        title: 'Ông',
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        type: 'adult'
      }
    ],
    contactInfo: {
      email: 'test@example.com',
      phone: '0123456789'
    },
    payment: {
      method: 'VNPay',
      status: 'completed',
      totalAmount: 1650000,
      currency: 'VND'
    },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'booking_2',
    bookingReference: 'FG789012',
    status: 'completed',
    flights: {
      outbound: {
        id: '2',
        flightNumber: 'VN456',
        departure: {
          airport: 'HAN',
          time: '14:20',
          date: '2024-01-05'
        },
        arrival: {
          airport: 'SGN',
          time: '16:30',
          date: '2024-01-05'
        },
        seats: [{ seatNumber: '8C', class: 'economy', price: 0 }]
      }
    },
    passengers: [
      {
        id: '1',
        title: 'Bà',
        firstName: 'Trần',
        lastName: 'Thị B',
        type: 'adult'
      }
    ],
    contactInfo: {
      email: 'test2@example.com',
      phone: '0987654321'
    },
    payment: {
      method: 'MoMo',
      status: 'completed',
      totalAmount: 1950000,
      currency: 'VND'
    },
    createdAt: '2024-01-01T15:30:00Z',
    updatedAt: '2024-01-05T16:45:00Z'
  }
];

export default function MyBookingsScreen({ navigation }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { bookingHistory } = useAppSelector(state => state.bookings);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    // Simulate API call
    setTimeout(() => {
      dispatch(setBookingHistory(mockBookings));
    }, 500);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadBookings();
      setRefreshing(false);
    }, 1000);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'completed':
        return theme.colors.primary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Chờ xử lý';
    }
  };

  const handleBookingPress = (booking) => {
    Alert.alert(
      'Chi tiết đặt chỗ',
      `Mã đặt chỗ: ${booking.bookingReference}\nTrạng thái: ${getStatusText(booking.status)}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Xem chi tiết', onPress: () => navigation.navigate('BookingDetail', { booking }) }
      ]
    );
  };

  const renderBookingCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleBookingPress(item)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={[styles.bookingReference, { color: theme.colors.text }]}>
            {item.bookingReference}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.bookingDate, { color: theme.colors.textMuted }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <View style={styles.flightInfo}>
        <View style={styles.routeInfo}>
          <Text style={[styles.flightNumber, { color: theme.colors.primary }]}>
            {item.flights.outbound.flightNumber}
          </Text>
          <View style={styles.route}>
            <Text style={[styles.airport, { color: theme.colors.text }]}>
              {item.flights.outbound.departure.airport}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={theme.colors.textMuted}
              style={styles.arrowIcon}
            />
            <Text style={[styles.airport, { color: theme.colors.text }]}>
              {item.flights.outbound.arrival.airport}
            </Text>
          </View>
          <Text style={[styles.flightDate, { color: theme.colors.textMuted }]}>
            {formatDate(item.flights.outbound.departure.date)} • {item.flights.outbound.departure.time}
          </Text>
        </View>

        <View style={styles.priceInfo}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {formatPrice(item.payment.totalAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.passengerInfo}>
        <Ionicons name="person" size={16} color={theme.colors.textMuted} />
        <Text style={[styles.passengerText, { color: theme.colors.textMuted }]}>
          {item.passengers.length} hành khách
        </Text>
        <View style={styles.seatInfo}>
          <Ionicons name="airplane" size={16} color={theme.colors.textMuted} />
          <Text style={[styles.seatText, { color: theme.colors.textMuted }]}>
            {item.flights.outbound.seats.map(seat => seat.seatNumber).join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterTabs = () => (
    <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
      {[
        { key: 'all', label: 'Tất cả' },
        { key: 'upcoming', label: 'Sắp tới' },
        { key: 'completed', label: 'Hoàn thành' },
        { key: 'cancelled', label: 'Đã hủy' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            {
              backgroundColor: filter === tab.key ? theme.colors.primary : 'transparent',
            }
          ]}
          onPress={() => setFilter(tab.key)}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color: filter === tab.key ? '#fff' : theme.colors.text
              }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={theme.colors.textMuted} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Chưa có đặt chỗ nào
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
        Đặt chuyến bay đầu tiên của bạn để xem lịch sử đặt chỗ
      </Text>
      <TouchableOpacity
        style={[styles.bookNowButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.bookNowButtonText}>Đặt vé ngay</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredBookings = bookingHistory.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'confirmed';
    if (filter === 'completed') return booking.status === 'completed';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Đặt chỗ của tôi
        </Text>
      </View>

      {renderFilterTabs()}

      {filteredBookings.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingReference: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDate: {
    fontSize: 12,
  },
  flightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  flightNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  airport: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  flightDate: {
    fontSize: 12,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  bookNowButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookNowButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});