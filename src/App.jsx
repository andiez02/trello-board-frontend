import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Board from "~/pages/Boards/_id";
import NotFound from "./pages/404/NotFound";
import Auth from "./pages/Auth/Auth";
import AccountVerification from "./pages/Auth/AccountVerification";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "~/redux/user/userSlice";

const ProtectedRoute = ({ user }) => {
  if (!user) return <Navigate to="/login" replace={true} />;
  return <Outlet />; // <Outlet /> của react-router-dom hiển thị Child Route
};

function App() {
  const currentUser = useSelector(selectCurrentUser);
  return (
    <Routes>
      {/* Redirect route */}
      <Route
        path="/"
        element={
          <Navigate to="/boards/67848999fd4e30cb0c0e5078" replace={true} />
        }
      />

      {/* Authentication */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/account/verification" element={<AccountVerification />} />

      <Route element={<ProtectedRoute user={currentUser} />}>
        {/* Board Details */}
        <Route path="/boards/:boardId" element={<Board />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
