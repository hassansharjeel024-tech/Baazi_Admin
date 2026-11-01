import { createSlice } from "@reduxjs/toolkit";

export const TOKEN_KEY = "baazi_admin_token";
export const USER_KEY = "baazi_admin_user";

const readStorage = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return { token: token || null, user: user || null };
  } catch {
    return { token: null, user: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: readStorage(),
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);