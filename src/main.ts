import { Credentials, getTransactions } from "./darujme";
import * as slack from "slack";

async function main(credentials: Credentials, slackToken: string) {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 6 * 24 * 3600 * 1000);
  const fmtd = new Intl.DateTimeFormat("cs-CZ").format;
  const fmtc = new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format;
  const txs = await getTransactions(credentials, startDate, endDate);
  const recurrentSum =
    txs
      .filter(t => t.pledge.isRecurrent)
      .map(t => t.sentAmount.cents)
      .reduce((a, b) => a + b, 0) / 100;
  const oneTimeSum =
    txs
      .filter(t => !t.pledge.isRecurrent)
      .map(t => t.sentAmount.cents)
      .reduce((a, b) => a + b, 0) / 100;
  const total = recurrentSum + oneTimeSum;
  const text = `
  Za týden od ${fmtd(startDate)} do ${fmtd(endDate)} nám čtenáři poslali
  celkem ${fmtc(total)}, z toho ${fmtc(recurrentSum)} dělají opakované dary
  a ${fmtc(oneTimeSum)} dary jednorázové. 🎉
  `
    .replace(/\n\s*/g, " ")
    .trim();
  slack.chat.postMessage({
    token: slackToken,
    channel: "#spolek",
    text: text
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
