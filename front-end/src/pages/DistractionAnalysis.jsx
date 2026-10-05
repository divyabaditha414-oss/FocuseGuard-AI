import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DistractionAnalysis.css";
import axios from "axios";

function DistractionAnalysis() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [period, setPeriod] = useState("today");

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [switchData, setSwitchData] = useState({
    total_switches: 0,
    detected_transitions: 0,
    switch_details: [],
  });

  const [switchLoading, setSwitchLoading] = useState(false);

  const [showSwitchDetails, setShowSwitchDetails] =
    useState(false);

  const userId = localStorage.getItem("user_id");

  // ==========================================
  // FETCH DISTRACTION DATA
  // ==========================================

  const fetchDistractionData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://focus-guard-ai-q44i.vercel.app/distraction-count/${userId}?period=${period}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch distraction data"
        );
      }

      const result = await response.json();
console.log(
  "DISTRACTION API RESPONSE:",
  JSON.stringify(result, null, 2)
);

if (result.error) {
        throw new Error(result.error);
      }

      setData(result);
    } catch (err) {
      console.error(
        "Distraction Analysis Error:",
        err
      );

      setError(
        "Unable to load distraction data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH SWITCH DATA
  // ==========================================

  const fetchSwitchData = async () => {
    try {
      setSwitchLoading(true);

      const response = await axios.get(
        `https://focus-guard-ai-q44i.vercel.app/task-switches/${userId}?period=${period}`
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setSwitchData({
        total_switches:
          response.data.total_switches || 0,

        detected_transitions:
          response.data.detected_transitions || 0,

        switch_details:
          response.data.switch_details || [],
      });
    } catch (err) {
      console.error(
        "Switch Details Error:",
        err
      );

      setSwitchData({
        total_switches: 0,
        detected_transitions: 0,
        switch_details: [],
      });
    } finally {
      setSwitchLoading(false);
    }
  };

  // ==========================================
  // FETCH BOTH APIs WHEN PERIOD CHANGES
  // ==========================================

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    fetchDistractionData();
    fetchSwitchData();
  }, [period, userId]);

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatMinutes = (minutes = 0) => {
    const numericMinutes =
      Number(minutes) || 0;

    const hours = Math.floor(
      numericMinutes / 60
    );

    const mins = numericMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  // ==========================================
  // PERIOD TITLE
  // ==========================================

  const getPeriodTitle = () => {
    if (period === "today") {
      return "Today";
    }

    if (period === "week") {
      return "This Week";
    }

    return "This Month";
  };

  // ==========================================
  // DISTRACTION DATA
  // ==========================================

  const distractionCount =
    data?.distraction_count || 0;

  const distractionMinutes =
    data?.distraction_minutes || 0;

  const distractionSwitches =
    data?.distraction_switches || 0;

  const websites =
    data?.distracting_websites || [];

  // ==========================================
  // TOP DISTRACTIONS
  // ==========================================

  const topDistractions = [...websites]
    .sort(
      (a, b) =>
        (b.duration_minutes || 0) -
        (a.duration_minutes || 0)
    )
    .slice(0, 6);

  const maxDuration =
    topDistractions.length > 0
      ? Math.max(
          ...topDistractions.map(
            (item) =>
              item.duration_minutes || 0
          )
        )
      : 1;

  // ==========================================
  // SWITCH DATA
  // ==========================================

  const switchDetails =
    switchData.switch_details || [];

  const detectedTransitions =
    switchData.detected_transitions || 0;

  // ==========================================
  // TOGGLE SWITCH DETAILS
  // ==========================================

  const toggleSwitchDetails = () => {
    const newState = !showSwitchDetails;

    setShowSwitchDetails(newState);

    if (newState) {
      setTimeout(() => {
        document
          .getElementById("switch-details")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = () => {
    fetchDistractionData();
    fetchSwitchData();
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");

    navigate("/");
  };

  // ==========================================
  // APPLICATION CATEGORY
  // ==========================================

  const getApplicationCategory = (
    appName = ""
  ) => {
    const app = appName.toLowerCase();

    if (
      app.includes("youtube") ||
      app.includes("instagram") ||
      app.includes("facebook") ||
      app.includes("snapchat") ||
      app.includes("netflix")
    ) {
      return "Entertainment";
    }

    if (
      app.includes("code") ||
      app.includes("visual studio") ||
      app.includes("pycharm") ||
      app.includes("jupyter")
    ) {
      return "Development";
    }

    if (
      app.includes("chrome") ||
      app.includes("edge") ||
      app.includes("firefox")
    ) {
      return "Browser";
    }

    if (
      app.includes("linkedin") ||
      app.includes("indeed")
    ) {
      return "Career";
    }

    return "Application";
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="distraction-page">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="distraction-sidebar">

        {/* BRAND */}

        <div className="distraction-brand">

          <div className="brand-logo">
            🧠
          </div>

          <div>
            <h2>
              FocusGuard AI
            </h2>

            <p>
              Attention Intelligence
            </p>
          </div>

        </div>

        {/* MAIN MENU */}

        <div className="sidebar-section">

          <span>
            MAIN
          </span>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/focus-sessions")
            }
          >
            🎯 Focus Sessions
          </button>

          <button
            onClick={() =>
              navigate("/activity-monitor")
            }
          >
            📱 Activity Monitor
          </button>

          <button className="active">
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

        <div className="sidebar-section">

          <span>
            INTELLIGENCE
          </span>

          <button
            onClick={() =>
              navigate(
                "/ai-recommendations"
              )
            }
          >
            🤖 AI Recommendations
          </button>

        </div>

        {/* ACCOUNT */}

        <div className="sidebar-section">

          <span>
            ACCOUNT
          </span>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            👤 Profile
          </button>

          <button
            onClick={() =>
              navigate("/settings")
            }
          >
            ⚙️ Settings
          </button>

        </div>

        {/* LOGOUT */}

        <button
          className="distraction-logout"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <main className="distraction-main">

        {/* HEADER */}

        <header className="distraction-header">

          <div>

            <div className="page-label">
              DIGITAL WELLBEING
            </div>

            <h1>
              Distraction Analysis
            </h1>

            <p>
              Understand where your attention
              is being interrupted.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={
              loading || switchLoading
            }
          >
            ↻ Refresh
          </button>

        </header>

        {/* =================================
            PERIOD SELECTOR
        ================================== */}

        <section className="period-panel">

          <div>

            <h3>
              Analysis Period
            </h3>

            <p>
              Showing distraction data for{" "}
              <strong>
                {getPeriodTitle()}
              </strong>
            </p>

          </div>

          <div className="period-controls">

            <button
              className={
                period === "today"
                  ? "selected"
                  : ""
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
                  ? "selected"
                  : ""
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
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setPeriod("month")
              }
            >
              This Month
            </button>

          </div>

        </section>

        {/* =================================
            LOADING
        ================================== */}

        {loading && (

          <div className="distraction-state">

            <div className="loader"></div>

            <p>
              Analysing your activity...
            </p>

          </div>

        )}

        {/* =================================
            ERROR
        ================================== */}

        {!loading && error && (

          <div className="distraction-error">

            <h3>
              Unable to load analysis
            </h3>

            <p>
              {error}
            </p>

            <button
              onClick={handleRefresh}
            >
              Try Again
            </button>

          </div>

        )}

        {/* =================================
            DATA
        ================================== */}

        {!loading &&
          !error &&
          data && (

            <>

              {/* =================================
                  KEY METRICS
              ================================== */}

              <section className="distraction-stats">

                {/* TOTAL DISTRACTIONS */}

                <div className="distraction-stat danger">

                  <div className="stat-symbol">
                    ⚠
                  </div>

                  <div>

                    <span>
                      Total Distractions
                    </span>

                    <strong>
                      {distractionCount}
                    </strong>

                    <small>
                      Detected events
                    </small>

                  </div>

                </div>

                {/* DISTRACTION TIME */}

                <div className="distraction-stat time">

                  <div className="stat-symbol">
                    ◷
                  </div>

                  <div>

                    <span>
                      Distraction Time
                    </span>

                    <strong>
                      {formatMinutes(
                        distractionMinutes
                      )}
                    </strong>

                    <small>
                      Time lost to distractions
                    </small>

                  </div>

                </div>

                {/* DISTRACTION SWITCHES */}

                <button
                  type="button"
                  className={`distraction-stat switch-stat-card ${
                    showSwitchDetails
                      ? "switch-card-active"
                      : ""
                  }`}
                  onClick={
                    toggleSwitchDetails
                  }
                >

                  <div className="stat-symbol">
                    ⇄
                  </div>

                  <div className="switch-stat-content">

                    <span>
                      Distraction Switches
                    </span>

                    <strong>
                      {switchLoading
                        ? "..."
                        : detectedTransitions}
                    </strong>

                    <small>
                      Click to view switch details
                    </small>

                  </div>

                  <div className="switch-card-arrow">
                    {showSwitchDetails
                      ? "▲"
                      : "▼"}
                  </div>

                </button>

              </section>

              {/* =================================
                  SWITCH ANALYSIS
              ================================== */}

              <section className="switch-analysis-panel">

                <div className="switch-header">

                  <div>

                    <span>
                      CONTEXT SWITCHING
                    </span>

                    <h2>
                      App Switch Analysis
                    </h2>

                    <p>
                      See how your attention
                      moved from one application
                      to another.
                    </p>

                  </div>

                  <button
                    className="view-switches-button"
                    onClick={
                      toggleSwitchDetails
                    }
                  >
                    {showSwitchDetails
                      ? "Hide Switch Details ↑"
                      : "View Switch Details →"}
                  </button>

                </div>

                <div className="switch-summary">

                  <div className="switch-summary-number">

                    <strong>
                      {switchLoading
                        ? "..."
                        : detectedTransitions}
                    </strong>

                    <span>
                      detected transitions
                    </span>

                  </div>

                  <div className="switch-summary-info">

                    <p>
                      Each switch represents a
                      transition from one
                      application or website
                      to another.
                    </p>

                    <div className="switch-example">

                      <span>
                        Example
                      </span>

                      <strong>
                        VS Code
                      </strong>

                      <span className="arrow">
                        →
                      </span>

                      <strong>
                        YouTube
                      </strong>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================
                  OVERVIEW GRID
              ================================== */}

              <section className="overview-grid">

                {/* DISTRACTION OVERVIEW */}

                <div className="overview-panel">

                  <div className="panel-heading">

                    <div>

                      <span>
                        ATTENTION LOSS
                      </span>

                      <h2>
                        Distraction Overview
                      </h2>

                      <p>
                        Activity interruptions
                        detected during{" "}
                        {getPeriodTitle().toLowerCase()}.
                      </p>

                    </div>

                  </div>

                  <div className="overview-number">

                    <strong>
                      {distractionCount}
                    </strong>

                    <span>
                      distraction events
                    </span>

                  </div>

                  <div className="overview-line">

                    <div
                      style={{
                        width: `${Math.min(
                          distractionCount * 8,
                          100
                        )}%`,
                      }}
                    ></div>

                  </div>

                  <div className="overview-footer">

                    <span>
                      Total interruption time
                    </span>

                    <strong>
                      {formatMinutes(
                        distractionMinutes
                      )}
                    </strong>

                  </div>

                </div>

                {/* ATTENTION IMPACT */}

                <div className="overview-panel distribution-panel">

                  <div className="panel-heading">

                    <div>

                      <span>
                        DISTRACTION LEVEL
                      </span>

                      <h2>
                        Attention Impact
                      </h2>

                    </div>

                  </div>

                  <div className="impact-content">

                    <div className="impact-circle">

                      <div>

                        <strong>
                          {distractionCount}
                        </strong>

                        <span>
                          events
                        </span>

                      </div>

                    </div>

                    <div className="impact-details">

                      <div>

                        <span className="impact-dot red"></span>

                        <div>

                          <strong>
                            Distractions
                          </strong>

                          <p>
                            {formatMinutes(
                              distractionMinutes
                            )}
                          </p>

                        </div>

                      </div>

                      <div>

                        <span className="impact-dot orange"></span>

                        <div>

                          <strong>
                            Switches
                          </strong>

                          <p>
                            {detectedTransitions}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================
                  TOP DISTRACTIONS
              ================================== */}

              <section className="content-panel">

                <div className="panel-heading">

                  <div>

                    <span>
                      DISTRACTION SOURCES
                    </span>

                    <h2>
                      Top Distracting Websites
                    </h2>

                    <p>
                      Applications and websites
                      consuming the most
                      distracting time.
                    </p>

                  </div>

                </div>

                {topDistractions.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      ✓
                    </div>

                    <h3>
                      No distractions detected
                    </h3>

                    <p>
                      Great! No distracting
                      activity was found for
                      this period.
                    </p>

                  </div>

                ) : (

                  <div className="distraction-list">

                    {topDistractions.map(
                      (item, index) => {

                        const duration =
                          item.duration_minutes ||
                          0;

                        const percentage =
                          (duration /
                            maxDuration) *
                          100;

                        return (

                          <div
                            className="distraction-row"
                            key={`${item.website}-${index}`}
                          >

                            <div className="distraction-rank">
                              {index + 1}
                            </div>

                            <div className="website-info">

                              <strong>
                                {item.website ||
                                  "Unknown"}
                              </strong>

                              <span>
                                {item.count || 0} events
                              </span>

                            </div>

                            <div className="distraction-progress">

                              <div className="progress-track">

                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                ></div>

                              </div>

                            </div>

                            <strong className="website-duration">

                              {formatMinutes(
                                duration
                              )}

                            </strong>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </section>

              {/* =================================
                  SWITCH DETAILS
              ================================== */}

              <section
                className="content-panel switch-details-panel"
                id="switch-details"
              >

                <div className="panel-heading">

                  <div>

                    <span>
                      SWITCH HISTORY
                    </span>

                    <h2>
                      Application Switch Details
                    </h2>

                    <p>
                      Track exactly how you
                      moved between applications
                      and websites.
                    </p>

                  </div>

                </div>

                {!showSwitchDetails ? (

                  <div className="switch-hidden-message">

                    <div className="switch-hidden-icon">
                      ⇄
                    </div>

                    <h3>
                      Switch details are hidden
                    </h3>

                    <p>
                      Click "View Switch Details"
                      or the Distraction Switches
                      card above to view your
                      application transitions.
                    </p>

                  </div>

                ) : switchLoading ? (

                  <div className="switch-hidden-message">

                    <div className="switch-mini-loader"></div>

                    <h3>
                      Loading switch details...
                    </h3>

                    <p>
                      Fetching your application
                      transitions.
                    </p>

                  </div>

                ) : switchDetails.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      ✓
                    </div>

                    <h3>
                      No application switches
                    </h3>

                    <p>
                      No application-to-application
                      transitions were detected
                      during this period.
                    </p>

                  </div>

                ) : (

                  <div className="switch-details-list">

                    {switchDetails.map(
                      (item, index) => (

                        <div
                          className="switch-detail-row"
                          key={
                            item.id ||
                            `${item.from_app}-${item.to_app}-${index}`
                          }
                        >

                          {/* NUMBER */}

                          <div className="switch-number">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </div>

                          {/* FROM APPLICATION */}

                          <div className="switch-app from-app">

                            <span>
                              FROM
                            </span>

                            <strong
                              title={
                                item.from_app ||
                                "Unknown"
                              }
                            >
                              {item.from_app ||
                                "Unknown"}
                            </strong>

                            <small>
                              {getApplicationCategory(
                                item.from_app
                              )}
                            </small>

                          </div>

                          {/* ARROW */}

                          <div className="switch-arrow">
                            →
                          </div>

                          {/* TO APPLICATION */}

                          <div className="switch-app to-app">

                            <span>
                              TO
                            </span>

                            <strong
                              title={
                                item.to_app ||
                                "Unknown"
                              }
                            >
                              {item.to_app ||
                                "Unknown"}
                            </strong>

                            <small>
                              {getApplicationCategory(
                                item.to_app
                              )}
                            </small>

                          </div>

                          {/* TIME */}

                          <div className="switch-time">

                            <strong>
                              {item.time ||
                                "--:--"}
                            </strong>

                            <span>
                              {item.date ||
                                "Unknown date"}
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

              {/* =================================
                  DETAILED TABLE
              ================================== */}

              <section className="content-panel">

                <div className="panel-heading">

                  <div>

                    <span>
                      HISTORY
                    </span>

                    <h2>
                      Distraction History
                    </h2>

                    <p>
                      Detailed breakdown of
                      distracting websites
                      and applications.
                    </p>

                  </div>

                </div>

                {websites.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      ✓
                    </div>

                    <h3>
                      No distraction history
                    </h3>

                    <p>
                      No distracting activity
                      exists for this period.
                    </p>

                  </div>

                ) : (

                  <div className="table-container">

                    <table className="distraction-table">

                      <thead>

                        <tr>

                          <th>
                            Website / Application
                          </th>

                          <th>
                            Duration
                          </th>

                          <th>
                            Events
                          </th>

                          <th>
                            Switches
                          </th>

                          <th>
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {websites.map(
                          (item, index) => (

                            <tr key={index}>

                              <td>

                                <strong>
                                  {item.website ||
                                    "Unknown"}
                                </strong>

                              </td>

                              <td>
                                {formatMinutes(
                                  item.duration_minutes ||
                                    0
                                )}
                              </td>

                              <td>
                                {item.count || 0}
                              </td>

                              <td>
                                {item.switch_count ||
                                  0}
                              </td>

                              <td>

                                <span className="danger-status">
                                  Distracting
                                </span>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

              {/* =================================
                  FOOTER INSIGHT
              ================================== */}

              <section className="insight-panel">

                <div className="insight-icon">
                  💡
                </div>

                <div>

                  <span>
                    FOCUSGUARD INSIGHT
                  </span>

                  <h3>
                    Your attention is being
                    interrupted{" "}
                    {distractionCount} times
                    during{" "}
                    {getPeriodTitle().toLowerCase()}.
                  </h3>

                  <p>
                    Reducing unnecessary
                    application switching can
                    help protect your focused
                    work sessions.
                  </p>

                </div>

              </section>

            </>

          )}

      </main>

    </div>
  );
}

export default DistractionAnalysis;