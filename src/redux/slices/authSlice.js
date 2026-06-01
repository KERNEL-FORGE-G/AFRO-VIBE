import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/apiService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.signInWithEmailAndPassword(email, password);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, username }, { rejectWithValue }) => {
    try {
      const response = await authService.createUserWithEmailAndPassword(email, password, username);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.signOut();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    onlineMode: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setOnlineMode: (state, action) => {
      state.onlineMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, setOnlineMode } = authSlice.actions;
export default authSlice.reducer;
