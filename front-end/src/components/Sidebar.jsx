import { useNavigate, useLocation } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">

      <h2>🧠 FocusGuard AI</h2>

      <ul>

        <li
          className={location.pathname === "/dashboard" ? "active" : ""}
          onClick={() => navigate("/dashboard")}
        >
          🏠 Dashboard
        </li>

        <li
          className={location.pathname === "/focus-sessions" ? "active" : ""}
          onClick={() => navigate("/focus-sessions")}
        >
          🎯 Focus Sessions
        </li>

        <li
          className={location.pathname === "/activity-monitor" ? "active" : ""}
          onClick={() => navigate("/activity-monitor")}
        >
          📱 Activity Monitor
        </li>

        <li
          className={
            location.pathname === "/distraction-analysis"
              ? "active"
              : ""
          }
          onClick={() => navigate("/distraction-analysis")}
        >
          ⚠️ Distraction Analysis
        </li>

        <li
          className={location.pathname === "/analytics" ? "active" : ""}
          onClick={() => navigate("/analytics")}
        >
          📊 Analytics
        </li>

        <li
          className={
            location.pathname === "/ai-recommendations"
              ? "active"
              : ""
          }
          onClick={() => navigate("/ai-recommendations")}
        >
          🤖 AI Recommendations
        </li>

        <li
          className={location.pathname === "/profile" ? "active" : ""}
          onClick={() => navigate("/profile")}
        >
          👤 Profile
        </li>

        <li
          className={location.pathname === "/settings" ? "active" : ""}
          onClick={() => navigate("/settings")}
        >
          ⚙️ Settings
        </li>

      </ul>
      <button
  className="logout-btn"
  onClick={() => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");
    navigate("/");
  }}
>
  Logout
</button>

    </aside>
  );
}

export default Sidebar;