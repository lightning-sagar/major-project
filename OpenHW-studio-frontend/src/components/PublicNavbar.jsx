import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggleSlider from "./ThemeToggleSlider.jsx";

// Default fallback links (used if no links prop is passed)
const DEFAULT_LINKS = [
  { label: "Home",               path: "/" },
  { label: "Components Status",  path: "/components-status" },
  { label: "Analytics",          path: "/analytics" },
  { label: "Bug Tracker",        path: "/bugs" },
  { label: "Feedback & Reviews", path: "/feedback" },
  { label: "About Us",           path: "/about" },
];

/**
 * Unified glassmorphism navbar shared across all public pages.
 *
 * Props:
 *   links   - Array of { label, path } to render as nav links.
 *             Defaults to DEFAULT_LINKS if not provided.
 *   actions - JSX to render as the right-side action area.
 *             Defaults to Log In + Launch Simulator / Dashboard.
 */
export default function PublicNavbar({ links, actions }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, user } = useAuth();

  const role = user?.role;
  const handleDashboard = () => {
    if (role === "teacher") navigate("/teacher/dashboard");
    else if (role === "student") navigate("/student/dashboard");
    else navigate("/user/dashboard");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = links ?? DEFAULT_LINKS;

  const currentPath = location.pathname + location.search;

  const defaultActions = isAuthenticated ? (
    <button className="btn btn-primary public-navbar__cta" onClick={handleDashboard}>
      Dashboard
    </button>
  ) : (
    <>
      <button
        className="public-navbar__link"
        onClick={() =>
          navigate(`/login?returnTo=${encodeURIComponent(currentPath)}`, {
            state: { from: currentPath },
          })
        }
      >
        Log In
      </button>
      <button className="btn btn-primary public-navbar__cta" onClick={() => navigate("/simulator")}>
        Open simulator
      </button>
    </>
  );

  return (
    <>
      <nav className="public-navbar">
        {/* Brand */}
        <div
          className="public-navbar__brand"
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/")}
        >
          <img
            src="/webhardware-mark.svg"
            alt=""
            className="public-navbar__logo"
          />
          <div className="public-navbar__brand-text">
            <div className="public-navbar__brand-name">
              web<span>hardware</span>
            </div>
            <div className="public-navbar__brand-sub">FOSSEE · IIT Bombay</div>
          </div>
        </div>

        {/* Links + Actions — all on the right */}
        <div className="public-navbar__right">
          <div className="public-navbar__links">
            {navLinks.map((link) => (
              <button
                key={link.path}
                className={`public-navbar__link ${isActive(link.path) ? "public-navbar__link--active" : ""}`}
                onClick={() => navigate(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="public-navbar__actions">
            {actions ?? defaultActions}

            {/* Divider + Theme toggle — always shown */}
            <span className="public-navbar__divider-wrap">
              <span className="public-navbar__divider" />
              <ThemeToggleSlider size="md" />
            </span>
          </div>
        </div>
      </nav>

      {/* Spacer so page content doesn't hide under the fixed bar */}
      <div className="public-navbar__spacer" aria-hidden="true" />

      <style>{PUBLIC_NAV_CSS}</style>
    </>
  );
}

const PUBLIC_NAV_CSS = `
  .public-navbar {
    position: fixed;
    top: var(--wh-banner-h, 0px);
    left: 0;
    right: 0;
    z-index: 9000;
    display: flex;
    align-items: center;
    padding: 0 32px;
    height: 64px;
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-body);
  }

  .public-navbar__spacer {
    height: 64px;
    flex-shrink: 0;
    width: 100%;
    display: block;
  }

  /* ── Brand ─────────────────────────────────────────────────────── */
  .public-navbar__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
    user-select: none;
    outline: none;
  }
  .public-navbar__brand:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
    border-radius: 6px;
  }
  .public-navbar__logo {
    width: 32px;
    height: 32px;
    display: block;
    flex-shrink: 0;
  }
  .public-navbar__brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }
  .public-navbar__brand-name {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text);
  }
  .public-navbar__brand-name span { color: var(--accent); }
  .public-navbar__brand-sub {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text3);
    margin-top: 4px;
  }

  /* ── Right side ─────────────────────────────────────────────────── */
  .public-navbar__right {
    display: flex;
    align-items: center;
    margin-left: auto;
  }
  .public-navbar__links {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .public-navbar__link {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    background: transparent;
    border: 0;
    color: var(--text2);
    font: 600 14px/1.2 var(--font-body);
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.15s ease;
  }
  .public-navbar__link:hover { color: var(--text); }
  .public-navbar__link--active { color: var(--text); }
  .public-navbar__link--active::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -12px;
    height: 2px;
    background: var(--accent);
  }

  .public-navbar__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-left: 16px;
    padding-left: 16px;
    border-left: 1px solid var(--border);
  }
  .public-navbar__cta { white-space: nowrap; }
  .public-navbar__divider-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 4px;
  }
  .public-navbar__divider {
    display: inline-block;
    width: 1px;
    height: 20px;
    background: var(--border);
  }

  /* ── Buttons passed in by pages ─────────────────────────────────── */
  .public-navbar .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius);
    font: 600 14px/1.2 var(--font-body);
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .public-navbar .btn-primary {
    background: var(--accent);
    color: var(--accent-ink);
    border: 1px solid transparent;
  }
  .public-navbar .btn-primary:hover { background: var(--accent2); }
  .public-navbar .btn-ghost,
  .public-navbar .btn-outline {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border2);
  }
  .public-navbar .btn-ghost:hover,
  .public-navbar .btn-outline:hover { border-color: var(--text); }

  /* ── Responsive ─────────────────────────────────────────────────── */
  @media (max-width: 1100px) {
    .public-navbar { padding: 0 20px; }
    .public-navbar__link { padding: 6px 8px; font-size: 13px; }
  }
  @media (max-width: 860px) {
    .public-navbar__links { display: none; }
    .public-navbar__brand-sub { display: none; }
  }
  @media (max-width: 480px) {
    .public-navbar { padding: 0 16px; }
    .public-navbar__actions { margin-left: 8px; padding-left: 8px; gap: 4px; }
  }
`;
