import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface Participant {
  id: string;
  username: string;
  isSpeaking: boolean;
  isMuted: boolean;
  avatar: string;
}

interface VoiceState {
  participants: Participant[];
  isMicrophoneEnabled: boolean;
  isVolumeEnabled: boolean;
  localStream: MediaStream | null;
  loading: boolean;
  error: string | null;
}

const initialState: VoiceState = {
  participants: [],
  isMicrophoneEnabled: false,
  isVolumeEnabled: true,
  localStream: null,
  loading: false,
  error: null
};

export const joinVoiceRoom = createAsyncThunk(
  'voice/joinVoiceRoom',
  async (roomId: string) => {
    const response = await axios.post(`/api/voice-rooms/${roomId}/join`);
    return response.data;
  }
);

export const leaveVoiceRoom = createAsyncThunk(
  'voice/leaveVoiceRoom',
  async (roomId: string) => {
    const response = await axios.post(`/api/voice-rooms/${roomId}/leave`);
    return response.data;
  }
);

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    toggleMicrophone: (state) => {
      state.isMicrophoneEnabled = !state.isMicrophoneEnabled;
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach(track => {
          track.enabled = state.isMicrophoneEnabled;
        });
      }
    },
    toggleVolume: (state) => {
      state.isVolumeEnabled = !state.isVolumeEnabled;
    },
    updateParticipants: (state, action) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action) => {
      state.participants.push(action.payload);
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(joinVoiceRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinVoiceRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.participants = action.payload.participants;
      })
      .addCase(joinVoiceRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加入语音房间失败';
      })
      .addCase(leaveVoiceRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveVoiceRoom.fulfilled, (state) => {
        state.loading = false;
        state.participants = [];
        state.localStream = null;
        state.isMicrophoneEnabled = false;
      })
      .addCase(leaveVoiceRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '离开语音房间失败';
      });
  }
});

export const {
  setLocalStream,
  toggleMicrophone,
  toggleVolume,
  updateParticipants,
  addParticipant,
  removeParticipant,
  clearError
} = voiceSlice.actions;

export const selectParticipants = (state: RootState) => state.voice.participants;
export const selectIsMicrophoneEnabled = (state: RootState) => state.voice.isMicrophoneEnabled;
export const selectIsVolumeEnabled = (state: RootState) => state.voice.isVolumeEnabled;
export const selectLocalStream = (state: RootState) => state.voice.localStream;
export const selectLoading = (state: RootState) => state.voice.loading;
export const selectError = (state: RootState) => state.voice.error;

export default voiceSlice.reducer; 