import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import {
  getNotifications,
  clearNotifications,
  markNotificationsRead,
} from "../utils/notificationSettings";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  // --------------------------------------------------
  // USER PROFILE
  // --------------------------------------------------

  const [userProfile, setUserProfile] = useState(null);

  // --------------------------------------------------
  // DASHBOARD STATE
  // --------------------------------------------------
const [showNotifications, setShowNotifications] =
  useState(false);

const [notifications, setNotifications] =
  useState([]);


  const [period, setPeriod] = useState("today");

  const [focusScore, setFocusScore] = useState(null);
  const [screenTime, setScreenTime] = useState(null);
  const [taskSwitches, setTaskSwitches] = useState(null);
  const [distractions, setDistractions] = useState(null);

  const [activityData, setActivityData] = useState({
    productive: [],
    non_productive: [],
  });
  const playNotificationSound = () => {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

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
      0.12,
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
    console.log(
      "Sound unavailable"
    );
  }
};

  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("user_id");

  // --------------------------------------------------
  // LOAD USER PROFILE
  // --------------------------------------------------
useEffect(() => {
  const loadNotifications = () => {
    setNotifications(
      getNotifications()
    );
  };

  loadNotifications();

  window.addEventListener(
    "focusguard-notification",
    loadNotifications
  );

  return () => {
    window.removeEventListener(
      "focusguard-notification",
      loadNotifications
    );
  };
}, []);

useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUserId =
          localStorage.getItem("user_id") || "1";

        const response = await axios.get(
          `${API_URL}/profile/${currentUserId}`
        );

        console.log(
          "DASHBOARD PROFILE:",
          response.data
        );

        setUserProfile(response.data);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      }
    };

    fetchProfile();
  }, []);

  // --------------------------------------------------
  // LOAD DASHBOARD DATA
  // --------------------------------------------------

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const [
          focusResponse,
          screenResponse,
          switchResponse,
          distractionResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/focus-score/${userId}?period=${period}`
          ),

          fetch(
            `${API_URL}/screen-time/${userId}?period=${period}`
          ),

          fetch(
            `${API_URL}/task-switches/${userId}?period=${period}`
          ),

          fetch(
            `${API_URL}/distraction-analysis/${userId}?period=${period}`
          ),
        ]);

        const focusData =
          await focusResponse.json();

        const screenData =
          await screenResponse.json();

        const switchData =
          await switchResponse.json();

        const distractionData =
          await distractionResponse.json();

        console.log(
          "FOCUS DATA:",
          focusData
        );

        console.log(
          "SCREEN DATA:",
          screenData
        );

        console.log(
          "SWITCH DATA:",
          switchData
        );

        console.log(
          "DISTRACTION DATA:",
          distractionData
        );

        // --------------------------------------------------
        // FOCUS SCORE
        // --------------------------------------------------

        setFocusScore(
          focusData.focus_score !== undefined
            ? Number(focusData.focus_score)
            : 0
        );

        // --------------------------------------------------
        // SCREEN TIME
        // --------------------------------------------------

        setScreenTime(
          `${screenData.hours || 0}h ${
            screenData.minutes || 0
          }m`
        );

        // --------------------------------------------------
        // TASK SWITCHES
        // --------------------------------------------------

        setTaskSwitches(
          switchData.total_switches !== undefined
            ? switchData.total_switches
            : 0
        );

        // --------------------------------------------------
        // DISTRACTIONS
        // --------------------------------------------------

        setDistractions(
          distractionData.distraction_count !==
            undefined
            ? distractionData.distraction_count
            : 0
        );

        // --------------------------------------------------
        // ACTIVITY DATA
        // --------------------------------------------------

        setActivityData({
          productive: Array.isArray(
            distractionData.productive
          )
            ? distractionData.productive
            : [],

          non_productive: Array.isArray(
            distractionData.non_productive
          )
            ? distractionData.non_productive
            : [],
        });
      } catch (error) {
        console.error(
          "Dashboard data error:",
          error
        );

        setFocusScore(0);
        setScreenTime("0h 0m");
        setTaskSwitches(0);
        setDistractions(0);

        setActivityData({
          productive: [],
          non_productive: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, userId, navigate]);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    navigate("/");
  };

  // --------------------------------------------------
  // USER DISPLAY NAME
  // --------------------------------------------------

  const displayName =
    userProfile?.name ||
    userProfile?.username ||
    localStorage.getItem("username") ||
    "User";

  const displayEmail =
    userProfile?.email ||
    localStorage.getItem("email") ||
    "";

  const userInitial =
    displayName.charAt(0).toUpperCase();

  // --------------------------------------------------
  // COMBINE ACTIVITIES
  // --------------------------------------------------

  const allActivities = useMemo(() => {
    return [
      ...activityData.productive,
      ...activityData.non_productive,
    ];
  }, [activityData]);

  // --------------------------------------------------
  // SORT APPLICATIONS BY DURATION
  // --------------------------------------------------

  const applicationData = useMemo(() => {
    return [...allActivities]
      .sort(
        (a, b) =>
          Number(b.duration_minutes || 0) -
          Number(a.duration_minutes || 0)
      )
      .slice(0, 5);
  }, [allActivities]);

  const maxDuration = Math.max(
    ...applicationData.map(
      (item) =>
        Number(item.duration_minutes) || 0
    ),
    1
  );

  // --------------------------------------------------
  // PRODUCTIVITY CALCULATION
  // --------------------------------------------------

  const productiveMinutes =
    activityData.productive.reduce(
      (total, item) =>
        total +
        Number(item.duration_minutes || 0),
      0
    );

  const nonProductiveMinutes =
    activityData.non_productive.reduce(
      (total, item) =>
        total +
        Number(item.duration_minutes || 0),
      0
    );

  const totalActivityMinutes =
    productiveMinutes +
    nonProductiveMinutes;

  const productivePercentage =
    totalActivityMinutes > 0
      ? Math.round(
          (productiveMinutes /
            totalActivityMinutes) *
            100
        )
      : 0;

  const nonProductivePercentage =
    totalActivityMinutes > 0
      ? Math.round(
          (nonProductiveMinutes /
            totalActivityMinutes) *
            100
        )
      : 0;

  // --------------------------------------------------
  // TOP DISTRACTIONS
  // --------------------------------------------------

  const topDistractions = useMemo(() => {
    return [...activityData.non_productive]
      .sort(
        (a, b) =>
          Number(b.duration_minutes || 0) -
          Number(a.duration_minutes || 0)
      )
      .slice(0, 5);
  }, [activityData.non_productive]);

  // --------------------------------------------------
  // PERIOD TEXT
  // --------------------------------------------------

  const periodText = {
    today: "today",
    week: "this week",
    month: "this month",
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="fg-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="fg-sidebar">

        {/* BRAND */}

        <div className="fg-brand">

          <div className="fg-brand-logo">
            🧠
          </div>

          <div>
            <h2>FocusGuard AI</h2>
            <span>
              Attention Intelligence
            </span>
          </div>

        </div>


        {/* MAIN NAVIGATION */}

        <div className="fg-sidebar-section">

          <p className="fg-section-title">
            MAIN
          </p>

          <button
            className="fg-nav-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate("/focus-sessions")
            }
          >
            <span>◉</span>
            Focus Sessions
          </button>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate("/activity-monitor")
            }
          >
            <span>▦</span>
            Activity Monitor
          </button>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate(
                "/distraction-analysis"
              )
            }
          >
            <span>⚠</span>
            Distraction Analysis
          </button>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate("/analytics")
            }
          >
            <span>▥</span>
            Analytics
          </button>

        </div>


        {/* INTELLIGENCE */}

        <div className="fg-sidebar-section">

          <p className="fg-section-title">
            INTELLIGENCE
          </p>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate(
                "/ai-recommendations"
              )
            }
          >
            <span>✦</span>
            AI Recommendations
          </button>

        </div>


        {/* ACCOUNT */}

        <div className="fg-sidebar-section">

          <p className="fg-section-title">
            ACCOUNT
          </p>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>◯</span>
            Profile
          </button>

          <button
            className="fg-nav-item"
            onClick={() =>
              navigate("/settings")
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </div>


        {/* SIDEBAR USER + LOGOUT */}

        <div className="fg-sidebar-bottom">

  <button
    className="fg-logout"
    onClick={handleLogout}
    type="button"
  >
    <span>↪</span>
    Logout
  </button>

</div>

</aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="fg-main">


        {/* =================================================
            HEADER
        ================================================= */}

      <header className="fg-header">

  {/* LEFT SIDE */}
  <div className="fg-welcome">

    <p className="fg-eyebrow">
      PRODUCTIVITY OVERVIEW
    </p>

    <h1>
      Welcome back {displayName} 👋
    </h1>

    <p>
      Understand your focus, digital activity and
      attention patterns.
    </p>

  </div>


  {/* RIGHT SIDE */}
  <div className="fg-header-right">

    {/* DATE */}
    <div className="fg-date">

      <span className="fg-date-icon">
        📅
      </span>

      <div>
        <strong>
          {new Date().toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )}
        </strong>
      </div>

    </div>


    {/* NOTIFICATION BELL */}
    <div className="fg-notification-wrapper">

      <button
        className="fg-notification-button"
        type="button"
        onClick={() => {
          const nextState = !showNotifications;

          setShowNotifications(nextState);

          // Opening the notification panel marks all notifications as read.
          if (nextState) {
            markNotificationsRead();

            // Update local state immediately so the unread badge disappears.
            setNotifications((current) =>
              current.map((notification) => ({
                ...notification,
                read: true,
              }))
            );
          }
        }}
      >

        <span className="fg-bell-icon">
          🔔
        </span>

        {notifications.filter(
          (notification) =>
            !notification.read
        ).length > 0 && (

          <span className="fg-notification-badge">

            {notifications.filter(
              (notification) =>
                !notification.read
            ).length > 9
              ? "9+"
              : notifications.filter(
                  (notification) =>
                    !notification.read
                ).length}

          </span>

        )}

      </button>


      {/* NOTIFICATION POPUP */}
      {showNotifications && (

        <div className="fg-notification-panel">

          <div className="fg-notification-panel-header">

            <div>
              <h3>
                Notifications
              </h3>

              <span>
                Your FocusGuard activity
              </span>
            </div>

            {notifications.length > 0 && (

              <button
                className="fg-clear-notifications"
                onClick={() => {
                  clearNotifications();
                  setNotifications([]);
                }}
              >
                Clear
              </button>

            )}

          </div>


          <div className="fg-notification-list">

            {notifications.length === 0 ? (

              <div className="fg-no-notifications">

                <div>
                  🔔
                </div>

                <strong>
                  No notifications
                </strong>

                <p>
                  Your focus and activity
                  alerts will appear here.
                </p>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    className={`fg-notification-item ${
                      notification.read
                        ? ""
                        : "unread"
                    }`}
                    key={
                      notification.id
                    }
                  >

                    <div className="fg-notification-item-icon">
                      {notification.icon}
                    </div>


                    <div className="fg-notification-item-content">

                      <strong>
                        {
                          notification.title
                        }
                      </strong>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      <small>
                        {new Date(
                          notification.createdAt
                        ).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </small>

                    </div>


                    {notification.sound && (
                      <span className="fg-notification-sound">
                        🔊
                      </span>
                    )}

                  </div>

                )

              )

            )}

          </div>


          <div className="fg-notification-footer">
            🔔 Manage notifications in Settings
          </div>

        </div>

      )}

    </div>


    {/* USER PROFILE */}
    <button
      className="fg-header-user"
      type="button"
      onClick={() =>
        navigate("/profile")
      }
    >

      <div className="fg-header-user-avatar">
        {userInitial}
      </div>

      <div className="fg-header-user-info">

        <strong>
          {displayName}
        </strong>

        <span>
          FocusGuard Member
        </span>

      </div>

      <span className="fg-header-user-arrow">
        ›
      </span>

    </button>

  </div>

</header>


        {/* =================================================
            PERIOD SELECTOR
        ================================================= */}

        <section className="fg-period-section">

          <div>

            <h2>
              Productivity Overview
            </h2>

            <p>
              Showing activity data for{" "}
              <strong>
                {periodText[period]}
              </strong>
            </p>

          </div>


          <div className="fg-period-selector">

            <button
              className={
                period === "today"
                  ? "fg-period active"
                  : "fg-period"
              }
              onClick={() =>
                setPeriod("today")
              }
            >
              Today
            </button>

            <button
              className={
                period === "week"
                  ? "fg-period active"
                  : "fg-period"
              }
              onClick={() =>
                setPeriod("week")
              }
            >
              This Week
            </button>

            <button
              className={
                period === "month"
                  ? "fg-period active"
                  : "fg-period"
              }
              onClick={() =>
                setPeriod("month")
              }
            >
              This Month
            </button>

          </div>

        </section>


        {/* =================================================
            KPI CARDS
        ================================================= */}

        <section className="fg-kpi-grid">

          {/* FOCUS */}

          <div className="fg-kpi-card focus">

            <div className="fg-kpi-top">

              <div>

                <p>
                  Focus Score
                </p>

                <h3>
                  {loading
                    ? "..."
                    : `${focusScore?.toFixed(
                        1
                      ) || "0.0"}%`}
                </h3>

              </div>

              <div className="fg-kpi-icon">
                ◎
              </div>

            </div>

            <span className="fg-kpi-description">
              Overall concentration
            </span>

          </div>


          {/* SCREEN TIME */}

          <div className="fg-kpi-card screen">

            <div className="fg-kpi-top">

              <div>

                <p>
                  Screen Time
                </p>

                <h3>
                  {loading
                    ? "..."
                    : screenTime}
                </h3>

              </div>

              <div className="fg-kpi-icon">
                ▣
              </div>

            </div>

            <span className="fg-kpi-description">
              Total device usage
            </span>

          </div>


          {/* SWITCHES */}

          <div className="fg-kpi-card switches">

            <div className="fg-kpi-top">

              <div>

                <p>
                  App Switches
                </p>

                <h3>
                  {loading
                    ? "..."
                    : taskSwitches}
                </h3>

              </div>

              <div className="fg-kpi-icon">
                ⇄
              </div>

            </div>

            <span className="fg-kpi-description">
              Context switches recorded
            </span>

          </div>


          {/* DISTRACTIONS */}

          <div className="fg-kpi-card distraction">

            <div className="fg-kpi-top">

              <div>

                <p>
                  Distractions
                </p>

                <h3>
                  {loading
                    ? "..."
                    : distractions}
                </h3>

              </div>

              <div className="fg-kpi-icon">
                !
              </div>

            </div>

            <span className="fg-kpi-description">
              Interruptions detected
            </span>

          </div>

        </section>


        {/* =================================================
            CHART ROW
        ================================================= */}

        <section className="fg-chart-grid">


          {/* FOCUS PERFORMANCE */}

          <div className="fg-panel">

            <div className="fg-panel-header">

              <div>

                <p className="fg-eyebrow">
                  FOCUS PERFORMANCE
                </p>

                <h2>
                  Focus Score
                </h2>

                <span>
                  Current concentration
                  performance
                </span>

              </div>

              <span className="fg-status-badge">

                {period === "today"
                  ? "Today"
                  : period === "week"
                  ? "This Week"
                  : "This Month"}

              </span>

            </div>


            <div className="fg-focus-chart">

              <div className="fg-focus-scale">

                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
                <span>20</span>
                <span>0</span>

              </div>


              <div className="fg-focus-area">

                <div className="fg-chart-lines">

                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>

                </div>


                <div
                  className="fg-focus-point"
                  style={{
                    bottom: `${Math.min(
                      Math.max(
                        focusScore || 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                >

                  <strong>
                    {focusScore?.toFixed(
                      1
                    ) || "0"}
                    %
                  </strong>

                </div>


                <div className="fg-focus-axis">

                  <span>
                    Current
                  </span>

                </div>

              </div>

            </div>


            <div className="fg-chart-note">
              Historical focus scores will
              appear here when daily focus
              history is available.
            </div>

          </div>


          {/* PRODUCTIVITY BREAKDOWN */}

          <div className="fg-panel">

            <div className="fg-panel-header">

              <div>

                <p className="fg-eyebrow">
                  PRODUCTIVITY
                </p>

                <h2>
                  Productivity Breakdown
                </h2>

                <span>
                  Productive vs
                  non-productive activity
                </span>

              </div>

            </div>


            <div className="fg-donut-wrapper">

              <div
                className="fg-donut"
                style={{
                  background: `conic-gradient(
                    #10b981 0% ${productivePercentage}%,
                    #ef4444 ${productivePercentage}% 100%
                  )`,
                }}
              >

                <div className="fg-donut-inner">

                  <strong>
                    {productivePercentage}%
                  </strong>

                  <span>
                    Productive
                  </span>

                </div>

              </div>

            </div>


            <div className="fg-legend">

              <div>

                <span className="fg-dot green"></span>

                Productive

                <strong>
                  {productiveMinutes} min
                </strong>

              </div>


              <div>

                <span className="fg-dot red"></span>

                Non-Productive

                <strong>
                  {nonProductiveMinutes} min
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            TIME BY APPLICATION
        ================================================= */}

        <section className="fg-panel fg-wide-panel">

          <div className="fg-panel-header">

            <div>

              <p className="fg-eyebrow">
                DIGITAL ACTIVITY
              </p>

              <h2>
                Time by Application
              </h2>

              <span>
                Where your screen time is
                being spent
              </span>

            </div>


            <button
              className="fg-text-button"
              onClick={() =>
                navigate(
                  "/activity-monitor"
                )
              }
            >
              View Activity →
            </button>

          </div>


          <div className="fg-app-chart">

            {applicationData.length === 0 ? (

              <div className="fg-empty">
                No activity data available
                for this period.
              </div>

            ) : (

              applicationData.map(
                (item, index) => {

                  const duration =
                    Number(
                      item.duration_minutes
                    ) || 0;

                  const width =
                    (duration /
                      maxDuration) *
                    100;

                  const isProductive =
                    activityData.productive.includes(
                      item
                    );

                  return (
                    <div
                      className="fg-app-row"
                      key={`${item.website}-${index}`}
                    >

                      <div className="fg-app-rank">
                        {index + 1}
                      </div>


                      <div className="fg-app-name">
                        {item.website ||
                          "Unknown"}
                      </div>


                      <div className="fg-app-bar-container">

                        <div
                          className={
                            isProductive
                              ? "fg-app-bar productive"
                              : "fg-app-bar distracting"
                          }
                          style={{
                            width: `${Math.max(
                              width,
                              4
                            )}%`,
                          }}
                        ></div>

                      </div>


                      <div className="fg-app-duration">
                        {duration} min
                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </section>


        {/* =================================================
            TOP DISTRACTIONS
        ================================================= */}

        <section className="fg-panel fg-wide-panel">

          <div className="fg-panel-header">

            <div>

              <p className="fg-eyebrow">
                ATTENTION LEAKS
              </p>

              <h2>
                Top Distractions
              </h2>

              <span>
                Highest sources of
                non-productive activity
              </span>

            </div>


            <button
              className="fg-text-button"
              onClick={() =>
                navigate(
                  "/distraction-analysis"
                )
              }
            >
              View Analysis →
            </button>

          </div>


          <div className="fg-distraction-list">

            {topDistractions.length === 0 ? (

              <div className="fg-empty">
                No distractions detected
                for this period.
              </div>

            ) : (

              topDistractions.map(
                (item, index) => {

                  const duration =
                    Number(
                      item.duration_minutes
                    ) || 0;

                  const switches =
                    Number(
                      item.switch_count
                    ) || 0;

                  const width =
                    (duration /
                      Math.max(
                        ...topDistractions.map(
                          (x) =>
                            Number(
                              x.duration_minutes
                            ) || 0
                        ),
                        1
                      )) *
                    100;

                  return (
                    <div
                      className="fg-distraction-row"
                      key={`${item.website}-${index}`}
                    >

                      <div className="fg-distraction-rank">
                        {index + 1}
                      </div>


                      <div className="fg-distraction-info">

                        <strong>
                          {item.website ||
                            "Unknown"}
                        </strong>

                        <span>
                          {duration} minutes
                          {" • "}
                          {switches} switches
                        </span>

                      </div>


                      <div className="fg-distraction-progress">

                        <div
                          style={{
                            width: `${Math.max(
                              width,
                              4
                            )}%`,
                          }}
                        ></div>

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>

        </section>


        {/* =================================================
            QUICK INSIGHTS
        ================================================= */}

        <section className="fg-insight-grid">


          {/* FOCUS */}

          <div className="fg-insight">

            <div className="fg-insight-icon green">
              ↑
            </div>

            <div>

              <span>
                Focus Performance
              </span>

              <strong>
                {focusScore?.toFixed(1) ||
                  "0"}%
                {" "}
                focus score
              </strong>

            </div>

          </div>


          {/* PRODUCTIVE */}

          <div className="fg-insight">

            <div className="fg-insight-icon blue">
              ◷
            </div>

            <div>

              <span>
                Productive Activity
              </span>

              <strong>
                {productiveMinutes} minutes
              </strong>

            </div>

          </div>


          {/* ATTENTION LEAKS */}

          <div className="fg-insight">

            <div className="fg-insight-icon red">
              !
            </div>

            <div>

              <span>
                Attention Leaks
              </span>

              <strong>
                {distractions} detected
              </strong>

            </div>

          </div>

        </section>


        {/* FOOTER */}

        <footer className="fg-footer">
          FocusGuard AI • Attention Intelligence
        </footer>

      </main>

    </div>
  );
}

export default Dashboard;