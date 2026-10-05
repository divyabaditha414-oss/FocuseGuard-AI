import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AIRecommendations.css";

const API_BASE = "https://focuse-guard-ai-q44i.vercel.app";

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ navigate }) {
  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="brand">
        <div className="brand-icon">🧠</div>

        <div>
          <h2>FocusGuard AI</h2>
          <span>Attention Intelligence</span>
        </div>
      </div>

      {/* MAIN */}
      <div className="menu-section">

        <p className="menu-title">
          MAIN
        </p>

        <ul>

          <li onClick={() => navigate("/dashboard")}>
            🏠 <span>Dashboard</span>
          </li>

          <li onClick={() => navigate("/focus-sessions")}>
            🎯 <span>Focus Sessions</span>
          </li>

          <li onClick={() => navigate("/activity-monitor")}>
            📱 <span>Activity Monitor</span>
          </li>

          <li onClick={() => navigate("/distraction-analysis")}>
            ⚠️ <span>Distraction Analysis</span>
          </li>

          <li onClick={() => navigate("/analytics")}>
            📊 <span>Analytics</span>
          </li>

        </ul>

      </div>

      {/* AI */}
      <div className="menu-section">

        <p className="menu-title">
          AI
        </p>

        <ul>

          <li className="active">
            🤖 <span>AI Recommendations</span>
          </li>

        </ul>

      </div>

      {/* ACCOUNT */}
      <div className="menu-section">

        <p className="menu-title">
          ACCOUNT
        </p>

        <ul>

          <li onClick={() => navigate("/profile")}>
            👤 <span>Profile</span>
          </li>

          <li onClick={() => navigate("/settings")}>
            ⚙️ <span>Settings</span>
          </li>

        </ul>

      </div>

      {/* LOGOUT */}
      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user_id");
          navigate("/");
        }}
      >
        🚪 Logout
      </button>

    </aside>
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function AIRecommendations() {

  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [period, setPeriod] = useState("week");

  const [analytics, setAnalytics] = useState(null);

  const [switchData, setSwitchData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [recommendations, setRecommendations] = useState([]);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("fg_recommendation_history") || "[]"
      );
    } catch {
      return [];
    }
  });

  const userId = localStorage.getItem("user_id");


  /* =========================================================
     FETCH ANALYTICS DATA
  ========================================================= */

  useEffect(() => {

    if (!userId) {
      navigate("/");
      return;
    }

    fetchRecommendationData();

  }, [period, userId]);


  const fetchRecommendationData = async () => {

    try {

      setLoading(true);

      setError("");

      const [
        analyticsResponse,
        switchResponse
      ] = await Promise.all([

        axios.get(
          `${API_BASE}/analytics/${userId}?period=${period}`
        ),

        axios.get(
          `${API_BASE}/task-switches/${userId}?period=${period}`
        )

      ]);

      setAnalytics(
        analyticsResponse.data
      );

      setSwitchData(
        switchResponse.data
      );

      console.log(
        "ANALYTICS RESPONSE:",
        analyticsResponse.data
      );

      console.log(
        "SWITCH RESPONSE:",
        switchResponse.data
      );

    } catch (err) {

      console.error(
        "Recommendation API Error:",
        err
      );

      setError(
        "Unable to load recommendation data."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
     HELPERS
  ========================================================= */

  const summary =
    analytics?.summary || {};


  const productivity =
    analytics?.productivity || {};


  const applications =
    analytics?.applications || [];


  const focusTrend =
    analytics?.focus_trend || [];


  const sessions =
    analytics?.session_analysis || [];


  const totalSwitches =
    Number(
      summary.app_switches ||
      switchData?.total_switches ||
      0
    );


  const focusScore =
    Number(
      summary.focus_score || 0
    );


  const screenTime =
    Number(
      summary.screen_time || 0
    );


  const productiveTime =
    Number(
      summary.productive_time ||
      productivity.productive_minutes ||
      0
    );


  const nonProductiveTime =
    Number(
      summary.non_productive_time ||
      productivity.non_productive_minutes ||
      0
    );


  const distractionCount =
    Number(
      summary.distractions || 0
    );


  /* =========================================================
     FORMAT MINUTES
  ========================================================= */

  const formatMinutes = (minutes = 0) => {

    const value =
      Number(minutes) || 0;

    const hours =
      Math.floor(value / 60);

    const mins =
      value % 60;

    if (hours > 0) {

      return `${hours}h ${mins}m`;

    }

    return `${mins}m`;

  };


  /* =========================================================
     BEST FOCUS WINDOW
  ========================================================= */

  const bestFocusWindow = useMemo(() => {

    if (!focusTrend.length) {

      return {
        time: "9:00 AM – 11:00 AM",
        score: Math.round(focusScore)
      };

    }


    const validDays =
      focusTrend.filter(
        (item) =>
          Number(
            item.focus_score || 0
          ) > 0
      );


    if (!validDays.length) {

      return {
        time: "9:00 AM – 11:00 AM",
        score: Math.round(focusScore)
      };

    }


    const best =
      validDays.reduce(
        (max, item) =>
          Number(
            item.focus_score || 0
          ) >
          Number(
            max.focus_score || 0
          )
            ? item
            : max,
        validDays[0]
      );


    return {

      time:
        "9:00 AM – 11:00 AM",

      score:
        Math.round(
          Number(
            best.focus_score ||
            focusScore
          )
        )

    };

  }, [
    focusTrend,
    focusScore
  ]);


  /* =========================================================
     MAIN DISTRACTION
  ========================================================= */

  const mainDistraction = useMemo(() => {

    if (!applications.length) {

      return {

        website:
          "No major distraction",

        minutes: 0,

        switches: 0

      };

    }


    const nonProductiveApps =
      applications.filter(
        (app) =>
          String(
            app.productivity || ""
          )
            .toLowerCase()
            .includes("non")
      );


    const source =
      nonProductiveApps.length
        ? nonProductiveApps
        : applications;


    return source.reduce(

      (max, app) =>

        Number(
          app.minutes || 0
        ) >

        Number(
          max.minutes || 0
        )

          ? app

          : max,

      source[0]

    );

  }, [applications]);


  /* =========================================================
     AVERAGE SESSION
  ========================================================= */

  const averageSession = useMemo(() => {

    if (!sessions.length) {

      return 25;

    }


    const total =
      sessions.reduce(

        (sum, session) =>

          sum +
          Number(
            session.duration_minutes || 0
          ),

        0

      );


    return Math.round(
      total / sessions.length
    );

  }, [sessions]);


  /* =========================================================
     SWITCH RISK
  ========================================================= */

  const switchRisk = useMemo(() => {

    if (totalSwitches <= 10) {

      return "Low";

    }


    if (totalSwitches <= 25) {

      return "Medium";

    }


    return "High";

  }, [totalSwitches]);


  /* =========================================================
     CONSISTENCY
  ========================================================= */

  const consistency = useMemo(() => {

    if (focusTrend.length < 2) {

      return "Steady";

    }


    const scores =
      focusTrend

        .map(
          (item) =>
            Number(
              item.focus_score || 0
            )
        )

        .filter(
          (score) => score > 0
        );


    if (scores.length < 2) {

      return "Steady";

    }


    const average =
      scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) / scores.length;


    const variance =
      scores.reduce(

        (sum, score) =>

          sum +
          Math.pow(
            score - average,
            2
          ),

        0

      ) / scores.length;


    const deviation =
      Math.sqrt(
        variance
      );


    if (deviation <= 10) {

      return "Steady";

    }


    if (deviation <= 20) {

      return "Variable";

    }


    return "Unstable";

  }, [focusTrend]);


  /* =========================================================
     GENERATE RECOMMENDATIONS
  ========================================================= */

  useEffect(() => {

    if (!analytics) {

      return;

    }


    const generated = [];


    /* -------------------------------------------------------
       Recommendation 1: Adaptive session
    ------------------------------------------------------- */

    let recommendedSession =
      averageSession;


    if (recommendedSession <= 20) {

      recommendedSession = 25;

    } else if (
      recommendedSession <= 30
    ) {

      recommendedSession = 35;

    } else if (
      recommendedSession <= 45
    ) {

      recommendedSession = 40;

    } else {

      recommendedSession = 45;

    }


    generated.push({

      id:
        "adaptive-session",

      impact:
        "High Impact",

      type:
        "Focus Strategy",

      title:
        `Try ${recommendedSession}-min focus sessions with 5-min breaks`,

      description:

        averageSession > 0

          ? `Your recent sessions average around ${averageSession} minutes. A structured session near this range may help maintain concentration.`

          : "Start with a manageable focus block and a short recovery break.",

      action:
        "Apply"

    });


    /* -------------------------------------------------------
       Recommendation 2: Main distraction
    ------------------------------------------------------- */

    if (
      mainDistraction &&
      mainDistraction.minutes > 0
    ) {

      generated.push({

        id:
          "distraction-control",

        impact:
          "Medium Impact",

        type:
          "Attention Protection",

        title:
          `Reduce ${mainDistraction.website} during focus sessions`,

        description:

          `${mainDistraction.website} accounts for ` +

          `${formatMinutes(
            mainDistraction.minutes
          )} of your tracked activity and may be contributing to attention loss.`,

        action:
          "Apply"

      });

    }


    /* -------------------------------------------------------
       Recommendation 3: Best focus time
    ------------------------------------------------------- */

    generated.push({

      id:
        "best-focus-window",

      impact:
        "Medium Impact",

      type:
        "Work Pattern",

      title:
        `Schedule important work between ${bestFocusWindow.time}`,

      description:
        `Your strongest observed focus level is around ${bestFocusWindow.score}/100. Use your highest-focus period for difficult tasks.`,

      action:
        "Apply"

    });


    /* -------------------------------------------------------
       Recommendation 4: Context switching
    ------------------------------------------------------- */

    if (totalSwitches > 10) {

      generated.push({

        id:
          "switch-reduction",

        impact:
          totalSwitches > 25
            ? "High Impact"
            : "Medium Impact",

        type:
          "Context Switching",

        title:
          "Reduce application switching",

        description:
          `You recorded ${totalSwitches} application switches during this period. Frequent switching can interrupt focused work.`,

        action:
          "Apply"

      });

    }


    /* -------------------------------------------------------
       Recommendation 5: Recovery
    ------------------------------------------------------- */

    if (focusTrend.length >= 3) {

      const recent =
        focusTrend.slice(-3);


      const decreasing =

        Number(
          recent[0]?.focus_score || 0
        ) >

        Number(
          recent[1]?.focus_score || 0
        ) &&

        Number(
          recent[1]?.focus_score || 0
        ) >

        Number(
          recent[2]?.focus_score || 0
        );


      if (decreasing) {

        generated.push({

          id:
            "recovery",

          impact:
            "Recovery",

          type:
            "Attention Recovery",

          title:
            "Take a lighter focus session today",

          description:
            "Your focus score has decreased across the latest tracked periods. Consider shorter work blocks and additional recovery time.",

          action:
            "Apply"

        });

      }

    }


    /* -------------------------------------------------------
       Recommendation 6: Productivity balance
    ------------------------------------------------------- */

    if (
      screenTime > 0 &&
      productiveTime <
        screenTime * 0.5
    ) {

      generated.push({

        id:
          "productivity-balance",

        impact:
          "Medium Impact",

        type:
          "Productivity",

        title:
          "Increase uninterrupted productive time",

        description:

          `Only ${Math.round(
            (productiveTime /
              screenTime) *
              100
          )}% of your tracked screen time was productive.`,

        action:
          "Apply"

      });

    }


    setRecommendations(
      generated.slice(0, 6)
    );

  }, [
    analytics,
    averageSession,
    mainDistraction,
    bestFocusWindow,
    totalSwitches,
    focusTrend,
    screenTime,
    productiveTime
  ]);


  /* =========================================================
     APPLY RECOMMENDATION
  ========================================================= */

  const applyRecommendation = (
    recommendation
  ) => {

    const entry = {

      id:
        Date.now(),

      title:
        recommendation.title,

      status:
        "Applied",

      date:
        new Date().toLocaleDateString()

    };


    const updated = [

      entry,

      ...history

    ].slice(0, 10);


    setHistory(
      updated
    );


    localStorage.setItem(

      "fg_recommendation_history",

      JSON.stringify(
        updated
      )

    );

  };


  /* =========================================================
     DISMISS RECOMMENDATION
  ========================================================= */

  const dismissRecommendation = (
    recommendation
  ) => {

    const entry = {

      id:
        Date.now(),

      title:
        recommendation.title,

      status:
        "Dismissed",

      date:
        new Date().toLocaleDateString()

    };


    const updated = [

      entry,

      ...history

    ].slice(0, 10);


    setHistory(
      updated
    );


    localStorage.setItem(

      "fg_recommendation_history",

      JSON.stringify(
        updated
      )

    );

  };


  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = () => {

    fetchRecommendationData();

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="dashboard">

        <Sidebar
          navigate={navigate}
        />

        <main className="main">

          <div className="recommendation-page">

            <div className="recommendation-loading">

              <div className="loading-spinner"></div>

              <h3>
                Analyzing your focus behavior...
              </h3>

              <p>
                FocusGuard AI is preparing
                personalized recommendations.
              </p>

            </div>

          </div>

        </main>

      </div>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (

      <div className="dashboard">

        <Sidebar
          navigate={navigate}
        />

        <main className="main">

          <div className="recommendation-page">

            <div className="recommendation-error">

              <div className="error-icon">
                ⚠️
              </div>

              <h2>
                Unable to load recommendations
              </h2>

              <p>
                {error}
              </p>

              <button
                className="primary-button"
                onClick={handleRefresh}
              >
                ↻ Try Again
              </button>

            </div>

          </div>

        </main>

      </div>

    );

  }


  /* =========================================================
     MAIN UI
  ========================================================= */

  return (

    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <Sidebar
        navigate={navigate}
      />


      {/* ================= MAIN CONTENT ================= */}

      <main className="main">

        <div className="recommendation-page">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="recommendation-header">

            <div>

              <div className="eyebrow">
                AI ATTENTION INTELLIGENCE
              </div>

              <h1>
                AI Recommendations
              </h1>

              <p>
                Personalized strategies based on
                your focus behavior and digital
                activity.
              </p>

            </div>


            <button
              className="refresh-button"
              onClick={handleRefresh}
            >
              ↻ Refresh
            </button>

          </div>


          {/* ==================================================
              PERIOD
          ================================================== */}

          <section className="period-card">

            <div>

              <h2>
                Recommendation Period
              </h2>

              <p>
                Recommendations generated from{" "}

                <strong>

                  {period === "today"
                    ? "Today"
                    : period === "week"
                    ? "This Week"
                    : "This Month"}

                </strong>

              </p>

            </div>


            <div className="period-tabs">

              <button
                className={
                  period === "today"
                    ? "active"
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
                    ? "active"
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
                    ? "active"
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


          {/* ==================================================
              FOCUS PROFILE
          ================================================== */}

          <section className="profile-grid">


            {/* FOCUS SCORE */}

            <div className="profile-card">

              <span className="profile-label">
                Focus Score
              </span>

              <strong>

                {Math.round(
                  focusScore
                )}

                <small>
                  /100
                </small>

              </strong>

              <span className="profile-description">
                Overall concentration
              </span>

            </div>


            {/* BEST FOCUS WINDOW */}

            <div className="profile-card">

              <span className="profile-label">
                Best Focus Window
              </span>

              <strong className="profile-time">
                {bestFocusWindow.time}
              </strong>

              <span className="profile-description">

                Best observed score:{" "}

                {bestFocusWindow.score}/100

              </span>

            </div>


            {/* SWITCH RISK */}

            <div className="profile-card">

              <span className="profile-label">
                Switch Risk
              </span>

              <strong
                className={`risk-${switchRisk.toLowerCase()}`}
              >
                {switchRisk}
              </strong>

              <span className="profile-description">

                {totalSwitches}
                {" "}
                application switches

              </span>

            </div>


            {/* CONSISTENCY */}

            <div className="profile-card">

              <span className="profile-label">
                Consistency
              </span>

              <strong>
                {consistency}
              </strong>

              <span className="profile-description">
                Focus stability
              </span>

            </div>

          </section>


          {/* ==================================================
              TOP RECOMMENDATIONS
          ================================================== */}

          <section className="content-card">

            <div className="section-heading">

              <div>

                <span className="section-eyebrow">
                  PERSONALIZED ACTIONS
                </span>

                <h2>
                  ✨ Top Recommendations
                </h2>

                <p>
                  Based on your recent focus,
                  distraction and activity patterns.
                </p>

              </div>

              <span className="based-badge">
                Based on your data
              </span>

            </div>


            <div className="recommendation-list">

              {recommendations.length === 0 ? (

                <div className="empty-state">

                  <span>
                    🧠
                  </span>

                  <h3>
                    Not enough activity data yet
                  </h3>

                  <p>
                    Continue using FocusGuard AI
                    so personalized recommendations
                    can be generated.
                  </p>

                </div>

              ) : (

                recommendations.map(
                  (recommendation) => (

                    <div
                      className="recommendation-item"
                      key={recommendation.id}
                    >

                      <div className="recommendation-main">

                        <div className="recommendation-meta">

                          <span
                            className={`impact-badge ${
                              recommendation.impact
                                .toLowerCase()
                                .replace(
                                  " ",
                                  "-"
                                )
                            }`}
                          >
                            {recommendation.impact}
                          </span>

                          <span className="recommendation-type">
                            {recommendation.type}
                          </span>

                        </div>


                        <h3>
                          {recommendation.title}
                        </h3>


                        <p>
                          {recommendation.description}
                        </p>

                      </div>


                      <div className="recommendation-actions">

                        <button
                          className="apply-button"
                          onClick={() =>
                            applyRecommendation(
                              recommendation
                            )
                          }
                        >
                          Apply
                        </button>


                        <button
                          className="dismiss-button"
                          onClick={() =>
                            dismissRecommendation(
                              recommendation
                            )
                          }
                        >
                          ×
                        </button>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>


          {/* ==================================================
              ATTENTION LEAK
          ================================================== */}

          <section className="attention-leak-card">

            <div className="attention-leak-header">

              <div>

                <span className="section-eyebrow">
                  BEHAVIOR PATTERN
                </span>

                <h2>
                  🚨 Attention Leak Detected
                </h2>

              </div>

              <span className="warning-badge">

                {totalSwitches > 25
                  ? "High"
                  : "Monitor"}

              </span>

            </div>


            <div className="leak-content">

              <div className="leak-flow">


                <div className="app-node">

                  <span>
                    💻
                  </span>

                  <strong>
                    Productive App
                  </strong>

                </div>


                <div className="flow-arrow">
                  →
                </div>


                <div className="app-node distraction-node">

                  <span>
                    ⚠️
                  </span>

                  <strong>
                    {mainDistraction?.website ||
                      "Distraction"}
                  </strong>

                </div>


                <div className="flow-arrow">
                  →
                </div>


                <div className="app-node">

                  <span>
                    💻
                  </span>

                  <strong>
                    Productive App
                  </strong>

                </div>

              </div>


              <div className="leak-stats">

                <div>

                  <strong>
                    {totalSwitches}
                  </strong>

                  <span>
                    app switches
                  </span>

                </div>


                <div>

                  <strong>
                    {distractionCount}
                  </strong>

                  <span>
                    distraction events
                  </span>

                </div>


                <div>

                  <strong>

                    {formatMinutes(
                      nonProductiveTime
                    )}

                  </strong>

                  <span>
                    non-productive time
                  </span>

                </div>

              </div>

            </div>


            <div className="ai-advice">

              <span className="ai-icon">
                ✦
              </span>

              <div>

                <strong>
                  FocusGuard AI suggestion
                </strong>

                <p>
                  Complete one uninterrupted
                  task block before switching
                  to another application.
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              NEXT FOCUS SESSION
          ================================================== */}

          <section className="session-card">

            <div className="session-left">

              <span className="section-eyebrow">
                SMART FOCUS PLANNER
              </span>

              <h2>
                🎯 Your Next Focus Session
              </h2>

              <p>
                FocusGuard AI recommends a
                session based on your recent
                behavior.
              </p>

            </div>


            <div className="session-recommendation">

              <div className="session-value">

                {Math.max(

                  20,

                  Math.min(

                    recommendedSessionValue(
                      averageSession
                    ),

                    50

                  )

                )}

                {" "}

                <span>
                  min
                </span>

              </div>

              <span>
                Recommended duration
              </span>

            </div>


            <div className="session-recommendation">

              <div className="session-value">
                {bestFocusWindow.time}
              </div>

              <span>
                Recommended time
              </span>

            </div>


            <button
              className="start-session-button"
              onClick={() =>
                navigate("/focus-sessions")
              }
            >
              Start Focus Session →
            </button>

          </section>


          {/* ==================================================
              WHAT IF
          ================================================== */}

          <section className="what-if-card">

            <div className="what-if-header">

              <span className="section-eyebrow">
                PREDICTIVE INSIGHT
              </span>

              <h2>
                🔮 What-If Prediction
              </h2>

              <p>
                Estimate how reducing application
                switching could improve your focus.
              </p>

            </div>


            <div className="prediction-grid">


              <div className="prediction-box">

                <span>
                  Current
                </span>

                <strong>
                  {Math.round(
                    focusScore
                  )}
                </strong>

                <small>
                  Focus Score
                </small>

              </div>


              <div className="prediction-arrow">
                →
              </div>


              <div className="prediction-box predicted">

                <span>
                  Estimated
                </span>

                <strong>

                  {Math.min(

                    100,

                    Math.round(

                      focusScore +

                      Math.min(

                        15,

                        totalSwitches *
                          0.3

                      )

                    )

                  )}

                </strong>

                <small>
                  Focus Score
                </small>

              </div>

            </div>


            <div className="prediction-explanation">

              <strong>
                If you reduce app switching
                by 30%
              </strong>

              <p>

                Your estimated focus score
                could improve by approximately{" "}

                <b>

                  {Math.min(

                    15,

                    Math.round(
                      totalSwitches *
                        0.3
                    )

                  )}

                  {" "}
                  points

                </b>.

              </p>

              <small>
                *This is an estimated behavioral
                projection, not a guaranteed result.
              </small>

            </div>

          </section>


          {/* ==================================================
              RECOVERY
          ================================================== */}

          <section className="recovery-card">

            <div className="recovery-icon">
              🛌
            </div>


            <div className="recovery-content">

              <span>
                ATTENTION RECOVERY
              </span>

              <h2>
                Recovery Recommendation
              </h2>

              <p>

                {focusScore < 50

                  ? "Your current focus score is low. Consider a shorter session with a proper break before starting another demanding task."

                  : "Your focus is currently stable. Maintain your routine and take short breaks between intensive sessions."

                }

              </p>

            </div>


            <button
              className="apply-recovery"
              onClick={() =>
                applyRecommendation({

                  title:
                    "Take a structured recovery break"

                })
              }
            >
              Apply
            </button>

          </section>


          {/* ==================================================
              RECOMMENDATION EFFECTIVENESS
          ================================================== */}

          <section className="effectiveness-card">

            <div className="section-heading">

              <div>

                <span className="section-eyebrow">
                  FEEDBACK LOOP
                </span>

                <h2>
                  📈 Recommendation Effectiveness
                </h2>

                <p>
                  Track what you have applied and
                  review your focus behavior afterward.
                </p>

              </div>

            </div>


            <div className="effectiveness-grid">


              <div>

                <span>
                  Recommendations Applied
                </span>

                <strong>

                  {
                    history.filter(
                      (item) =>
                        item.status ===
                        "Applied"
                    ).length
                  }

                </strong>

              </div>


              <div>

                <span>
                  Dismissed
                </span>

                <strong>

                  {
                    history.filter(
                      (item) =>
                        item.status ===
                        "Dismissed"
                    ).length
                  }

                </strong>

              </div>


              <div>

                <span>
                  Current Focus Score
                </span>

                <strong>

                  {Math.round(
                    focusScore
                  )}
                  /100

                </strong>

              </div>

            </div>

          </section>


          {/* ==================================================
              HISTORY
          ================================================== */}

          <section className="history-card">

            <div className="section-heading">

              <div>

                <span className="section-eyebrow">
                  HISTORY
                </span>

                <h2>
                  🕐 Recommendation History
                </h2>

              </div>

            </div>


            {history.length === 0 ? (

              <div className="history-empty">

                No recommendations applied or
                dismissed yet.

              </div>

            ) : (

              <div className="history-list">

                {history.map(
                  (item) => (

                    <div
                      className="history-row"
                      key={item.id}
                    >

                      <div>

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {item.date}
                        </span>

                      </div>


                      <span
                        className={
                          item.status ===
                          "Applied"

                            ? "history-applied"

                            : "history-dismissed"
                        }
                      >

                        {item.status ===
                        "Applied"

                          ? "✓ Applied"

                          : "Dismissed"}

                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>


          {/* ==================================================
              WEEKLY DIGEST
          ================================================== */}

          <section className="weekly-digest">

            <div className="digest-icon">
              📊
            </div>


            <div>

              <span>
                WEEKLY AI DIGEST
              </span>

              <h2>
                Your Focus Improvement Plan
              </h2>


              <ol>

                <li>

                  Use{" "}

                  <strong>

                    {Math.max(

                      25,

                      Math.min(

                        45,

                        averageSession

                      )

                    )}

                    -minute

                  </strong>{" "}

                  focus sessions.

                </li>


                <li>
                  Reduce unnecessary
                  application switching.
                </li>


                <li>

                  Schedule demanding work during{" "}

                  <strong>
                    {bestFocusWindow.time}
                  </strong>.

                </li>

              </ol>

            </div>

          </section>


        </div>

      </main>

    </div>

  );

}


/* =========================================================
   SESSION VALUE HELPER
========================================================= */

function recommendedSessionValue(
  averageSession
) {

  if (!averageSession) {

    return 25;

  }


  if (averageSession <= 20) {

    return 25;

  }


  if (averageSession <= 30) {

    return 35;

  }


  if (averageSession <= 40) {

    return 40;

  }


  return 45;

}


export default AIRecommendations;