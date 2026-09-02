import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/notificationMessages";
import "./FocusSessions.css";

function FocusSessions() {

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [sessions, setSessions] = useState([]);

  const [activeSession, setActiveSession] =
    useState(null);

  const [selectedDuration, setSelectedDuration] =
    useState(25);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const userId =
    localStorage.getItem("user_id");


  // =====================================================
  // NOTIFICATION CONTROL
  // Prevent duplicate notifications
  // =====================================================

  const notifiedMilestones =
    useRef(new Set());

  const sessionStartedNotification =
    useRef(false);

  const targetReachedNotification =
    useRef(false);


  // =====================================================
  // LOAD SESSION HISTORY
  // =====================================================

  const loadSessions = async () => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/focus-sessions/${userId}?period=week`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load sessions"
        );
      }

      const data =
        await response.json();

      setSessions(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error loading focus sessions:",
        error
      );

    }

  };


  // =====================================================
  // CHECK ACTIVE SESSION
  // =====================================================

  const checkActiveSession = async () => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/focus-sessions/${userId}/active`
      );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      if (data.active) {

        setActiveSession(data);

        calculateElapsedTime(
          data.start_time
        );

      }

    } catch (error) {

      console.error(
        "Error checking active session:",
        error
      );

    }

  };


  // =====================================================
  // CALCULATE TIMER
  // =====================================================

  const calculateElapsedTime = (
    startTime
  ) => {

    if (!startTime) {
      return;
    }

    const start =
      new Date(startTime).getTime();

    const now =
      new Date().getTime();

    const elapsed =
      Math.floor(
        (now - start) / 1000
      );

    setElapsedSeconds(
      Math.max(0, elapsed)
    );

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    if (!userId) {

      navigate("/");

      return;

    }

    loadSessions();

    checkActiveSession();

  }, [userId]);


  // =====================================================
  // TIMER
  // =====================================================

  useEffect(() => {

    if (!activeSession) {
      return;
    }

    const interval =
      setInterval(() => {

        calculateElapsedTime(
          activeSession.start_time
        );

      }, 1000);


    return () =>
      clearInterval(interval);

  }, [activeSession]);


  // =====================================================
  // SESSION MILESTONE NOTIFICATIONS
  // =====================================================

  useEffect(() => {

    if (!activeSession) {
      return;
    }

    const elapsedMinutes =
      Math.floor(
        elapsedSeconds / 60
      );


    // ---------------------------------------------------
    // 15 MINUTE DEEP FOCUS
    // ---------------------------------------------------

    if (
      elapsedMinutes >= 15 &&
      !notifiedMilestones.current.has(15)
    ) {

      notifiedMilestones.current.add(15);

      notify(
        "deepFocusMilestone",
        "You've maintained uninterrupted focus for 15 minutes. Keep going!"
      );

    }


    // ---------------------------------------------------
    // 25 MINUTE DEEP FOCUS
    // ---------------------------------------------------

    if (
      elapsedMinutes >= 25 &&
      !notifiedMilestones.current.has(25)
    ) {

      notifiedMilestones.current.add(25);

      notify(
        "deepFocusMilestone",
        "25 minutes of uninterrupted focus achieved. Excellent concentration!"
      );

    }


    // ---------------------------------------------------
    // 50 MINUTE DEEP FOCUS
    // ---------------------------------------------------

    if (
      elapsedMinutes >= 50 &&
      !notifiedMilestones.current.has(50)
    ) {

      notifiedMilestones.current.add(50);

      notify(
        "deepFocusMilestone",
        "You've reached 50 minutes of continuous focus. Your concentration is strong!"
      );

    }


    // ---------------------------------------------------
    // 90 MINUTE DEEP FOCUS
    // ---------------------------------------------------

    if (
      elapsedMinutes >= 90 &&
      !notifiedMilestones.current.has(90)
    ) {

      notifiedMilestones.current.add(90);

      notify(
        "deepFocusMilestone",
        "90 minutes of uninterrupted focus achieved. Outstanding concentration!"
      );

    }


    // ---------------------------------------------------
    // RECOMMENDED BREAK
    // ---------------------------------------------------

    if (
      elapsedMinutes >= 90 &&
      !notifiedMilestones.current.has(
        "recommended-break"
      )
    ) {

      notifiedMilestones.current.add(
        "recommended-break"
      );

      notify(
        "recommendedBreak",
        "You've been focusing continuously for 90 minutes. Consider taking a short break to recharge your attention."
      );

    }


    // ---------------------------------------------------
    // SESSION TARGET REACHED
    // ---------------------------------------------------

    const targetMinutes =
      Number(
        activeSession.target_minutes ||
        selectedDuration
      );


    if (
      elapsedMinutes >= targetMinutes &&
      !targetReachedNotification.current
    ) {

      targetReachedNotification.current =
        true;

      notify(
        "targetReached",
        `You've reached your ${targetMinutes}-minute focus target. Excellent work!`
      );

    }

  }, [
    elapsedSeconds,
    activeSession,
    selectedDuration,
  ]);


  // =====================================================
  // START SESSION
  // =====================================================

  const startSession = async () => {

    if (!userId) {

      navigate("/");

      return;

    }


    setLoading(true);

    setErrorMessage("");


    try {

      console.log(
        "STARTING FOCUS SESSION..."
      );


      const response =
        await fetch(
          "http://127.0.0.1:8000/focus-sessions/start",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              user_id:
                Number(userId),

              target_minutes:
                selectedDuration,

            }),

          }
        );


      const data =
        await response.json();


      console.log(
        "FOCUS SESSION RESPONSE:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to start focus session"
        );

      }


      if (!data.session_id) {

        throw new Error(
          "Session ID was not returned by the server."
        );

      }


      // ------------------------------------------------
      // RESET NOTIFICATION TRACKERS
      // ------------------------------------------------

      notifiedMilestones.current =
        new Set();

      sessionStartedNotification.current =
        false;

      targetReachedNotification.current =
        false;


      // ------------------------------------------------
      // SET ACTIVE SESSION
      // ------------------------------------------------

      setActiveSession(data);

      setElapsedSeconds(0);


      // ------------------------------------------------
      // LOAD HISTORY
      // ------------------------------------------------

      await loadSessions();


      // ------------------------------------------------
      // START NOTIFICATION
      // ------------------------------------------------

      notify(
        "sessionStarted",
        `Your ${
          data.target_minutes ||
          selectedDuration
        }-minute focus session has started. Stay focused!`
      );


      sessionStartedNotification.current =
        true;


      console.log(
        "FOCUS START NOTIFICATION CREATED"
      );


    } catch (error) {

      console.error(
        "Error starting session:",
        error
      );

      setErrorMessage(
        error.message ||
        "Unable to start focus session."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // END SESSION
  // =====================================================

  const endSession = async () => {

    if (!activeSession) {
      return;
    }


    setLoading(true);

    setErrorMessage("");


    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/focus-sessions/${activeSession.session_id}/end`,
          {
            method: "POST",
          }
        );


      const data =
        await response.json();


      console.log(
        "END SESSION RESPONSE:",
        data
      );


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Failed to end focus session"
        );

      }


      // =================================================
      // DETERMINE SESSION RESULT
      // =================================================

      const targetMinutes =
        Number(
          activeSession.target_minutes ||
          selectedDuration
        );


      const actualMinutes =
        Number(
          data.duration_minutes ||
          Math.floor(
            elapsedSeconds / 60
          )
        );


      // =================================================
      // COMPLETED
      // =================================================

      if (
        data.status === "completed" ||
        actualMinutes >= targetMinutes
      ) {

        notify(
          "sessionCompleted",
          `Great work! You completed your ${actualMinutes || targetMinutes}-minute focus session.`
        );

      }


      // =================================================
      // ENDED EARLY
      // =================================================

      else {

        notify(
          "sessionEndedEarly",
          `Your focus session ended after ${actualMinutes} minute${actualMinutes === 1 ? "" : "s"}. Every minute of focused work counts!`
        );

      }


      // =================================================
      // RESET
      // =================================================

      setActiveSession(null);

      setElapsedSeconds(0);

      notifiedMilestones.current =
        new Set();

      sessionStartedNotification.current =
        false;

      targetReachedNotification.current =
        false;


      await loadSessions();


    } catch (error) {

      console.error(
        "Error ending session:",
        error
      );

      setErrorMessage(
        error.message ||
        "Unable to end focus session."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FORMAT TIMER
  // =====================================================

  const formatTime = (
    seconds
  ) => {

    const hours =
      Math.floor(
        seconds / 3600
      );


    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );


    const secs =
      seconds % 60;


    if (hours > 0) {

      return `${String(
        hours
      ).padStart(
        2,
        "0"
      )}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        secs
      ).padStart(
        2,
        "0"
      )}`;

    }


    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;

  };


  // =====================================================
  // STATISTICS
  // =====================================================

  const completedSessions =
    sessions.filter(
      session =>
        session.status ===
        "completed"
    );


  const totalFocusMinutes =
    completedSessions.reduce(
      (
        total,
        session
      ) =>
        total +
        Number(
          session.duration_minutes ||
          0
        ),
      0
    );


  const averageSession =
    completedSessions.length > 0
      ? Math.round(
          totalFocusMinutes /
          completedSessions.length
        )
      : 0;


  // =====================================================
  // FORMAT DURATION
  // =====================================================

  const formatDuration = (
    minutes
  ) => {

    if (!minutes) {
      return "0 min";
    }


    const hours =
      Math.floor(
        minutes / 60
      );


    const mins =
      minutes % 60;


    if (hours > 0) {

      return `${hours}h ${mins}m`;

    }


    return `${mins} min`;

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date
  ) => {

    return new Date(date)
      .toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  };


  // =====================================================
  // FORMAT CLOCK
  // =====================================================

  const formatClock = (
    date
  ) => {

    return new Date(date)
      .toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "username"
    );

    localStorage.removeItem(
      "email"
    );

    navigate("/");

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="focus-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="focus-sidebar">

        {/* BRAND */}

        <div className="focus-brand">

          <div className="focus-brand-logo">
            🧠
          </div>

          <div>

            <h2>
              FocusGuard AI
            </h2>

            <span>
              Attention Intelligence
            </span>

          </div>

        </div>


        {/* MAIN */}

        <div className="focus-menu-section">

          <p>
            MAIN
          </p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            className="active"
          >
            🎯 Focus Sessions
          </button>

          <button
            onClick={() =>
              navigate(
                "/activity-monitor"
              )
            }
          >
            📱 Activity Monitor
          </button>

          <button
            onClick={() =>
              navigate(
                "/distraction-analysis"
              )
            }
          >
            ⚠️ Distraction Analysis
          </button>

          <button
            onClick={() =>
              navigate("/analytics")
            }
          >
            📊 Analytics
          </button>

        </div>


        {/* INTELLIGENCE */}

        <div className="focus-menu-section">

          <p>
            INTELLIGENCE
          </p>

          <button
            onClick={() =>
              navigate(
                "/ai-recommendations"
              )
            }
          >
            ✦ AI Recommendations
          </button>

        </div>


        {/* ACCOUNT */}

        <div className="focus-menu-section">

          <p>
            ACCOUNT
          </p>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            ◯ Profile
          </button>

          <button
            onClick={() =>
              navigate("/settings")
            }
          >
            ⚙ Settings
          </button>

        </div>


        {/* LOGOUT */}

        <button
          className="focus-logout"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="focus-main">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="focus-header">

          <div>

            <p className="focus-eyebrow">
              FOCUS MANAGEMENT
            </p>

            <h1>
              Focus Sessions
            </h1>

            <p>
              Create intentional periods of
              deep work and protect your attention.
            </p>

          </div>


          <div className="focus-header-date">

            {new Date()
              .toLocaleDateString(
                "en-IN",
                {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}

          </div>

        </header>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {errorMessage && (

          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#fff1f2",
              color: "#be123c",
              border: "1px solid #fecdd3",
            }}
          >

            ⚠️ {errorMessage}

          </div>

        )}


        {/* =================================================
            TIMER
        ================================================= */}

        <section className="focus-timer-panel">

          <div className="timer-content">

            <p className="timer-label">

              {activeSession
                ? "FOCUS SESSION IN PROGRESS"
                : "READY TO FOCUS?"}

            </p>


            <div className="timer-circle">

              <div>

                <strong>
                  {formatTime(
                    elapsedSeconds
                  )}
                </strong>

                <span>

                  {activeSession

                    ? `Target ${
                        activeSession.target_minutes
                      } min`

                    : "Focus Timer"}

                </span>

              </div>

            </div>


            {/* DURATION */}

            {!activeSession && (

              <div className="duration-options">

                <span>
                  Session duration
                </span>

                <div>

                  {[25, 50, 90].map(
                    duration => (

                      <button
                        key={duration}
                        className={
                          selectedDuration ===
                          duration
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          setSelectedDuration(
                            duration
                          )
                        }
                      >
                        {duration} min
                      </button>

                    )
                  )}

                </div>

              </div>

            )}


            {/* START / END */}

            {activeSession ? (

              <button
                className="end-session-btn"
                onClick={
                  endSession
                }
                disabled={loading}
              >

                {loading
                  ? "Ending..."
                  : "End Focus Session"}

              </button>

            ) : (

              <button
                className="start-session-btn"
                onClick={
                  startSession
                }
                disabled={loading}
              >

                {loading
                  ? "Starting..."
                  : "Start Focus Session"}

              </button>

            )}

          </div>


          {/* TIMER INFO */}

          <div className="timer-info">

            <div>

              <span>
                SESSION TYPE
              </span>

              <strong>
                Deep Focus
              </strong>

            </div>


            <div>

              <span>
                SELECTED GOAL
              </span>

              <strong>
                {selectedDuration} minutes
              </strong>

            </div>


            <div>

              <span>
                STATUS
              </span>

              <strong
                className={
                  activeSession
                    ? "status-active"
                    : "status-ready"
                }
              >

                {activeSession
                  ? "● In Progress"
                  : "● Ready"}

              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATION INFORMATION
        ================================================= */}

        <section
          style={{
            marginTop: "20px",
            padding: "18px 20px",
            borderRadius: "14px",
            background: "#f8fbff",
            border: "1px solid #e1eaf5",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#eaf2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🔔
            </div>

            <div>

              <strong
                style={{
                  display: "block",
                  color: "#17345f",
                  marginBottom: "4px",
                }}
              >
                Focus notifications are active
              </strong>

              <span
                style={{
                  color: "#7185a0",
                  fontSize: "13px",
                }}
              >
                You'll receive alerts when your
                session starts, reaches its target,
                completes, or ends early.
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="session-stats">

          <div className="session-stat">

            <span>
              Sessions Today
            </span>

            <strong>
              {completedSessions.length}
            </strong>

            <small>
              Completed sessions
            </small>

          </div>


          <div className="session-stat">

            <span>
              Focus Time
            </span>

            <strong>
              {formatDuration(
                totalFocusMinutes
              )}
            </strong>

            <small>
              Total completed focus
            </small>

          </div>


          <div className="session-stat">

            <span>
              Average Session
            </span>

            <strong>
              {formatDuration(
                averageSession
              )}
            </strong>

            <small>
              Per completed session
            </small>

          </div>


          <div className="session-stat">

            <span>
              Current Goal
            </span>

            <strong>
              {selectedDuration}m
            </strong>

            <small>
              Selected focus duration
            </small>

          </div>

        </section>


        {/* =================================================
            SESSION HISTORY
        ================================================= */}

        <section className="session-history">

          <div className="section-header">

            <div>

              <p>
                HISTORY
              </p>

              <h2>
                Focus Session History
              </h2>

              <span>
                Your recent intentional focus periods
              </span>

            </div>

          </div>


          {sessions.length === 0 ? (

            <div className="empty-sessions">

              <div>
                🎯
              </div>

              <h3>
                No focus sessions yet
              </h3>

              <p>
                Start your first focus session
                to begin building your focus history.
              </p>

            </div>

          ) : (

            <div className="session-table">

              <div className="session-table-head">

                <span>
                  Date
                </span>

                <span>
                  Start
                </span>

                <span>
                  End
                </span>

                <span>
                  Duration
                </span>

                <span>
                  Status
                </span>

              </div>


              {sessions.map(
                session => (

                  <div
                    className="session-row"
                    key={session.id}
                  >

                    <span>
                      {formatDate(
                        session.start_time
                      )}
                    </span>

                    <span>
                      {formatClock(
                        session.start_time
                      )}
                    </span>

                    <span>

                      {session.end_time
                        ? formatClock(
                            session.end_time
                          )
                        : "—"}

                    </span>

                    <span>

                      {session.status ===
                      "active"

                        ? "In progress"

                        : formatDuration(
                            session.duration_minutes
                          )}

                    </span>

                    <span>

                      <b
                        className={
                          session.status ===
                          "completed"
                            ? "completed"
                            : "in-progress"
                        }
                      >

                        {session.status ===
                        "completed"

                          ? "Completed"

                          : "In Progress"}

                      </b>

                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="focus-footer">

          FocusGuard AI • Focus intentionally.

        </footer>


      </main>

    </div>

  );

}

export default FocusSessions;