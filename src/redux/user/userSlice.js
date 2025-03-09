import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { API_ROOT } from "~/utils/constants";

//Khởi tạo giá trị State của slice trong redux
const initialState = {
  currentUser: null,
};

//Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducer
export const loginUserAPI = createAsyncThunk(
  "user/loginUserAPI",
  async (data) => {
    const request = await authorizedAxiosInstance.post(
      `${API_ROOT}/v1/users/login`,
      data
    );
    const response = request.data;
    return response;
  }
);

// Khởi tạo một Slice trong kho lưu trữ Redux store
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  //ExtraReducers: Nơi xử lí dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // action.payload laf response.data trả về
      const user = action.payload;
      state.currentUser = user;
    });
  },
});

// Action creators are generated for each case reducer function
//*Actions: Là nơi cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thôgn qua reducer (chạy động bộ)
// export const {} = userSlice.actions;

//*Selectors: Là nơi cho các component bên dưới gọi bằng hook callSelector() để lấy dữ liệu từ trong redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser;
};

export const userReducer = userSlice.reducer;
