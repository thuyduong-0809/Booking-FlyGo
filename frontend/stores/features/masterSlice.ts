"use client";

import { _GLOBAL } from "@/contstants";
import { createSlice } from "@reduxjs/toolkit";
import secureLocalStorage from "react-secure-storage";

const initialState = {
  loading: true,
  is_login: false,
  access_token: "",
  isAdmin:false,
  isAuth:false,
  user: {
    avatar:'',
    id:''
  },
};

export const masterSlice = createSlice({
  name: "master",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
    //   console.log("action: ", action);
      state.access_token = action.payload.data.accessToken;
      state.user = action.payload;
      state.is_login = true;
    },
    initialBootState: (state) => {
      if(typeof window !== 'undefined'){
        let masterLocalStorage = secureLocalStorage.getItem("master") as string;
        if (masterLocalStorage) {
          let parseLocalStorage = JSON.parse(masterLocalStorage);
          state.is_login = parseLocalStorage.is_login;
          state.access_token = parseLocalStorage.access_token;
          state.user = parseLocalStorage.user;
        } else {
          secureLocalStorage.setItem("master", JSON.stringify(initialState));
        }
        state.loading = false;
      }
    },
    updateLocalStorage: (state: any) => {
     secureLocalStorage.setItem("master", JSON.stringify(state));
    },
    logout: (state:any) => {
        state.is_login = false;
        // state.user = { avatar: '', id: '' };
        state.access_token = "";
        secureLocalStorage.removeItem("master"); //xoá storage nếu cần
    },
  },
});

export const {initialBootState, updateLocalStorage, loginSuccess, logout } =
  masterSlice.actions;

export default masterSlice.reducer;
