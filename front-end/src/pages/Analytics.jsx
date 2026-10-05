import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "./Analytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function Analytics() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState({
    focusScore: 0,
    screenMinutes: 0,
    productiveMinutes: 0,
    nonProductiveMinutes: 0,
    switches: 0,
    distractions: 0,
    activeApps: 0,
  });

  const [activities, setActivities] = useState([]);

  const userId = localStorage.getItem("user_id");

  // =====================================================
  // FETCH ANALYTICS DATA
  // =====================================================

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    loadAnalytics();
  }, [period, userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------
      // ANALYTICS API
      // -----------------------------------------------

      const analyticsResponse = await fetch(
        `https://focuse-guard-ai-q44i.vercel.app/analytics/${userId}?period=${period}`
      );

      if (!analyticsResponse.ok) {
        throw new Error("Analytics API failed");
      }

      const analyticsData = await analyticsResponse.json();

      console.log("ANALYTICS RESPONSE:", analyticsData);

      // -----------------------------------------------
      // FOCUS SCORE
      // -----------------------------------------------

      let focusScore =
        analyticsData?.summary?.focus_score ??
        analyticsData?.focus_score ??
        0;

      // -----------------------------------------------
      // SCREEN TIME
      // -----------------------------------------------

      let screenMinutes =
        analyticsData?.summary?.screen_time ??
        analyticsData?.screen_time ??
        0;

      // Sometimes screen_time may be an object
      if (
        typeof screenMinutes === "object" &&
        screenMinutes !== null
      ) {
        screenMinutes =
          Number(screenMinutes.hours || 0) * 60 +
          Number(screenMinutes.minutes || 0);
      }

      // -----------------------------------------------
      // PRODUCTIVE TIME
      // -----------------------------------------------

      let productiveMinutes =
        analyticsData?.summary?.productive_time ??
        analyticsData?.productive_time ??
        0;

      if (
        typeof productiveMinutes === "object" &&
        productiveMinutes !== null
      ) {
        productiveMinutes =
          Number(productiveMinutes.hours || 0) * 60 +
          Number(productiveMinutes.minutes || 0);
      }

      // -----------------------------------------------
      // SWITCHES
      // -----------------------------------------------

      let switches =
        analyticsData?.summary?.app_switches ??
        analyticsData?.summary?.task_switches ??
        analyticsData?.app_switches ??
        analyticsData?.task_switches ??
        0;

      // -----------------------------------------------
      // DISTRACTIONS
      // -----------------------------------------------

      let distractions =
        analyticsData?.summary?.distractions ??
        analyticsData?.summary?.distraction_count ??
        analyticsData?.distractions ??
        analyticsData?.distraction_count ??
        0;

      // -----------------------------------------------
      // ACTIVITY API
      // -----------------------------------------------

      let activityList = [];

      try {
        const activityResponse = await fetch(
          `https://focuse-guard-ai-q44i.vercel.app/activity-monitor/${userId}?period=${period}`
        );

        if (activityResponse.ok) {
          const activityData =
            await activityResponse.json();

          console.log(
            "ACTIVITY RESPONSE:",
            activityData
          );

          activityList =
            activityData.activities ||
            activityData.activity ||
            [];
        }
      } catch (activityError) {
        console.error(
          "Activity API error:",
          activityError
        );
      }

      // -----------------------------------------------
      // CALCULATE ACTIVITY VALUES
      // -----------------------------------------------

      let calculatedProductive = 0;
      let calculatedNonProductive = 0;
      let appNames = new Set();

      activityList.forEach((item) => {
        const minutes =
          Number(item.duration_minutes) || 0;

        const productivity =
          String(item.productivity || "")
            .toLowerCase();

        if (
          productivity.includes("productive") &&
          !productivity.includes("non")
        ) {
          calculatedProductive += minutes;
        } else {
          calculatedNonProductive += minutes;
        }

        if (item.website) {
          appNames.add(item.website);
        }
      });

      // Use API productive value if available.
      if (Number(productiveMinutes) === 0) {
        productiveMinutes = calculatedProductive;
      }

      // -----------------------------------------------
      // SCREEN TIME FALLBACK
      // -----------------------------------------------

      if (Number(screenMinutes) === 0) {
        screenMinutes =
          calculatedProductive +
          calculatedNonProductive;
      }

      // -----------------------------------------------
      // NON PRODUCTIVE
      // -----------------------------------------------

      const nonProductiveMinutes =
        Number(screenMinutes) -
        Number(productiveMinutes) > 0
          ? Number(screenMinutes) -
            Number(productiveMinutes)
          : calculatedNonProductive;

      // -----------------------------------------------
      // DISTRACTION API FALLBACK
      // -----------------------------------------------

      if (Number(distractions) === 0) {
        try {
          const distractionResponse =
            await fetch(
              `https://focuse-guard-ai-q44i.vercel.app/distraction-count/${userId}?period=${period}`
            );

          if (distractionResponse.ok) {
            const distractionData =
              await distractionResponse.json();

            distractions =
              distractionData.distraction_count ||
              0;

            console.log(
              "DISTRACTION RESPONSE:",
              distractionData
            );
          }
        } catch (e) {
          console.error(
            "Distraction API error:",
            e
          );
        }
      }

      // -----------------------------------------------
      // SWITCH API FALLBACK
      // -----------------------------------------------

      if (Number(switches) === 0) {
        try {
          const switchResponse =
            await fetch(
              `https://focuse-guard-ai-q44i.vercel.app/task-switches/${userId}?period=${period}`
            );

          if (switchResponse.ok) {
            const switchData =
              await switchResponse.json();

            switches =
              switchData.total_switches ||
              switchData.distraction_switches ||
              0;

            console.log(
              "SWITCH RESPONSE:",
              switchData
            );
          }
        } catch (e) {
          console.error(
            "Switch API error:",
            e
          );
        }
      }

      // -----------------------------------------------
      // SET FINAL DATA
      // -----------------------------------------------

      setAnalytics({
        focusScore: Number(focusScore) || 0,

        screenMinutes:
          Number(screenMinutes) || 0,

        productiveMinutes:
          Number(productiveMinutes) || 0,

        nonProductiveMinutes:
          Number(nonProductiveMinutes) || 0,

        switches:
          Number(switches) || 0,

        distractions:
          Number(distractions) || 0,

        activeApps:
          appNames.size,
      });

      setActivities(activityList);

    } catch (err) {
      console.error(
        "Analytics loading error:",
        err
      );

      setError(
        "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatMinutes = (minutes) => {
    const value = Number(minutes) || 0;

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }

    return `${mins}m`;
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");

    navigate("/");
  };

  // =====================================================
  // CONSISTENCY
  // =====================================================

  const consistency =
    analytics.switches <= 10
      ? "Steady"
      : analytics.switches <= 25
      ? "Moderate"
      : "Unstable";

  // =====================================================
  // SWITCH COST
  // =====================================================

  const switchCost = Math.round(
    analytics.switches * 1.3
  );

  // =====================================================
  // PRODUCTIVITY %
  // =====================================================

  const totalActivity =
    analytics.productiveMinutes +
    analytics.nonProductiveMinutes;

  const productivePercentage =
    totalActivity > 0
      ? Math.round(
          (analytics.productiveMinutes /
            totalActivity) *
            100
        )
      : 0;

  // =====================================================
  // APP DATA
  // =====================================================

  const appMap = {};

  activities.forEach((item) => {
    const website =
      item.website || "Unknown";

    const minutes =
      Number(item.duration_minutes) || 0;

    if (!appMap[website]) {
      appMap[website] = 0;
    }

    appMap[website] += minutes;
  });

  const topApps = Object.entries(appMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // =====================================================
  // FOCUS CHART
  // =====================================================

  const focusChartData = {
    labels: ["Focus Score"],

    datasets: [
      {
        label: "Focus Score",

        data: [
          analytics.focusScore,
        ],

        borderColor: "#2563eb",

        backgroundColor:
          "rgba(37, 99, 235, 0.12)",

        fill: true,

        tension: 0.4,

        pointRadius: 6,
      },
    ],
  };

  const focusChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    scales: {
      y: {
        min: 0,
        max: 100,

        ticks: {
          color: "#64748b",
        },

        grid: {
          color: "#e5e7eb",
        },
      },

      x: {
        ticks: {
          color: "#64748b",
        },

        grid: {
          display: false,
        },
      },
    },

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // =====================================================
  // PRODUCTIVITY CHART
  // =====================================================

  const productivityChartData = {
    labels: [
      "Productive",
      "Non-Productive",
    ],

    datasets: [
      {
        data: [
          analytics.productiveMinutes,
          analytics.nonProductiveMinutes,
        ],

        backgroundColor: [
          "#10b981",
          "#ef4444",
        ],

        borderWidth: 0,
      },
    ],
  };

  const productivityChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "70%",

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          usePointStyle: true,
          padding: 18,
        },
      },
    },
  };

  // =====================================================
  // APPLICATION BAR CHART
  // =====================================================

  const applicationChartData = {
    labels: topApps.map(
      ([name]) => name
    ),

    datasets: [
      {
        label: "Minutes",

        data: topApps.map(
          ([, minutes]) => minutes
        ),

        backgroundColor: "#2563eb",

        borderRadius: 8,
      },
    ],
  };

  const applicationChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    indexAxis: "y",

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        beginAtZero: true,

        ticks: {
          color: "#64748b",
        },

        grid: {
          color: "#edf1f6",
        },
      },

      y: {
        ticks: {
          color: "#334155",
        },

        grid: {
          display: false,
        },
      },
    },
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="analytics-layout">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="analytics-sidebar">

        <div className="analytics-brand">

          <div className="analytics-brand-icon">
            🧠
          </div>

          <div>
            <h2>FocusGuard AI</h2>

            <span>
              Attention Intelligence
            </span>
          </div>

        </div>

        <div className="analytics-menu">

          <p>MAIN</p>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠
            <span>Dashboard</span>
          </button>

          <button
            onClick={() =>
              navigate("/focus-sessions")
            }
          >
            🎯
            <span>Focus Sessions</span>
          </button>

          <button
            onClick={() =>
              navigate("/activity-monitor")
            }
          >
            📱
            <span>Activity Monitor</span>
          </button>

          <button
            onClick={() =>
              navigate("/distraction-analysis")
            }
          >
            ⚠️
            <span>Distraction Analysis</span>
          </button>

          <button className="analytics-active">
            📊
            <span>Analytics</span>
          </button>

        </div>

        <div className="analytics-menu">

          <p>INTELLIGENCE</p>

          <button
            onClick={() =>
              navigate("/ai-recommendations")
            }
          >
            🤖
            <span>AI Recommendations</span>
          </button>

        </div>

        <div className="analytics-menu">

          <p>ACCOUNT</p>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            👤
            <span>Profile</span>
          </button>

          <button
            onClick={() =>
              navigate("/settings")
            }
          >
            ⚙️
            <span>Settings</span>
          </button>

        </div>

        <button
          className="analytics-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="analytics-main">

        {/* HEADER */}

        <header className="analytics-header">

          <div>

            <p className="analytics-label">
              PERFORMANCE INTELLIGENCE
            </p>

            <h1>Analytics</h1>

            <p className="analytics-subtitle">
              Understand your focus, productivity
              and digital behaviour over time.
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={loadAnalytics}
          >
            ↻ Refresh
          </button>

        </header>

        {/* PERIOD */}

        <section className="analysis-period">

          <div>

            <h2>
              Analysis Period
            </h2>

            <p>
              Showing detailed analysis for{" "}
              <strong>
                {period === "today"
                  ? "Today"
                  : period === "week"
                  ? "This Week"
                  : "This Month"}
              </strong>
            </p>

          </div>

          <div className="period-buttons">

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

        {error && (
          <div className="analytics-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="analytics-loading">
            Loading analytics...
          </div>
        ) : (
          <>
            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="analytics-metrics">

              <div className="analytics-card">

                <span>
                  Focus Quality
                </span>

                <h2>
                  {analytics.focusScore}
                  <small>/100</small>
                </h2>

                <p>
                  Overall concentration
                </p>

              </div>

              <div className="analytics-card">

                <span>
                  Switch Cost Estimate
                </span>

                <h2>
                  ~{switchCost} min
                </h2>

                <p>
                  Estimated time lost through switches
                </p>

              </div>

              <div className="analytics-card">

                <span>
                  Consistency
                </span>

                <h2>
                  {consistency}
                </h2>

                <p>
                  Focus stability during this period
                </p>

              </div>

              <div className="analytics-card">

                <span>
                  Total Screen Time
                </span>

                <h2>
                  {formatMinutes(
                    analytics.screenMinutes
                  )}
                </h2>

                <p>
                  Total digital activity
                </p>

              </div>

            </section>

            {/* =================================================
                CHARTS
            ================================================= */}

            <section className="analytics-chart-grid">

              {/* FOCUS */}

              <div className="analytics-panel">

                <div className="panel-heading">

                  <div>

                    <p>
                      FOCUS PERFORMANCE
                    </p>

                    <h2>
                      Focus Score
                    </h2>

                    <span>
                      Current concentration performance
                    </span>

                  </div>

                  <b>
                    {period === "today"
                      ? "Today"
                      : period === "week"
                      ? "This Week"
                      : "This Month"}
                  </b>

                </div>

                <div className="chart-box">

                  <Line
                    data={focusChartData}
                    options={focusChartOptions}
                  />

                </div>

              </div>

              {/* PRODUCTIVITY */}

              <div className="analytics-panel">

                <div className="panel-heading">

                  <div>

                    <p>
                      PRODUCTIVITY
                    </p>

                    <h2>
                      Productivity Breakdown
                    </h2>

                    <span>
                      Productive vs non-productive activity
                    </span>

                  </div>

                </div>

                <div className="chart-box doughnut-box">

                  <Doughnut
                    data={
                      productivityChartData
                    }
                    options={
                      productivityChartOptions
                    }
                  />

                  <div className="doughnut-center">

                    <strong>
                      {productivePercentage}%
                    </strong>

                    <span>
                      Productive
                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                ACTIVITY ANALYSIS
            ================================================= */}

            <section className="analytics-panel large-panel">

              <div className="panel-heading">

                <div>

                  <p>
                    DIGITAL ACTIVITY
                  </p>

                  <h2>
                    Time by Application
                  </h2>

                  <span>
                    Where your screen time is being spent
                  </span>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/activity-monitor"
                    )
                  }
                >
                  View Activity →
                </button>

              </div>

              <div className="application-chart">

                {topApps.length > 0 ? (
                  <Bar
                    data={
                      applicationChartData
                    }
                    options={
                      applicationChartOptions
                    }
                  />
                ) : (
                  <div className="empty-chart">
                    No application data available
                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                BEHAVIOUR SUMMARY
            ================================================= */}

            <section className="behaviour-grid">

              <div className="behaviour-card">

                <span>
                  🔄
                </span>

                <div>

                  <strong>
                    App Switches
                  </strong>

                  <h3>
                    {analytics.switches}
                  </h3>

                  <p>
                    Context switches detected
                  </p>

                </div>

              </div>

              <div className="behaviour-card">

                <span>
                  ⚠️
                </span>

                <div>

                  <strong>
                    Distractions
                  </strong>

                  <h3>
                    {analytics.distractions}
                  </h3>

                  <p>
                    Attention interruptions
                  </p>

                </div>

              </div>

              <div className="behaviour-card">

                <span>
                  🎯
                </span>

                <div>

                  <strong>
                    Productive Time
                  </strong>

                  <h3>
                    {formatMinutes(
                      analytics.productiveMinutes
                    )}
                  </h3>

                  <p>
                    Focused digital activity
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                INSIGHT
            ================================================= */}

            <section className="analytics-insight">

              <div className="insight-icon">
                ✦
              </div>

              <div>

                <strong>
                  Behavioral Insight
                </strong>

                <p>
                  {analytics.switches > 25
                    ? "You are switching between applications frequently. Reducing context switches may help preserve your focus."
                    : analytics.focusScore >= 70
                    ? "Your focus performance is strong during this period. Continue maintaining longer uninterrupted focus sessions."
                    : "Your focus score indicates that there is room to improve concentration. Try reducing distractions and maintaining longer focus sessions."}
                </p>

              </div>

            </section>

          </>
        )}

        <footer className="analytics-footer">
          FocusGuard AI • Focus intentionally.
        </footer>

      </main>

    </div>
  );
}

export default Analytics;