import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getQuizzesAPI,
  getQuizByIdAPI,
  createQuizAPI,
  updateQuizAPI,
  deleteQuizAPI,
  addQuestionToQuizAPI,
} from '../../services/api';

// Async thunks
export const fetchQuizzes = createAsyncThunk('quizzes/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getQuizzesAPI();
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch quizzes';
    return thunkAPI.rejectWithValue(message);
  }
});

export const fetchQuizById = createAsyncThunk('quizzes/fetchById', async (id, thunkAPI) => {
  try {
    const response = await getQuizByIdAPI(id);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to fetch quiz';
    return thunkAPI.rejectWithValue(message);
  }
});

export const createQuiz = createAsyncThunk('quizzes/create', async (quizData, thunkAPI) => {
  try {
    const response = await createQuizAPI(quizData);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to create quiz';
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateQuiz = createAsyncThunk('quizzes/update', async ({ id, quizData }, thunkAPI) => {
  try {
    const response = await updateQuizAPI(id, quizData);
    return response.data.data;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to update quiz';
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteQuiz = createAsyncThunk('quizzes/delete', async (id, thunkAPI) => {
  try {
    await deleteQuizAPI(id);
    return id;
  } catch (error) {
    const message = error.response?.data?.error || 'Failed to delete quiz';
    return thunkAPI.rejectWithValue(message);
  }
});

export const addQuestionToQuiz = createAsyncThunk(
  'quizzes/addQuestion',
  async ({ quizId, questionData }, thunkAPI) => {
    try {
      const response = await addQuestionToQuizAPI(quizId, questionData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add question';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const quizSlice = createSlice({
  name: 'quizzes',
  initialState: {
    quizzes: [],
    currentQuiz: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
  },
  reducers: {
    resetQuizState: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create quiz
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.quizzes.push(action.payload);
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Update quiz
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isSuccess = true;
        const index = state.quizzes.findIndex((q) => q._id === action.payload._id);
        if (index !== -1) {
          state.quizzes[index] = action.payload;
        }
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Delete quiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      // Add question to quiz
      .addCase(addQuestionToQuiz.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.currentQuiz = action.payload;
      })
      .addCase(addQuestionToQuiz.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetQuizState, clearCurrentQuiz } = quizSlice.actions;
export default quizSlice.reducer;
