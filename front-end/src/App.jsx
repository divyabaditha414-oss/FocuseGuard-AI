import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/login";
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
import MobileNavigation from "./components/MobileNavigation";


function App() {
  return (
    <BrowserRouter>

      {/* Global notification */}
      <NotificationToast />

      <Routes>

        {/* =========================
            PUBLIC PAGES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            APP PAGES
            MobileNavigation appears
            only on logged-in pages
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <>
              <MobileNavigation />
              <Dashboard />
            </>
          }
        />

        <Route
          path="/focus-sessions"
          element={
            <>
              <MobileNavigation />
              <FocusSessions />
            </>
          }
        />

        <Route
          path="/activity-monitor"
          element={
            <>
              <MobileNavigation />
              <ActivityMonitor />
            </>
          }
        />

        <Route
          path="/distraction-analysis"
          element={
            <>
              <MobileNavigation />
              <DistractionAnalysis />
            </>
          }
        />

        <Route
          path="/analytics"
          element={
            <>
              <MobileNavigation />
              <Analytics />
            </>
          }
        />

        <Route
          path="/ai-recommendations"
          element={
            <>
              <MobileNavigation />
              <AIRecommendations />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <MobileNavigation />
              <Profile />
            </>
          }
        />

        <Route
          path="/settings"
          element={
            <>
              <MobileNavigation />
              <Settings />
            </>
          }
        />

        <Route
          path="/explore-my-data"
          element={
            <>
              <MobileNavigation />
              <ExploreMyData />
            </>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;