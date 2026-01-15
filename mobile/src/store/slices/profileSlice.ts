import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

interface ProfileState {
  profiles: any[];
  activeProfile: any | null;
  myList: any[];
  watchHistory: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profiles: [],
  activeProfile: null,
  myList: [],
  watchHistory: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchProfiles = createAsyncThunk(
  'profile/fetchProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getProfiles();
      return response.data.profiles;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profiles');
    }
  }
);

export const createProfile = createAsyncThunk(
  'profile/create',
  async ({ name, isKids }: { name: string; isKids: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiService.createProfile(name, isKids);
      return response.data.profile;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create profile');
    }
  }
);

export const fetchMyList = createAsyncThunk(
  'profile/fetchMyList',
  async (profileId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getMyList(profileId);
      return response.data.myList;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch My List');
    }
  }
);

export const addToMyList = createAsyncThunk(
  'profile/addToMyList',
  async ({ profileId, contentId }: { profileId: string; contentId: string }, { rejectWithValue }) => {
    try {
      await apiService.addToMyList(profileId, contentId);
      return contentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to My List');
    }
  }
);

export const removeFromMyList = createAsyncThunk(
  'profile/removeFromMyList',
  async ({ profileId, contentId }: { profileId: string; contentId: string }, { rejectWithValue }) => {
    try {
      await apiService.removeFromMyList(profileId, contentId);
      return contentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from My List');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setActiveProfile: (state, action: PayloadAction<any>) => {
      state.activeProfile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch profiles
    builder.addCase(fetchProfiles.fulfilled, (state, action) => {
      state.profiles = action.payload;
    });

    // Create profile
    builder.addCase(createProfile.fulfilled, (state, action) => {
      state.profiles.push(action.payload);
    });

    // Fetch My List
    builder.addCase(fetchMyList.fulfilled, (state, action) => {
      state.myList = action.payload;
    });

    // Add to My List
    builder.addCase(addToMyList.fulfilled, (state, action) => {
      // Will be refreshed on next fetch
    });

    // Remove from My List
    builder.addCase(removeFromMyList.fulfilled, (state, action) => {
      state.myList = state.myList.filter((item: any) => item._id !== action.payload);
    });
  },
});

export const { setActiveProfile, clearError } = profileSlice.actions;
export default profileSlice.reducer;
