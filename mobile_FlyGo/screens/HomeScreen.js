import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, images } from '../theme/theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeMode } from '../theme/ThemeProvider';

export default function HomeScreen({ navigation }) {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState('round');
  const [seat, setSeat] = useState('economy');
  const [tripType, setTripType] = useState('Khứ hồi');
  const [seatClass, setSeatClass] = useState('Phổ thông');
  const [guests, setGuests] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  import { colors, images } from '../theme/theme';
  import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
  import { useThemeMode } from '../theme/ThemeProvider';

  export default function HomeScreen({ navigation }) {
    const { theme } = useThemeMode();
    const insets = useSafeAreaInsets();
    const [trip, setTrip] = useState('round');
    const [seat, setSeat] = useState('economy');
    const [tripType, setTripType] = useState('Khứ hồi');
    const [seatClass, setSeatClass] = useState('Phổ thông');
    const [guests, setGuests] = useState(1);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [airportModal, setAirportModal] = useState({ visible: false, field: 'from' });
    const [guestsModal, setGuestsModal] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const AIRPORTS = ['SGN - Tân Sơn Nhất', 'HAN - Nội Bài', 'DAD - Đà Nẵng', 'PQC - Phú Quốc', 'CXR - Cam Ranh'];
    const [date, setDate] = useState('Chọn ngày');
    const [showPicker, setShowPicker] = useState(false);
    const [pickerValue, setPickerValue] = useState(new Date());
    return (
      <ScrollView
        style={[styles.root, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: 12 + insets.top }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <Ionicons name="airplane" size={24} color={theme.colors.primary} style={styles.logoIcon} />
            <Text style={[styles.brandText, { color: theme.colors.text }]}>FlyGo</Text>
          </View>
          <TouchableOpacity style={[styles.signUpBtn, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signUpTxt}>Sign up</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heroTitle, { color: theme.colors.text }]}>Đặt vé & mở lối phiêu lưu</Text>
        <Text style={[styles.heroSubtitle, { color: theme.colors.textMuted }]}>
          Khám thế giới bắt đầu từ một chiếc vé máy bay - FlyGo giúp bạn bay dễ dàng hơn
        </Text>

        <View style={styles.heroCTAGroup}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.primaryBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroImages}>
          <Image source={{ uri: DEMO_CATS[0].thumbnail }} style={[styles.heroImg, styles.heroImgTall]} />
          <View style={styles.heroColRight}>
            <Image source={{ uri: DEMO_CATS[1].thumbnail }} style={[styles.heroImg, styles.heroImgSmall]} />
            <Image source={{ uri: DEMO_CATS[2].thumbnail }} style={[styles.heroImg, styles.heroImgSmall]} />
          </View>
        </View>

        {/* Trip Type Toggle */}
        <View style={styles.tripToggleContainer}>
          <View style={[styles.tripToggle, { backgroundColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[
                styles.tripToggleButton,
                { backgroundColor: tripType === 'Một chiều' ? theme.colors.primary : 'transparent' }
              ]}
              onPress={() => setTripType('Một chiều')}
            >
              <Text style={[
                styles.tripToggleText,
                { color: tripType === 'Một chiều' ? '#fff' : theme.colors.text }
              ]}>
                Một chiều
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tripToggleButton,
                { backgroundColor: tripType === 'Khứ hồi' ? theme.colors.primary : 'transparent' }
              ]}
              onPress={() => setTripType('Khứ hồi')}
            >
              <Text style={[
                styles.tripToggleText,
                { color: tripType === 'Khứ hồi' ? '#fff' : theme.colors.text }
              ]}>
                Khứ hồi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Card */}
        <View style={[styles.searchCard, { backgroundColor: theme.colors.card }]}>
          {/* Flight Route Section */}
          <View style={styles.flightRouteSection}>
            {/* From Location */}
            <View style={styles.flightInputContainer}>
              <View style={styles.flightInputHeader}>
                <Ionicons name="airplane" size={18} color={theme.colors.textMuted} />
                <Text style={[styles.flightInputLabel, { color: theme.colors.text }]}>Khởi hành</Text>
              </View>
              <TouchableOpacity
                style={[styles.flightInputField, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 16 }]}
                onPress={() => setAirportModal({ visible: true, field: 'from' })}
              >
                <Text style={[styles.flightInputText, { color: from ? theme.colors.text : theme.colors.textMuted }]}>
                  {from || 'Chọn điểm khởi hành'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Location */}
            <View style={styles.flightInputContainer}>
              <View style={styles.flightInputHeader}>
                <Ionicons name="airplane" size={18} color={theme.colors.textMuted} />
                <Text style={[styles.flightInputLabel, { color: theme.colors.text }]}>Điểm đến</Text>
              </View>
              <TouchableOpacity
                style={[styles.flightInputField, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 16 }]}
                onPress={() => setAirportModal({ visible: true, field: 'to' })}
              >
                <Text style={[styles.flightInputText, { color: to ? theme.colors.text : theme.colors.textMuted }]}>
                  {to || 'Chọn điểm đến'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Section */}
          <View style={styles.dateSection}>
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputHeader}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
                <Text style={[styles.dateInputLabel, { color: theme.colors.text }]}>Ngày khởi hành</Text>
              </View>
              <TouchableOpacity
                style={[styles.dateInputField, { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 16 }]}
                onPress={() => setShowPicker(true)}
              >
                <Text style={[styles.dateInputText, { color: date === 'Chọn ngày' ? theme.colors.textMuted : theme.colors.text }]}>
                  {date === 'Chọn ngày' ? 'Chọn ngày bay' : date}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Passenger Section */}
          <View style={styles.passengerSection}>
            <Text style={[styles.passengerSectionTitle, { color: theme.colors.text }]}>Hành khách</Text>

            {/* Adults */}
            <View style={styles.passengerRow}>
              <View style={styles.passengerInfo}>
                <Ionicons name="people" size={18} color={theme.colors.textMuted} />
                <View style={styles.passengerDetails}>
                  <Text style={[styles.passengerLabel, { color: theme.colors.text }]}>Người lớn</Text>
                  <Text style={[styles.passengerSubLabel, { color: theme.colors.textMuted }]}>(12 tuổi trở lên)</Text>
                </View>
              </View>
              <View style={styles.passengerCounter}>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setAdults(Math.max(1, adults - 1))}
                >
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterText, { color: theme.colors.primary }]}>{adults}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setAdults(adults + 1)}
                >
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.passengerRow}>
              <View style={styles.passengerInfo}>
                <Ionicons name="person" size={18} color={theme.colors.textMuted} />
                <View style={styles.passengerDetails}>
                  <Text style={[styles.passengerLabel, { color: theme.colors.text }]}>Trẻ em</Text>
                  <Text style={[styles.passengerSubLabel, { color: theme.colors.textMuted }]}>(2 đến dưới 12 tuổi)</Text>
                </View>
              </View>
              <View style={styles.passengerCounter}>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setChildren(Math.max(0, children - 1))}
                >
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterText, { color: theme.colors.text }]}>{children}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setChildren(children + 1)}
                >
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Infants */}
            <View style={styles.passengerRow}>
              <View style={styles.passengerInfo}>
                <Ionicons name="heart" size={18} color={theme.colors.textMuted} />
                <View style={styles.passengerDetails}>
                  <Text style={[styles.passengerLabel, { color: theme.colors.text }]}>Em bé</Text>
                  <Text style={[styles.passengerSubLabel, { color: theme.colors.textMuted }]}>(Dưới 2 tuổi)</Text>
                </View>
              </View>
              <View style={styles.passengerCounter}>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setInfants(Math.max(0, infants - 1))}
                >
                  <Ionicons name="remove" size={16} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.counterText, { color: theme.colors.text }]}>{infants}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => setInfants(infants + 1)}
                >
                  <Ionicons name="add" size={16} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
            onPress={() =>
              navigation.navigate('Flights', {
                from,
                to,
                date,
                trip: tripType,
                seat: seatClass,
                guests: adults + children + infants,
              })
            }
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>Tìm chuyến bay</Text>
          </TouchableOpacity>
        </View>

        <Modal transparent visible={airportModal.visible} animationType="fade" onRequestClose={() => setAirportModal({ ...airportModal, visible: false })}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Chọn sân bay</Text>
              <FlatList
                data={AIRPORTS}
                keyExtractor={(i) => i}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      if (airportModal.field === 'from') setFrom(item);
                      else setTo(item);
                      setAirportModal({ ...airportModal, visible: false });
                    }}
                  >
                    <Text style={{ color: colors.text }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setAirportModal({ ...airportModal, visible: false })} style={[styles.primaryBtn, { alignSelf: 'stretch', marginTop: 8 }]}>
                <Text style={styles.primaryBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Guest Selection Modal */}
        <Modal transparent visible={showGuestModal} animationType="fade" onRequestClose={() => setShowGuestModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={{ color: theme.colors.text, fontWeight: '700', marginBottom: 8 }}>Chọn số khách</Text>
              <View style={styles.guestSelector}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setGuests(Math.max(1, guests - 1))}
                >
                  <Ionicons name="remove" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.guestCount, { color: theme.colors.text }]}>{guests}</Text>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={() => setGuests(guests + 1)}
                >
                  <Ionicons name="add" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setShowGuestModal(false)}
                style={[styles.primaryBtn, { alignSelf: 'stretch', marginTop: 8 }]}
              >
                <Text style={styles.primaryBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {showPicker && (
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 8, marginTop: 12 }}>
            <DateTimePicker
              value={pickerValue}
              mode="date"
              display="calendar"
              onChange={(e, d) => {
                if (!d) { setShowPicker(false); return; }
                setPickerValue(d);
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyy = d.getFullYear();
                setDate(`${dd}/${mm}/${yyyy}`);
                setShowPicker(false);
              }}
            />
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}> Gợi ý cho bạn</Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>Những điểm đến được đề xuất cho bạn</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {SUGGESTS.map((it) => (
            <View key={it.title} style={styles.card}>
              <Image source={it.image} style={styles.cardImg} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{it.title}</Text>
              <Text style={styles.cardSub}>188,285 điểm đến</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.block}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Explore nearby</Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>Discover great places near where you live</Text>
          <View style={styles.nearbyGrid}>
            {NEARBY.map((n) => (
              <View key={n.title} style={styles.nearItem}>
                <Image source={n.image} style={styles.nearImg} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nearTitle, { color: theme.colors.text }]}>{n.title}</Text>
                  <Text style={[styles.nearSub, { color: theme.colors.textMuted }]}>{n.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* <View style={styles.block}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Explore by types of stays</Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>Explore houses based on types of stays</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
          {TYPES.map((t) => (
            <View key={t.title} style={[styles.card, { width: 180 }] }>
              <Image source={t.image} style={[styles.cardImg, { height: 110 }]} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{t.title}</Text>
              <Text style={styles.cardSub}>{t.sub}</Text>
            </View>
          ))}
        </ScrollView>
      </View> */}

        {/* <View style={styles.block}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>The Videos</Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.textMuted }]}>Check out our hottest videos</Text>
        <Image source={require('../assets/image/flygo_2.png')} style={styles.videoHero} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
          {SUGGESTS.slice(0,4).map((it) => (
            <Image key={it.title} source={it.image} style={styles.videoThumb} />
          ))}
        </ScrollView>
      </View> */}
      </ScrollView>
    );
  }



  const styles = StyleSheet.create({
    root: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoIcon: {
      marginRight: 8,
    },
    brandText: {
      fontSize: 20,
      fontWeight: '800',
    },
    signUpBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    signUpTxt: {
      color: '#fff',
      fontWeight: '600',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '800',
    },
    heroSubtitle: {
      marginTop: 8,
    },
    heroCTAGroup: {
      marginTop: 16,
    },
    primaryBtn: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: '700',
    },
    heroImages: {
      flexDirection: 'row',
      marginTop: 20,
    },
    heroColRight: {
      marginLeft: 12,
      justifyContent: 'space-between',
    },
    heroImg: {
      borderRadius: 12,
      backgroundColor: '#111827',
    },
    heroImgTall: {
      width: 180,
      height: 220,
    },
    heroImgSmall: {
      width: 187,
      height: 100,
    },
    tripToggleContainer: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
    },
    tripToggle: {
      flexDirection: 'row',
      borderRadius: 25,
      padding: 4,
      backgroundColor: colors.border,
    },
    tripToggleButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: 'center',
    },
    tripToggleText: {
      fontSize: 16,
      fontWeight: '600',
    },
    searchCard: {
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 8,
      minHeight: 60,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    inputCol: {
      flex: 1,
    },
    inputLabel: {
      color: '#cbd5e1',
      fontSize: 12,
      marginBottom: 6,
    },
    inputLabelStrong: {
      fontWeight: '700',
      marginBottom: 8,
      fontSize: 14,
    },
    input: {
      backgroundColor: 'transparent',
      borderRadius: 10,
      paddingHorizontal: 0,
      paddingVertical: 8,
      fontSize: 16,
    },
    divider: {
      width: 1,
      height: 50,
      backgroundColor: colors.border,
      marginHorizontal: 12,
    },
    searchTopChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    searchBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchIconBtn: {
      backgroundColor: colors.primary,
      width: 50,
      height: 50,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    sectionTitle: {
      fontWeight: '800',
      fontSize: 18,
      marginTop: 20,
    },
    sectionDesc: {
      marginTop: 4,
      marginBottom: 12,
    },
    cardRow: {
      paddingVertical: 8,
    },
    block: {
      marginTop: 24,
    },
    card: {
      width: 140,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginRight: 12,
      padding: 8,
    },
    cardImg: {
      width: '100%',
      height: 90,
      borderRadius: 8,
      backgroundColor: '#111827',
      marginBottom: 8,
    },
    cardTitle: {
      fontWeight: '700',
    },
    cardSub: {
      color: '#64748b',
      fontSize: 12,
      marginTop: 2,
    },
    nearbyGrid: {
      marginTop: 12,
    },
    nearItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
    },
    nearImg: {
      width: 42,
      height: 42,
      borderRadius: 999,
      marginRight: 10,
    },
    nearTitle: { fontWeight: '700' },
    nearSub: { marginTop: 2, fontSize: 12 },
    videoHero: { width: '100%', height: 180, borderRadius: 16, marginTop: 12, backgroundColor: '#111827' },
    thumbRow: { paddingVertical: 10 },
    videoThumb: { width: 80, height: 60, borderRadius: 10, marginRight: 10, backgroundColor: '#111827' },
    chipsSection: {
      marginTop: 16,
      paddingHorizontal: 20,
    },
    chipsContainer: {
      paddingVertical: 8,
    },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
    modalCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, maxHeight: '70%' },
    modalItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    guestSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 16,
    },
    guestButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestCount: {
      fontSize: 24,
      fontWeight: '700',
      marginHorizontal: 20,
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
    flightRouteSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      gap: 16,
    },
    flightInputContainer: {
      flex: 1,
    },
    flightInputHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    flightInputLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    flightInputField: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 50,
    },
    flightInputText: {
      fontSize: 16,
    },
    dateSection: {
      marginBottom: 20,
    },
    dateInputContainer: {
      flex: 1,
    },
    dateInputHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    dateInputLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    dateInputField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 50,
    },
    dateInputText: {
      fontSize: 16,
    },
    passengerSection: {
      marginBottom: 20,
    },
    passengerSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 16,
    },
    passengerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    passengerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    passengerDetails: {
      marginLeft: 12,
    },
    passengerLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    passengerSubLabel: {
      fontSize: 12,
      marginTop: 2,
    },
    passengerCounter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    counterButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterText: {
      fontSize: 18,
      fontWeight: '700',
      marginHorizontal: 16,
      minWidth: 20,
      textAlign: 'center',
    },
    searchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 8,
    },
    searchButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
  });

  function Chip({ children, selected, onPress }) {
    const { theme } = useThemeMode();
    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          marginRight: 8,
          marginBottom: 8,
          backgroundColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 0 : 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{
          color: selected ? '#fff' : theme.colors.text,
          fontWeight: '600',
          fontSize: 14,
        }}>{children}</Text>
      </TouchableOpacity>
    );
  }


