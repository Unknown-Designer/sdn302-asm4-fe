import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getQuestionsAPI,
  getQuestionByIdAPI,
  createQuestionAPI,
  updateQuestionAPI,
  deleteQuestionAPI,
} from '../../services/api';

// Async thunks
export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getQuestionsAPI();
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch questions';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchQuestionById = createAsyncThunk('questions/fetchById', async (id, thunkAPI) => {
  try {
    const response = await getQuestionByIdAPI(id);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch question';
    return thunkAPI.rejectWithValue(message);
  }
});

export const createQuestion = createAsyncThunk('questions/create', async (questionData, thunkAPI) => {
  try {
    const response = await createQuestionAPI(questionData);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to create question';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateQuestion = createAsyncThunk(
  'questions/update',
  async ({ id, questionData }, thunkAPI) => {
    try {
      const response = await updateQuestionAPI(id, questionData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteQuestion = createAsyncThunk('questions/delete', async (id, thunkAPI) => {
  try {
    await deleteQuestionAPI(id);
    return id;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to delete question';
    return thunkAPI.rejectWithValue(message);
  }
});

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [],
    currentQuestion: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  },
  reducers: {
    resetQuestionState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch by ID
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.currentQuestion = action.payload;
      })
      // Create
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.questions.push(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Update
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.isSuccess = true;
        const index = state.questions.findIndex((q) => q._id === action.payload._id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.questions = state.questions.filter((q) => q._id !== action.payload);
      })
      .addCase(deleteQuestion.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetQuestionState } = questionSlice.actions;
export default questionSlice.reducer;
