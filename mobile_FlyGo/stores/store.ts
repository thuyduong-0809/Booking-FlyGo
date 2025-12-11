import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from './slices/authSlice';
import flightSlice from './slices/flightSlice';
import bookingSlice from './slices/bookingSlice';
import masterSlice from './slices/masterSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    flights: flightSlice,
    bookings: bookingSlice,
    master: masterSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;