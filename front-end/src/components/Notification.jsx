import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationsRead,
  clearNotifications,
} from "../utils/notificationSettings";
import "./Notification.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  // ============================================
  // LOAD NOTIFICATIONS
  // ============================================

  const loadNotifications = () => {
    const saved = getNotifications();

    setNotifications(
      Array.isArray(saved) ? saved : []
    );
  };

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    loadNotifications();

    const handleNewNotification = (event) => {
      // If a new notification was created,
      // reload the list.
      if (event?.detail) {
        loadNotifications();
      }
    };

    window.addEventListener(
      "focusguard-notification",
      handleNewNotification
    );

    return () => {
      window.removeEventListener(
        "focusguard-notification",
        handleNewNotification
      );
    };
  }, []);

  // ============================================
  // UNREAD COUNT
  // ============================================

  const unreadCount = notifications.filter(
    (notification) =>
      notification.read !== true
  ).length;

  // ============================================
  // OPEN NOTIFICATION PANEL
  // ============================================

  const handleOpen = () => {
    // ------------------------------------------
    // CLOSE
    // ------------------------------------------

    if (showPanel) {
      setShowPanel(false);
      return;
    }

    // ------------------------------------------
    // OPEN
    // ------------------------------------------

    setShowPanel(true);

    // ------------------------------------------
    // MARK ALL AS READ
    // ------------------------------------------

    if (unreadCount > 0) {
      // Update React state FIRST.
      // This guarantees the badge disappears.
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      // Then save read=true to localStorage.
      markNotificationsRead();
    }
  };

  // ============================================
  // CLEAR NOTIFICATIONS
  // ============================================

  const handleClear = () => {
    clearNotifications();

    setNotifications([]);

    setShowPanel(true);
  };

  // ============================================
  // TIME
  // ============================================

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <div className="notification-container">

      {/* ========================================
          BELL
      ======================================== */}

      <button
        type="button"
        className="notification-bell"
        onClick={handleOpen}
        aria-label="Notifications"
      >

        <span className="notification-bell-icon">
          🔔
        </span>

        {/* --------------------------------------
            IMPORTANT

            Badge exists ONLY when unreadCount
            is greater than zero.
        -------------------------------------- */}

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}

      </button>


      {/* ========================================
          PANEL
      ======================================== */}

      {showPanel && (
        <div className="notification-panel">

          {/* HEADER */}

          <div className="notification-panel-header">

            <div>
              <h3>
                Notifications
              </h3>

              <span>
                Your FocusGuard activity
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >

              {notifications.length > 0 && (
                <button
                  type="button"
                  className="notification-clear"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setShowPanel(false)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "20px",
                  color: "#8a99aa",
                  cursor: "pointer",
                }}
              >
                ×
              </button>

            </div>

          </div>


          {/* NOTIFICATION LIST */}

          <div className="notification-list">

            {notifications.length === 0 ? (

              <div className="notification-empty">

                <div className="notification-empty-icon">
                  🔔
                </div>

                <strong>
                  No notifications
                </strong>

                <p>
                  Your focus and activity
                  alerts will appear here.
                </p>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={
                      notification.read === true
                        ? "notification-item"
                        : "notification-item unread"
                    }
                  >

                    {/* ICON */}

                    <div className="notification-item-icon">
                      {notification.icon || "🔔"}
                    </div>


                    {/* CONTENT */}

                    <div className="notification-item-content">

                      <strong>
                        {notification.title ||
                          "Notification"}
                      </strong>

                      <p>
                        {notification.message || ""}
                      </p>

                      <small>
                        {formatDate(
                          notification.createdAt
                        )}

                        {" • "}

                        {formatTime(
                          notification.createdAt
                        )}
                      </small>

                    </div>


                    {/* SOUND */}

                    {notification.sound === true && (
                      <span className="notification-sound">
                        🔊
                      </span>
                    )}

                  </div>

                )
              )

            )}

          </div>


          {/* FOOTER */}

          <div className="notification-panel-footer">
            🔔 Manage notification preferences
            in Settings
          </div>

        </div>
      )}

    </div>
  );
}

export default Notification;