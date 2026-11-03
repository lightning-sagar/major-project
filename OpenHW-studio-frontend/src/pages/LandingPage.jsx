import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PublicNavbar from "../components/PublicNavbar.jsx";
import { PROJECTS } from "../services/gamification/ProjectsConfig.js";
import GUIDED_JSON from "../services/guidedProjects.json";
import "./LandingPage.css";

const DOCS_URL =
  import.meta.env.VITE_DOCS_URL || "https://openhw-studio.fossee.in/docs/";

const EXAMPLES_BASE_URL =
  import.meta.env.VITE_EXAMPLES_BASE_URL || "/api/examples";

// JSON slug → URL slug for projects where they differ
const JSON_SLUG_TO_URL = {
  "rgb-led-blink": "rgb-led",
};

// Maps every project slug → { folder, file } in the examples repo
// folder/file must match exactly what's served under EXAMPLES_BASE_URL
const CIRCUIT_IMAGE_MAP = {
  "led-blink":               { folder: "led-blink",               file: "circuit.png" },
  "rgb-led":                 { folder: "rgb-led",                 file: "circuit.png" },
  "rgb-led-blink":           { folder: "rgb-led-blink",           file: "circuit.png" },
  "rgb-led-serial":          { folder: "rgb-led-serial",          file: "circuit.png" },
  "rgb-led-3-buttons":       { folder: "rgb-led-3-buttons",       file: "circuit.png" },
  "button-debounce":         { folder: "button-debounce",         file: "circuit.png" },
  "button-led":              { folder: "button-led",              file: "circuit.png" },
  "potentiometer-led":       { folder: "potentiometer-led",       file: "circuit.png" },
  "servo-motor":             { folder: "servo-motor",             file: "circuit.png" },
  "servo-potentiometer":     { folder: "servo-potentiometer",     file: "circuit.png" },
  "temperature-sensor":      { folder: "temperature-sensor",      file: "circuit.png" },
  "temperature-rgb-led":     { folder: "temperature-rgb-led",     file: "circuit.png" },
  "dc-motor-l293d":          { folder: "dc-motor-l293d",          file: "circuit.png" },
  "dc-motor-pwm":            { folder: "dc-motor-pwm",            file: "circuit.png" },
  "led-strip":               { folder: "led-strip",               file: "circuit.png" },
  "ldr-automatic-light":     { folder: "ldr-automatic-light",     file: "circuit.png" },
  "gas-sensor-led":          { folder: "gas-sensor-led",          file: "circuit.png" },
  "motion-sensor-alarm":     { folder: "motion-sensor-alarm",     file: "circuit.png" },
  "obstacle-avoiding-robot": { folder: "obstacle-avoiding-robot", file: "circuit.png" },
  "smart-dustbin":           { folder: "smart-dustbin",           file: "circuit.png" },
  "smart-home-automation":   { folder: "smart-home-automation",   file: "circuit.png" },
  "smart-street-light":      { folder: "smart-street-light",      file: "circuit.png" },
  "water-level-indicator":   { folder: "water-level-indicator",   file: "circuit.png" },
  "auto-fan-speed":          { folder: "auto-fan-speed",          file: "circuit.png" },
  "lcd-scrolling-text":      { folder: "lcd-scrolling-text",      file: "circuit.png" },
  "ultrasonic-distance":     { folder: "ultrasonic-distance",     file: "circuit.png" },
  "traffic-light":           { folder: "traffic-light",           file: "circuit.png" },
  "up-counter":              { folder: "up-counter",              file: "circuit.png" },
  "up-down-counter":         { folder: "up-down-counter",         file: "circuit.png" },
  // slug differs from folder name
  "buzzer":                  { folder: "Turn_on_Buzzer",          file: "Turn_on_Buzzer.png" },
  "ldr":                     { folder: "ldr-automatic-light",     file: "circuit.png" },
  "7-segment-display":       { folder: "7-segment-display",       file: "circuit.png" },
  "7-segment-counter":       { folder: "7-segment-display",       file: "circuit.png" },
  "ir-remote-control-system":{ folder: "ir-remote-control-system",file: "circuit.png" },
  "ir-remote-control":       { folder: "ir-remote-control-system",file: "circuit.png" },
  // no dedicated folder — use closest equivalent
  "led-pwm":                 { folder: "potentiometer-led",       file: "circuit.png" },
  "dht-lcd":                 { folder: "temperature-rgb-led",     file: "circuit.png" },
  "line-following-robot":    { folder: "obstacle-avoiding-robot", file: "circuit.png" },
  "bluetooth-hc05":          { folder: "smart-home-automation",   file: "circuit.png" },
  "rf-remote-control":       { folder: "ir-remote-control-system",file: "circuit.png" },
  "wifi-led-control":        { folder: "smart-home-automation",   file: "circuit.png" },
  "communication-protocols": { folder: "button-led",              file: "circuit.png" },
};

function getCircuitImageUrl(slug, baseUrl) {
  const entry = CIRCUIT_IMAGE_MAP[slug];
  if (entry) return `${baseUrl}/${entry.folder}/${entry.file}`;
  return `${baseUrl}/${slug}/circuit.png`;
}

const PROJECT_ICONS = {};
for (const p of PROJECTS) {
  PROJECT_ICONS[p.slug] = p.icon || "🔌";
}

const LEVEL_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LEVEL_LABELS = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

const BOARDS = ["Arduino Uno", "Arduino Mega", "Arduino Nano", "Raspberry Pi Pico", "Pico W", "ESP32", "STM32 Blue Pill", "ATtiny85"];

const FEATURES = [
  { title: "Instruction-level emulation", desc: "AVR, RP2040, ESP32 and STM32 cores run in your browser tab. No plugins, no installs, no real hardware." },
  { title: "Blocks → C++", desc: "Start by snapping blocks together, then switch to the full code editor when you're ready." },
  { title: "Wiring that helps", desc: "Drop an LED and a resistor gets added for you. The circuit checker catches shorts before you hit run." },
  { title: "Serial monitor & plotter", desc: "Watch serial output and plot sensor values live, just like on a real bench." },
  { title: "Built for classrooms", desc: "Teachers set up classes, hand out starter projects, lock screens and grade work as it comes in." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [editorMode, setEditorMode] = useState(
    () => localStorage.getItem("openhw_demo_editor_mode") || "code"
  );
  const [level, setLevel] = useState("All");
  const [brokenImages, setBrokenImages] = useState({});

  const handleEditorModeChange = (mode) => {
    setEditorMode(mode);
    localStorage.setItem("openhw_demo_editor_mode", mode);
  };

  const allCards = useMemo(() => {
    const cards = [];
    for (const lvl of LEVEL_ORDER) {
      const levelData = GUIDED_JSON[lvl];
      if (!levelData) continue;
      const levelLabel = LEVEL_LABELS[lvl] || lvl;
      for (const cat of Object.values(levelData.categories)) {
        for (const p of cat.projects) {
          const urlSlug = JSON_SLUG_TO_URL[p.slug] || p.slug;
          cards.push({ slug: urlSlug, title: p.title, board: p.board, difficulty: levelLabel });
        }
      }
    }
    return cards;
  }, []);

  const visibleCards = level === "All" ? allCards : allCards.filter((c) => c.difficulty === level);

  const handleDashboard = () => {
    if (role === "teacher") navigate("/teacher/dashboard");
    else if (role === "student") navigate("/student/dashboard");
    else navigate("/user/dashboard");
  };

  const openProject = (p) =>
    navigate(`/${p.slug}/demo?editorMode=${editorMode}`, {
      state: { editorMode, guidedProject: p },
    });

  return (
    <div className="wh-landing">
      <PublicNavbar
        links={[
          { label: "Examples", path: "/examples" },
          { label: "About", path: "/about" },
        ]}
        actions={
          isAuthenticated ? (
            <button className="wh-btn wh-btn--solid" onClick={handleDashboard}>
              Dashboard
            </button>
          ) : (
            <>
              <button className="wh-btn wh-btn--text" onClick={() => navigate("/login")}>
                Log in
              </button>
              <button className="wh-btn wh-btn--solid" onClick={() => navigate("/signup")}>
                Sign up
              </button>
            </>
          )
        }
      />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="wh-hero">
        <div className="wh-hero__copy">
          <p className="wh-eyebrow">
            <span className="wh-dot" /> Open-source hardware lab, in your browser
          </p>
          <h1 className="wh-hero__title">
            Wire it up.
            <br />
            Flash it.
            <br />
            <em>Watch it run.</em>
          </h1>
          <p className="wh-hero__lede">
            WebHardware is a circuit simulator for learning embedded systems. Put
            together a circuit, write the firmware, and watch it run, all in a
            browser tab.
          </p>
          <div className="wh-hero__actions">
            <button
              className="wh-btn wh-btn--solid wh-btn--lg"
              onMouseEnter={() => import("./simulationpage/SimulatorPage.jsx")}
              onClick={() => navigate("/simulator")}
            >
              Open the simulator
              <span aria-hidden="true">→</span>
            </button>
            <button
              className="wh-btn wh-btn--line wh-btn--lg"
              onClick={() => navigate("/classroom/signup")}
            >
              Join a classroom
            </button>
          </div>
          <p className="wh-hero__note">
            Guest mode works without an account, but it doesn't save to the cloud, track progress or hand in assignments.
          </p>
        </div>

        <div className="wh-hero__visual" aria-hidden="true">
          <div className="wh-bench">
            <div className="wh-bench__bar">
              <span /> <span /> <span />
              <code>blink.ino — Arduino Uno</code>
            </div>
            <svg className="wh-bench__svg" viewBox="0 0 420 260">
              <defs>
                <pattern id="wh-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" className="wh-grid-dot" />
                </pattern>
              </defs>
              <rect width="420" height="260" fill="url(#wh-grid)" />
              <rect x="30" y="50" width="190" height="150" rx="10" className="wh-board" />
              <rect x="60" y="95" width="70" height="40" rx="4" className="wh-chip" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <rect key={i} x={50 + i * 20} y="58" width="10" height="14" rx="2" className="wh-header" />
              ))}
              <text x="66" y="120" className="wh-chip-label">ATmega328P</text>
              <path d="M190 65 V30 H300 V95" className="wh-trace" />
              <path d="M170 65 V40 H360 V200 H300 V186" className="wh-trace wh-trace--gnd" />
              <rect x="290" y="95" width="20" height="40" rx="4" className="wh-resistor" />
              <path d="M300 135 V154" className="wh-trace" />
              <circle cx="300" cy="170" r="30" className="wh-led-glow" />
              <circle cx="300" cy="170" r="16" className="wh-led" />
            </svg>
            <div className="wh-bench__serial">
              <span className="wh-prompt">serial@9600</span>
              <span className="wh-serial-line">LED ON</span>
              <span className="wh-serial-line wh-serial-line--off">LED OFF</span>
              <span className="wh-caret" />
            </div>
          </div>
        </div>
      </section>

      {/* ── BOARD STRIP ──────────────────────────────────────────────── */}
      <div className="wh-strip" aria-label="Supported boards">
        <div className="wh-strip__track">
          {[...BOARDS, ...BOARDS].map((b, i) => (
            <span key={i} className="wh-strip__item" aria-hidden={i >= BOARDS.length}>
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="wh-section">
        <header className="wh-section__head">
          <p className="wh-eyebrow">What you get</p>
          <h2>A whole electronics bench, minus the parts bin.</h2>
        </header>
        <ol className="wh-features">
          {FEATURES.map((f, i) => (
            <li key={f.title} className="wh-feature">
              <span className="wh-feature__num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── GUIDED PROJECTS ──────────────────────────────────────────── */}
      <section className="wh-section">
        <header className="wh-section__head wh-section__head--row">
          <div>
            <p className="wh-eyebrow">Guided projects</p>
            <h2>Pick a circuit and start tinkering.</h2>
            <p className="wh-muted">Every project opens with the parts placed and the code written. No login needed.</p>
          </div>
          <div className="wh-controls">
            <div className="wh-seg" role="radiogroup" aria-label="Difficulty">
              {["All", ...Object.values(LEVEL_LABELS)].map((l) => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={level === l}
                  className={level === l ? "is-on" : ""}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="wh-seg" role="radiogroup" aria-label="Editor mode">
              <button
                type="button"
                id="mode-toggle-code"
                role="radio"
                aria-checked={editorMode === "code"}
                className={editorMode === "code" ? "is-on" : ""}
                onClick={() => handleEditorModeChange("code")}
              >
                {"</>"} Code
              </button>
              <button
                type="button"
                id="mode-toggle-blocks"
                role="radio"
                aria-checked={editorMode === "blocks"}
                className={editorMode === "blocks" ? "is-on" : ""}
                onClick={() => handleEditorModeChange("blocks")}
              >
                ▦ Blocks
              </button>
            </div>
          </div>
        </header>
        <p className="wh-mode-hint">
          {editorMode === "blocks"
            ? "Blocks mode: you edit with blocks, and the code editor is read-only."
            : "Code mode: you edit the code, and the blocks are view-only."}
        </p>

        <div className="wh-projects">
          {visibleCards.map((p) => (
            <button key={p.slug} type="button" className="wh-project" onClick={() => openProject(p)}>
              <div className="wh-project__img">
                {brokenImages[p.slug] ? (
                  <span className="wh-project__icon">{PROJECT_ICONS[p.slug] || "🔌"}</span>
                ) : (
                  <img
                    src={getCircuitImageUrl(p.slug, EXAMPLES_BASE_URL)}
                    alt={p.title}
                    loading="lazy"
                    onError={() => setBrokenImages((s) => ({ ...s, [p.slug]: true }))}
                  />
                )}
              </div>
              <div className="wh-project__meta">
                <span className={`wh-level wh-level--${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <span className="wh-project__board">{p.board}</span>
              </div>
              <h3 className="wh-project__title">{p.title}</h3>
              <span className="wh-project__go" aria-hidden="true">Open →</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="wh-section">
        <div className="wh-split">
          <button type="button" className="wh-split__panel" onClick={() => navigate("/classroom/signup?role=student")}>
            <p className="wh-eyebrow">For students</p>
            <h3>Join your class</h3>
            <p>Join a class, hand in assignments, earn XP and unlock new components as you go.</p>
            <span className="wh-split__go">Join as student →</span>
          </button>
          <button type="button" className="wh-split__panel wh-split__panel--accent" onClick={() => navigate("/classroom/signup?role=teacher")}>
            <p className="wh-eyebrow">For teachers</p>
            <h3>Run your lab</h3>
            <p>Set up classes, assign projects, follow each student's progress and grade in one place.</p>
            <span className="wh-split__go">Join as teacher →</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="wh-footer">
        <div className="wh-footer__brand">
          <img src="/webhardware-logo.svg" alt="WebHardware" className="wh-footer__logo" />
          <p>Open-source hardware simulation &amp; learning. Built at FOSSEE, IIT Bombay.</p>
        </div>
        <nav className="wh-footer__cols">
          <div>
            <h4>Product</h4>
            <a href="/simulator">Simulator</a>
            <a href="/examples">Examples</a>
            <a href="/components-status">Component status</a>
          </div>
          <div>
            <h4>Community</h4>
            <a href="https://github.com/OpenHW-Studio/" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="/feedback">Reviews &amp; feedback</a>
            <a href="/bugs">Bug tracker</a>
          </div>
          <div>
            <h4>Resources</h4>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">Documentation</a>
            <a href="/analytics">Analytics</a>
            <a href="/about">About</a>
          </div>
        </nav>
        <p className="wh-footer__legal">© {new Date().getFullYear()} WebHardware · FOSSEE, IIT Bombay</p>
      </footer>
    </div>
  );
}
