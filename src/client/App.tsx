import { useState, useCallback, useMemo } from "react";
import katex from "katex";
import { calculate } from "@/lib/calc";
import { useI18n, I18nProvider } from "@/hooks/useI18n";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Input } from "@/components/ui/input";

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: true, trust: true });
  } catch {
    return `<span style="color:#ee0000">${latex}</span>`;
  }
}

function AppContent() {
  const { t } = useI18n();
  const [input, setInput] = useState("42");
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const num = parseFloat(trimmed);
    if (isNaN(num)) return { error: t.hero.error };
    try {
      return { input: num, expression: calculate(num) };
    } catch {
      return { error: t.hero.error };
    }
  }, [input, t]);

  const handleCopy = useCallback(() => {
    if (result && "expression" in result) {
      navigator.clipboard.writeText(result.expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-card pt-24 pb-20 sm:pt-32 sm:pb-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="caption-mono uppercase text-muted-foreground mb-4">{t.hero.eyebrow}</p>
          <h1 className="display-xl text-foreground mb-4">{t.hero.title}</h1>
          <p className="body-lg text-muted-foreground max-w-lg mx-auto mb-8">
            {t.hero.lead}
          </p>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground code text-sm">$</span>
              <Input
                type="text"
                inputMode="decimal"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.hero.placeholder}
                autoFocus
                className="h-12 pl-8 code bg-card border-border text-base"
                style={{ boxShadow: "var(--shadow-input)" }}
              />
            </div>
          </div>

          {result && "error" in result && (
            <p className="code text-sm text-destructive mt-3">{result.error}</p>
          )}
        </div>
      </section>

      {/* RESULT — dark polarity-flip band */}
      {result && "expression" in result && (
        <section className="bg-primary text-primary-foreground py-20 sm:py-24">
          <div className="max-w-2xl mx-auto px-6">
            <p className="caption-mono uppercase text-muted-foreground mb-3">{t.result.eyebrow}</p>
            <p className="code text-sm text-muted-foreground mb-6">{result.input} =</p>

            <div className="bg-primary-foreground/5 rounded-lg p-6 overflow-x-auto mb-6">
              <div className="text-primary-foreground" dangerouslySetInnerHTML={{ __html: renderLatex(result.expression) }} />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                className="btn-pill-sm inline-flex items-center justify-center bg-primary-foreground text-primary rounded-full"
                style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "14px", fontWeight: 500, border: "none", cursor: copied ? "default" : "pointer", opacity: copied ? 0.6 : 1 }}
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? t.hero.copied : t.result.copyLatex}
              </button>
              <button
                className="btn-pill-sm inline-flex items-center justify-center border border-primary-foreground/20 text-primary-foreground rounded-full"
                style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: "14px", fontWeight: 500, background: "transparent", cursor: "pointer" }}
                onClick={() => setShowSource(!showSource)}
              >
                {showSource ? t.result.hideSource : t.result.viewSource}
              </button>
            </div>

            {showSource && (
              <pre className="mt-4 p-4 bg-primary-foreground/10 rounded-lg code text-sm text-primary-foreground/70 whitespace-pre-wrap break-all overflow-x-auto">
                {result.expression}
              </pre>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-border bg-card py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-between gap-6 text-sm text-muted-foreground">
          <span className="caption-mono">
            Made by{" "}
            <a href="https://kibidango.top" target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--link))", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              Kibidango086
            </a>
          </span>
          <span className="caption-mono">
            Inspiration from{" "}
            <a href="https://www.zhihu.com/question/264059954" target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--link))", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              this Zhihu Question
            </a>
          </span>
          <span className="caption-mono text-muted-foreground">{t.footer.copyright}</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
}
