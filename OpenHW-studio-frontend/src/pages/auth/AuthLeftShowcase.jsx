/**
 * Left-hand brand panel shown beside the login / classroom sign-in forms.
 */
const POINTS = [
  "Your circuits are saved to the cloud",
  "Progress, XP and unlocked components follow you",
  "Hand in classroom assignments in one click",
];

export default function AuthLeftShowcase() {
  return (
    <aside className="auth-hardware-showcase wh-auth-showcase">
      <style>{SHOWCASE_CSS}</style>
      <a href="/" className="wh-auth-showcase__brand">
        <img src="/webhardware-mark.svg" alt="" width="36" height="36" />
        <span>
          web<b>hardware</b>
        </span>
      </a>

      <div className="wh-auth-showcase__body">
        <p className="wh-auth-showcase__eyebrow">Your bench is waiting</p>
        <h1>
          Every circuit you build,
          <br />
          <em>right where you left it.</em>
        </h1>
        <ul>
          {POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <div className="wh-auth-showcase__term" aria-hidden="true">
        <span className="wh-auth-showcase__prompt">$</span> webhardware flash blink.ino
        <br />
        <span className="wh-auth-showcase__ok">✓</span> compiled · 924 bytes · uploaded to uno
      </div>
    </aside>
  );
}

const SHOWCASE_CSS = `
  .wh-auth-showcase.auth-hardware-showcase {
    align-items: stretch;
    justify-content: space-between;
    padding: 40px 56px;
    gap: 40px;
  }
  .wh-auth-showcase__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }
  .wh-auth-showcase__brand b { color: var(--accent); font-weight: 800; }
  .wh-auth-showcase__eyebrow {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text2);
    margin-bottom: 18px;
  }
  .wh-auth-showcase__body h1 {
    font-family: var(--font-display);
    font-size: clamp(34px, 3.6vw, 56px);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--text);
    margin-bottom: 32px;
  }
  .wh-auth-showcase__body h1 em { font-style: normal; color: var(--accent); }
  .wh-auth-showcase__body ul { list-style: none; display: grid; gap: 14px; }
  .wh-auth-showcase__body li {
    display: flex;
    gap: 12px;
    align-items: baseline;
    color: var(--text2);
    font-size: 15.5px;
  }
  .wh-auth-showcase__body li::before {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: var(--accent);
    transform: translateY(-1px);
  }
  .wh-auth-showcase__term {
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.8;
    color: var(--text2);
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--card);
  }
  .wh-auth-showcase__prompt { color: var(--accent); }
  .wh-auth-showcase__ok { color: var(--green); }
`;
