import { createServerFn } from "@tanstack/react-start";

const baseURL = process.env.API_URL || "http://localhost:5000";

export const getTanks = createServerFn().handler(async () => {
  // This runs only on the server
  try {
    const res = await fetch(baseURL + `/api/tanks`);
    if (!res.ok) {
      console.warn(`HTTP error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.log(`Error loading /api/tanks: ${error}`);
    return [];
  }
});
