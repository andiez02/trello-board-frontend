import axios from "axios";
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatter";
import { refreshTokenAPI } from "~/apis";
import { logoutUserAPI } from "~/redux/user/userSlice";

//Khoong thể import {store} from '~/redux/store' theo cách thông thường ở đây (file js)
//Giải pháp: //* Inject store: là 1 kt khi cần sử dụng biến redux store ở file ngoài phạm vi component
//Khi chạy --> main.jsx --> injectStore --> gán biến mainStore vào axiosReduxStore cục bộ trong file này

let axiosReduxStore;
export const injectStore = (mainStore) => {
  axiosReduxStore = mainStore;
};

//Khởi tạo đối tượng Axios --> custom & cấu hình chung
let authorizedAxiosInstance = axios.create();

//Thời gian chờ tối đa của 1 request: để 10'
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;
// withCredentials: Sẽ cho phép axios tự động gửi cookies trong mỗi request lên BE --> lưu JWT tokens (refresh & access) vào trong httpOnly Cookie của trình duyệt
authorizedAxiosInstance.defaults.withCredentials = true;

//? Config Intercepter
//* Add a request intercepter
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    //Chặn spam click
    interceptorLoadingElements(true);
    return config;
  },
  (error) => {
    //Do sth with request error
    return Promise.reject(error);
  }
);

// Khởi tạo 1 promise gọi api refresh_token
// MỤc đích tạo Promise --> call api refresh_token --> retry lại api bị lỗi trước đó
let refreshTokenPromise = null;

//* Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    //Chặn spam click
    interceptorLoadingElements(false);
    return response;
  },
  (error) => {
    // Any status codes that fall outside the  range of 2xx cause this function to trigger
    // Do sth with response data

    //Chặn spam click
    interceptorLoadingElements(false);

    //! Quan trọng: Xử lý Refresh Token tự động
    //TH1: Nếu nhận mã 401 từ BE, call api logout
    if (error.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserAPI(false));
    }
    //TH2: Nếu nhận mã 410, call api refreshToken để làm mới refreshToken
    //Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
    const originalRequests = error.config;
    console.log("🚀 ~ originalRequests:", originalRequests);
    if (error.response?.status === 410 && !originalRequests._retry) {
      originalRequests._retry = true;

      // Kiểm tra xem nếu chưa có refreshTokenPromise thì thự hiện gọi api refresh_token đồng thời gán vào refreshTokenPromise
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenAPI()
          .then((data) => {
            //đồng thời accessToken đã nằm trong httpOnly cookie (xử lý tù BE)
            return data?.accessToken;
          })
          .catch((_error) => {
            //nếu nhận bất kì lỗi nào từ api refresh_token --> logout
            axiosReduxStore.dispatch(logoutUserAPI(false));
            return Promise.reject(_error); //tránh lỗi gọi 2 lần api logout trong TH API refresh_token trả về lỗi
          })
          .finally(() => {
            // Dù API có ok hay ko thì vẫn gán lại refreshTokenPromise về null như ban đầu
            refreshTokenPromise = null;
          });
      }

      //Cần return trường hợp refreshTokenPromise chạy thành công và xử lý ở đây:
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then((accessToken) => {
        //Bước 1: Đối với TH: nếu dự án cần lưu accessToken vào localStorage hoặc đâu đó thì viết code xử lý ở đây
        // Hiện tại ở đây ko cần vì đã đưa accessToken vào cookie (xử lí từ phía BE) sau khi api refresh_token được gọi thành công

        //Bước 2: Return lại Axios Instance kết hợp các originalRequests để gọi lại những API ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequests);
      });
    }

    //todo --- Xử lí tập trung phần hiển thị thông báo lỗi trả về từ API
    console.log(error);
    let errorMessage = error?.message;
    if (error.response?.data?.message) {
      errorMessage = error.response?.data?.message;
    }
    //Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ 410 - GONE phục vụ việc tự động refresh
    if (error.response?.status !== 410) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default authorizedAxiosInstance;
