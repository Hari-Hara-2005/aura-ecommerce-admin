import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adminUser: null,
  isAuthenticated: false,
  role: 'superadmin',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAdminUser: (state, action) => {
      state.adminUser = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    logoutAdmin: (state) => {
      state.adminUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdminUser, logoutAdmin } = authSlice.actions;

export const selectAdminUser = (state) => state.auth.adminUser;
export const selectIsAdminAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
