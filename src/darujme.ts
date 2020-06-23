import axios from "axios";

export interface TransactionResponse {
  transactions: Transaction[];
}

export interface Transaction {
  transactionId: number;
  sentAmount: Amount;
  pledge: Pledge;
}

export interface Amount {
  cents: number;
  currency: string;
}

export interface Pledge {
  pledgeId: number;
  isRecurrent: boolean;
}

export interface GiftReport {
  fromDate: Date;
  toDate: Date;
  totalTransactions: number;
  recurrentGifts: number;
  oneTimeGifts: number;
  totalGifts: number;
}

async function call<T>(
  apiId: string,
  apiSecret: string,
  path: string,
  params: { [key: string]: string } = {},
  extract: (data: any) => T = (d: any) => d
): Promise<T> {
  const baseUrl = "https://www.darujme.cz/api/v1/organization/1200499";
  const endpoint = baseUrl + "/" + path;
  const response = await axios.get(endpoint, {
    params: {
      apiId,
      apiSecret,
      ...params,
    },
  });
  return extract(response.data);
}

export async function getTransactions(
  apiId: string,
  apiSecret: string,
  fromDate: Date,
  toDate: Date
): Promise<Transaction[]> {
  return call(
    apiId,
    apiSecret,
    "transactions-by-filter",
    {
      fromReceivedDate: formatDate(fromDate),
      toReceivedDate: formatDate(toDate),
    },
    (data) => data.transactions
  );
}

export async function getGiftReport(
  apiId: string,
  apiSecret: string,
  reportingPeriodDays: number
): Promise<GiftReport> {
  const msPerDay = 1000 * 3600 * 24;
  const endDate = new Date();
  const startDate = new Date(Date.now() - reportingPeriodDays * msPerDay);
  const txs = await getTransactions(apiId, apiSecret, startDate, endDate);
  return {
    fromDate: startDate,
    toDate: endDate,
    totalTransactions: txs.length,
    recurrentGifts: getRecurrentGifts(txs),
    oneTimeGifts: getOneTimeGifts(txs),
    totalGifts: getRecurrentGifts(txs) + getOneTimeGifts(txs),
  };
}

export const getRecurrentGifts = (txs: Transaction[]) =>
  sumTransactions(txs.filter((t) => t.pledge.isRecurrent));

export const getOneTimeGifts = (txs: Transaction[]) =>
  sumTransactions(txs.filter((t) => !t.pledge.isRecurrent));

export const sumTransactions = (txs: Transaction[]) =>
  txs.map((t) => t.sentAmount.cents).reduce((a, b) => a + b, 0) / 100;

/** Format date to a string used in the Darujme API (YYYY-MM-dd) */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fmt = (x: number) => x.toString().padStart(2, "0");
  return [year, month, day].map(fmt).join("-");
}
