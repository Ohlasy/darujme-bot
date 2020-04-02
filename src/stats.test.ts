import { Stats, renderStats, calculateStats } from "./stats";
import { Transaction } from "./darujme";

test("Stats rendering", () => {
  const startDate = new Date("2020-04-1");
  const endDate = new Date("2020-04-10");
  const stats: Stats = {
    recurringIncome: 1000,
    oneTimeIncome: 2500
  };
  expect(renderStats(startDate, endDate, stats)).toBe(
    "Za týden od 1. 4. 2020 do 10. 4. 2020 nám čtenáři poslali celkem 3 500 Kč, z toho 1 000 Kč dělají opakované dary a 2 500 Kč dary jednorázové. 🎉"
  );
});

test("Stats calculation", () => {
  const txs: Transaction[] = [
    {
      transactionId: 1,
      sentAmount: {
        cents: 100_00,
        currency: "CZK"
      },
      pledge: {
        pledgeId: 1,
        isRecurrent: true
      }
    },
    {
      transactionId: 2,
      sentAmount: {
        cents: 200_00,
        currency: "CZK"
      },
      pledge: {
        pledgeId: 2,
        isRecurrent: true
      }
    },
    {
      transactionId: 3,
      sentAmount: {
        cents: 300_00,
        currency: "CZK"
      },
      pledge: {
        pledgeId: 3,
        isRecurrent: false
      }
    }
  ];
  expect(calculateStats(txs)).toEqual({
    recurringIncome: 300,
    oneTimeIncome: 300
  });
});
