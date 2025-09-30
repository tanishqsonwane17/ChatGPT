import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice'; // your existing chat slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
});

export default store;
