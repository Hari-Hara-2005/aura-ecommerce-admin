import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Re-export convenience hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export * from './slices/themeSlice';
export * from './slices/authSlice';
export * from './slices/notificationSlice';
