import axios from "axios";
import { API_ROOT } from "~/utils/constants";

//Intercepter

//Boards
export const fetchBoardDetailAPI = async (boardId) => {
  const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  const response = request.data;
  return response;
};

//Columns
export const createNewColumnAPI = async (newColumnData) => {
  const request = await axios.post(`${API_ROOT}/v1/columns`, newColumnData);
  const response = request.data;
  return response;
};

//Cards
export const createNewCardAPI = async (newCardData) => {
  const request = await axios.post(`${API_ROOT}/v1/cards`, newCardData);
  const response = request.data;
  return response;
};
