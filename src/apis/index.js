import { toast } from "react-toastify";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { API_ROOT } from "~/utils/constants";

//Intercepter

//Boards
// export const fetchBoardDetailAPI = async (boardId) => {
//   const request = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
//   const response = request.data;
//   return response;
// };

export const updateBoardDetailAPI = async (boardId, updateData) => {
  const request = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData
  );
  const response = request.data;
  return response;
};

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/boards/supports/moving_card`,
    updateData
  );
  return response.data;
};

//Columns
export const createNewColumnAPI = async (newColumnData) => {
  const request = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/columns`,
    newColumnData
  );
  const response = request.data;
  return response;
};

export const updateColumnDetailAPI = async (columnId, updateData) => {
  const request = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/columns/${columnId}`,
    updateData
  );
  const response = request.data;
  return response;
};

export const deleteColumnDetailAPI = async (columnId) => {
  const request = await authorizedAxiosInstance.delete(
    `${API_ROOT}/v1/columns/${columnId}`
  );
  const response = request.data;
  return response;
};

//Cards
export const createNewCardAPI = async (newCardData) => {
  const request = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/cards`,
    newCardData
  );
  const response = request.data;
  return response;
};

//User
export const registerUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(
    `${API_ROOT}/v1/users/register`,
    data
  );
  toast.success(
    "Account created successfully! Please check and verify your account before logging in!",
    { theme: "colored" }
  );
  return response.data;
};

export const verifyUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/users/verify`,
    data
  );
  toast.success(
    "Account verified successfully! Now you can login to enjoy our service",
    { theme: "colored" }
  );
  return response.data;
};
