import { createNotification } from "./notificationSettings";


// =====================================================
// ALL NOTIFICATION DEFINITIONS
// =====================================================

export const NOTIFICATION_MESSAGES = {

  // ===================================================
  // SESSION LIFECYCLE
  // ===================================================

  sessionStarted: {
    icon: "🟢",
    title: "Focus session started",
    message:
      "Your focus session has started. Stay focused and make this session count.",
    sound: true,
  },

  sessionPaused: {
    icon: "⏸️",
    title: "Focus session paused",
    message:
      "Your focus session is paused. Resume when you're ready to continue.",
    sound: false,
  },

  sessionResumed: {
    icon: "▶️",
    title: "Focus session resumed",
    message:
      "You're back in focus mode. Keep going!",
    sound: false,
  },

  sessionCompleted: {
    icon: "🎯",
    title: "Focus session completed",
    message:
      "Great work! You completed your focus session.",
    sound: true,
  },

  sessionEndedEarly: {
    icon: "🛑",
    title: "Focus session ended early",
    message:
      "Your session ended before reaching the target. Every minute of focused work counts.",
    sound: true,
  },


  // ===================================================
  // BREAK EVENTS
  // ===================================================

  breakStarted: {
    icon: "☕",
    title: "Break started",
    message:
      "Your break has started. Step away from the screen and recharge.",
    sound: true,
  },

  breakEndingSoon: {
    icon: "⏰",
    title: "Break ending soon",
    message:
      "Your break ends in 30 seconds. Get ready to return to focus.",
    sound: true,
  },

  breakOver: {
    icon: "🚀",
    title: "Break is over",
    message:
      "Your break is complete. Time to get back into focus.",
    sound: true,
  },


  // ===================================================
  // DISTRACTION / ACTIVITY
  // ===================================================

  distractionDetected: {
    icon: "⚠️",
    title: "Distraction detected",
    message:
      "You switched to a non-productive activity during your focus session.",
    sound: true,
  },

  returnedToFocus: {
    icon: "🎯",
    title: "Back to focus",
    message:
      "Nice recovery! You're back on a productive activity.",
    sound: false,
  },

  repeatedDistraction: {
    icon: "🚨",
    title: "Repeated distraction",
    message:
      "You've switched to the same distracting activity multiple times. Consider returning to your focus task.",
    sound: true,
  },


  // ===================================================
  // GOALS / TARGETS
  // ===================================================

  targetReached: {
    icon: "🏆",
    title: "Session target reached",
    message:
      "You've reached your focus target. Excellent work!",
    sound: true,
  },

  dailyGoal: {
    icon: "🌟",
    title: "Daily focus goal achieved",
    message:
      "You've achieved your daily focus goal. Keep the momentum going!",
    sound: true,
  },

  weeklyGoal: {
    icon: "🏆",
    title: "Weekly focus goal achieved",
    message:
      "Amazing! You've achieved your weekly focus goal.",
    sound: true,
  },

  fallingBehind: {
    icon: "📈",
    title: "Weekly goal progress",
    message:
      "You're currently behind your weekly focus target. A short focus session can help you catch up.",
    sound: false,
  },


  // ===================================================
  // STREAK
  // ===================================================

  streakMaintained: {
    icon: "🔥",
    title: "Daily streak maintained",
    message:
      "Great job! You've maintained your focus streak today.",
    sound: false,
  },

  streakAtRisk: {
    icon: "⚡",
    title: "Your streak is at risk",
    message:
      "You haven't completed a focus session today. Complete one to keep your streak alive.",
    sound: true,
  },

  personalBestStreak: {
    icon: "🏅",
    title: "New personal best streak",
    message:
      "Amazing! You've reached a new personal best focus streak.",
    sound: true,
  },


  // ===================================================
  // AI RECOMMENDATIONS
  // ===================================================

  newRecommendation: {
    icon: "✨",
    title: "New AI recommendation",
    message:
      "FocusGuard AI has a new recommendation based on your recent activity.",
    sound: false,
  },

  weeklyDigest: {
    icon: "📊",
    title: "Weekly digest is ready",
    message:
      "Your weekly FocusGuard summary is ready. See what improved and what you can work on next.",
    sound: false,
  },

  recommendationFollowUp: {
    icon: "💡",
    title: "Recommendation follow-up",
    message:
      "It's been a few days since you tried your focus strategy. Check how it affected your productivity.",
    sound: false,
  },


  // ===================================================
  // RECOVERY / WELLBEING
  // ===================================================

  recoverySuggestion: {
    icon: "🌿",
    title: "Recovery day suggested",
    message:
      "Your focus scores have been declining. Consider a lighter day and give your attention some time to recover.",
    sound: true,
  },

  recommendedBreak: {
    icon: "☕",
    title: "A break is recommended",
    message:
      "You've been working continuously for a long period. Take a short break to recharge your attention.",
    sound: true,
  },


  // ===================================================
  // MILESTONES
  // ===================================================

  deepFocusMilestone: {
    icon: "🧠",
    title: "Deep focus milestone",
    message:
      "You've maintained uninterrupted focus for another milestone. Keep going!",
    sound: false,
  },

  bestSession: {
    icon: "🏆",
    title: "Best session ever",
    message:
      "Amazing! You just completed your strongest focus session so far.",
    sound: true,
  },

  bestWeek: {
    icon: "🌟",
    title: "Best week ever",
    message:
      "Congratulations! This is your best FocusGuard week so far.",
    sound: true,
  },

};


// =====================================================
// NOTIFICATION TRIGGER FUNCTION
// =====================================================

export function notify(
  type,
  customMessage = null
) {

  const notification =
    NOTIFICATION_MESSAGES[type];


  if (!notification) {

    console.error(
      "Unknown notification type:",
      type
    );

    return null;
  }


  return createNotification({

    type,

    title:
      notification.title,

    message:
      customMessage ||
      notification.message,

    icon:
      notification.icon,

    sound:
      notification.sound,

  });
}