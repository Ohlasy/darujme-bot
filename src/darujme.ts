import axios from "axios";

export interface Credentials {
  apiId: string;
  apiSecret: string;
}

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

export async function getTransactions(
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

/** Format date to a string used in the Darujme API (YYYY-MM-dd) */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fmt = (x: number) => x.toString().padStart(2, "0");
  return [year, month, day].map(fmt).join("-");
}
