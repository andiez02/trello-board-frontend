import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { verifyUserAPI } from "~/apis";
import PageLoadingSpinner from "~/components/Loading/PageLoadingSpinner";

function AccountVerification() {
  //Lấy giá trị email và token từ URL
  let [searchParam] = useSearchParams();
  //   const email = searchParam.get("email");
  //   const token = searchParam.get("token");

  const { email, token } = Object.fromEntries([...searchParam]);

  // Tạo state verify account isSuccess?
  const [verified, setVerified] = useState(false);

  // Gọi API để verify tài khoản
  useEffect(() => {
    if (email && token) {
      verifyUserAPI({ email, token }).then(() => setVerified(true));
    }
  }, [email, token]);

  //Nếu URL có vấn đề, không tồn tại 1 trong 2 email hoặc token --> 404
  if (!email || !token) {
    return <Navigate to="/404" />;
  }

  //Nếu chưa verified xong --> Loading
  if (!verified) {
    return <PageLoadingSpinner caption="Verifying your account..." />;
  }

  //Thành công --> Login page cùng với verifiedEmail
  return <Navigate to={`/login?verifiedEmail=${email}`} />;
}

export default AccountVerification;
