import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import candidatesReducer from './slices/candidatesSlice';
import interviewReducer from './slices/interviewSlice';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import interviewRoomsReducer from './slices/interviewRoomsSlice';

const persistConfig = {
  key: 'root',
  storage,
};

export const store = configureStore({
  reducer: {
    candidates: candidatesReducer, // Don't persist candidates - too large (resume files)
    interview: persistReducer({ ...persistConfig, key: 'interview' }, interviewReducer),
    auth: persistReducer({ ...persistConfig, key: 'auth' }, authReducer),
    users: persistReducer({ ...persistConfig, key: 'users' }, usersReducer),
    interviewRooms: persistReducer({ ...persistConfig, key: 'interviewRooms' }, interviewRoomsReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
