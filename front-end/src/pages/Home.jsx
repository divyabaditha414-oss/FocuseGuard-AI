import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// ─── React Icons ─────────────────────────────────────────────────────────────
import {
  FaBrain,
  FaChartLine,
  FaClock,
  FaRandom,
  FaExclamationTriangle,
  FaLightbulb,
  FaBolt,
  FaRobot,
  FaShieldAlt,
  FaEye,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { MdAutoGraph, MdSpeed } from "react-icons/md";

// ─── Demo data for charts (no backend calls) ─────────────────────────────────
const DEMO_BAR_HEIGHTS = [38, 52, 44, 68, 82, 57, 75]; // % heights, Mon–Sun
const DEMO_APPS = [
  { name: "GitHub",    pct: 78, type: "p" },
  { name: "YouTube",  pct: 55, type: "n" },
  { name: "ChatGPT",  pct: 70, type: "p" },
  { name: "Instagram",pct: 42, type: "n" },
  { name: "VS Code",  pct: 85, type: "p" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onNav }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="fg-nav">
        {/* Brand */}
        <div className="fg-nav-brand" onClick={() => { onNav("top"); close(); }}>
          <div className="fg-nav-brand-icon">🧠</div>
          <div className="fg-nav-brand-text">
            <span className="fg-nav-brand-name">FocusGuard AI</span>
            <span className="fg-nav-brand-sub">Attention Intelligence</span>
          </div>
        </div>

        {/* Desktop links */}
        <ul className="fg-nav-links">
          <li><button onClick={() => { onNav("top"); close(); }}>Home</button></li>
          <li><button onClick={() => { onNav("features"); close(); }}>Features</button></li>
          <li><button onClick={() => { onNav("how-it-works"); close(); }}>How It Works</button></li>
          <li><button onClick={() => { onNav("about"); close(); }}>About</button></li>
        </ul>

        {/* Desktop actions */}
        <div className="fg-nav-actions">
          <button className="fg-nav-signin" onClick={() => navigate("/login")}>
            Sign In
          </button>
          <button className="fg-nav-getstarted" onClick={() => navigate("/register")}>
            Get Started
          </button>
        </div>

        {/* Hamburger */}
        <button
          className={`fg-nav-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`fg-nav-mobile${menuOpen ? " open" : ""}`}>
        <button onClick={() => { onNav("top"); close(); }}>Home</button>
        <button onClick={() => { onNav("features"); close(); }}>Features</button>
        <button onClick={() => { onNav("how-it-works"); close(); }}>How It Works</button>
        <button onClick={() => { onNav("about"); close(); }}>About</button>
        <div className="fg-nav-mobile-divider" />
        <button className="fg-nav-mobile-signin" onClick={() => { navigate("/login"); close(); }}>
          Sign In
        </button>
        <button className="fg-nav-mobile-getstarted" onClick={() => { navigate("/register"); close(); }}>
          Get Started
        </button>
      </div>
    </>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();

  return (
    <section className="fg-hero" id="top">
      <div className="fg-hero-inner">
        {/* Left */}
        <div className="fg-hero-left">
          <div className="fg-hero-badge">
            <span className="fg-hero-badge-dot" />
            AI-Powered Attention Intelligence
          </div>

          <h1 className="fg-hero-heading">
            Take Control of Your <span>Attention</span>
          </h1>

          <p className="fg-hero-sub">
            FocusGuard AI analyzes your digital behavior to detect attention
            leaks, understand productivity patterns, and help you build better
            focus habits.
          </p>

          <div className="fg-hero-actions">
            <button className="fg-btn-primary" onClick={() => navigate("/register")}>
              Get Started <span style={{ fontSize: 12 }}>→</span>
            </button>
            <button className="fg-btn-secondary" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>

          <div className="fg-hero-highlights">
            <span className="fg-highlight">
              <span className="fg-highlight-dot" />
              AI-Powered Insights
            </span>
            <span className="fg-highlight">
              <span className="fg-highlight-dot" />
              Real-Time Activity Tracking
            </span>
            <span className="fg-highlight">
              <span className="fg-highlight-dot" />
              Personalized Focus Analytics
            </span>
          </div>
        </div>

        {/* Right — demo analytics panel */}
        <div className="fg-hero-right">
          <div className="fg-hero-panel">
            {/* SVG gradient definition */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            <div className="fg-hero-panel-header">
              <span className="fg-hero-panel-title">Focus Overview</span>
              <span className="fg-hero-panel-badge">● Live Demo</span>
            </div>

            {/* Focus score ring + progress bars */}
            <div className="fg-score-row">
              <div className="fg-score-ring-wrap">
                <svg className="fg-score-ring-svg" viewBox="0 0 80 80">
                  <circle className="fg-score-ring-bg" cx="40" cy="40" r="34" />
                  <circle className="fg-score-ring-fill" cx="40" cy="40" r="34" />
                </svg>
                <div className="fg-score-ring-text">
                  82%<small>Focus</small>
                </div>
              </div>

              <div className="fg-score-details">
                <div className="fg-score-bar-row">
                  <div className="fg-score-bar-label">
                    <span>Productive</span><span>72%</span>
                  </div>
                  <div className="fg-score-bar-track">
                    <div className="fg-score-bar-fill" style={{ width: "72%" }} />
                  </div>
                </div>
                <div className="fg-score-bar-row">
                  <div className="fg-score-bar-label">
                    <span>Distracted</span><span>18%</span>
                  </div>
                  <div className="fg-score-bar-track">
                    <div className="fg-score-bar-fill amber" style={{ width: "18%" }} />
                  </div>
                </div>
                <div className="fg-score-bar-row">
                  <div className="fg-score-bar-label">
                    <span>Idle</span><span>10%</span>
                  </div>
                  <div className="fg-score-bar-track">
                    <div className="fg-score-bar-fill red" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* KPI mini-cards */}
            <div className="fg-hero-metrics" style={{ marginTop: 16 }}>
              <div className="fg-hero-metric">
                <div className="fg-hero-metric-label">Focus Score</div>
                <div className="fg-hero-metric-value fg-metric-blue">82%</div>
              </div>
              <div className="fg-hero-metric">
                <div className="fg-hero-metric-label">Focus Time</div>
                <div className="fg-hero-metric-value fg-metric-cyan">4h 32m</div>
              </div>
              <div className="fg-hero-metric">
                <div className="fg-hero-metric-label">Distractions</div>
                <div className="fg-hero-metric-value fg-metric-red">12</div>
              </div>
              <div className="fg-hero-metric">
                <div className="fg-hero-metric-label">Task Switches</div>
                <div className="fg-hero-metric-value fg-metric-amber">18</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Problem Section ─────────────────────────────────────────────────────────
function ProblemSection() {
  return (
    <section style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="fg-section">
        <div className="fg-section-center">
          <span className="fg-section-eyebrow">The Problem</span>
          <h2 className="fg-section-heading">
            Your Screen Time Doesn't Tell the Whole Story
          </h2>
          <p className="fg-section-desc">
            Knowing how long you use your device is only part of the picture.
            FocusGuard AI looks deeper into your digital behavior to understand
            how your attention is actually being used.
          </p>
        </div>

        <div className="fg-problem-grid">
          {[
            { icon: "📱", title: "App & Website Usage", desc: "Track the applications and websites that consume your attention without you realizing." },
            { icon: "🔄", title: "Task Switching", desc: "Understand how frequently you switch between tasks and applications — and what it costs." },
            { icon: "🚨", title: "Attention Leaks", desc: "Identify the patterns and triggers that interrupt your focus and derail deep work." },
            { icon: "📊", title: "Productivity Behavior", desc: "Understand which activities are productive versus non-productive in your digital routine." },
          ].map((c) => (
            <div className="fg-problem-card" key={c.title}>
              <div className="fg-problem-icon">{c.icon}</div>
              <div className="fg-problem-title">{c.title}</div>
              <div className="fg-problem-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🔍", color: "",        title: "Attention Leak Detection",    desc: "Identify patterns that interrupt your concentration before they become habits." },
  { icon: "🎯", color: "cyan",    title: "Focus Score",                 desc: "Understand your focus level through clear, meaningful analytics updated in real time." },
  { icon: "⏱️", color: "purple",  title: "Screen Time Analytics",       desc: "See exactly how your digital time is distributed across productive and non-productive activities." },
  { icon: "🔀", color: "amber",   title: "Task Switch Analysis",        desc: "Track how frequently you switch between applications and tasks — and the hidden cognitive cost." },
  { icon: "⚠️", color: "red",     title: "Distraction Detection",       desc: "Identify distracting applications and websites consuming your attention and time." },
  { icon: "🎯", color: "green",   title: "Focus Sessions",              desc: "Start and track dedicated periods of deep, uninterrupted focused work." },
  { icon: "📈", color: "pink",    title: "Productivity Insights",       desc: "Understand productive and non-productive activity patterns across your digital day." },
  { icon: "🤖", color: "",        title: "AI-Powered Recommendations",  desc: "Receive intelligent, personalized suggestions based on your real attention and focus patterns." },
];

function FeaturesSection() {
  return (
    <section id="features">
      <div className="fg-section">
        <div className="fg-section-center">
          <span className="fg-section-eyebrow">Features</span>
          <h2 className="fg-section-heading">Everything You Need to Stay Focused</h2>
          <p className="fg-section-desc">
            A complete attention intelligence platform designed to give you
            clear insight into your digital behavior.
          </p>
        </div>

        <div className="fg-features-grid">
          {FEATURES.map((f) => (
            <div className="fg-feature-card" key={f.title}>
              <div className={`fg-feature-icon${f.color ? " " + f.color : ""}`}>{f.icon}</div>
              <div className="fg-feature-title">{f.title}</div>
              <div className="fg-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="fg-section">
        <div className="fg-section-center">
          <span className="fg-section-eyebrow">How It Works</span>
          <h2 className="fg-section-heading">How FocusGuard AI Works</h2>
          <p className="fg-section-desc">
            Three simple steps from tracking to building better focus habits.
          </p>
        </div>

        <div className="fg-steps">
          {[
            { num: "01", title: "Track",   desc: "FocusGuard AI observes your application and website activity to build a clear picture of your digital behavior." },
            { num: "02", title: "Analyze", desc: "AI analyzes switching patterns, distractions, productivity, and focus behavior to surface meaningful insights." },
            { num: "03", title: "Improve", desc: "Use actionable, personalized insights to build better focus habits and reclaim your attention." },
          ].map((s) => (
            <div className="fg-step" key={s.num}>
              <div className="fg-step-num">{s.num}</div>
              <div className="fg-step-title">{s.title}</div>
              <div className="fg-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AI Analytics Section ─────────────────────────────────────────────────────
function AnalyticsSection() {
  const navigate = useNavigate();

  return (
    <section>
      <div className="fg-section">
        <div className="fg-analytics-inner">
          {/* Left */}
          <div className="fg-analytics-left">
            <span className="fg-section-eyebrow">Intelligence</span>
            <h2 className="fg-analytics-heading">
              Understand Your Attention.<br />
              <span>Improve Your Focus.</span>
            </h2>
            <p className="fg-analytics-desc">
              FocusGuard AI goes beyond screen time. It identifies when, where,
              and how your attention is being lost — and gives you the insights
              to take it back.
            </p>

            <div className="fg-analytics-points">
              {[
                { icon: "🔍", title: "Behavioral Analysis",       desc: "Deep analysis of your actual digital behavior patterns." },
                { icon: "🚨", title: "Attention Leak Detection",   desc: "Pinpoint the exact moments your concentration breaks." },
                { icon: "📊", title: "Productivity Tracking",      desc: "Separate productive time from non-productive usage." },
                { icon: "🤖", title: "AI Recommendations",         desc: "Personalized actions based on your unique attention profile." },
              ].map((p) => (
                <div className="fg-analytics-point" key={p.title}>
                  <div className="fg-analytics-point-icon">{p.icon}</div>
                  <div className="fg-analytics-point-text">
                    <strong>{p.title}</strong>
                    <span>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="fg-btn-primary" style={{ width: "fit-content" }} onClick={() => navigate("/register")}>
              Start Analyzing →
            </button>
          </div>

          {/* Right — dashboard mockup */}
          <div className="fg-analytics-right">
            <div className="fg-dashboard-mockup">
              <div className="fg-dash-header">
                <div className="fg-dash-title">
                  Dashboard <span>· Today</span>
                </div>
                <div className="fg-dash-badge">
                  <span className="fg-dash-dot" /> Active
                </div>
              </div>

              {/* KPI row */}
              <div className="fg-dash-kpi-row">
                {[
                  { val: "82%",    lbl: "Focus Score" },
                  { val: "4h 32m", lbl: "Focus Time"  },
                  { val: "6h 18m", lbl: "Screen Time" },
                  { val: "18",     lbl: "Switches"    },
                  { val: "12",     lbl: "Distractions"},
                ].map((k) => (
                  <div className="fg-dash-kpi" key={k.lbl}>
                    <div className="fg-dash-kpi-val">{k.val}</div>
                    <div className="fg-dash-kpi-lbl">{k.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="fg-chart-area">
                <div className="fg-chart-area-label">Focus Score · 7 Days</div>
                <div className="fg-chart-bars">
                  {DEMO_BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className={`fg-bar${h < 45 ? " low" : h < 60 ? " mid" : ""}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="fg-chart-x">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>

              {/* App rows */}
              <div className="fg-app-rows">
                {DEMO_APPS.map((a) => (
                  <div className="fg-app-row" key={a.name}>
                    <span className="fg-app-row-name">{a.name}</span>
                    <div className="fg-app-row-track">
                      <div className={`fg-app-row-fill ${a.type}`} style={{ width: `${a.pct}%` }} />
                    </div>
                    <span className="fg-app-row-val">{a.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection() {
  const ABOUT_CARDS = [
    { icon: "🔬", title: "Behavioral Analysis",      desc: "Deep behavioral analytics of your real digital activity." },
    { icon: "🚨", title: "Attention Leak Detection", desc: "Find exactly where and when your focus is breaking down." },
    { icon: "📈", title: "Productivity Tracking",    desc: "Understand productive vs non-productive digital time." },
    { icon: "🤖", title: "AI-Powered Insights",      desc: "Intelligent recommendations tailored to your patterns." },
  ];

  return (
    <section
      id="about"
      style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="fg-section">
        <div className="fg-about-inner">
          <div className="fg-about-left">
            <span className="fg-section-eyebrow">About</span>
            <h2>
              Built to Make Your Digital Life More Intentional
            </h2>
            <p>
              FocusGuard AI was created with a simple belief: knowing your
              screen time isn't enough. Real attention intelligence means
              understanding <em>how</em> your attention flows — and where it
              leaks — across every app, tab, and context switch in your day.
            </p>
            <p>
              Our platform combines behavioral analysis with AI-powered insights
              to give you a complete picture of your focus health — and a clear
              path to improving it.
            </p>
            <div className="fg-about-tags">
              {["Behavioral Analysis","Attention Leaks","Focus Score","Productivity Tracking","Task Switching","AI Insights"].map((t) => (
                <span className="fg-about-tag" key={t}>{t}</span>
              ))}
            </div>
          </div>

          <div className="fg-about-right">
            {ABOUT_CARDS.map((c) => (
              <div className="fg-about-card" key={c.title}>
                <div className="fg-about-card-icon">{c.icon}</div>
                <div className="fg-about-card-title">{c.title}</div>
                <div className="fg-about-card-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  const navigate = useNavigate();

  return (
    <div className="fg-cta-wrap">
      <div className="fg-cta-card">
        <h2 className="fg-cta-heading">Ready to Take Back Your Focus?</h2>
        <p className="fg-cta-sub">
          Start understanding your digital habits and turn your attention into
          your strongest productivity tool.
        </p>
        <div className="fg-cta-actions">
          <button className="fg-btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => navigate("/register")}>
            Create Your Account →
          </button>
          <button className="fg-cta-secondary" onClick={() => navigate("/login")}>
            Already have an account? Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ onNav }) {
  const navigate = useNavigate();

  return (
    <footer className="fg-footer">
      <div className="fg-footer-inner">
        <div className="fg-footer-top">
          <div className="fg-footer-brand">
            <div className="fg-nav-brand">
              <div className="fg-nav-brand-icon">🧠</div>
              <div className="fg-nav-brand-text">
                <span className="fg-nav-brand-name">FocusGuard AI</span>
                <span className="fg-nav-brand-sub">Attention Intelligence Platform</span>
              </div>
            </div>
            <p>
              Helping you understand your digital behavior, detect attention
              leaks, and build better focus habits through AI-powered insights.
            </p>
          </div>

          <div>
            <div className="fg-footer-col-title">Navigation</div>
            <div className="fg-footer-links">
              <button onClick={() => onNav("top")}>Home</button>
              <button onClick={() => onNav("features")}>Features</button>
              <button onClick={() => onNav("how-it-works")}>How It Works</button>
              <button onClick={() => onNav("about")}>About</button>
            </div>
          </div>

          <div>
            <div className="fg-footer-col-title">Account</div>
            <div className="fg-footer-links">
              <button onClick={() => navigate("/login")}>Sign In</button>
              <button onClick={() => navigate("/register")}>Sign Up</button>
              <button onClick={() => navigate("/dashboard")}>Dashboard</button>
            </div>
          </div>
        </div>

        <div className="fg-footer-bottom">
          <span className="fg-footer-copy">© 2026 FocusGuard AI. All rights reserved.</span>
          <span className="fg-footer-made">
            Built with <span style={{ color: "#ef4444" }}>♥</span> for better attention
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Home (page root) ─────────────────────────────────────────────────────────
function Home() {
  // Smooth-scroll helper — handles both hash IDs and "top"
  const scrollTo = useCallback((target) => {
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      const offset = 76; // navbar height
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  // Reset to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fg-home">
      <Navbar onNav={scrollTo} />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AnalyticsSection />
      <AboutSection />
      <CTASection />
      <Footer onNav={scrollTo} />
    </div>
  );
}

export default Home;
