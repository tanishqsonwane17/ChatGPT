import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // initially no user logged in
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload; // set user on login/fetch
    },
    logout(state) {
      state.user = null; // reset user on logout
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
