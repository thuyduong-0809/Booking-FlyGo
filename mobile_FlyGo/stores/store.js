import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
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

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;