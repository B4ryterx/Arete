// src/testModels.ts
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });  // load your Vite env file

async function listModels() {
  const apiKey = process.env.VITE_CEREBRAS_API_KEY;
  if (!apiKey) {
    console.error("❌ Missing VITE_CEREBRAS_API_KEY");
    return;
  }

  const res = await fetch("https://api.cerebras.ai/v1/models", {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();
  console.log("=== Available Models ===");
  data.data.forEach((m: any) => {
    console.log(m.id);
  });
}

listModels().catch(console.error);