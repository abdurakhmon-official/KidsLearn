import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthRole, AuthUser, ChildProfile } from "@/types/api";

export type AuthState = {
  user: AuthUser | null;
  child: ChildProfile | null;
  role: AuthRole | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  child: null,
  role: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setParentSession: (state, action: PayloadAction<{ user: AuthUser; isAdmin: boolean }>) => {
      state.user = action.payload.user;
      state.child = null;
      state.role = action.payload.isAdmin ? "ADMIN" : "PARENT";
      state.initialized = true;
    },
    setChildSession: (state, action: PayloadAction<{ parent: AuthUser; child: ChildProfile }>) => {
      state.user = action.payload.parent;
      state.child = action.payload.child;
      state.role = "CHILD";
      state.initialized = true;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.child = null;
      state.role = null;
      state.initialized = true;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
  },
});

export const { setParentSession, setChildSession, updateUser, clearAuth, setInitialized } = authSlice.actions;

export default authSlice.reducer;
