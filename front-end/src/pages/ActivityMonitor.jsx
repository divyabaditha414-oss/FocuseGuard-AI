import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ActivityMonitor.css";

function ActivityMonitor() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("user_id");

  // =========================
  // FETCH ACTIVITY DATA
  // =========================

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/activity-monitor/${userId}?period=${period}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity data");
      }

      const result = await response.json();

      console.log("Activity Monitor API:", result);

      setData(result);
    } catch (err) {
      console.error("Activity Monitor Error:", err);
      setError("Unable to load activity data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [period, userId]);

  // =========================
  // FORMAT MINUTES
  // =========================

  const formatMinutes = (minutes = 0) => {
    const value = Number(minutes) || 0;

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  // =========================
  // PERIOD TITLE
  // =========================

  const getPeriodTitle = () => {
    if (period === "today") return "Today";
    if (period === "week") return "This Week";
    return "This Month";
  };

  // =========================
  // ACTIVITY DATA
  // =========================

  const activities = data?.activities || [];

  const sortedActivities = [...activities]
    .sort(
      (a, b) =>
        (Number(b.duration_minutes) || 0) -
        (Number(a.duration_minutes) || 0)
    )
    .slice(0, 8);

  const maxDuration =
    sortedActivities.length > 0
      ? Math.max(
          ...sortedActivities.map(
            (item) => Number(item.duration_minutes) || 0
          )
        )
      : 1;

  // =========================
  // CORRECT BACKEND VALUES
  // =========================

  const totalScreenTime = Number(data?.total_screen_time) || 0;

  const activeApps = Number(data?.active_apps) || 0;

  const totalSwitches = Number(data?.total_switches) || 0;

  const productiveMinutes =
    Number(data?.productive_minutes) || 0;

  const nonProductiveMinutes =
    Number(data?.non_productive_minutes) || 0;

  const productivityPercentage =
    totalScreenTime > 0
      ? Math.round(
          (productiveMinutes / totalScreenTime) * 100
        )
      : 0;

  // =========================
  // RETURN
  // =========================

  return (
    <div className="activity-page">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="activity-sidebar">

        <div className="brand">
          <div className="brand-icon">🧠</div>

          <div>
            <h2>FocusGuard AI</h2>
            <p>Attention Intelligence</p>
          </div>
        </div>

        {/* MAIN */}

        <div className="menu-section">
          <span>MAIN</span>

          <button
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() => navigate("/focus-sessions")}
          >
            🎯 Focus Sessions
          </button>

          <button className="active">
            📱 Activity Monitor
          </button>

          <button
            onClick={() =>
              navigate("/distraction-analysis")
            }
          >
            ⚠️ Distraction Analysis
          </button>

          <button
            onClick={() => navigate("/analytics")}
          >
            📊 Analytics
          </button>
        </div>

        {/* INTELLIGENCE */}

        <div className="menu-section">
          <span>INTELLIGENCE</span>

          <button
            onClick={() =>
              navigate("/ai-recommendations")
            }
          >
            🤖 AI Recommendations
          </button>
        </div>

        {/* ACCOUNT */}

        <div className="menu-section">
          <span>ACCOUNT</span>

          <button
            onClick={() => navigate("/profile")}
          >
            👤 Profile
          </button>

          <button
            onClick={() => navigate("/settings")}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* LOGOUT */}

        <button
          className="activity-logout"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("user_id");
            navigate("/");
          }}
        >
          ↪ Logout
        </button>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="activity-main">

        {/* HEADER */}

        <header className="activity-header">

          <div>
            <div className="page-label">
              DIGITAL ACTIVITY
            </div>

            <h1>Activity Monitor</h1>

            <p>
              Understand where your digital attention is going.
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchActivity}
          >
            ↻ Refresh
          </button>

        </header>

        {/* =========================
            PERIOD SELECTOR
        ========================= */}

        <section className="period-card">

          <div>
            <h3>Activity Overview</h3>

            <p>
              Showing activity data for{" "}
              <strong>{getPeriodTitle()}</strong>
            </p>
          </div>

          <div className="period-buttons">

            <button
              className={
                period === "today"
                  ? "selected"
                  : ""
              }
              onClick={() => setPeriod("today")}
            >
              Today
            </button>

            <button
              className={
                period === "week"
                  ? "selected"
                  : ""
              }
              onClick={() => setPeriod("week")}
            >
              This Week
            </button>

            <button
              className={
                period === "month"
                  ? "selected"
                  : ""
              }
              onClick={() => setPeriod("month")}
            >
              This Month
            </button>

          </div>

        </section>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="state-card">
            <div className="loader"></div>
            <p>Loading activity data...</p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (
          <div className="error-card">

            <h3>Unable to load activity</h3>

            <p>{error}</p>

            <button onClick={fetchActivity}>
              Try Again
            </button>

          </div>
        )}

        {/* =========================
            DATA
        ========================= */}

        {!loading && !error && data && (
          <>

            {/* =========================
                STAT CARDS
            ========================= */}

            <section className="activity-stats">

              {/* SCREEN TIME */}

              <div className="stat-card blue">

                <div className="stat-icon">
                  💻
                </div>

                <div>
                  <span>Total Screen Time</span>

                  <strong>
                    {formatMinutes(totalScreenTime)}
                  </strong>

                  <small>
                    Device usage
                  </small>
                </div>

              </div>

              {/* ACTIVE APPS */}

              <div className="stat-card purple">

                <div className="stat-icon">
                  📱
                </div>

                <div>
                  <span>Active Apps</span>

                  <strong>
                    {activeApps}
                  </strong>

                  <small>
                    Applications & websites
                  </small>
                </div>

              </div>

              {/* SWITCHES */}

              <div className="stat-card orange">

                <div className="stat-icon">
                  🔄
                </div>

                <div>
                  <span>App Switches</span>

                  <strong>
                    {totalSwitches}
                  </strong>

                  <small>
                    Context switches
                  </small>
                </div>

              </div>

              {/* PRODUCTIVE TIME */}

              <div className="stat-card green">

                <div className="stat-icon">
                  🎯
                </div>

                <div>
                  <span>Productive Time</span>

                  <strong>
                    {formatMinutes(productiveMinutes)}
                  </strong>

                  <small>
                    Focused activity
                  </small>
                </div>

              </div>

            </section>

            {/* =========================
                PRODUCTIVITY SUMMARY
            ========================= */}

            <section className="summary-grid">

              {/* PRODUCTIVITY */}

              <div className="summary-card">

                <div className="section-heading">

                  <div>
                    <span>PRODUCTIVITY</span>

                    <h2>
                      Productivity Summary
                    </h2>

                    <p>
                      Productive versus
                      non-productive activity
                    </p>
                  </div>

                </div>

                <div className="productivity-content">

                  <div className="productivity-bar">

                    <div
                      className="productive-bar"
                      style={{
                        width: `${productivityPercentage}%`,
                      }}
                    ></div>

                  </div>

                  <div className="productivity-values">

                    {/* PRODUCTIVE */}

                    <div>

                      <span className="green-dot"></span>

                      <div>
                        <strong>
                          Productive
                        </strong>

                        <p>
                          {formatMinutes(
                            productiveMinutes
                          )}
                        </p>
                      </div>

                    </div>

                    {/* NON PRODUCTIVE */}

                    <div>

                      <span className="red-dot"></span>

                      <div>
                        <strong>
                          Non-Productive
                        </strong>

                        <p>
                          {formatMinutes(
                            nonProductiveMinutes
                          )}
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================
                  ACTIVITY DISTRIBUTION
              ========================= */}

              <div className="summary-card score-card">

                <span>ATTENTION</span>

                <h2>
                  Activity Distribution
                </h2>

                <div
                  className="score-circle"
                  style={{
                    "--score": `${
                      productivityPercentage * 3.6
                    }deg`,
                  }}
                >

                  <div>

                    <strong>
                      {productivityPercentage}%
                    </strong>

                    <small>
                      Productive
                    </small>

                  </div>

                </div>

              </div>

            </section>

            {/* =========================
                TIME BY APPLICATION
            ========================= */}

            <section className="content-card">

              <div className="section-heading">

                <div>

                  <span>
                    DIGITAL ACTIVITY
                  </span>

                  <h2>
                    Time by Application
                  </h2>

                  <p>
                    Where your screen time is being spent
                  </p>

                </div>

              </div>

              {sortedActivities.length === 0 ? (

                <div className="empty-state">

                  <div>📊</div>

                  <h3>
                    No activity found
                  </h3>

                  <p>
                    Activity data will appear here
                    when available.
                  </p>

                </div>

              ) : (

                <div className="application-list">

                  {sortedActivities.map(
                    (item, index) => {

                      const duration =
                        Number(
                          item.duration_minutes
                        ) || 0;

                      const percentage =
                        maxDuration > 0
                          ? (duration / maxDuration) *
                            100
                          : 0;

                      const productive =
                        String(
                          item.productivity || ""
                        ).toLowerCase() ===
                        "productive";

                      return (

                        <div
                          className="application-row"
                          key={`${item.id}-${index}`}
                        >

                          <div className="rank">
                            {index + 1}
                          </div>

                          <div className="application-name">

                            <strong>
                              {item.website ||
                                "Unknown"}
                            </strong>

                            <span
                              className={
                                productive
                                  ? "status productive"
                                  : "status distracting"
                              }
                            >
                              {productive
                                ? "Productive"
                                : "Non-Productive"}
                            </span>

                          </div>

                          <div className="application-progress">

                            <div className="progress-track">

                              <div
                                className={`progress-fill ${
                                  productive
                                    ? "productive-fill"
                                    : "distracting-fill"
                                }`}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              ></div>

                            </div>

                          </div>

                          <strong className="duration">

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

            {/* =========================
                ACTIVITY HISTORY
            ========================= */}

            <section className="content-card">

              <div className="section-heading">

                <div>

                  <span>
                    HISTORY
                  </span>

                  <h2>
                    Activity History
                  </h2>

                  <p>
                    Detailed application and website activity
                  </p>

                </div>

              </div>

              {activities.length === 0 ? (

                <div className="empty-state">

                  <div>🕐</div>

                  <h3>
                    No activity recorded
                  </h3>

                  <p>
                    No activity is available
                    for this period.
                  </p>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table className="activity-table">

                    <thead>

                      <tr>
                        <th>
                          Application / Website
                        </th>

                        <th>
                          Duration
                        </th>

                        <th>
                          Switches
                        </th>

                        <th>
                          Productivity
                        </th>

                        <th>
                          Time
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {activities.map(
                        (item, index) => {

                          const productive =
                            String(
                              item.productivity || ""
                            ).toLowerCase() ===
                            "productive";

                          const createdTime =
                            item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "--";

                          return (

                            <tr key={item.id || index}>

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
                                {item.switch_count ||
                                  0}
                              </td>

                              <td>

                                <span
                                  className={
                                    productive
                                      ? "table-status productive-status"
                                      : "table-status nonproductive-status"
                                  }
                                >
                                  {productive
                                    ? "Productive"
                                    : "Non-Productive"}
                                </span>

                              </td>

                              <td>
                                {createdTime}
                              </td>

                            </tr>

                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default ActivityMonitor;