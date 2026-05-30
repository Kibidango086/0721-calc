import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";

type Lang = "en" | "zh-CN" | "ja";

const labels: Record<Lang, string> = {
  en: "EN",
  "zh-CN": "中",
  ja: "日",
};

const next: Record<Lang, Lang> = {
  en: "zh-CN",
  "zh-CN": "ja",
  ja: "en",
};

export function LanguageSwitch() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(next[lang])}
      className="h-8 px-2 text-xs font-mono"
    >
      {labels[lang]}
    </Button>
  );
}
