// Enhanced theme configuration similar to web app
export const lightColors = {
  primary: '#1e40af',
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',
  secondary: '#f97316',
  secondaryLight: '#fb923c',
  secondaryDark: '#ea580c',

  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',

  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textDisabled: '#d1d5db',

  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  overlay: 'rgba(0, 0, 0, 0.5)',

  // Gradient colors
  gradientStart: '#1e40af',
  gradientEnd: '#3b82f6',
};

export const darkColors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  secondary: '#fb923c',
  secondaryLight: '#fdba74',
  secondaryDark: '#f97316',

  background: '#111827',
  surface: '#1f2937',
  card: '#374151',

  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textDisabled: '#6b7280',

  border: '#4b5563',
  borderLight: '#374151',

  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  overlay: 'rgba(0, 0, 0, 0.7)',

  // Gradient colors
  gradientStart: '#1e40af',
  gradientEnd: '#3b82f6',
};

export const lightTheme = {
  dark: false,
  colors: lightColors,
  fonts: {
    light: { fontFamily: 'System', fontWeight: '300' },
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    semiBold: { fontFamily: 'System', fontWeight: '600' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    extraBold: { fontFamily: 'System', fontWeight: '800' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    round: 999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  dark: true,
  colors: darkColors,
  fonts: lightTheme.fonts,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Legacy colors for backward compatibility
export const colors = lightColors;

// Sample images data
export const images = {
  logo: require('../assets/image/flygo.png'),
  heroA: require('../assets/image/flygo.png'),
  heroB: require('../assets/image/flygo_2.png'),
  heroC: require('../assets/image/flygo_3.png'),
};

// Sample data similar to web app
export const DEMO_CATS = [
  {
    id: "1",
    href: "#",
    name: "Hà Nội",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://vj-prod-website-cms.s3.ap-southeast-1.amazonaws.com/thumbnailhn-1621669931033.jpeg",
  },
  {
    id: "2",
    href: "#",
    name: "TP.Hồ Chí Minh",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/941195/pexels-photo-941195.jpeg",
  },
  {
    id: "3",
    href: "#",
    name: "Đà Nẵng",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/34373621/pexels-photo-34373621.jpeg",
  },
  {
    id: "4",
    href: "#",
    name: "Quy Nhơn",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/30228245/pexels-photo-30228245.jpeg"
  },
  {
    id: "5",
    href: "#",
    name: "Tokyo",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/4151484/pexels-photo-4151484.jpeg",
  },
  {
    id: "6",
    href: "#",
    name: "Maldives",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg",
  },
  {
    id: "7",
    href: "#",
    name: "Italy",
    taxonomy: "category",
    count: 188288,
    thumbnail: "https://images.pexels.com/photos/7740160/pexels-photo-7740160.jpeg",
  },
];

export const SUGGESTS = DEMO_CATS.slice(0, 6).map(cat => ({
  title: cat.name,
  image: { uri: cat.thumbnail }
}));

export const NEARBY = [
  { title: 'Hà Nội', time: '1 giờ bay', image: { uri: DEMO_CATS[0].thumbnail } },
  { title: 'TP. Hồ Chí Minh', time: '2 giờ bay', image: { uri: DEMO_CATS[1].thumbnail } },
  { title: 'Đà Nẵng', time: '1.5 giờ bay', image: { uri: DEMO_CATS[2].thumbnail } },
  { title: 'Quy Nhơn', time: '1.5 giờ bay', image: { uri: DEMO_CATS[3].thumbnail } },
];

export const TYPES = [
  { title: 'Du lịch nghỉ dưỡng', sub: 'Khám phá thiên nhiên', image: { uri: DEMO_CATS[5].thumbnail } },
  { title: 'Du lịch thành phố', sub: 'Khám phá đô thị', image: { uri: DEMO_CATS[4].thumbnail } },
  { title: 'Du lịch văn hóa', sub: 'Tìm hiểu lịch sử', image: { uri: DEMO_CATS[6].thumbnail } },
];


