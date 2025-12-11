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
import { initializeBooking, setBookingStep } from '../../stores/slices/bookingSlice';

export default function SeatSelectionScreen({ navigation, route }) {
  const { theme } = useThemeMode();
  const dispatch = useAppDispatch();
  const { selectedOutboundFlight } = useAppSelector(state => state.flights);
  const { currentBooking } = useAppSelector(state => state.bookings);
  const [selectedSeats, setSelectedSeats] = useState({});

  // Mock seat data - in real app this would come from API
  const seatMap = generateSeatMap();

  function generateSeatMap() {
    const rows = 30;
    const seatsPerRow = 6; // A, B, C, D, E, F
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < seatsPerRow; col++) {
        const seatNumber = `${row}${seatLetters[col]}`;
        const isOccupied = Math.random() < 0.3; // 30% occupied
        const isPremium = row <= 3; // First 3 rows are premium
        const isExit = row === 12 || row === 13; // Exit rows

        rowSeats.push({
          id: seatNumber,
          number: seatNumber,
          row,
          column: seatLetters[col],
          isAvailable: !isOccupied,
          isOccupied,
          isPremium,
          isExit,
          price: isPremium ? 500000 : isExit ? 200000 : 0,
          type: isPremium ? 'premium' : isExit ? 'exit' : 'standard'
        });
      }
      seats.push(rowSeats);
    }
    return seats;
  }

  const handleSeatPress = (seat) => {
    if (!seat.isAvailable) return;

    const seatId = seat.id;
    setSelectedSeats(prev => {
      const newSelection = { ...prev };
      if (newSelection[seatId]) {
        delete newSelection[seatId];
      } else {
        // For simplicity, allow only one seat selection per passenger
        // In real app, you'd manage multiple passengers
        newSelection[seatId] = seat;
      }
      return newSelection;
    });
  };

  const getSeatColor = (seat) => {
    if (selectedSeats[seat.id]) {
      return theme.colors.primary;
    }
    if (!seat.isAvailable) {
      return '#ef4444';
    }
    if (seat.isPremium) {
      return '#f59e0b';
    }
    if (seat.isExit) {
      return '#10b981';
    }
    return theme.colors.surface;
  };

  const getSeatTextColor = (seat) => {
    if (selectedSeats[seat.id] || !seat.isAvailable) {
      return '#ffffff';
    }
    return theme.colors.text;
  };

  const calculateTotalPrice = () => {
    return Object.values(selectedSeats).reduce((total, seat) => total + seat.price, 0);
  };

  const handleContinue = () => {
    if (Object.keys(selectedSeats).length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế');
      return;
    }

    // Initialize booking if not already done
    if (!currentBooking) {
      dispatch(initializeBooking({
        outbound: {
          id: selectedOutboundFlight.id,
          flightNumber: selectedOutboundFlight.flightNumber,
          departure: selectedOutboundFlight.departure,
          arrival: selectedOutboundFlight.arrival,
          seats: Object.values(selectedSeats).map(seat => ({
            seatNumber: seat.number,
            class: seat.type,
            price: seat.price
          }))
        }
      }));
    }

    dispatch(setBookingStep('passengers'));
    navigation.navigate('PassengerInfo');
  };

  const renderSeatLegend = () => (
    <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, { backgroundColor: theme.colors.surface }]} />
          <Text style={[styles.legendText, { color: theme.colors.text }]}>Trống</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: theme.colors.text }]}>Đã chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, { backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.legendText, { color: theme.colors.text }]}>Hạng thương gia</Text>
        </View>
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.legendText, { color: theme.colors.text }]}>Lối thoát hiểm</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.legendText, { color: theme.colors.text }]}>Đã chọn</Text>
        </View>
      </View>
    </View>
  );

  const renderSeatMap = () => (
    <ScrollView style={styles.seatMapContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.aircraftHeader}>
        <Ionicons name="airplane" size={24} color={theme.colors.primary} />
        <Text style={[styles.aircraftText, { color: theme.colors.text }]}>
          {selectedOutboundFlight?.aircraft || 'A320'}
        </Text>
      </View>

      {seatMap.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.seatRow}>
          <Text style={[styles.rowNumber, { color: theme.colors.textMuted }]}>
            {row[0].row}
          </Text>

          <View style={styles.seatsContainer}>
            {row.slice(0, 3).map((seat, seatIndex) => (
              <TouchableOpacity
                key={seat.id}
                style={[
                  styles.seat,
                  { backgroundColor: getSeatColor(seat) }
                ]}
                onPress={() => handleSeatPress(seat)}
                disabled={!seat.isAvailable}
              >
                <Text style={[
                  styles.seatText,
                  { color: getSeatTextColor(seat) }
                ]}>
                  {seat.column}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.aisle} />

            {row.slice(3, 6).map((seat, seatIndex) => (
              <TouchableOpacity
                key={seat.id}
                style={[
                  styles.seat,
                  { backgroundColor: getSeatColor(seat) }
                ]}
                onPress={() => handleSeatPress(seat)}
                disabled={!seat.isAvailable}
              >
                <Text style={[
                  styles.seatText,
                  { color: getSeatTextColor(seat) }
                ]}>
                  {seat.column}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.flightInfo, { color: theme.colors.text }]}>
          {selectedOutboundFlight?.flightNumber} - {selectedOutboundFlight?.departure.airport.code} → {selectedOutboundFlight?.arrival.airport.code}
        </Text>
      </View>

      {renderSeatLegend()}
      {renderSeatMap()}

      {Object.keys(selectedSeats).length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.selectionInfo}>
            <Text style={[styles.selectedSeatsTitle, { color: theme.colors.text }]}>
              Ghế đã chọn:
            </Text>
            <Text style={[styles.selectedSeats, { color: theme.colors.primary }]}>
              {Object.keys(selectedSeats).join(', ')}
            </Text>
            <Text style={[styles.totalPrice, { color: theme.colors.text }]}>
              Phí ghế: {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(calculateTotalPrice())}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  flightInfo: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  legend: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  seatMapContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  aircraftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aircraftText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowNumber: {
    width: 30,
    fontSize: 12,
    textAlign: 'center',
  },
  seatsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  seatText: {
    fontSize: 10,
    fontWeight: '600',
  },
  aisle: {
    width: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectionInfo: {
    marginBottom: 16,
  },
  selectedSeatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedSeats: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
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