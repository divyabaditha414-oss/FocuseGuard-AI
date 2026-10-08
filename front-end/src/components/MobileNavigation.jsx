import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Home,
  Target,
  Activity,
  BarChart3,
  User,
  AlertTriangle,
  Brain,
  Settings,
  LogOut,
} from "lucide-react";

import Notification from "./Notification";

import "./MobileNavigation.css";


/* =====================================================
   PRIMARY MOBILE NAVIGATION
===================================================== */

const primaryNavigation = [
  {
    name: "Home",
    path: "/dashboard",
    icon: Home,
  },
  {
    name: "Focus",
    path: "/focus-sessions",
    icon: Target,
  },
  {
    name: "Activity",
    path: "/activity-monitor",
    icon: Activity,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Profile",
    path: "/profile",
    icon: User,
  },
];


/* =====================================================
   SECONDARY MOBILE NAVIGATION
===================================================== */

const secondaryNavigation = [
  {
    name: "Distraction Analysis",
    path: "/distraction-analysis",
    icon: AlertTriangle,
  },
  {
    name: "AI Recommendations",
    path: "/ai-recommendations",
    icon: Brain,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

export default function MobileNavigation() {

  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();


  /* =====================================================
     CLOSE DRAWER
  ===================================================== */

  const closeMenu = () => {
    setMenuOpen(false);
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    setMenuOpen(false);

    navigate("/");
  };


  return (
    <>
      {/* =================================================
          MOBILE TOP HEADER
      ================================================= */}

      <header className="mobile-header">

        {/* -----------------------------------------------
            LEFT - MENU BUTTON
        ----------------------------------------------- */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>


        {/* -----------------------------------------------
            CENTER - BRAND
        ----------------------------------------------- */}

        <NavLink
          to="/dashboard"
          className="mobile-brand"
          onClick={closeMenu}
        >

          <div className="mobile-brand-icon">
            🧠
          </div>

          <div className="mobile-brand-text">

            <div className="mobile-brand-name">
              FocusGuard AI
            </div>

            <div className="mobile-brand-subtitle">
              Attention Intelligence
            </div>

          </div>

        </NavLink>


        {/* -----------------------------------------------
            RIGHT - NOTIFICATION + PROFILE
        ----------------------------------------------- */}

        <div className="mobile-header-actions">

          {/* EXISTING NOTIFICATION COMPONENT */}

          <Notification />


          {/* PROFILE */}

          <NavLink
            to="/profile"
            className="mobile-header-profile"
            onClick={closeMenu}
            aria-label="Profile"
          >
            <User size={19} />
          </NavLink>

        </div>

      </header>


      {/* =================================================
          DARK OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}


      {/* =================================================
          SIDE DRAWER
      ================================================= */}

      <aside
        className={`mobile-drawer ${
          menuOpen ? "mobile-drawer-open" : ""
        }`}
      >

        {/* -----------------------------------------------
            DRAWER HEADER
        ----------------------------------------------- */}

        <div className="mobile-drawer-header">

          <div className="mobile-drawer-brand">

            <div className="mobile-drawer-logo">
              🧠
            </div>

            <div className="mobile-drawer-brand-text">

              <strong>
                FocusGuard AI
              </strong>

              <span>
                Attention Intelligence
              </span>

            </div>

          </div>


          {/* CLOSE BUTTON */}

          <button
            type="button"
            className="mobile-close-button"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={23} />
          </button>

        </div>


        {/* -----------------------------------------------
            DRAWER CONTENT
        ----------------------------------------------- */}

        <div className="mobile-drawer-content">

          {/* MAIN */}

          <div className="mobile-menu-title">
            MAIN
          </div>


          {primaryNavigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `mobile-drawer-link ${
                    isActive ? "active" : ""
                  }`
                }
              >

                <Icon size={21} />

                <span>
                  {item.name}
                </span>

              </NavLink>
            );

          })}


          {/* INTELLIGENCE */}

          <div className="mobile-menu-title">
            INTELLIGENCE
          </div>


          {secondaryNavigation
            .filter(
              (item) =>
                item.name !== "Settings"
            )
            .map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `mobile-drawer-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >

                  <Icon size={21} />

                  <span>
                    {item.name}
                  </span>

                </NavLink>
              );

            })}


          {/* ACCOUNT */}

          <div className="mobile-menu-title">
            ACCOUNT
          </div>


          {/* SETTINGS */}

          <NavLink
            to="/settings"
            onClick={closeMenu}
            className={({ isActive }) =>
              `mobile-drawer-link ${
                isActive ? "active" : ""
              }`
            }
          >

            <Settings size={21} />

            <span>
              Settings
            </span>

          </NavLink>


          {/* LOGOUT */}

          <button
            type="button"
            className="mobile-logout"
            onClick={handleLogout}
          >

            <LogOut size={21} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =================================================
          FIXED BOTTOM NAVIGATION
      ================================================= */}

      <nav className="mobile-bottom-navigation">

        {primaryNavigation.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `mobile-bottom-link ${
                  isActive ? "active" : ""
                }`
              }
            >

              {({ isActive }) => (
                <>
                  <div className="mobile-bottom-icon">

                    <Icon
                      size={21}
                      strokeWidth={
                        isActive ? 2.5 : 2
                      }
                    />

                  </div>

                  <span>
                    {item.name}
                  </span>

                </>
              )}

            </NavLink>
          );

        })}

      </nav>

    </>
  );
}