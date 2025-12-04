import { createServerFn } from "@tanstack/react-start";

const test = process.env.DB_TEST || "--";

export const getTanks = createServerFn().handler(async () => {
  // This runs only on the server
  console.log(test);
  return new Date().toISOString();
});
