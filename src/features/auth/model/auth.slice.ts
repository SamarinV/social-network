import { PayloadAction, createSlice, isFulfilled } from "@reduxjs/toolkit"
import { createAppAsyncThunk } from "common/utils/create-app-async-thunk"
import { AuthUser, LoginParams, authAPI } from "../api/auth-api"
import { appActions } from "app/app.slice"
import { profileAPI } from "features/profile/api/profile-api"
import { GetUserProfileResponseType, usersAPI } from "features/users/api/users-api"
import { UserType } from "common/types/types"
import { profileThunks } from "features/profile/model/profile.slice"

type InitialState = {
  userData: AuthUser & { smallPhoto: string }
  isLoggedIn: boolean
  captcha: string
  isLoading: boolean
}

const initialState: InitialState = {
  userData: {
    id: 0,
    login: "",
    email: "",
    smallPhoto: "",
  },
  isLoggedIn: false,
  captcha: "",
  isLoading: false,
}

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoggedIn = action.payload.isLoggedIn
        state.userData = action.payload.data
      })
      .addCase(profileThunks.savePhoto.fulfilled, (state, action) => {
        state.userData.smallPhoto = action.payload.data.photos.small
      })
      .addMatcher(
        isFulfilled(authThunks.login, authThunks.logout, authThunks.initializeApp),
        (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
          state.isLoggedIn = action.payload.isLoggedIn
        }
      )
  },
})

// thunks
const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParams>(
  `${slice.name}/login`,
  async (arg, { rejectWithValue }) => {
    const res = await authAPI.login(arg)
    if (res.data.resultCode === 0) {
      return { isLoggedIn: true }
    } else {
      return rejectWithValue(res.data)
    }
  }
)

const logout = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
  `${slice.name}/logout`,
  async (_, { dispatch, rejectWithValue }) => {
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      return { isLoggedIn: false }
    } else {
      return rejectWithValue(res.data)
    }
  }
)

const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean; data: AuthUser & { smallPhoto: string } }, undefined>(
  `${slice.name}/initializeApp`,
  async (_, { rejectWithValue, dispatch }) => {
    const res = await authAPI.me().finally(() => {
      dispatch(appActions.setAppInitialized({ isInitialized: true }))
    })
    if (res.data.resultCode === 0) {
      const userData = await usersAPI.getUserProfile(res.data.data.id)
      return { isLoggedIn: true, data: { ...res.data.data, smallPhoto: userData.data.photos.small } }
    } else {
      return rejectWithValue(res.data)
    }
  }
)

export const authReducer = slice.reducer
export const authThunks = { login, logout, initializeApp }
