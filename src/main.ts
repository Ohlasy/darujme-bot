import { getGiftReport } from "./darujme";
import { writeFileSync } from "fs";
import { queryTopArticles } from "./analytics";

function envOrDie(key: string): string {
  const val = process.env[key];
  if (val == null) {
    throw `Please define the ${key} env variable.`;
  }
  return val;
}

const toJSON = (data: any) => JSON.stringify(data, null, 2);

async function downloadDonationStats() {
  const apiId = envOrDie("DARUJME_ID");
  const apiSecret = envOrDie("DARUJME_SECRET");
  const oneYearBack = 365;
  const report = await getGiftReport(apiId, apiSecret, oneYearBack);
  writeFileSync("dary.json", toJSON(report));
}

async function downloadAnalytics() {
  const email = envOrDie("ANALYTICS_MAIL");
  const privateKey = envOrDie("ANALYTICS_KEY");
  const tops = await queryTopArticles(email, privateKey);
  writeFileSync("top-articles.json", toJSON(tops));
}

async function main() {
  await downloadAnalytics();
  await downloadDonationStats();
}

main().catch((e) => console.error(e));
