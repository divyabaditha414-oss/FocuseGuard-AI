import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
 const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  navigate("/");
};
  return (
    <div className="dashboard">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2>🧠 FocusGuard AI</h2>

        <ul>
          <li>🏠 Dashboard</li>
          <li>🎯 Focus Sessions</li>
          <li>📱 Activity Monitor</li>
          <li>⚠️ Distraction Analysis</li>
          <li>📊 Analytics</li>
          <li>🤖 AI Recommendations</li>
          <li>👤 Profile</li>
          <li>⚙️ Settings</li>
        </ul>

        <button className="logout-btn" onClick={handleLogout}>
            Logout
     </button>
      </aside>

      {/* Main Content */}
      <main className="main">

        <div className="header">
          <div>
            <h1>Welcome to FocusGuard AI 👋</h1>
            <p>Human Attention Preservation & Digital Distraction Intelligence</p>
          </div>

      
          <div className="profile">
            👤 User
          </div>
        </div>

        {/* Cards */}

        <div className="cards">

          <div className="card">
            <h3>🎯 Focus Score</h3>
            <h2>86%</h2>
            <p>Today's AI Focus Score</p>
          </div>

          <div className="card">
            <h3>📱 Screen Time</h3>
            <h2>5h 10m</h2>
            <p>Total Device Usage</p>
          </div>

          <div className="card">
            <h3>⚠️ Distractions</h3>
            <h2>14</h2>
            <p>Interruptions Detected</p>
          </div>

          <div className="card">
            <h3>🔄 Task Switches</h3>
            <h2>21</h2>
            <p>Context Switching</p>
          </div>

        </div>

        {/* AI Insights */}

        <div className="recent">

          <h2>🤖 AI Insights</h2>

          <ul>
            <li>✅ Your highest focus period was 9:00 AM – 11:00 AM.</li>
            <li>⚠️ Social media caused most distractions today.</li>
            <li>📵 AI recommends a 15-minute Focus Session.</li>
            <li>🎯 Productivity increased compared to yesterday.</li>
          </ul>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;