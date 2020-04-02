import { Credentials, getTransactions } from "./darujme";
import { Stats, renderStats, calculateStats } from "./stats";
import * as slack from "slack";

async function downloadStats(
  credentials: Credentials,
  startDate: Date,
  endDate: Date
): Promise<Stats | null> {
  try {
    const txs = await getTransactions(credentials, startDate, endDate);
    return calculateStats(txs);
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function main(credentials: Credentials, slackToken: string) {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 6 * 24 * 3600 * 1000);
  const stats = await downloadStats(credentials, startDate, endDate);
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
