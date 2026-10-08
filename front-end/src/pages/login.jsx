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
    if (usernameOrEmail.trim() === "" || password === "") {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await API.post("/login", {
        username_or_email: usernameOrEmail,
        password,
      });

      if (res.data.message === "Login Successful") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user_id", res.data.user_id);

        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Login Error:", err);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);

        alert(
          err.response.data?.detail ||
            err.response.data?.message ||
            "Login Failed"
        );
      } else {
        alert(
          "Unable to connect to the backend. Check CORS or backend URL."
        );
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-card">

          {/* Avatar */}
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User"
            className="avatar"
          />

          {/* Heading */}
          <h1>Welcome Back</h1>

          <p className="subtitle">
            Login to continue
          </p>


          {/* Username / Email */}
          <div className="login-field">

            <input
              type="text"
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChange={(e) =>
                setUsernameOrEmail(e.target.value)
              }
              autoComplete="username"
            />

          </div>


          {/* Password */}
          <div className="password-container">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loginUser();
                }
              }}
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>


          {/* Options */}
          <div className="options">

            <label className="remember-option">

              <input
                type="checkbox"
              />

              <span>
                Remember Me
              </span>

            </label>


            <a
              href="#"
              onClick={(e) =>
                e.preventDefault()
              }
            >
              Forgot Password?
            </a>

          </div>


          {/* Login Button */}
          <button
            type="button"
            className="login-btn"
            onClick={loginUser}
          >
            Login
          </button>


          {/* Register */}
          <p className="bottom-text">

            Don't have an account?{" "}

            <Link to="/register">
              Create Account
            </Link>

          </p>

        </div>

      </div>
    </div>
  );
}

export default Login;