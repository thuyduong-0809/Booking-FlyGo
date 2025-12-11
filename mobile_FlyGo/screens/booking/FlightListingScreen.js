import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useAppSelector, useAppDispatch } from '../../stores/store';
import { searchFlightsStart, searchFlightsSuccess, selectOutboundFlight } from '../../stores/slices/flightSlice';

// Mock flight data
const mockFlights = [
  {
    id: '1',
    flightNumber: 'VJ123',
    airline: { id: '1', code: 'VJ', name: 'VietJet Air', logo: null },
    departure: {
      airport: { id: '1', code: 'SGN', name: 'Tân Sơn Nhất', city: 'TP.HCM', country: 'VN' },
      time: '08:30',
      date: '2024-01-15'
    },
    arrival: {
      airport: { id: '2', code: 'HAN', name: 'Nội Bài', city: 'Hà Nội', country: 'VN' },
      time: '10:45',
      date: '2024-01-15'
    },
    duration: '2h 15m',
    aircraft: 'A321',
    price: { economy: 1500000, business: 3000000, first: 5000000 },
    availableSeats: { economy: 45, business: 8, first: 4 },
    stops: 0,
    status: 'Available'
  },
  {
    id: '2',
    flightNumber: 'VN456',
    airline: { id: '2', code: 'VN', name: 'Vietnam Airlines', logo: null },
    departure: {
      airport: { id: '1', code: 'SGN', name: 'Tân Sơn Nhất', city: 'TP.HCM', country: 'VN' },
      time: '14:20',
      date: '2024-01-15'
    },
    arrival: {
      airport: { id: '2', code: 'HAN', name: 'Nội Bài', city: 'Hà Nội', country: 'VN' },
      time: '16:30',
      date: '2024-01-15'
    },
    duration: '2h 10m',
    aircraft: 'A350',
    price: { economy: 1800000, business: 3500000, first: 6000000 },
    availableSeats: { economy: 32, business: 12, first: 8 },
    stops: 0,
    status: 'Available'
  },
  {
    id: '3',
    flightNumber: 'QH789',
    airline: { id: '3', code: 'QH', name: 'Bamboo Airways', logo: null },
    departure: {
      airport: { id: '1', code: 'SGN', name: 'Tân Sơn Nhất', city: 'TP.HCM', country: 'VN' },
      time: '19:15',
      date: '2024-01-15'
    },
    arrival: {
      airport: { id: '2', code: 'HAN', name: 'Nội Bài', city: 'Hà Nội', country: 'VN' },
      time: '21:25',
      date: '2024-01-15'
    },
    duration: '2h 10m',
    aircraft: 'A320',
    price: { economy: 1600000, business: 3200000, first: 5500000 },
    availableSeats: { economy: 28, business: 6, first: 2 },
    stops: 0,
    status: 'Available'
  }
];

export default function FlightListingScreen({ navigation, route }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { searchParams, searchResults, isLoading } = useAppSelector(state => state.flights);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('price'); // price, duration, departure

  useEffect(() => {
    // Simulate search with mock data
    if (route.params) {
      dispatch(searchFlightsStart());
      setTimeout(() => {
        dispatch(searchFlightsSuccess(mockFlights));
      }, 1500);
    }
  }, [route.params]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(searchFlightsStart());
    setTimeout(() => {
      dispatch(searchFlightsSuccess(mockFlights));
      setRefreshing(false);
    }, 1000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleSelectFlight = (flight) => {
    dispatch(selectOutboundFlight(flight));
    navigation.navigate('FlightDetail', { flight });
  };

  const renderFlightCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.flightCard, { backgroundColor: theme.colors.card }]}
      onPress={() => handleSelectFlight(item)}
    >
      <View style={styles.flightHeader}>
        <Text style={[styles.airline, { color: theme.colors.text }]}>
          {item.airline.name}
        </Text>
        <Text style={[styles.flightNumber, { color: theme.colors.textMuted }]}>
          {item.flightNumber}
        </Text>
      </View>

      <View style={styles.flightRoute}>
        <View style={styles.routePoint}>
          <Text style={[styles.time, { color: theme.colors.text }]}>{item.departure.time}</Text>
          <Text style={[styles.airport, { color: theme.colors.textMuted }]}>
            {item.departure.airport.code}
          </Text>
          <Text style={[styles.city, { color: theme.colors.textMuted }]}>
            {item.departure.airport.city}
          </Text>
        </View>

        <View style={styles.routeCenter}>
          <Ionicons
            name="airplane"
            size={20}
            color={theme.colors.primary}
            style={styles.airplaneIcon}
          />
          <Text style={[styles.duration, { color: theme.colors.textMuted }]}>
            {item.duration}
          </Text>
          {item.stops === 0 ? (
            <Text style={[styles.direct, { color: theme.colors.success }]}>Thẳng</Text>
          ) : (
            <Text style={[styles.stops, { color: theme.colors.warning }]}>
              {item.stops} điểm dừng
            </Text>
          )}
        </View>

        <View style={styles.routePoint}>
          <Text style={[styles.time, { color: theme.colors.text }]}>{item.arrival.time}</Text>
          <Text style={[styles.airport, { color: theme.colors.textMuted }]}>
            {item.arrival.airport.code}
          </Text>
          <Text style={[styles.city, { color: theme.colors.textMuted }]}>
            {item.arrival.airport.city}
          </Text>
        </View>
      </View>

      <View style={styles.flightFooter}>
        <View style={styles.priceSection}>
          <Text style={[styles.priceLabel, { color: theme.colors.textMuted }]}>
            Từ
          </Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {formatPrice(item.price.economy)}
          </Text>
        </View>
        <View style={styles.seatsInfo}>
          <Text style={[styles.seatsText, { color: theme.colors.textMuted }]}>
            {item.availableSeats.economy} chỗ trống
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortOptions = () => (
    <View style={[styles.sortContainer, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.sortTitle, { color: theme.colors.text }]}>Sắp xếp theo:</Text>
      <View style={styles.sortOptions}>
        {[
          { key: 'price', label: 'Giá' },
          { key: 'duration', label: 'Thời gian' },
          { key: 'departure', label: 'Khởi hành' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortOption,
              {
                backgroundColor: sortBy === option.key ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.border
              }
            ]}
            onPress={() => setSortBy(option.key)}
          >
            <Text
              style={[
                styles.sortOptionText,
                {
                  color: sortBy === option.key ? '#fff' : theme.colors.text
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading && searchResults.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Đang tìm chuyến bay...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderSortOptions()}

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsText, { color: theme.colors.text }]}>
          {searchResults.length} chuyến bay được tìm thấy
        </Text>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderFlightCard}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  sortContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  flightCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  airline: {
    fontSize: 16,
    fontWeight: '600',
  },
  flightNumber: {
    fontSize: 14,
  },
  flightRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routePoint: {
    flex: 1,
    alignItems: 'center',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  airport: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  city: {
    fontSize: 12,
  },
  routeCenter: {
    flex: 1,
    alignItems: 'center',
  },
  airplaneIcon: {
    marginBottom: 4,
  },
  duration: {
    fontSize: 12,
    marginBottom: 2,
  },
  direct: {
    fontSize: 12,
    fontWeight: '500',
  },
  stops: {
    fontSize: 12,
    fontWeight: '500',
  },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  seatsInfo: {
    alignItems: 'flex-end',
  },
  seatsText: {
    fontSize: 12,
  },
});