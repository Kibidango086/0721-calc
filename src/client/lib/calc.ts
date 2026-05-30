// Pre-computed onani data — expressions using only 0, 7, 2, 1 in order
const onaniData: Record<number, { latex: string }> = {
  0: { latex: "(0*721)" },
  1: { latex: "(0*721)!" },
  2: { latex: "((0!^72)+1)" },
  3: { latex: "((0!/7)*21)" },
  4: { latex: "(0+(7-(2+1)))" },
  5: { latex: "(0+(7-(2*1)))" },
  6: { latex: "((0!/7)*21)!" },
  7: { latex: "(0+(7*(2-1)))" },
  8: { latex: "(0+(7+(2-1)))" },
  9: { latex: "(0+(7+(2*1)))" },
  10: { latex: "(0+(7+(2+1)))" },
  11: { latex: "(0!+(7+(2+1)))" },
  12: { latex: "((0!-7)*(2*(-1)))" },
  13: { latex: "-((0!+7)-21)" },
  14: { latex: "((0-7)+21)" },
  15: { latex: "((0!-7)+21)" },
  16: { latex: "(0!+((7*2)+1))" },
  17: { latex: "(((0!+7)*2)+1)" },
  18: { latex: "((0!-7)*((-2)-1))" },
  19: { latex: "((0!-\\lceil\\sqrt{7}\\rceil)+21)" },
  20: { latex: "-((0!^7)-21)" },
  21: { latex: "((0*7)+21)" },
  22: { latex: "((0!^7)+21)" },
  23: { latex: "(((0!+7)/2)!-1)" },
  24: { latex: "(0+(7-(2+1))!)" },
  25: { latex: "(0!+(7-(2+1))!)" },
  26: { latex: "\\lfloor\\sqrt{(0+721)}\\rfloor" },
  27: { latex: "-((0!-7)-21)" },
  28: { latex: "((0+7)+21)" },
  29: { latex: "((0!+7)+21)" },
  30: { latex: "-((0!-7)*\\lceil\\sqrt{21}\\rceil)" },
  31: { latex: "(0+\\lceil ((7+2)^{\\tan(1)}) \\rceil)" },
  32: { latex: "((0!+7)*\\lfloor\\sqrt{21}\\rfloor)" },
  33: { latex: "\\lceil ((0+7)*\\sqrt{21}) \\rceil" },
  34: { latex: "(0+\\lceil (7*(2+e^{1})) \\rceil)" },
  35: { latex: "(((0!-7)^{2})-1)" },
  36: { latex: "((0!-7)^{(2*1)})" },
  37: { latex: "(((0!-7)^{2})+1)" },
  38: { latex: "(0+\\lfloor (7*(2*e^{1})) \\rfloor)" },
  39: { latex: "(0+\\lceil (7*(2*e^{1})) \\rceil)" },
  40: { latex: "((0!+7)*\\lceil\\sqrt{21}\\rceil)" },
  41: { latex: "(-(0!-(7*(2+1)!)))" },
  42: { latex: "(0+(7*(2+1)!))" },
  43: { latex: "(0!+(7*(2+1)!))" },
  44: { latex: "(0+\\lfloor (7*(e^{2}-1)) \\rfloor)" },
  45: { latex: "(0+\\lceil (7*(e^{2}-1)) \\rceil)" },
  46: { latex: "(0+\\lfloor (7*(2^{e^{1}})) \\rfloor)" },
  47: { latex: "((-(0!-(7^{2})))-1)" },
  48: { latex: "(0+((7^{2})-1))" },
  49: { latex: "(0+(7^{(2*1)}))" },
  50: { latex: "(0+((7^{2})+1))" },
};



const availableNums = Object.keys(onaniData)
  .map(Number)
  .filter((x) => x > 0)
  .sort((a, b) => b - a);

function getMaxDivisor(num: number): number {
  for (const n of availableNums) {
    if (num >= n) return n;
  }
  return 1;
}

export function calculate(num: number): string {
  if (!isFinite(num) || isNaN(num)) {
    return String(num);
  }

  if (num < 0) {
    const inner = calculate(-num);
    return `(-1)\\cdot (${inner})`;
  }

  if (!Number.isInteger(num)) {
    let n = 0;
    let scaled = num;
    while (!Number.isInteger(scaled) && n < 10) {
      scaled = num * Math.pow(10, ++n);
    }
    scaled = Math.round(scaled);
    const inner = calculate(scaled);
    return `\\frac{${inner}}{10^{${n}}}`;
  }

  if (onaniData[num]) {
    return onaniData[num].latex;
  }

  const div = getMaxDivisor(num);
  const quotient = Math.floor(num / div);
  const remainder = num % div;

  let result = "";
  if (quotient > 0 && div > 1) {
    const divExpr = onaniData[div]
      ? onaniData[div].latex
      : String(div);
    const quotExpr = calculate(quotient);
    result = `${divExpr}\\cdot (${quotExpr})`;
  } else if (quotient > 0) {
    result = calculate(quotient);
  }

  if (remainder > 0) {
    const remExpr = calculate(remainder);
    if (result) {
      result = `(${result})+(${remExpr})`;
    } else {
      result = remExpr;
    }
  }

  return result;
}
