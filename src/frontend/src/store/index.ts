import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';
import voiceReducer from './slices/voiceSlice';
import hostReducer from './slices/hostSlice';
import questionnaireReducer from './slices/questionnaireSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    voice: voiceReducer,
    host: hostReducer,
    questionnaire: questionnaireReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['voice/setLocalStream'],
        ignoredPaths: ['voice.localStream']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 
