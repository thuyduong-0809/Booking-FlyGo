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
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ color, size, focused }) => {
          const m = {
            HomeTab: focused ? 'home' : 'home-outline',
            Flights: focused ? 'airplane' : 'airplane-outline',
            Account: focused ? 'person' : 'person-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          const name = m[route.name] || 'ellipse-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="HomeTab" options={{ title: 'Trang chủ' }} component={HomeScreen} />
      <Tabs.Screen name="Flights" options={{ title: 'Chuyến bay' }} component={FlightsScreen} />
      <Tabs.Screen name="Account" options={{ title: 'Tài khoản' }} component={AccountScreen} />
      <Tabs.Screen name="Settings" options={{ title: 'Cài đặt' }} component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

function AppInner() {
  const { theme } = useThemeMode();
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen name="Root" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ title: 'Đăng nhập' }} component={LoginScreen} />
        <Stack.Screen name="Signup" options={{ title: 'Đăng ký' }} component={SignupScreen} />
        <Stack.Screen name="FlightDetail" options={{ title: 'Chi tiết chuyến bay' }} component={FlightDetailScreen} />
        <Stack.Screen name="Checkout" options={{ title: 'Thanh toán' }} component={CheckoutScreen} />
        <Stack.Screen name="PayDone" options={{ title: 'Hoàn tất' }} component={PayDoneScreen} />
        <Stack.Screen name="About" options={{ title: 'Giới thiệu' }} component={AboutScreen} />
        <Stack.Screen name="Contact" options={{ title: 'Liên hệ' }} component={ContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </ThemeProvider>
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
