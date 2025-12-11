import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MasterState {
  isAdmin: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'vi';
  currency: 'VND' | 'USD';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  appVersion: string;
  isFirstLaunch: boolean;
  connectivity: {
    isConnected: boolean;
    type: string;
  };
}

const initialState: MasterState = {
  isAdmin: false,
  theme: 'system',
  language: 'vi',
  currency: 'VND',
  notifications: {
    push: true,
    email: true,
    sms: false,
  },
  appVersion: '1.0.0',
  isFirstLaunch: true,
  connectivity: {
    isConnected: true,
    type: 'wifi',
  },
};

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      state.language = action.payload;
    },
    setCurrency: (state, action: PayloadAction<'VND' | 'USD'>) => {
      state.currency = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<MasterState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setFirstLaunch: (state, action: PayloadAction<boolean>) => {
      state.isFirstLaunch = action.payload;
    },
    updateConnectivity: (state, action: PayloadAction<{ isConnected: boolean; type: string }>) => {
      state.connectivity = action.payload;
    },
    resetSettings: (state) => {
      return { ...initialState, isFirstLaunch: false };
    },
  },
});

export const {
  setAdmin,
  setTheme,
  setLanguage,
  setCurrency,
  updateNotificationSettings,
  setFirstLaunch,
  updateConnectivity,
  resetSettings,
} = masterSlice.actions;

export default masterSlice.reducer;