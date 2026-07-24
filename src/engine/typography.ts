export interface FitTextOptions {
  text: string;
  maxWidth: number;
  maxHeight: number;
  maxLines: number;
  minFontSize: number;
  maxFontSize: number;
  lineHeightRatio: number;
}

export interface FitTextResult {
  fontSize: number;
  lines: string[];
  height: number;
  truncated: boolean;
}

const tokenWeight = (value: string): number => {
  let weight = 0;
  for (const character of value) {
    weight += /[\u3400-\u9fff]/u.test(character) ? 1 : 0.56;
  }
  return weight;
};

const wrapAtSize = (
  text: string,
  fontSize: number,
  maxWidth: number,
): string[] => {
  const maxWeight = Math.max(1, maxWidth / fontSize);
  const tokens = text
    .trim()
    .split(/(\s+|(?<=[\u3400-\u9fff])|(?=[\u3400-\u9fff]))/u)
    .filter((token) => token.length > 0);
  const lines: string[] = [];
  let current = "";

  for (const token of tokens) {
    const candidate = `${current}${token}`;
    if (current.length > 0 && tokenWeight(candidate) > maxWeight) {
      lines.push(current.trim());
      current = token.trimStart();
    } else {
      current = candidate;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
};

export const fitText = (options: FitTextOptions): FitTextResult => {
  let low = options.minFontSize;
  let high = options.maxFontSize;
  let best = options.minFontSize;
  let bestLines = wrapAtSize(options.text, best, options.maxWidth);

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const lines = wrapAtSize(options.text, middle, options.maxWidth);
    const height = lines.length * middle * options.lineHeightRatio;
    const fits =
      lines.length <= options.maxLines && height <= options.maxHeight;
    if (fits) {
      best = middle;
      bestLines = lines;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  const truncated = bestLines.length > options.maxLines;
  const lines = bestLines.slice(0, options.maxLines);
  if (truncated && lines.length > 0) {
    const finalIndex = lines.length - 1;
    lines[finalIndex] = `${lines[finalIndex].replace(/[.…]+$/u, "")}…`;
  }

  return {
    fontSize: best,
    lines,
    height: lines.length * best * options.lineHeightRatio,
    truncated,
  };
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

export const formatEstimate = (
  low: number,
  high: number,
  currency: string,
): string => `${currency} ${formatNumber(low)}–${formatNumber(high)}`;
