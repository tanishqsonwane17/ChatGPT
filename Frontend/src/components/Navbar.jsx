import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../store/authSlice";

const Navbar = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/auth/logout", {}, { withCredentials: true });
      dispatch(logout()); // Redux state update
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      {!user && <Link to="/login">Login</Link>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
};

export default Navbar;
