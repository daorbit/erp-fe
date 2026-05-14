import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import activeCompanyReducer from './activeCompanySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    activeCompany: activeCompanyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
