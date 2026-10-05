import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  getNotificationSettings,
  saveNotificationSettings,
} from "../utils/notificationSettings";

const API_URL = "https://focuse-guard-ai-q44i.vercel.app";

function Settings() {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] =
    useState(null);

  const [
    notificationSettings,
    setNotificationSettings,
  ] = useState(
    DEFAULT_NOTIFICATION_SETTINGS
  );

  const [showAddSite, setShowAddSite] =
    useState(false);

  const [newSite, setNewSite] =
    useState("");

  const [blockedSites, setBlockedSites] =
    useState([
      {
        name: "YouTube",
        mode: "Hard block",
      },
      {
        name: "Instagram",
        mode: "Soft nudge",
      },
    ]);

  const [focusDuration, setFocusDuration] =
    useState(35);

  const [breakInterval, setBreakInterval] =
    useState(5);

  const [autoStart, setAutoStart] =
    useState(false);

  const [theme, setTheme] =
    useState("System");

  // ==================================================
  // LOAD PROFILE
  // ==================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId =
          localStorage.getItem("user_id") ||
          "1";

        const response = await fetch(
          `${API_URL}/profile/${userId}`
        );

        if (!response.ok) {
          throw new Error(
            "Profile request failed"
          );
        }

        const data =
          await response.json();

        setUserProfile(data);
      } catch (error) {
        console.error(
          "Profile error:",
          error
        );
      }
    };

    loadProfile();
  }, []);

  // ==================================================
  // LOAD NOTIFICATION SETTINGS
  // ==================================================

  useEffect(() => {
    setNotificationSettings(
      getNotificationSettings()
    );
  }, []);

  // ==================================================
  // UPDATE NOTIFICATION
  // ==================================================

  const updateNotification = (
    key,
    value
  ) => {
    setNotificationSettings(
      (previous) => {
        const updated = {
          ...previous,
          [key]: value,
        };

        saveNotificationSettings(
          updated
        );

        return updated;
      }
    );
  };

  // ==================================================
  // TEST SOUND
  // ==================================================

  const testSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context =
        new AudioContext();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.connect(gain);

      gain.connect(
        context.destination
      );

      oscillator.frequency.value =
        880;

      oscillator.type = "sine";

      gain.gain.setValueAtTime(
        0.15,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.3
      );

      oscillator.start();

      oscillator.stop(
        context.currentTime + 0.3
      );
    } catch (error) {
      console.error(
        "Sound error:",
        error
      );
    }
  };

  // ==================================================
  // ADD SITE
  // ==================================================

  const addBlockedSite = () => {
    const value =
      newSite.trim();

    if (!value) return;

    setBlockedSites(
      (previous) => [
        ...previous,
        {
          name: value,
          mode: "Soft nudge",
        },
      ]
    );

    setNewSite("");

    setShowAddSite(false);
  };

  // ==================================================
  // REMOVE SITE
  // ==================================================

  const removeBlockedSite = (
    index
  ) => {
    setBlockedSites(
      (previous) =>
        previous.filter(
          (_, i) =>
            i !== index
        )
    );
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = () => {
    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "username"
    );

    navigate("/");
  };

  const userName =
    userProfile?.username ||
    userProfile?.name ||
    localStorage.getItem(
      "username"
    ) ||
    "User";

  const avatarLetter =
    userName
      .charAt(0)
      .toUpperCase();

  // ==================================================
  // NOTIFICATION GROUP
  // ==================================================

  const notificationGroups = [
    {
      title: "SESSION",
      items: [
        [
          "sessionStarted",
          "Focus session started",
          "Notify when a focus session begins",
          true,
        ],
        [
          "sessionPaused",
          "Focus session paused",
          "Notify when a session is paused",
          false,
        ],
        [
          "sessionResumed",
          "Focus session resumed",
          "Notify when a paused session resumes",
          false,
        ],
        [
          "sessionCompleted",
          "Focus session completed",
          "Notify when the target session finishes",
          true,
        ],
        [
          "sessionEndedEarly",
          "Session ended early",
          "Notify when a session is stopped early",
          true,
        ],
      ],
    },

    {
      title: "BREAKS",
      items: [
        [
          "breakStarted",
          "Break started",
          "Notify when a break begins",
          true,
        ],
        [
          "breakEndingSoon",
          "Break ending soon",
          "30-second break warning",
          true,
        ],
        [
          "breakOver",
          "Break over",
          "Notify when it is time to focus again",
          true,
        ],
      ],
    },

    {
      title: "DISTRACTIONS",
      items: [
        [
          "distractionDetected",
          "Distraction detected",
          "Alert when a non-productive app is detected",
          true,
        ],
        [
          "returnedToFocus",
          "Returned to focus",
          "Notify when you return to productive activity",
          false,
        ],
        [
          "repeatedDistraction",
          "Repeated distraction",
          "Alert after repeated switching to the same distracting app",
          true,
        ],
      ],
    },

    {
      title: "GOALS & TARGETS",
      items: [
        [
          "targetReached",
          "Focus target reached",
          "Notify when your session target is reached",
          true,
        ],
        [
          "dailyGoal",
          "Daily focus goal achieved",
          "Celebrate completing your daily goal",
          true,
        ],
        [
          "weeklyGoal",
          "Weekly focus goal achieved",
          "Celebrate completing your weekly goal",
          false,
        ],
        [
          "fallingBehind",
          "Falling behind weekly goal",
          "Receive a mid-week progress warning",
          false,
        ],
      ],
    },

    {
      title: "STREAKS",
      items: [
        [
          "streakMaintained",
          "Daily streak maintained",
          "Celebrate maintaining your streak",
          false,
        ],
        [
          "streakAtRisk",
          "Streak at risk",
          "Remind you before your streak is lost",
          true,
        ],
        [
          "personalBestStreak",
          "New personal best streak",
          "Celebrate a new streak record",
          true,
        ],
      ],
    },

    {
      title: "AI & INSIGHTS",
      items: [
        [
          "newRecommendation",
          "New AI recommendation",
          "Notify when a new recommendation is available",
          false,
        ],
        [
          "weeklyDigest",
          "Weekly digest ready",
          "Notify when your weekly insight summary is ready",
          false,
        ],
        [
          "recommendationFollowUp",
          "Recommendation follow-up",
          "Follow up on recommendations you tried",
          false,
        ],
        [
          "recoverySuggestion",
          "Recovery day suggested",
          "Suggest recovery after declining focus",
          false,
        ],
      ],
    },

    {
      title: "MILESTONES",
      items: [
        [
          "deepFocusMilestone",
          "Deep focus milestone",
          "Celebrate uninterrupted focus milestones",
          true,
        ],
        [
          "bestSession",
          "Best session ever",
          "Celebrate your longest/best session",
          true,
        ],
        [
          "bestWeek",
          "Best week ever",
          "Celebrate a new weekly record",
          true,
        ],
      ],
    },
  ];

  return (
    <div className="settings-page">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="settings-sidebar">

        <div className="settings-brand">

          <div className="settings-brand-icon">
            🧠
          </div>

          <div>
            <div className="settings-brand-name">
              FocusGuard AI
            </div>

            <div className="settings-brand-subtitle">
              Attention Intelligence
            </div>
          </div>

        </div>


        <div className="settings-menu-section">

          <div className="settings-menu-title">
            MAIN
          </div>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate("/focus-sessions")
            }
          >
            🎯
            <span>Focus Sessions</span>
          </button>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate("/activity-monitor")
            }
          >
            📱
            <span>Activity Monitor</span>
          </button>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate(
                "/distraction-analysis"
              )
            }
          >
            ⚠️
            <span>
              Distraction Analysis
            </span>
          </button>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate("/analytics")
            }
          >
            📊
            <span>Analytics</span>
          </button>

        </div>


        <div className="settings-menu-section">

          <div className="settings-menu-title">
            INTELLIGENCE
          </div>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate(
                "/ai-recommendations"
              )
            }
          >
            🤖
            <span>
              AI Recommendations
            </span>
          </button>

        </div>


        <div className="settings-menu-section">

          <div className="settings-menu-title">
            ACCOUNT
          </div>

          <button
            className="settings-menu-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            👤
            <span>Profile</span>
          </button>

          <button
            className="settings-menu-item settings-active"
          >
            ⚙️
            <span>Settings</span>
          </button>

        </div>


        <div className="settings-sidebar-bottom">

          <button
            className="settings-logout"
            onClick={logout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* =========================================
          MAIN
      ========================================= */}

      <main className="settings-main">

        {/* HEADER */}

        <header className="settings-header">

          <div>

            <div className="settings-eyebrow">
              PREFERENCES
            </div>

            <h1>Settings</h1>

            <p>
              Manage your FocusGuard
              preferences and
              notification behaviour.
            </p>

          </div>


          <div className="settings-header-right">

            <div className="settings-date">
              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </div>

            <button
              className="settings-user"
              onClick={() =>
                navigate("/profile")
              }
              type="button"
            >

              <div className="settings-user-avatar">
                {avatarLetter}
              </div>

              <div className="settings-user-details">

                <strong>
                  {userName}
                </strong>

              </div>

              <span className="settings-user-arrow">
                ›
              </span>

            </button>

          </div>

        </header>


        <div className="settings-container">


          {/* ======================================
              NOTIFICATIONS
          ====================================== */}

          <section className="settings-card notification-settings-card">

            <div className="settings-card-heading">

              <div className="settings-section-icon">
                🔔
              </div>

              <div>

                <h2>
                  Notifications
                </h2>

                <p>
                  Choose which alerts appear
                  in your notification center.
                </p>

              </div>

            </div>


            {/* MASTER */}

            <div className="notification-master">

              <div className="notification-master-text">

                <strong>
                  Notification Center
                </strong>

                <span>
                  Enable FocusGuard
                  notifications
                </span>

              </div>

              <button
                className={`toggle ${
                  notificationSettings.master
                    ? "toggle-on"
                    : ""
                }`}
                onClick={() =>
                  updateNotification(
                    "master",
                    !notificationSettings.master
                  )
                }
              >
                <span />
              </button>

            </div>


            {/* SOUND */}

            <div className="notification-master">

              <div className="notification-master-text">

                <strong>
                  Notification Sounds
                </strong>

                <span>
                  Sound is only played for
                  notifications configured
                  with 🔊
                </span>

              </div>

              <div className="notification-sound-controls">

                <button
                  className="test-sound-button"
                  onClick={testSound}
                >
                  🔊 Test
                </button>

                <button
                  className={`toggle ${
                    notificationSettings.sound
                      ? "toggle-on"
                      : ""
                  }`}
                  onClick={() =>
                    updateNotification(
                      "sound",
                      !notificationSettings.sound
                    )
                  }
                >
                  <span />
                </button>

              </div>

            </div>


            {/* GROUPS */}

            {notificationGroups.map(
              (group) => (

                <div
                  className="notification-group"
                  key={group.title}
                >

                  <div className="notification-group-title">
                    {group.title}
                  </div>


                  {group.items.map(
                    ([
                      key,
                      title,
                      description,
                      hasSound,
                    ]) => (

                      <div
                        className="notification-setting-row"
                        key={key}
                      >

                        <div className="notification-setting-info">

                          <strong>
                            {title}
                          </strong>

                          <span>
                            {description}
                          </span>

                        </div>


                        <div className="notification-setting-controls">

                          <span
                            className={
                              hasSound
                                ? "sound-label active"
                                : "sound-label"
                            }
                            title={
                              hasSound
                                ? "Sound enabled for this notification"
                                : "Silent notification"
                            }
                          >
                            {hasSound
                              ? "🔊"
                              : "🔇"}
                          </span>

                          <button
                            className={`toggle ${
                              notificationSettings[
                                key
                              ]
                                ? "toggle-on"
                                : ""
                            }`}
                            onClick={() =>
                              updateNotification(
                                key,
                                !notificationSettings[
                                  key
                                ]
                              )
                            }
                          >
                            <span />
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )
            )}

          </section>


          {/* ======================================
              APP BLOCKING
          ====================================== */}

          <section className="settings-card">

            <div className="settings-card-heading">

              <div className="settings-section-icon">
                🚫
              </div>

              <div>

                <h2>
                  App & Site Blocking
                </h2>

                <p>
                  Control websites that
                  interrupt your focus.
                </p>

              </div>

              <button
                className="settings-add-button"
                onClick={() =>
                  setShowAddSite(
                    !showAddSite
                  )
                }
              >
                + Add
              </button>

            </div>


            {showAddSite && (

              <div className="add-site-box">

                <input
                  value={newSite}
                  onChange={(e) =>
                    setNewSite(
                      e.target.value
                    )
                  }
                  placeholder="Enter website or app"
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      addBlockedSite();
                    }
                  }}
                />

                <button
                  onClick={
                    addBlockedSite
                  }
                >
                  Add
                </button>

                <button
                  className="cancel-button"
                  onClick={() =>
                    setShowAddSite(false)
                  }
                >
                  Cancel
                </button>

              </div>

            )}


            <div className="blocked-sites">

              {blockedSites.map(
                (site, index) => (

                  <div
                    className="blocked-site-row"
                    key={`${site.name}-${index}`}
                  >

                    <strong>
                      {site.name}
                    </strong>

                    <div className="blocked-site-actions">

                      <span
                        className={
                          site.mode ===
                          "Hard block"
                            ? "hard-block"
                            : "soft-nudge"
                        }
                      >
                        {site.mode}
                      </span>

                      <button
                        className="delete-site"
                        onClick={() =>
                          removeBlockedSite(
                            index
                          )
                        }
                      >
                        🗑
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* ======================================
              DATA & PRIVACY
          ====================================== */}

          <section className="settings-card">

            <div className="settings-card-heading">

              <div className="settings-section-icon">
                🛡️
              </div>

              <div>

                <h2>
                  Data & Privacy
                </h2>

                <p>
                  Explore and control your FocusGuard data.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="settings-click-row"
              onClick={() =>
                navigate("/explore-my-data")
              }
            >

              <div>

                <strong>
                  🔐 Explore my data
                </strong>

                <span>
                  View your sessions, activity,
                  distractions and productivity data
                </span>

              </div>

              <span className="settings-arrow">
                ›
              </span>

            </button>

          </section>

          {/* ======================================
              ACCOUNT
          ====================================== */}

          <section className="settings-card">

            <div className="settings-card-heading">

              <div className="settings-section-icon">
                👤
              </div>

              <div>

                <h2>
                  Account
                </h2>

                <p>
                  Manage your account.
                </p>

              </div>

            </div>


            <button
              className="settings-click-row"
              onClick={() =>
                navigate("/profile")
              }
            >

              <div>

                <strong>
                  Profile
                </strong>

                <span>
                  View and update your
                  personal information
                </span>

              </div>

              <span className="settings-arrow">
                ›
              </span>

            </button>


            <button
              className="settings-click-row"
              onClick={() =>
                navigate("/profile")
              }
            >

              <div>

                <strong>
                  Password
                </strong>

                <span>
                  Change your account
                  password
                </span>

              </div>

              <span className="settings-arrow">
                ›
              </span>

            </button>

          </section>


          {/* ======================================
              APPEARANCE
          ====================================== */}

          <section className="settings-card">

            <div className="settings-card-heading">

              <div className="settings-section-icon">
                🎨
              </div>

              <div>

                <h2>
                  Appearance
                </h2>

                <p>
                  Customize FocusGuard
                  appearance.
                </p>

              </div>

            </div>


            <div className="settings-row">

              <div>

                <strong>
                  Theme
                </strong>

                <span>
                  Choose your preferred
                  appearance
                </span>

              </div>

              <select
                className="settings-select"
                value={theme}
                onChange={(e) =>
                  setTheme(
                    e.target.value
                  )
                }
              >
                <option>
                  System
                </option>

                <option>
                  Light
                </option>

                <option>
                  Dark
                </option>
              </select>

            </div>

          </section>


        </div>


        <footer className="settings-footer">
          FocusGuard AI • Focus intentionally.
        </footer>

      </main>

    </div>
  );
}

export default Settings;