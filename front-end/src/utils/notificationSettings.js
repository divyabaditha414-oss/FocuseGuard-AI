const NOTIFICATION_KEY =
  "focusguard_notifications";

const SETTINGS_KEY =
  "focusguard_notification_settings";


// =====================================================
// DEFAULT SETTINGS
// =====================================================

export const DEFAULT_NOTIFICATION_SETTINGS = {

  master: true,
  sound: true,

  sessionStarted: true,
  sessionPaused: true,
  sessionResumed: true,
  sessionCompleted: true,
  sessionEndedEarly: true,

  breakStarted: true,
  breakEndingSoon: true,
  breakOver: true,

  distractionDetected: true,
  returnedToFocus: true,
  repeatedDistraction: true,

  targetReached: true,
  dailyGoal: true,
  weeklyGoal: true,
  fallingBehind: true,

  streakMaintained: true,
  streakAtRisk: true,
  personalBestStreak: true,

  newRecommendation: true,
  weeklyDigest: true,
  recommendationFollowUp: true,

  recoverySuggestion: true,
  recommendedBreak: true,

  deepFocusMilestone: true,
  bestSession: true,
  bestWeek: true,
};


// =====================================================
// GET SETTINGS
// =====================================================

export function getNotificationSettings() {
  try {
    const saved =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!saved) {
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
      };
    }

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...JSON.parse(saved),
    };

  } catch (error) {
    console.error(
      "Notification settings error:",
      error
    );

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
    };
  }
}


// =====================================================
// SAVE SETTINGS
// =====================================================

export function saveNotificationSettings(
  settings
) {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

  window.dispatchEvent(
    new Event(
      "focusguard-settings-changed"
    )
  );
}


// =====================================================
// GET NOTIFICATIONS
// =====================================================

export function getNotifications() {
  try {
    const data =
      localStorage.getItem(
        NOTIFICATION_KEY
      );

    if (!data) {
      return [];
    }

    return JSON.parse(data);

  } catch (error) {
    console.error(
      "Notification read error:",
      error
    );

    return [];
  }
}


// =====================================================
// CREATE NOTIFICATION
// =====================================================

export function createNotification({
  type,
  title,
  message,
  icon = "🔔",
  sound = false,
}) {

  const settings =
    getNotificationSettings();


  // MASTER SWITCH
  if (!settings.master) {
    console.log(
      "Notifications disabled"
    );

    return null;
  }


  // INDIVIDUAL NOTIFICATION SWITCH
  if (
    type &&
    settings[type] === false
  ) {
    console.log(
      `${type} notification disabled`
    );

    return null;
  }


  const shouldPlaySound =
    sound === true &&
    settings.sound === true;


  const notification = {
    id:
      Date.now() +
      Math.random(),

    type,

    title,

    message,

    icon,

    sound:
      shouldPlaySound,

    read: false,

    createdAt:
      new Date().toISOString(),
  };


  // SAVE
  const existing =
    getNotifications();

  const updated = [
    notification,
    ...existing,
  ].slice(0, 50);

  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify(updated)
  );


  console.log(
    "NOTIFICATION CREATED:",
    notification
  );


  // =================================================
  // SOUND
  // =================================================

  if (shouldPlaySound) {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioContext) {

        const context =
          new AudioContext();


        if (
          context.state ===
          "suspended"
        ) {
          context.resume();
        }


        const oscillator =
          context.createOscillator();

        const gain =
          context.createGain();


        oscillator.connect(
          gain
        );

        gain.connect(
          context.destination
        );


        oscillator.type =
          "sine";


        oscillator.frequency.setValueAtTime(
          880,
          context.currentTime
        );

        oscillator.frequency.setValueAtTime(
          660,
          context.currentTime + 0.12
        );


        gain.gain.setValueAtTime(
          0.0001,
          context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
          0.15,
          context.currentTime + 0.02
        );


        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + 0.4
        );


        oscillator.start();

        oscillator.stop(
          context.currentTime + 0.4
        );


        console.log(
          "🔊 Notification sound played"
        );
      }

    } catch (error) {

      console.error(
        "Notification sound error:",
        error
      );
    }
  }


  // =================================================
  // TELL OTHER COMPONENTS
  // =================================================

  window.dispatchEvent(
    new CustomEvent(
      "focusguard-notification",
      {
        detail:
          notification,
      }
    )
  );


  return notification;
}


// =====================================================
// MARK NOTIFICATIONS READ
// =====================================================

export function markNotificationsRead() {

  const notifications =
    getNotifications();

  const updated =
    notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

  localStorage.setItem(
    NOTIFICATION_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new Event(
      "focusguard-notification"
    )
  );
}


// =====================================================
// CLEAR NOTIFICATIONS
// =====================================================

export function clearNotifications() {

  localStorage.removeItem(
    NOTIFICATION_KEY
  );

  window.dispatchEvent(
    new Event(
      "focusguard-notification"
    )
  );
}
