import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import { enableScreens } from 'react-native-screens';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useThemeMode } from './theme/ThemeProvider';
import FlightsScreen from './screens/FlightsScreen';
import FlightDetailScreen from './screens/FlightDetailScreen';
import { LoginScreen, SignupScreen } from './screens/AuthScreens';
import { CheckoutScreen, PayDoneScreen } from './screens/CheckoutScreens';
import { AccountScreen, AboutScreen, ContactScreen } from './screens/StaticScreens';
import SettingsScreen from './screens/SettingsScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StoreProvider from './stores/providers';
import Toast from 'react-native-toast-message';

// New screens for enhanced functionality
import FlightListingScreen from './screens/booking/FlightListingScreen';
import SeatSelectionScreen from './screens/booking/SeatSelectionScreen';
import PassengerInfoScreen from './screens/booking/PassengerInfoScreen';
import PaymentScreen from './screens/booking/PaymentScreen';
import BookingConfirmationScreen from './screens/booking/BookingConfirmationScreen';
import MyBookingsScreen from './screens/user/MyBookingsScreen';
import ProfileScreen from './screens/user/ProfileScreen';

enableScreens(true);

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function PlaceholderScreen({ title, imageSource }) {
  return (
    <View style={styles.container}>
      {imageSource ? (
        <Image source={imageSource} style={styles.logo} resizeMode="contain" />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function HomeTabs() {
  const { theme } = useThemeMode();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          height: 65,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            HomeTab: focused ? 'home' : 'home-outline',
            Flights: focused ? 'airplane' : 'airplane-outline',
            Bookings: focused ? 'calendar' : 'calendar-outline',
            Account: focused ? 'person' : 'person-outline',
          };
          const iconName = iconMap[route.name] || 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tabs.Screen
        name="HomeTab"
        options={{ title: 'Trang chủ' }}
        component={HomeScreen}
      />
      <Tabs.Screen
        name="Flights"
        options={{ title: 'Chuyến bay' }}
        component={FlightsScreen}
      />
      <Tabs.Screen
        name="Bookings"
        options={{ title: 'Đặt chỗ' }}
        component={MyBookingsScreen}
      />
      <Tabs.Screen
        name="Account"
        options={{ title: 'Tài khoản' }}
        component={AccountScreen}
      />
    </Tabs.Navigator>
  );
}

function AppInner() {
  const { theme } = useThemeMode();
  return (
    <>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          {/* Main tab navigation */}
          <Stack.Screen
            name="Root"
            component={HomeTabs}
            options={{ headerShown: false }}
          />

          {/* Authentication screens */}
          <Stack.Screen
            name="Login"
            options={{
              title: 'Đăng nhập',
              headerBackTitle: 'Quay lại',
            }}
            component={LoginScreen}
          />
          <Stack.Screen
            name="Signup"
            options={{
              title: 'Đăng ký',
              headerBackTitle: 'Quay lại',
            }}
            component={SignupScreen}
          />

          {/* Flight booking flow */}
          <Stack.Screen
            name="FlightListing"
            options={{
              title: 'Chọn chuyến bay',
              headerBackTitle: 'Quay lại',
            }}
            component={FlightListingScreen}
          />
          <Stack.Screen
            name="FlightDetail"
            options={{
              title: 'Chi tiết chuyến bay',
              headerBackTitle: 'Quay lại',
            }}
            component={FlightDetailScreen}
          />
          <Stack.Screen
            name="SeatSelection"
            options={{
              title: 'Chọn chỗ ngồi',
              headerBackTitle: 'Quay lại',
            }}
            component={SeatSelectionScreen}
          />
          <Stack.Screen
            name="PassengerInfo"
            options={{
              title: 'Thông tin hành khách',
              headerBackTitle: 'Quay lại',
            }}
            component={PassengerInfoScreen}
          />
          <Stack.Screen
            name="Payment"
            options={{
              title: 'Thanh toán',
              headerBackTitle: 'Quay lại',
            }}
            component={PaymentScreen}
          />
          <Stack.Screen
            name="BookingConfirmation"
            options={{
              title: 'Xác nhận đặt chỗ',
              headerLeft: () => null, // Disable back button
            }}
            component={BookingConfirmationScreen}
          />

          {/* Legacy screens - keeping for compatibility */}
          <Stack.Screen
            name="Checkout"
            options={{ title: 'Thanh toán' }}
            component={CheckoutScreen}
          />
          <Stack.Screen
            name="PayDone"
            options={{ title: 'Hoàn tất' }}
            component={PayDoneScreen}
          />

          {/* User management screens */}
          <Stack.Screen
            name="Profile"
            options={{
              title: 'Thông tin cá nhân',
              headerBackTitle: 'Quay lại',
            }}
            component={ProfileScreen}
          />
          <Stack.Screen
            name="Settings"
            options={{
              title: 'Cài đặt',
              headerBackTitle: 'Quay lại',
            }}
            component={SettingsScreen}
          />

          {/* Static screens */}
          <Stack.Screen
            name="About"
            options={{ title: 'Giới thiệu' }}
            component={AboutScreen}
          />
          <Stack.Screen
            name="Contact"
            options={{ title: 'Liên hệ' }}
            component={ContactScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppInner />
        </SafeAreaProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
});
