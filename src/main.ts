import { getGiftReport } from "./darujme";
import { writeFileSync } from "fs";

function envOrDie(key: string): string {
  const val = process.env[key];
  if (val == null) {
    throw `Please define the ${key} env variable.`;
  }
  return val;
}

async function main() {
  const apiId = envOrDie("DARUJME_ID");
  const apiSecret = envOrDie("DARUJME_SECRET");
  const oneMonthBack = 30;
  const report = await getGiftReport(apiId, apiSecret, oneMonthBack);
  writeFileSync("dary.json", JSON.stringify(report, null, 2));
}

main().catch((e) => console.error(e));
