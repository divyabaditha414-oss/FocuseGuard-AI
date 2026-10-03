import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async () => {
  if (usernameOrEmail === "" || password === "") {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await API.post("/login", {
      username_or_email: usernameOrEmail,
      password,
    });

    if (res.data.message === "Login Successful") {
      alert("Login Successful");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user_id", res.data.user_id);
      alert("user ID:  " + res.data.user_id);
      navigate("/dashboard");
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    alert("Login Failed");
  }
};

return (
  <div className="login-container">
    <div className="login-card">

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="User"
        className="avatar"
      />

      <h1>Welcome Back</h1>
      <p className="subtitle">Login to continue</p>

     <input
         type="text"
         placeholder="Username or Email"
         value={usernameOrEmail}
         onChange={(e) => setUsernameOrEmail(e.target.value)}
      />

      <div className="password-container">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <span
          className="eye-icon"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className="options">
        <label>
          <input type="checkbox" />
          Remember Me
        </label>

        <a href="#">Forgot Password?</a>
      </div>

      <button className="login-btn" onClick={loginUser}>
        Login
      </button>

      <p className="bottom-text">
        Don't have an account?{" "}
        <Link to="/register">Create Account</Link>
      </p>

    </div>
  </div>
);

}
export default Login;