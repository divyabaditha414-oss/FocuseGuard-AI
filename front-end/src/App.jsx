import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FocusSessions from "./pages/FocusSessions";
import ActivityMonitor from "./pages/ActivityMonitor";
import DistractionAnalysis from "./pages/DistractionAnalysis";
import Analytics from "./pages/Analytics";
import AIRecommendations from "./pages/AIRecommendations";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ExploreMyData from "./pages/ExploreMyData";

import NotificationToast from "./components/NotificationToast";

function App() {

  return (

    <BrowserRouter>

      {/* =====================================
          GLOBAL NOTIFICATION MESSAGE
          Appears on ANY PAGE
      ===================================== */}

      <NotificationToast />


      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/focus-sessions"
          element={<FocusSessions />}
        />

        <Route
          path="/activity-monitor"
          element={<ActivityMonitor />}
        />

        <Route
          path="/distraction-analysis"
          element={
            <DistractionAnalysis />
          }
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/ai-recommendations"
          element={
            <AIRecommendations />
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
        <Route
  path="/explore-my-data"
  element={<ExploreMyData />}
/>

      </Routes>

    </BrowserRouter>

  );

}

export default App;