import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isAuth = localStorage.getItem("user");

  return isAuth ? children : <Navigate to="/login" />;
}