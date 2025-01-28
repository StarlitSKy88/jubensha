import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  type: 'choice' | 'text';
  content: string;
  options: Option[];
}

interface Answer {
  questionId: string;
  answer: string;
}

interface Analysis {
  summary: string;
  recommendations: string[];
}

interface QuestionnaireState {
  questions: Question[];
  answers: Record<string, string>;
  currentStep: number;
  totalSteps: number;
  analysis: Analysis | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuestionnaireState = {
  questions: [],
  answers: {},
  currentStep: 0,
  totalSteps: 0,
  analysis: null,
  loading: false,
  error: null
};

export const fetchQuestionnaire = createAsyncThunk(
  'questionnaire/fetchQuestionnaire',
  async () => {
    const response = await axios.get('/api/questionnaire');
    return response.data;
  }
);

export const submitAnswers = createAsyncThunk(
  'questionnaire/submitAnswers',
  async (answers: Record<string, string>) => {
    const response = await axios.post('/api/questionnaire/submit', { answers });
    return response.data;
  }
);

export const getAnalysis = createAsyncThunk(
  'questionnaire/getAnalysis',
  async () => {
    const response = await axios.get('/api/questionnaire/analysis');
    return response.data;
  }
);

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    clearAnswers: (state) => {
      state.answers = {};
      state.currentStep = 0;
      state.analysis = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionnaire.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionnaire.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.questions;
        state.totalSteps = action.payload.questions.length;
      })
      .addCase(fetchQuestionnaire.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取问卷失败';
      })
      .addCase(submitAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnswers.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '提交问卷失败';
      })
      .addCase(getAnalysis.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(getAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取分析结果失败';
      });
  }
});

export const {
  setAnswer,
  nextStep,
  prevStep,
  clearAnswers,
  clearError
} = questionnaireSlice.actions;

export const selectQuestions = (state: RootState) => state.questionnaire.questions;
export const selectAnswers = (state: RootState) => state.questionnaire.answers;
export const selectCurrentStep = (state: RootState) => state.questionnaire.currentStep;
export const selectTotalSteps = (state: RootState) => state.questionnaire.totalSteps;
export const selectAnalysis = (state: RootState) => state.questionnaire.analysis;
export const selectLoading = (state: RootState) => state.questionnaire.loading;
export const selectError = (state: RootState) => state.questionnaire.error;

export default questionnaireSlice.reducer; 