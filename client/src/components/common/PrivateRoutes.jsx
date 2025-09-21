import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import UserLayout from "../layout/UserLayout";
import { selectUser } from "../../store/slices/authSlice";

export default function PrivateRoute() {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <UserLayout />;
}
