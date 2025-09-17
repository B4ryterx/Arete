import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
const K2_API_KEY = Deno.env.get("K2_API_KEY");
const K2_URL = "https://grpwxsxyybsgranunl.functions.supabase.co/ask-k2";

if (!TAVILY_API_KEY || !K2_API_KEY) {
  console.error("❌ Missing required API keys. Check environment variables.");
}
serve(async (req) => {
  try {
    const { query, n } = await req.json();

    // 1️⃣ Search Olympiad problems from Tavily
    if (!TAVILY_API_KEY) {
      throw new Error("Missing Tavily API key.");
    }
    const tavilyRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: query || "IMO Olympiad problems site",
        max_results: 3,
      }),
    });

    const tavilyData = await tavilyRes.json();
    let refs = "";
    if (Array.isArray(tavilyData.results)) {
      refs = tavilyData.results.map((r: any) => r.content).join("\n\n");
    } else {
      console.warn("Tavily results missing or not an array:", tavilyData);
    }

    // 2️⃣ Build K2 system prompt
    const systemPrompt = `
    You are K2-Think, a world-class Olympiad coach.
    Use these real Olympiad problems as references:
    ${refs}

    Generate exactly ${n || 3} new Olympiad problems.
    Rules:
    - Each problem must be self-contained, rigorous, non-trivial.
    - Match ≥95% similarity in depth and style to IMO/ICPC.
    - Output only a numbered list of complete problem statements.
    `;

    // 3️⃣ Call K2
    if (!K2_API_KEY) {
      throw new Error("Missing K2 API key.");
    }
    const k2Res = await fetch(K2_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${K2_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate problems now." },
        ],
      }),
    });

    const k2Data = await k2Res.json();
    console.log("🔎 Raw K2 response:", k2Data);

    // ✅ Normalize response
    const messageContent =
      k2Data.content ||
      k2Data.choices?.[0]?.message?.content ||
      k2Data.choices?.[0]?.delta?.content ||
      k2Data.output_text ||
      "";

    return new Response(
      JSON.stringify({
        content: messageContent, // 👈 always present
        raw: k2Data,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});