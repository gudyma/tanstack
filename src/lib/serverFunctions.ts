import { createServerFn } from "@tanstack/react-start";

export const getTanks = createServerFn().handler(async () => {
  // This runs only on the server
  console.log("Hello");
  return new Date().toISOString();
});
