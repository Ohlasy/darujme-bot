import { formatDate } from "./darujme";

test("Date formatting", () => {
  expect(formatDate(new Date("2020-4-1"))).toBe("2020-04-01");
});
