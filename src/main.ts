import { Credentials, getTransactions } from "./darujme";
import * as slack from "slack";

interface Stats {
  recurringIncome: number;
  oneTimeIncome: number;
}

async function getStats(
  credentials: Credentials,
  startDate: Date,
  endDate: Date
): Promise<Stats | null> {
  try {
    const txs = await getTransactions(credentials, startDate, endDate);
    const recurrentSum = txs
      .filter(t => t.pledge.isRecurrent)
      .map(t => t.sentAmount.cents)
      .reduce((a, b) => a + b, 0);
    const oneTimeSum = txs
      .filter(t => !t.pledge.isRecurrent)
      .map(t => t.sentAmount.cents)
      .reduce((a, b) => a + b, 0);
    return {
      recurringIncome: recurrentSum / 100,
      oneTimeIncome: oneTimeSum / 100
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderStats(startDate: Date, endDate: Date, stats: Stats): string {
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

async function main(credentials: Credentials, slackToken: string) {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 6 * 24 * 3600 * 1000);
  const stats = await getStats(credentials, startDate, endDate);
  const msg =
    stats != null
      ? renderStats(startDate, endDate, stats)
      : "Aktuální statistiky darů se nepodařilo zjistit, zoul bude vědět víc.";
  slack.chat.postMessage({
    token: slackToken,
    channel: "#spolek",
    text: msg
  });
}

function envOrDie(key: string): string {
  const val = process.env[key];
  if (val == null) {
    throw `Please define the ${key} env variable.`;
  }
  return val;
}

const slackToken = envOrDie("SLACK_TOKEN");
const credentials: Credentials = {
  apiId: envOrDie("DARUJME_ID"),
  apiSecret: envOrDie("DARUJME_SECRET")
};

main(credentials, slackToken);
