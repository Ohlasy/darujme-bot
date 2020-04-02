import { Transaction } from "./darujme";

export interface Stats {
  recurringIncome: number;
  oneTimeIncome: number;
}

export function renderStats(
  startDate: Date,
  endDate: Date,
  stats: Stats
): string {
  const locale = "cs-CZ";
  const fmtd = new Intl.DateTimeFormat(locale).format;
  const fmtc = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format;
  const total = stats.recurringIncome + stats.oneTimeIncome;
  const text = `
    Za týden od ${fmtd(startDate)} do ${fmtd(endDate)} nám čtenáři poslali
    celkem ${fmtc(total)}, z toho ${fmtc(stats.recurringIncome)} dělají
    opakované dary a ${fmtc(stats.oneTimeIncome)} dary jednorázové. 🎉
    `
    .replace(/\n\s*/g, " ")
    .trim();
  return text;
}

export function calculateStats(transactions: Transaction[]): Stats {
  const recurrentSum = transactions
    .filter(t => t.pledge.isRecurrent)
    .map(t => t.sentAmount.cents)
    .reduce((a, b) => a + b, 0);
  const oneTimeSum = transactions
    .filter(t => !t.pledge.isRecurrent)
    .map(t => t.sentAmount.cents)
    .reduce((a, b) => a + b, 0);
  return {
    recurringIncome: recurrentSum / 100,
    oneTimeIncome: oneTimeSum / 100
  };
}
