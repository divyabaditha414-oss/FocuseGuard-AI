import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_BASE = "https://focuse-guard-ai-q44i.vercel.app";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const userId = localStorage.getItem("user_id") || "1";

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setProfileError("");

      const response = await axios.get(
        `${API_BASE}/profile/${userId}`
      );

      console.log("PROFILE RESPONSE:", response.data);

      setProfile(response.data);
      setUsername(response.data.username || "");
    } catch (error) {
      console.error("PROFILE ERROR:", error);

      setProfileError(
        error.response?.data?.detail ||
        "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setProfileMessage("");
    setProfileError("");
    setUsername(profile.username || "");
    setEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setUsername(profile.username || "");
    setEditingProfile(false);
    setProfileMessage("");
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      setProfileError("Username cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await axios.put(
        `${API_BASE}/profile/${userId}`,
        {
          username: username.trim()
        }
      );

      setProfile({
        ...profile,
        username: response.data.username
      });

      setUsername(response.data.username);
      setEditingProfile(false);

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      setProfileError(
        error.response?.data?.detail ||
        "Unable to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const getPasswordStrength = () => {
    if (!newPassword) {
      return {
        label: "Enter a password",
        level: 0
      };
    }

    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        level: 1
      };
    }

    if (score <= 4) {
      return {
        label: "Medium",
        level: 2
      };
    }

    return {
      label: "Strong",
      level: 3
    };
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError(
        "Enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setPasswordError(
        "Enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      await axios.put(
        `${API_BASE}/profile/${userId}/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        }
      );

      setPasswordMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("PASSWORD ERROR:", error);

      setPasswordError(
        error.response?.data?.detail ||
        "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const strength = getPasswordStrength();

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-error-page">
          <div className="error-icon">!</div>

          <h2>
            Unable to load profile
          </h2>

          <p>
            {profileError ||
              "Something went wrong."}
          </p>

          <button
            className="primary-btn"
            onClick={loadProfile}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    profile.username || "FocusGuard User";

  // First letter of username
  const firstLetter =
    displayName.charAt(0).toUpperCase();

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-header">

        <div>

          <div className="eyebrow">
            ACCOUNT
          </div>

          <h1>
            Profile
          </h1>

          <p>
            Manage your personal information,
            account security and FocusGuard settings.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            className="refresh-btn"
            onClick={loadProfile}
          >
            ↻ Refresh
          </button>

        </div>

      </div>


      {/* PROFILE HERO */}

      <section className="profile-hero">

        <div className="profile-avatar-large">
          {firstLetter}
        </div>

        <div className="hero-info">

          <div className="hero-name-row">

            <h2>
              {displayName}
            </h2>

            <span className="active-badge">
              <span className="status-dot"></span>
              Active
            </span>

          </div>

          <p className="hero-email">
            {profile.email}
          </p>

          <p className="hero-subtitle">
            FocusGuard AI Member
          </p>

        </div>

        <div className="hero-id">

          <span>
            USER ID
          </span>

          <strong>
            #{profile.id}
          </strong>

        </div>

      </section>


      {/* PROFILE MESSAGE */}

      {profileMessage && (
        <div className="success-message">
          <span>✓</span>
          {profileMessage}
        </div>
      )}

      {profileError && (
        <div className="error-message">
          <span>!</span>
          {profileError}
        </div>
      )}


      {/* MAIN CARDS */}

      <div className="profile-grid">

        {/* PERSONAL INFORMATION */}

        <section className="profile-card">

          <div className="card-header">

            <div className="card-icon blue">
              👤
            </div>

            <div>
              <h3>
                Personal Information
              </h3>

              <p>
                Your FocusGuard account details
              </p>
            </div>

          </div>


          <div className="information-list">

            {/* USERNAME */}

            <div className="information-item">

              <div className="information-content">

                <span className="field-label">
                  Full Name / Username
                </span>

                {editingProfile ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    placeholder="Enter your name"
                  />
                ) : (
                  <strong>
                    {profile.username}
                  </strong>
                )}

              </div>

              {!editingProfile && (
                <button
                  className="edit-btn"
                  onClick={handleEditProfile}
                >
                  ✎ Edit
                </button>
              )}

            </div>


            {/* EMAIL */}

            <div className="information-item">

              <div className="information-content">

                <span className="field-label">
                  Email Address
                </span>

                <strong>
                  {profile.email}
                </strong>

              </div>

              <span className="verified">
                ✓ Verified
              </span>

            </div>


            {/* USER ID */}

            <div className="information-item">

              <div className="information-content">

                <span className="field-label">
                  User ID
                </span>

                <strong>
                  #{profile.id}
                </strong>

              </div>

            </div>


            {/* STATUS */}

            <div className="information-item">

              <div className="information-content">

                <span className="field-label">
                  Account Status
                </span>

                <strong className="status-text">
                  ● Active
                </strong>

              </div>

            </div>

          </div>


          {/* EDIT BUTTONS */}

          {editingProfile && (

            <div className="edit-actions">

              <button
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          )}

        </section>


        {/* PASSWORD SECURITY */}

        <section className="profile-card">

          <div className="card-header">

            <div className="card-icon purple">
              🔐
            </div>

            <div>

              <h3>
                Password & Security
              </h3>

              <p>
                Keep your FocusGuard account protected
              </p>

            </div>

          </div>


          <form
            className="password-form"
            onSubmit={handleChangePassword}
          >

            {/* CURRENT PASSWORD */}

            <div className="password-field">

              <label>
                Current Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showCurrent
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowCurrent(
                      !showCurrent
                    )
                  }
                >
                  {showCurrent
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>


            {/* NEW PASSWORD */}

            <div className="password-field">

              <label>
                New Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showNew
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowNew(
                      !showNew
                    )
                  }
                >
                  {showNew
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>


            {/* PASSWORD STRENGTH */}

            <div className="password-strength">

              <div className="strength-top">

                <span>
                  Password strength
                </span>

                <strong
                  className={
                    strength.level === 1
                      ? "weak"
                      : strength.level === 2
                      ? "medium"
                      : strength.level === 3
                      ? "strong"
                      : ""
                  }
                >
                  {strength.label}
                </strong>

              </div>

              <div className="strength-bars">

                <span
                  className={
                    strength.level >= 1
                      ? "filled"
                      : ""
                  }
                />

                <span
                  className={
                    strength.level >= 2
                      ? "filled"
                      : ""
                  }
                />

                <span
                  className={
                    strength.level >= 3
                      ? "filled"
                      : ""
                  }
                />

              </div>

              <small>
                Use 8+ characters with numbers,
                uppercase letters and symbols.
              </small>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="password-field">

              <label>
                Confirm New Password
              </label>

              <div className="password-wrapper">

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() =>
                    setShowConfirm(
                      !showConfirm
                    )
                  }
                >
                  {showConfirm
                    ? "🙈"
                    : "👁"}
                </button>

              </div>

            </div>


            {passwordMessage && (
              <div className="success-message compact">
                <span>✓</span>
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="error-message compact">
                <span>!</span>
                {passwordError}
              </div>
            )}


            <button
              type="submit"
              className="primary-btn password-submit"
              disabled={changingPassword}
            >
              {changingPassword
                ? "Changing Password..."
                : "🔐 Change Password"}
            </button>

          </form>

        </section>

      </div>


      {/* SECURITY BANNER */}

      <section className="security-status">

        <div className="security-status-icon">
          🛡️
        </div>

        <div className="security-status-content">

          <div className="security-title-row">

            <h3>
              Account Security
            </h3>

            <span className="secure-badge">
              ● Protected
            </span>

          </div>

          <p>
            Your FocusGuard account is active and
            protected with password authentication.
          </p>

        </div>

        <div className="security-checks">

          <div>
            <span>✓</span>
            Account active
          </div>

          <div>
            <span>✓</span>
            Password authentication
          </div>

        </div>

      </section>


      {/* BOTTOM DASHBOARD BUTTON */}

      <div className="bottom-actions">

        <button
          className="dashboard-bottom-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>


      <div className="profile-footer">
        FocusGuard AI • Focus intentionally.
      </div>

    </div>
  );
}

export default Profile;