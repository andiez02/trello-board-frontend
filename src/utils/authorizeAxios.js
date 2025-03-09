import axios from "axios";
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatter";

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
