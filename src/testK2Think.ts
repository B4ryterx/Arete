import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { askK2Think } from "./lib/k2";

async function run() {
  console.log("🔗 Connecting to K2-Think...");

  const out = await askK2Think([
    { role: "system", content: "You are Arete’s K2-Think tutor. Be concise." },
    { role: "user", content: "Explain the Pythagorean theorem in 2 lines." }
  ]);

  console.log("=== Response from K2-Think ===");
  console.log(out);
}

run().catch((err) => {
  console.error("❌ Error:", err);
});