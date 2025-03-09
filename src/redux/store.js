import { configureStore } from "@reduxjs/toolkit";
import { activeBoardReducer } from "./activeBoard/activeBoardSlice";
import { userReducer } from "./user/userSlice";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; //default localStorage

// Cấu hình persist
const rootPersistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["user"], // định nghĩa slide dữ liệu ĐƯỢC PHÉP duy tri qua mỗi lần f5 trình duyệt
  // blacklist: ["user"] //định nghĩa slide dữ liệu KHÔNG ĐƯỢC PHÉP duy tri qua mỗi lần f5 trình duyệt
};

// Combine các reducers trong dự án của chúng ta ở đây
const reducers = combineReducers({
  activeBoard: activeBoardReducer,
  user: userReducer,
});

//Thực hiện persist Reducer
const persistedReducers = persistReducer(rootPersistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
