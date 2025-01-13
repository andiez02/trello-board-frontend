import axios from "axios";
import { API_ROOT } from "~/utils/constants";

//Intercepter
export const fetchBoardDetailAPI = async (boardId) => {
  const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
  const response = request.data;
  return response;
};
