import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dbService } from '../../services/apiService';

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await dbService.getVideos(userId);
      return response.videos || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async ({ videoUri, caption, category }, { rejectWithValue }) => {
    try {
      const result = await dbService.uploadVideo(videoUri, caption, category);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      });
  },
});

export default videoSlice.reducer;
