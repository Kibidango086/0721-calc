import { useState, useCallback, useMemo, useEffect, createContext, useContext } from "react";
import katex from "katex";
import { calculate } from "@/lib/calc";
import en from "@/locales/en.json";
import zhCN from "@/locales/zh-CN.json";
import ja from "@/locales/ja.json";

// ─── i18n ────────────────────────────────────────────────────
type Lang = "en" | "zh-CN" | "ja";
type T = typeof en;
const locales: Record<Lang, T> = { en, "zh-CN": zhCN, ja };

const I18nCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: T }>({
  lang: "zh-CN", setLang: () => {}, t: zhCN,
});

function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "zh-CN";
    }
    return "zh-CN";
  });
  const persist = useCallback((l: Lang) => { setLang(l); localStorage.setItem("lang", l); }, []);
  return <I18nCtx.Provider value={{ lang, setLang: persist, t: locales[lang] }}>{children}</I18nCtx.Provider>;
}

function useT() { return useContext(I18nCtx); }

// ─── Helpers ─────────────────────────────────────────────────
function stripOuterParens(expr: string): string {
  if (!expr.startsWith("(") || !expr.endsWith(")")) return expr;
  let d = 0;
  for (let i = 0; i < expr.length - 1; i++) {
    if (expr[i] === "(") d++;
    if (expr[i] === ")") d--;
    if (d === 0) return expr; // closed early — not wrapped
  }
  return expr.slice(1, -1);
}

function renderKatex(latex: string): string {
  try { return katex.renderToString(latex, { throwOnError: false, displayMode: true, trust: true }); }
  catch { return `<span style="color:var(--destructive)">${latex}</span>`; }
}

const LANGS: Lang[] = ["zh-CN", "en", "ja"];
const LANG_LABELS: Record<Lang, string> = { en: "EN", "zh-CN": "中", ja: "日" };

// ─── App Inner (inside provider) ──────────────────────────────
function AppInner() {
  const [input, setInput] = useState("42");
  const [copied, setCopied] = useState(false);
  const [showSrc, setShowSrc] = useState(false);
  const { t, lang, setLang } = useT();

  // Init theme
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = useCallback((e: React.MouseEvent) => {
    const html = document.documentElement;
    const dark = !html.classList.contains("dark");
    const apply = () => {
      html.classList.toggle("dark", dark);
      localStorage.setItem("theme", dark ? "dark" : "light");
    };
    const x = e.clientX, y = e.clientY;
    html.style.setProperty("--vt-origin-x", x + "px");
    html.style.setProperty("--vt-origin-y", y + "px");
    if (document.startViewTransition) {
      document.startViewTransition(() => apply());
    } else {
      apply();
    }
  }, []);

  const cycleLang = useCallback(() => {
    const idx = LANGS.indexOf(lang);
    setLang(LANGS[(idx + 1) % LANGS.length]);
  }, [lang, setLang]);

  const result = useMemo(() => {
    const s = input.trim();
    if (!s) return null;
    const n = parseFloat(s);
    if (isNaN(n)) return { error: true };
    try { return { input: n, expr: stripOuterParens(calculate(n)) }; }
    catch { return { error: true }; }
  }, [input]);

  const doCopy = useCallback(() => {
    if (result && "expr" in result) {
      navigator.clipboard.writeText(result.expr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  return (
    <>
    <div style={{ flex: 1 }}>
      {/* Nav */}
      <nav className="top-nav">
        <a href="/" className="nav-brand">0721 数字论证器</a>
        <div className="nav-right">
          <button className="lang-switch" onClick={cycleLang} aria-label="Switch language">
            {LANG_LABELS[lang]}
          </button>
          <button className="theme-switch" onClick={toggleTheme} aria-label="Toggle theme">
            <span className="material-symbols-rounded icon-light">dark_mode</span>
            <span className="material-symbols-rounded icon-dark">light_mode</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-center">
        <div className="hero-center-inner">
          <h1 className="hero-center-headline">
            0721{" "}
            <span style={{ color: "var(--primary)" }}>{t.title}</span>
          </h1>
          <p className="hero-center-sub">{t.subtitle}</p>

          <div className="card" style={{ maxWidth: "560px", margin: "0 auto" }}>
            <input
              type="text" inputMode="decimal" className="calc-input"
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder} autoFocus
            />
          </div>

          {result && "error" in result && (
            <p style={{ color: "var(--destructive)", fontSize: ".82rem", marginTop: "12px" }}>{t.invalid}</p>
          )}
        </div>
      </section>

      {/* Result */}
      {result && "expr" in result && (
        <section style={{ position: "relative", zIndex: 10, maxWidth: "800px", margin: "0 auto 32px", padding: "0 16px" }}>
          <div className="result-card">
            <div style={{ fontSize: ".78rem", color: "var(--muted-fg)", fontFamily: "var(--font-mono)", marginBottom: "8px" }}>
              {result.input} =
            </div>

            <div
              style={{ overflowX: "auto", marginBottom: "20px", padding: "16px 0" }}
              dangerouslySetInnerHTML={{ __html: renderKatex(result.expr) }}
            />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="btn-primary btn-sm" onClick={doCopy} disabled={copied}>
                {copied ? t.copied : t.copy}
              </button>
              <button className="btn-outline btn-sm" onClick={() => setShowSrc(!showSrc)}>
                {showSrc ? t.hideSrc : t.viewSrc}
              </button>
            </div>

            {showSrc && (
              <pre style={{
                marginTop: "16px", padding: "16px", borderRadius: "10px",
                background: "var(--muted)", color: "var(--muted-fg)",
                fontFamily: "var(--font-mono)", fontSize: ".78rem",
                whiteSpace: "pre-wrap", wordBreak: "break-all", overflowX: "auto",
              }}>
                {result.expr}
              </pre>
            )}
          </div>
        </section>
      )}

    </div>

      {/* Footer */}
      <footer className="site-footer">
        <p>
          Made by{" "}
          <a href="https://kibidango.top" target="_blank" rel="noopener noreferrer">Kibidango086</a>
          {" · "}
          Inspiration from{" "}
          <a href="https://www.zhihu.com/question/264059954" target="_blank" rel="noopener noreferrer">this Zhihu Question</a>
        </p>
        <p style={{ marginTop: "4px" }}>{t.copyright}</p>
      </footer>
    </>
  );
}

// ─── App (provider wrapper) ──────────────────────────────────
export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}
