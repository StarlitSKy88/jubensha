import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface Room {
  id: string;
  name: string;
  hostId: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'ended';
  gameType: string;
  createdAt: string;
}

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null
};

export const fetchRooms = createAsyncThunk(
  'room/fetchRooms',
  async () => {
    const response = await axios.get('/api/rooms');
    return response.data;
  }
);

export const createRoom = createAsyncThunk(
  'room/createRoom',
  async (roomData: { name: string; maxPlayers: number; gameType: string }) => {
    const response = await axios.post('/api/rooms', roomData);
    return response.data;
  }
);

export const joinRoom = createAsyncThunk(
  'room/joinRoom',
  async (roomId: string) => {
    const response = await axios.post(`/api/rooms/${roomId}/join`);
    return response.data;
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    leaveRoom: (state) => {
      state.currentRoom = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取房间列表失败';
      })
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
        state.currentRoom = action.payload;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建房间失败';
      })
      .addCase(joinRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
        const roomIndex = state.rooms.findIndex(room => room.id === action.payload.id);
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = action.payload;
        }
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加入房间失败';
      });
  }
});

export const { clearError, leaveRoom } = roomSlice.actions;

export const selectRooms = (state: RootState) => state.room.rooms;
export const selectCurrentRoom = (state: RootState) => state.room.currentRoom;
export const selectRoomLoading = (state: RootState) => state.room.loading;
export const selectRoomError = (state: RootState) => state.room.error;

export default roomSlice.reducer; 