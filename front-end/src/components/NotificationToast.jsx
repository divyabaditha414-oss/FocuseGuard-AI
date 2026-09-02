import { useEffect, useRef, useState } from "react";
import "./NotificationToast.css";

function NotificationToast() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    const handleNotification = (event) => {
      const newNotification = event?.detail;

      if (!newNotification) return;

      console.log(
        "Notification received:",
        newNotification
      );

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setNotification(newNotification);
      setVisible(true);

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    window.addEventListener(
      "focusguard-notification",
      handleNotification
    );

    return () => {
      window.removeEventListener(
        "focusguard-notification",
        handleNotification
      );

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const closeToast = () => {
    setVisible(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  if (!notification || !visible) {
    return null;
  }

  return (
    <div className="fg-toast">

      <div className="fg-toast-icon">
        {notification.icon || "🔔"}
      </div>

      <div className="fg-toast-content">

        <strong>
          {notification.title}
        </strong>

        <p>
          {notification.message}
        </p>

      </div>

      {notification.sound && (
        <span className="fg-toast-sound">
          🔊
        </span>
      )}

      <button
        className="fg-toast-close"
        onClick={closeToast}
        type="button"
      >
        ×
      </button>

    </div>
  );
}

export default NotificationToast;