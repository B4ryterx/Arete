// testK2.ts
import { askK2Think } from "./lib/k2";

async function testK2Olympiad() {
  const messages = [
    {
      role: "system" as const,
      content: `
You are K2-Think, a world-class Olympiad coach.
Output ONLY complete Olympiad problems as a clean numbssered list.
Never output commentary, notes, or categories.
Each problem must be a full contest-style statement, self-contained and rigorous.
`
    },
    {
      role: "user" as const,
      content: `
Generate exactly 5 Olympiad math problems (medium difficulty).
Rules:
- Output ONLY complete problem statements as a numbered list (1., 2., 3., ...).
- Each problem must be fully self-contained, rigorous, and solvable.
- Do not output categories, outlines, or commentary.
Return exactly 5 problems.
`
    }
  ];

  const reply = await askK2Think(messages);
  console.log("🔎 Raw K2 reply:\n", reply);
}

testK2Olympiad();