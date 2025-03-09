import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { isEmpty } from "lodash";
import { API_ROOT } from "~/utils/constants";
import { generatePlaceholderCard } from "~/utils/formatter";
import { mapOrder } from "~/utils/sort";

//Khởi tạo giá trị State của slice trong redux
const initialState = {
  currentActiveBoard: null,
};

//Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducer
export const fetchBoardDetailAPI = createAsyncThunk(
  "activeBoard/fetchBoardDetailAPI",
  async (boardId) => {
    const request = await authorizedAxiosInstance.get(
      `${API_ROOT}/v1/boards/${boardId}`
    );
    const response = request.data;
    return response;
  }
);

// Khởi tạo một Slice trong kho lưu trữ Redux store
export const activeBoardSlice = createSlice({
  name: "activeBoard",
  initialState,
  reducers: {
    updateCurrentActiveBoard: (state, action) => {
      const fullBoard = action.payload;

      //Xu li du lieu

      //Update du lieu currentActiveBoard
      state.currentActiveBoard = fullBoard;
    },
  },
  //ExtraReducers: Nơi xử lí dữ liệu bất đồng bộ
  extraReducers: (builder) => {
    builder.addCase(fetchBoardDetailAPI.fulfilled, (state, action) => {
      // action.payload laf response.data trả về
      let board = action.payload;

      //Xử lí dữ liệu
      //Sort column before pass data
      board.columns = mapOrder(board.columns, board.columnOrderIds, "_id");

      //Bug kéo thả Card vào 1 Column rỗng
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          //Sort card before pass data
          column.cards = mapOrder(column.cards, column.cardOrderIds, "_id");
        }
      });

      state.currentActiveBoard = board;
    });
  },
});

// Action creators are generated for each case reducer function
//*Actions: Là nơi cho các component bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thôgn qua reducer (chạy động bộ)
export const { updateCurrentActiveBoard } = activeBoardSlice.actions;

//*Selectors: Là nơi cho các component bên dưới gọi bằng hook callSelector() để lấy dữ liệu từ trong redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard;
};

export const activeBoardReducer = activeBoardSlice.reducer;
