// https://www.darujme.cz/doc/api/v1/index.html

export interface TransactionResponse {
  transactions: Transaction[];
}

export interface Transaction {
  transactionId: number;
  state: string;
  sentAmount: Amount;
  outgoingAmount: Amount;
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
