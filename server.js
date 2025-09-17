// server.js
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const K2_API_URL = "https://api.cerebras.ai/v1/chat/completions";
const K2_API_KEY = process.env.VITE_CEREBRAS_API_KEY;
const TAVILY_API_KEY = process.env.VITE_TAVILY_API_KEY;

// Unified K2 call
async function queryK2(messages) {
  if (!K2_API_KEY) {
    throw new Error("K2 API key not configured");
  }

  const response = await fetch(K2_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${K2_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "cerebras-llama-3.1-8b-instruct",
      messages: messages,
      max_tokens: 800,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`K2 API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Tavily search function
async function searchTavily(query) {
  if (!TAVILY_API_KEY) {
    return "Search not available - API key not configured";
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        search_depth: "basic",
        max_results: 3
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.map(r => r.content).join('\n\n') || "No search results found";
  } catch (error) {
    console.error("Tavily search error:", error);
    return "Search temporarily unavailable";
  }
}

app.post("/explain", async (req, res) => {
  const { mode, userExplanation, topic, context } = req.body;

  // Choose prompt template based on mode
  let systemPrompt = "";
  let userPrompt = "";

  if (mode === "feynman") {
    systemPrompt = `You are K2 in Feynman Mode.
The student will explain a concept in their own words.
Your task:
1. Do not correct immediately. Instead, produce a step-by-step reasoning log of what you understood from their explanation.
2. Identify unclear, incorrect, or missing steps and mark them.
3. Rewrite the explanation in a way a 12-year-old could understand, while preserving the student's original flow.
4. End with one short challenge question to test mastery.`;
    
    userPrompt = `Topic: ${topic || 'Unknown'}
Student explanation:
${userExplanation}

Please analyze this explanation using the Feynman Technique.`;
  } else if (mode === "analyze") {
    systemPrompt = `You are K2 in Analysis Mode.
Analyze the student's explanation and provide structured feedback.
Focus on:
- What they got right
- What needs clarification
- What might be incorrect
- Overall understanding level`;
    
    userPrompt = `Topic: ${topic || 'Unknown'}
Student explanation:
${userExplanation}

Please provide a detailed analysis of this explanation.`;
  } else if (mode === "suggestions") {
    systemPrompt = `You are K2 in Suggestions Mode.
Suggest 3-5 specific ways the student can improve their explanation.
Make suggestions practical and actionable.`;
    
    userPrompt = `Topic: ${topic || 'Unknown'}
Student explanation:
${userExplanation}

Please provide specific suggestions for improvement.`;
  } else if (mode === "simplify") {
    systemPrompt = `You are K2 in Simplification Mode.
Rewrite the student's explanation in the simplest way possible, as if for a 10-year-old.
Use analogies, simple language, and step-by-step reasoning.`;
    
    userPrompt = `Topic: ${topic || 'Unknown'}
Student explanation:
${userExplanation}

Please simplify this explanation.`;
  } else if (mode === "coding") {
    systemPrompt = `You are K2 in Coding Mode.
Solve the following coding/mathematical reasoning benchmark problem.
After solving, show:
- A clear explanation of your logic
- An optimized solution (minimal lines, efficient runtime)
- A comparison with how a larger model might overcomplicate it`;
    
    userPrompt = `Problem: ${userExplanation}
${context ? `\n\nContext:\n${context}` : ''}`;
  } else if (mode === "course") {
    systemPrompt = `You are K2 in Course Mode.
The student asks about a broad topic.
Break this into a logical learning path of 4–6 steps:
- Start with definitions and intuition
- Progress through derivation and key examples
- Show common mistakes
- End with practice problems
Make it adaptive: suggest which step the student should start with based on difficulty.`;
    
    userPrompt = `Build a course on: ${topic || userExplanation}
${context ? `\n\nResources/Context:\n${context}` : ''}`;
  } else if (mode === "olympiad") {
    systemPrompt = `You are K2 in Olympiad Mode.
Solve the following problem step by step.
After solving, briefly explain why your solution is efficient compared to larger models — highlighting clarity of reasoning over brute force.`;
    
    userPrompt = `Create Olympiad-grade problem(s) on: ${topic || 'Mathematics Olympiad'}
${context ? `\n\nContext:\n${context}` : ''}`;
  }

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ];

  try {
    console.log(`Making K2 API call for mode: ${mode}`);
    const result = await queryK2(messages);
    
    if (result.choices && result.choices[0] && result.choices[0].message) {
      res.json({
        success: true,
        content: result.choices[0].message.content,
        usage: result.usage
      });
    } else {
      throw new Error("Invalid response format from K2 API");
    }
  } catch (err) {
    console.error("K2 API error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      content: "I apologize, but I'm having trouble connecting to the AI service right now. Please check your internet connection and try again."
    });
  }
});

// Search endpoint
app.post("/search", async (req, res) => {
  const { query } = req.body;
  
  try {
    const results = await searchTavily(query);
    res.json({ success: true, content: results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      content: "Search temporarily unavailable"
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    k2_configured: !!K2_API_KEY,
    tavily_configured: !!TAVILY_API_KEY
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`K2 API configured: ${!!K2_API_KEY}`);
  console.log(`Tavily API configured: ${!!TAVILY_API_KEY}`);
});
