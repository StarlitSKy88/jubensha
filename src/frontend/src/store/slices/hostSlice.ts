import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface Player {
  id: string;
  username: string;
  status: 'active' | 'inactive';
}

interface Clue {
  id: string;
  content: string;
  isRevealed: boolean;
  targetPlayer: string;
}

interface GamePhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
}

interface HostState {
  players: Player[];
  clues: Clue[];
  gamePhases: GamePhase[];
  currentPhase: GamePhase | null;
  timeRemaining: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: HostState = {
  players: [],
  clues: [],
  gamePhases: [],
  currentPhase: null,
  timeRemaining: null,
  loading: false,
  error: null
};

export const fetchGameState = createAsyncThunk(
  'host/fetchGameState',
  async (gameId: string) => {
    const response = await axios.get(`/api/games/${gameId}/state`);
    return response.data;
  }
);

export const revealClue = createAsyncThunk(
  'host/revealClue',
  async ({ gameId, clueId }: { gameId: string; clueId: string }) => {
    const response = await axios.post(`/api/games/${gameId}/clues/${clueId}/reveal`);
    return response.data;
  }
);

export const startPhase = createAsyncThunk(
  'host/startPhase',
  async ({ gameId, phaseId }: { gameId: string; phaseId: string }) => {
    const response = await axios.post(`/api/games/${gameId}/phases/${phaseId}/start`);
    return response.data;
  }
);

export const updatePlayerStatus = createAsyncThunk(
  'host/updatePlayerStatus',
  async ({ gameId, playerId, status }: { gameId: string; playerId: string; status: string }) => {
    const response = await axios.patch(`/api/games/${gameId}/players/${playerId}`, { status });
    return response.data;
  }
);

const hostSlice = createSlice({
  name: 'host',
  initialState,
  reducers: {
    updateTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGameState.fulfilled, (state, action) => {
        state.loading = false;
        state.players = action.payload.players;
        state.clues = action.payload.clues;
        state.gamePhases = action.payload.gamePhases;
        state.currentPhase = action.payload.currentPhase;
        state.timeRemaining = action.payload.timeRemaining;
      })
      .addCase(fetchGameState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取游戏状态失败';
      })
      .addCase(revealClue.fulfilled, (state, action) => {
        const clue = state.clues.find(c => c.id === action.payload.clueId);
        if (clue) {
          clue.isRevealed = true;
        }
      })
      .addCase(revealClue.rejected, (state, action) => {
        state.error = action.error.message || '显示线索失败';
      })
      .addCase(startPhase.fulfilled, (state, action) => {
        state.currentPhase = action.payload.phase;
        state.timeRemaining = action.payload.timeRemaining;
      })
      .addCase(startPhase.rejected, (state, action) => {
        state.error = action.error.message || '开始阶段失败';
      })
      .addCase(updatePlayerStatus.fulfilled, (state, action) => {
        const player = state.players.find(p => p.id === action.payload.playerId);
        if (player) {
          player.status = action.payload.status;
        }
      })
      .addCase(updatePlayerStatus.rejected, (state, action) => {
        state.error = action.error.message || '更新玩家状态失败';
      });
  }
});

export const { updateTimeRemaining } = hostSlice.actions;

export const selectPlayers = (state: RootState) => state.host.players;
export const selectClues = (state: RootState) => state.host.clues;
export const selectGamePhases = (state: RootState) => state.host.gamePhases;
export const selectCurrentPhase = (state: RootState) => state.host.currentPhase;
export const selectTimeRemaining = (state: RootState) => state.host.timeRemaining;
export const selectLoading = (state: RootState) => state.host.loading;
export const selectError = (state: RootState) => state.host.error;

export default hostSlice.reducer; 