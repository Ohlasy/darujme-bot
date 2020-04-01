import { Transaction } from "./darujme";
import axios from "axios";
import * as slack from "slack";

interface Credentials {
  apiId: string;
  apiSecret: string;
}

async function call<T>(
  credentials: Credentials,
  path: string,
  params: { [key: string]: string } = {},
  extract: (data: any) => T = (d: any) => d
): Promise<T> {
  const baseUrl = "https://www.darujme.cz/api/v1/organization/1200499";
  const endpoint = baseUrl + "/" + path;
  const response = await axios.get(endpoint, {
    params: {
      ...credentials,
      ...params
    }
  });
  return extract(response.data);
}

async function getTransactions(
  credentials: Credentials,
  fromDate: Date,
  toDate: Date
): Promise<Transaction[]> {
  return call(
    credentials,
    "transactions-by-filter",
    {
      fromReceivedDate: formatDate(fromDate),
      toReceivedDate: formatDate(toDate)
    },
    data => data.transactions
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fmt = (x: number) => x.toString().padStart(2, "0");
  return [year, month, day].map(fmt).join("-");
}

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
