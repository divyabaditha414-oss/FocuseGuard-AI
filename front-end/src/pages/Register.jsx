import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const registerUser = async () => {
  
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    // Password Validation
    // Password Validation
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

if (!passwordRegex.test(password)) {
  alert(
    "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."
  );
  return;
}

if (password !== confirmPassword) {
  alert("Passwords do not match");
  return;
}

    try {
      const res =await API.post("/register", {
    username,
    email,
    password,
  });

      if (res.data.message === "Registration Successful") {
        alert("Registration Successful");
        navigate("/");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Registration Failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="User"
          className="avatar"
        />
        <h1>Create Account</h1>
        <p className="subtitle">Register to continue</p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

<div className="password-container">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <span
    className="eye-icon"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>
<div className="password-container">
<input
  type={showConfirmPassword ? "text" : "password"}
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
<span
    className="eye-icon"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? "🙈" : "👁️"}
  </span>
  </div>
<div className="password-rules">
  <p className={password.length >= 8 ? "valid" : "invalid"}>
    {password.length >= 8 ? "✔" : "✖"} At least 8 characters
  </p>

  <p className={/[A-Z]/.test(password) ? "valid" : "invalid"}>
    {/[A-Z]/.test(password) ? "✔" : "✖"} One uppercase letter
  </p>

  <p className={/[a-z]/.test(password) ? "valid" : "invalid"}>
    {/[a-z]/.test(password) ? "✔" : "✖"} One lowercase letter
  </p>

  <p className={/\d/.test(password) ? "valid" : "invalid"}>
    {/\d/.test(password) ? "✔" : "✖"} One number
  </p>

  <p className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "valid" : "invalid"}>
    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✔" : "✖"} One special character
  </p>
</div>
<p className={password === confirmPassword && confirmPassword ? "valid" : "invalid"}>
  {confirmPassword
    ? password === confirmPassword
      ? "✔ Passwords match"
      : "✖ Passwords do not match"
    : ""}
</p>



        <button
          className="register-btn"
          onClick={registerUser}
        >
          Register
        </button>

        <p className="bottom-text">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;