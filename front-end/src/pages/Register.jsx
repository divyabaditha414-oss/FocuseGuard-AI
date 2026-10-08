import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* =====================================================
     REGISTER USER
  ===================================================== */

  const registerUser = async () => {

    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }


    // ---------------------------------------------
    // EMAIL VALIDATION
    // ---------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      alert("Please enter a valid email");
      return;
    }


    // ---------------------------------------------
    // PASSWORD VALIDATION
    // ---------------------------------------------

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."
      );
      return;
    }


    // ---------------------------------------------
    // CONFIRM PASSWORD
    // ---------------------------------------------

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }


    // ---------------------------------------------
    // API
    // ---------------------------------------------

    try {

      const res = await API.post("/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });


      if (
        res.data.message ===
        "Registration Successful"
      ) {

        alert("Registration Successful");

        navigate("/");

      } else {

        alert(res.data.message);

      }

    } catch (err) {

      console.error(
        "Registration Error:",
        err
      );

      if (err.response) {

        alert(
          err.response.data?.detail ||
          err.response.data?.message ||
          "Registration Failed"
        );

      } else {

        alert(
          "Unable to connect to the backend. Check CORS or backend URL."
        );

      }

    }
  };


  return (

    <div className="register-page">

      <div className="register-container">

        <div className="register-card">

          {/* =================================================
              AVATAR
          ================================================= */}

          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User"
            className="avatar"
          />


          {/* =================================================
              HEADING
          ================================================= */}

          <h1>
            Create Account
          </h1>

          <p className="subtitle">
            Register to continue
          </p>


          {/* =================================================
              USERNAME
          ================================================= */}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            autoComplete="username"
          />


          {/* =================================================
              EMAIL
          ================================================= */}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
          />


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="password-container">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >

              {showPassword
                ? "🙈"
                : "👁️"}

            </button>

          </div>


          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="password-container">

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              autoComplete="new-password"
            />

            <button
              type="button"
              className="eye-icon"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >

              {showConfirmPassword
                ? "🙈"
                : "👁️"}

            </button>

          </div>


          {/* =================================================
              PASSWORD RULES
          ================================================= */}

          <div className="password-rules">

            <p
              className={
                password.length >= 8
                  ? "valid"
                  : "invalid"
              }
            >
              {password.length >= 8
                ? "✔"
                : "✖"}{" "}
              At least 8 characters
            </p>


            <p
              className={
                /[A-Z]/.test(password)
                  ? "valid"
                  : "invalid"
              }
            >
              {/[A-Z]/.test(password)
                ? "✔"
                : "✖"}{" "}
              One uppercase letter
            </p>


            <p
              className={
                /[a-z]/.test(password)
                  ? "valid"
                  : "invalid"
              }
            >
              {/[a-z]/.test(password)
                ? "✔"
                : "✖"}{" "}
              One lowercase letter
            </p>


            <p
              className={
                /\d/.test(password)
                  ? "valid"
                  : "invalid"
              }
            >
              {/\d/.test(password)
                ? "✔"
                : "✖"}{" "}
              One number
            </p>


            <p
              className={
                /[!@#$%^&*(),.?":{}|<>]/.test(
                  password
                )
                  ? "valid"
                  : "invalid"
              }
            >
              {/[!@#$%^&*(),.?":{}|<>]/.test(
                password
              )
                ? "✔"
                : "✖"}{" "}
              One special character
            </p>

          </div>


          {/* =================================================
              PASSWORD MATCH
          ================================================= */}

          {confirmPassword && (
            <p
              className={
                password === confirmPassword
                  ? "valid"
                  : "invalid"
              }
            >
              {password === confirmPassword
                ? "✔ Passwords match"
                : "✖ Passwords do not match"}
            </p>
          )}


          {/* =================================================
              REGISTER BUTTON
          ================================================= */}

          <button
            type="button"
            className="register-btn"
            onClick={registerUser}
          >
            Register
          </button>


          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <p className="bottom-text">

            Already have an account?{" "}

            <Link to="/">
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;