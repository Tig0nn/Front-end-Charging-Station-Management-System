// Test API directly
import { stationsAPI } from "./src/lib/apiServices.js";

console.log("Testing stationsAPI...");
console.log("stationsAPI:", stationsAPI);

try {
  const result = await stationsAPI.getAll();
  console.log("API result:", result);
} catch (error) {
  console.error("API error:", error);
}
