// src/lib/k2.ts
import OpenAI from "openai";

// ✅ Load env vars from Vite
const apiKey = (import.meta as any).env?.VITE_CEREBRAS_API_KEY as string | undefined;
const baseURL = (import.meta as any).env?.VITE_CEREBRAS_BASE_URL as string | undefined;
const tavilyKey = (import.meta as any)?.env?.VITE_TAVILY_API_KEY as string | undefined;
const tavilyUrl =
  ((import.meta as any)?.env?.VITE_TAVILY_BASE_URL as string | undefined) ||
  "https://api.tavily.com/search";
const k2MaxTokensEnv = Number(((import.meta as any)?.env?.VITE_K2_MAX_TOKENS as string | undefined) || "");
const k2TempEnv = Number(((import.meta as any)?.env?.VITE_K2_TEMPERATURE as string | undefined) || "");

if (!apiKey || !baseURL) {
  console.error("❌ Missing K2 API configuration. Check .env.local");
  console.error("API Key:", apiKey ? "Present" : "Missing");
  console.error("Base URL:", baseURL ? "Present" : "Missing");
  throw new Error("Missing K2 API configuration");
}

// ✅ Create K2 client
export const k2 = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true,
});

// ✅ Define the model (switched to instruct for direct answers)
export const K2_THINK = (import.meta as any).env?.VITE_K2_MODEL || "qwen-3-235b-a22b-instruct-2507";

// ✅ Main function
export async function askK2Think(
  messages: { role: "system" | "user" | "assistant"; content: any }[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  try {
    // Check if K2 client is properly configured
    if (!apiKey || !baseURL) {
      throw new Error("K2 API not configured. Missing API key or base URL.");
    }

    console.log("🔗 Making K2 API call...");
    console.log("Model:", K2_THINK);
    console.log("API Key present:", !!apiKey);
    console.log("Base URL:", baseURL);

    // Force everything into strings
    const safeMessages = messages.map((m) => {
      let contentStr = "";
      if (typeof m.content === "string") {
        contentStr = m.content;
      } else if (m.content == null) {
        contentStr = "";
      } else {
        try {
          contentStr = JSON.stringify(m.content);
        } catch (e) {
          console.warn("Could not stringify message content:", m.content, e);
          contentStr = String(m.content);
        }
      }
      return { role: m.role, content: contentStr };
    });

    console.log("📤 Sending messages to K2:", safeMessages);

    // ✅ Call K2
    const resp = await k2.chat.completions.create({
      model: K2_THINK,
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 500,
      messages: safeMessages,
    });

    console.log("📥 Received response from K2:", resp);
    const result = resp.choices[0]?.message?.content ?? "";
    console.log("✅ K2 response content:", result);
    
    return result;
  } catch (err) {
    console.error("❌ K2 API error:", err);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      stack: err.stack
    });
    return `⚠️ K2 API Error: ${err.message}`;
  }
}

// ==========================================
// High-level helper: Tavily → K2 Olympiad gen
// ==========================================
export async function generateOlympiadProblemsViaK2(params: {
  query?: string;
  count?: number;
  maxResults?: number; // Tavily results to fetch
  problemStyle?: 'pure' | 'clarified';
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<string> {
  const { query = "IMO Olympiad problems", count = 3, maxResults = 6, problemStyle = 'pure', difficulty = 'medium' } = params;

  let references = "";

  if (!tavilyKey) {
    console.warn("⚠️ VITE_TAVILY_API_KEY missing — proceeding without web refs.");
  } else {
    try {
      const tavilyRes = await fetch(tavilyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          api_key: tavilyKey, 
          query: query?.toLowerCase().includes('math') || query?.toLowerCase().includes('imo') || query?.toLowerCase().includes('usamo') || query?.toLowerCase().includes('putnam') || query?.toLowerCase().includes('amc') || query?.toLowerCase().includes('aime') || (query?.toLowerCase().includes('olympiad') && !query?.toLowerCase().includes('coding') && !query?.toLowerCase().includes('programming'))
            ? `${query} mathematical competition problems questions past years official solutions`
            : query?.toLowerCase().includes('coding') || query?.toLowerCase().includes('programming') || query?.toLowerCase().includes('icpc') || query?.toLowerCase().includes('code jam') || query?.toLowerCase().includes('hacker cup') || query?.toLowerCase().includes('usaco') || query?.toLowerCase().includes('algorithm') || query?.toLowerCase().includes('competitive programming')
            ? `${query} programming competition problems questions past years official solutions`
            : `${query} Olympiad problems questions past years official competition`,
          max_results: maxResults 
        }),
      });

      if (!tavilyRes.ok) {
        const body = await tavilyRes.text();
        console.warn("Tavily request failed:", tavilyRes.status, body);
      } else {
        const tv = await tavilyRes.json();
        const refLines: string[] = (tv?.results || [])
          .slice(0, Math.max(3, Math.min(maxResults, 8)))
          .map((r: any, i: number) => {
            const title = r?.title || `Ref ${i + 1}`;
            const url = r?.url || r?.link || "";
            const content = (r?.content || "").toString();
            const trimmed = content.length > 800 ? content.slice(0, 800) + "…" : content;
            return `- ${title}\n  ${url}\n  ${trimmed}`;
          });
        references = refLines.join("\n\n");
      }
    } catch (e) {
      console.warn("Tavily request error:", e);
    }
  }

  const difficultyDescription = {
    easy: "Beginner-friendly problems suitable for students new to Olympiad competitions. Focus on fundamental concepts with clear, straightforward solutions.",
    medium: "Intermediate problems that require solid understanding of core concepts. Moderate complexity with some creative thinking required.",
    hard: "Advanced problems for experienced competitors. High complexity requiring deep mathematical insight, creative problem-solving, and advanced techniques."
  };

  // Determine competition type based on the query
  const isMathCompetition = query?.toLowerCase().includes('math') || 
    query?.toLowerCase().includes('imo') || 
    query?.toLowerCase().includes('usamo') || 
    query?.toLowerCase().includes('putnam') || 
    query?.toLowerCase().includes('amc') || 
    query?.toLowerCase().includes('aime') ||
    (query?.toLowerCase().includes('olympiad') && !query?.toLowerCase().includes('coding') && !query?.toLowerCase().includes('programming'));

  const isCodingCompetition = query?.toLowerCase().includes('coding') || 
    query?.toLowerCase().includes('programming') || 
    query?.toLowerCase().includes('icpc') || 
    query?.toLowerCase().includes('code jam') || 
    query?.toLowerCase().includes('hacker cup') || 
    query?.toLowerCase().includes('usaco') || 
    query?.toLowerCase().includes('algorithm') ||
    query?.toLowerCase().includes('competitive programming');

  const competitionContext = isMathCompetition ? `
  COMPETITION FOCUS: Generate problems specifically for mathematical competitions like:
  - IMO (International Mathematical Olympiad)
  - USAMO (USA Mathematical Olympiad) 
  - Putnam Competition
  - AMC/AIME (American Mathematics Competitions)
  - Regional and National Math Olympiads
  - Other prestigious mathematical competitions

  PROBLEM STYLE: Use the exact style and difficulty of these competitions:
  - IMO-style: Elegant, challenging problems requiring deep mathematical insight
  - USAMO-style: Rigorous proofs and advanced problem-solving techniques
  - Putnam-style: Creative mathematical thinking and proof techniques
  - Focus on: Number Theory, Algebra, Geometry, Combinatorics, Inequalities, Functional Equations
  ` : isCodingCompetition ? `
  COMPETITION FOCUS: Generate problems specifically for coding/programming competitions like:
  - ICPC (International Collegiate Programming Contest)
  - Google Code Jam
  - Facebook Hacker Cup
  - USACO (USA Computing Olympiad)
  - Codeforces contests
  - AtCoder contests
  - LeetCode contests
  - Other competitive programming platforms

  PROBLEM STYLE: Use the exact style and difficulty of these competitions:
  - ICPC-style: Algorithmic problems with clear input/output specifications
  - Code Jam-style: Creative problem-solving with multiple test cases
  - USACO-style: Structured problems with specific algorithmic requirements
  - Focus on: Data Structures, Algorithms, Graph Theory, Dynamic Programming, Greedy, Math, Implementation
  - Include: Time/space complexity considerations, edge cases, multiple test cases
  ` : `
  OLYMPIAD FOCUS: Generate problems for ${query || 'general Olympiad'} competitions.
  `;

  const systemPrompt = problemStyle === 'pure' ? `
  You are K2-Think, a world-class Olympiad coach specializing in ${isCodingCompetition ? 'programming competitions' : 'mathematical competitions'}.
  Use these real Olympiad problems as references:
  ${references}

  ${competitionContext}

  Generate EXACTLY ${count} new competition problems at ${difficulty} difficulty level.
  Difficulty: ${difficultyDescription[difficulty]}

  ${isCodingCompetition ? `
  CRITICAL FORMATTING REQUIREMENTS FOR CODING PROBLEMS:
  - Use clear, precise problem statements with specific input/output requirements
  - Include time and space complexity constraints where relevant
  - Specify input format, output format, and constraints clearly
  - Use proper algorithmic notation and terminology
  - Include sample inputs and expected outputs
  - Use code blocks for examples: \`\`\`language\ncode\n\`\`\`
  - Focus on: Data Structures, Algorithms, Graph Theory, Dynamic Programming, Greedy, Math, Implementation
  ` : `
  CRITICAL FORMATTING REQUIREMENTS FOR MATH PROBLEMS:
  - Use proper LaTeX mathematical notation: $inline math$ and $$display math$$
  - All mathematical expressions MUST be in LaTeX format
  - Use standard mathematical symbols: \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}, etc.
  - Use proper function notation: f: \\mathbb{R} \\to \\mathbb{R}
  - Use proper set notation: \\{x \\in \\mathbb{R} : condition\\}
  - Use proper logical symbols: \\forall, \\exists, \\Rightarrow, \\Leftrightarrow, etc.
  `}

  Strict rules:
  - Self-contained and rigorous; include all assumptions and constraints.
  - Match the difficulty level specified: ${difficulty.toUpperCase()}
  - Non-trivial, competition-grade problems appropriate for the difficulty level.
  - Use competition-style problem structure: concise, formal, ${isCodingCompetition ? 'algorithmic' : 'mathematical'}
    - Each problem must be COMPLETE and self-contained - do not truncate or cut off mid-sentence
    - Each problem must end with a clear question or instruction (e.g., "Find...", "Prove...", "Determine...", "Calculate...", "Show that...", "Solve...", "Implement...", "Write...", "Design...")
    - Each problem must be a complete, solvable ${isCodingCompetition ? 'programming' : 'mathematical'} statement
    - Output only a numbered list of ${count} items, starting at '1.'; one problem per number.
    - No solutions, no hints, no extra commentary.
    - CRITICAL: Ensure each problem is fully written from start to finish with a complete question
    - IMPORTANT: Do not stop mid-sentence or mid-problem - each problem must be complete
    - MANDATORY: Every problem must end with a clear ${isCodingCompetition ? 'programming' : 'mathematical'} question or instruction
    - NEVER generate partial or incomplete problems - if you cannot complete a problem, do not include it
    - CRITICAL: Each problem must be a complete, self-contained ${isCodingCompetition ? 'programming' : 'mathematical'} statement
    - REQUIRED: Every problem must have a clear ending with a question mark or instruction
    - ESSENTIAL: Do not cut off mid-sentence - complete each problem fully before moving to the next
  - Output MUST be wrapped strictly between the markers:
  <<<PROBLEMS>>>
  1. ...
  2. ...
  ...
  <<<END>>>
  ` : `
  You are K2-Think, a world-class Olympiad coach specializing in ${isCodingCompetition ? 'programming competitions' : 'mathematical competitions'}.
  Use these real Olympiad problems as references:
  ${references}

  ${competitionContext}

  Generate EXACTLY ${count} new competition problems with clarifications at ${difficulty} difficulty level.
  Difficulty: ${difficultyDescription[difficulty]}
  IMPORTANT: You MUST provide clarifications for each problem.

  ${isCodingCompetition ? `
  CRITICAL FORMATTING REQUIREMENTS FOR CODING PROBLEMS:
  - Use clear, precise problem statements with specific input/output requirements
  - Include time and space complexity constraints where relevant
  - Specify input format, output format, and constraints clearly
  - Use proper algorithmic notation and terminology
  - Include sample inputs and expected outputs
  - Use code blocks for examples: \`\`\`language\ncode\n\`\`\`
  - Focus on: Data Structures, Algorithms, Graph Theory, Dynamic Programming, Greedy, Math, Implementation
  ` : `
  CRITICAL FORMATTING REQUIREMENTS FOR MATH PROBLEMS:
  - Use proper LaTeX mathematical notation: $inline math$ and $$display math$$
  - All mathematical expressions MUST be in LaTeX format
  - Use standard mathematical symbols: \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}, etc.
  - Use proper function notation: f: \\mathbb{R} \\to \\mathbb{R}
  - Use proper set notation: \\{x \\in \\mathbb{R} : condition\\}
  - Use proper logical symbols: \\forall, \\exists, \\Rightarrow, \\Leftrightarrow, etc.
  `}

  Strict rules:
  - Self-contained and rigorous; include all assumptions and constraints.
  - Match the difficulty level specified: ${difficulty.toUpperCase()}
  - Non-trivial, competition-grade problems appropriate for the difficulty level.
  - Use competition-style problem structure: concise, formal, ${isCodingCompetition ? 'algorithmic' : 'mathematical'}
    - Each problem must be COMPLETE and self-contained - do not truncate or cut off mid-sentence
    - Each problem must end with a clear question or instruction (e.g., "Find...", "Prove...", "Determine...", "Calculate...", "Show that...", "Solve...", "Implement...", "Write...", "Design...")
    - Each problem must be a complete, solvable ${isCodingCompetition ? 'programming' : 'mathematical'} statement
    - For each problem, provide BOTH the original competition-style statement AND a clarification.
    - Format each item EXACTLY as: "1. [Original competition problem statement]\n\nClarification: [Plain-language explanation]"
    - The clarification should explain the problem in simpler terms, what is being asked, and key concepts.
    - No solutions, no hints, no extra commentary beyond the clarification.
    - CRITICAL: Ensure each problem is fully written from start to finish with a complete question
    - IMPORTANT: Do not stop mid-sentence or mid-problem - each problem must be complete
    - MANDATORY: Every problem must end with a clear ${isCodingCompetition ? 'programming' : 'mathematical'} question or instruction
    - NEVER generate partial or incomplete problems - if you cannot complete a problem, do not include it
    - CRITICAL: Each problem must be a complete, self-contained ${isCodingCompetition ? 'programming' : 'mathematical'} statement
    - REQUIRED: Every problem must have a clear ending with a question mark or instruction
    - ESSENTIAL: Do not cut off mid-sentence - complete each problem fully before moving to the next
  - Output MUST be wrapped strictly between the markers:
  <<<PROBLEMS>>>
  1. [Problem statement]

  Clarification: [Explanation]
  2. [Problem statement]

  Clarification: [Explanation]
  ...
  <<<END>>>
  `;

  const defaultCap = 20000; // much higher default cap for complete questions
  const dynamicMaxTokens = Number.isFinite(k2MaxTokensEnv) && k2MaxTokensEnv > 0
    ? Math.min(defaultCap, k2MaxTokensEnv)
    : Math.min(defaultCap, Math.max(2000, count * 2000)); // Much higher per question
  const temperature = Number.isFinite(k2TempEnv) && k2TempEnv > 0 ? k2TempEnv : 0.3;
  const content = await askK2Think(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate problems now." },
    ],
    { maxTokens: dynamicMaxTokens, temperature }
  );

  return content || "";
}

// Request additional problems continuing numbering at startAt
export async function generateOlympiadProblemsContinue(params: {
  query?: string;
  startAt: number;
  count: number;
  maxResults?: number;
  problemStyle?: 'pure' | 'clarified';
  difficulty?: 'easy' | 'medium' | 'hard';
}): Promise<string> {
  const { query = "IMO Olympiad problems", startAt, count, maxResults = 6, problemStyle = 'pure', difficulty = 'medium' } = params;

  let references = "";
  if (tavilyKey) {
    try {
      const tavilyRes = await fetch(tavilyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          api_key: tavilyKey, 
          query: query?.toLowerCase().includes('math') || query?.toLowerCase().includes('imo') || query?.toLowerCase().includes('usamo') || query?.toLowerCase().includes('putnam') || query?.toLowerCase().includes('amc') || query?.toLowerCase().includes('aime') || (query?.toLowerCase().includes('olympiad') && !query?.toLowerCase().includes('coding') && !query?.toLowerCase().includes('programming'))
            ? `${query} mathematical competition problems questions past years official solutions`
            : query?.toLowerCase().includes('coding') || query?.toLowerCase().includes('programming') || query?.toLowerCase().includes('icpc') || query?.toLowerCase().includes('code jam') || query?.toLowerCase().includes('hacker cup') || query?.toLowerCase().includes('usaco') || query?.toLowerCase().includes('algorithm') || query?.toLowerCase().includes('competitive programming')
            ? `${query} programming competition problems questions past years official solutions`
            : `${query} Olympiad problems questions past years official competition`,
          max_results: maxResults 
        }),
      });
      if (tavilyRes.ok) {
        const tv = await tavilyRes.json();
        const refLines: string[] = (tv?.results || [])
          .slice(0, Math.max(3, Math.min(maxResults, 8)))
          .map((r: any, i: number) => {
            const title = r?.title || `Ref ${i + 1}`;
            const url = r?.url || r?.link || "";
            const content = (r?.content || "").toString();
            const trimmed = content.length > 800 ? content.slice(0, 800) + "…" : content;
            return `- ${title}\n  ${url}\n  ${trimmed}`;
          });
        references = refLines.join("\n\n");
      }
    } catch (_) {
      // ignore, proceed without refs
    }
  }

  const difficultyDescription = {
    easy: "Beginner-friendly problems suitable for students new to Olympiad competitions. Focus on fundamental concepts with clear, straightforward solutions.",
    medium: "Intermediate problems that require solid understanding of core concepts. Moderate complexity with some creative thinking required.",
    hard: "Advanced problems for experienced competitors. High complexity requiring deep mathematical insight, creative problem-solving, and advanced techniques."
  };

  // Determine competition type for continuation
  const isMathCompetition = query?.toLowerCase().includes('math') || 
    query?.toLowerCase().includes('imo') || 
    query?.toLowerCase().includes('usamo') || 
    query?.toLowerCase().includes('putnam') || 
    query?.toLowerCase().includes('amc') || 
    query?.toLowerCase().includes('aime') ||
    (query?.toLowerCase().includes('olympiad') && !query?.toLowerCase().includes('coding') && !query?.toLowerCase().includes('programming'));

  const isCodingCompetition = query?.toLowerCase().includes('coding') || 
    query?.toLowerCase().includes('programming') || 
    query?.toLowerCase().includes('icpc') || 
    query?.toLowerCase().includes('code jam') || 
    query?.toLowerCase().includes('hacker cup') || 
    query?.toLowerCase().includes('usaco') || 
    query?.toLowerCase().includes('algorithm') ||
    query?.toLowerCase().includes('competitive programming');

  const systemPrompt = problemStyle === 'pure' ? `
You are K2-Think, an Olympiad coach specializing in ${isCodingCompetition ? 'programming competitions' : 'mathematical competitions'}. Continue the previously generated list.
References (for consistency):
${references}

Continue by generating EXACTLY ${count} new Olympiad problems at ${difficulty} difficulty level.
Difficulty: ${difficultyDescription[difficulty]}

${isCodingCompetition ? `
CRITICAL FORMATTING REQUIREMENTS FOR CODING PROBLEMS:
- Use clear, precise problem statements with specific input/output requirements
- Include time and space complexity constraints where relevant
- Specify input format, output format, and constraints clearly
- Use proper algorithmic notation and terminology
- Include sample inputs and expected outputs
- Use code blocks for examples: \`\`\`language\ncode\n\`\`\`
- Focus on: Data Structures, Algorithms, Graph Theory, Dynamic Programming, Greedy, Math, Implementation
` : `
CRITICAL FORMATTING REQUIREMENTS FOR MATH PROBLEMS:
- Use proper LaTeX mathematical notation: $inline math$ and $$display math$$
- All mathematical expressions MUST be in LaTeX format
- Use standard mathematical symbols: \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}, etc.
- Use proper function notation: f: \\mathbb{R} \\to \\mathbb{R}
- Use proper set notation: \\{x \\in \\mathbb{R} : condition\\}
- Use proper logical symbols: \\forall, \\exists, \\Rightarrow, \\Leftrightarrow, etc.
`}

Strict rules:
- Start numbering at '${startAt}.' and increment by 1 for each item.
- Self-contained, rigorous, non-trivial; match the specified difficulty level.
- Match the difficulty level specified: ${difficulty.toUpperCase()}
- Use ${isCodingCompetition ? 'ICPC/Code Jam-style' : 'IMO-style'} problem structure: concise, formal, ${isCodingCompetition ? 'algorithmic' : 'mathematical'}
- Output only a numbered list of ${count} items; no solutions or commentary.
- Output MUST be wrapped strictly between the markers:
<<<PROBLEMS>>>
${startAt}. ...
${startAt + 1}. ...
...
<<<END>>>
` : `
You are K2-Think, an Olympiad coach specializing in ${isCodingCompetition ? 'programming competitions' : 'mathematical competitions'}. Continue the previously generated list.
References (for consistency):
${references}

Continue by generating EXACTLY ${count} new Olympiad problems with clarifications at ${difficulty} difficulty level.
Difficulty: ${difficultyDescription[difficulty]}
IMPORTANT: You MUST provide clarifications for each problem.

${isCodingCompetition ? `
CRITICAL FORMATTING REQUIREMENTS FOR CODING PROBLEMS:
- Use clear, precise problem statements with specific input/output requirements
- Include time and space complexity constraints where relevant
- Specify input format, output format, and constraints clearly
- Use proper algorithmic notation and terminology
- Include sample inputs and expected outputs
- Use code blocks for examples: \`\`\`language\ncode\n\`\`\`
- Focus on: Data Structures, Algorithms, Graph Theory, Dynamic Programming, Greedy, Math, Implementation
` : `
CRITICAL FORMATTING REQUIREMENTS FOR MATH PROBLEMS:
- Use proper LaTeX mathematical notation: $inline math$ and $$display math$$
- All mathematical expressions MUST be in LaTeX format
- Use standard mathematical symbols: \\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{C}, etc.
- Use proper function notation: f: \\mathbb{R} \\to \\mathbb{R}
- Use proper set notation: \\{x \\in \\mathbb{R} : condition\\}
- Use proper logical symbols: \\forall, \\exists, \\Rightarrow, \\Leftrightarrow, etc.
`}

Strict rules:
- Start numbering at '${startAt}.' and increment by 1 for each item.
- Self-contained, rigorous, non-trivial; match the specified difficulty level.
- Match the difficulty level specified: ${difficulty.toUpperCase()}
- Use ${isCodingCompetition ? 'ICPC/Code Jam-style' : 'IMO-style'} problem structure: concise, formal, ${isCodingCompetition ? 'algorithmic' : 'mathematical'}
- For each problem, provide BOTH the original Olympiad-style statement AND a clarification.
- Format each item EXACTLY as: "${startAt}. [Original Olympiad problem statement]\n\nClarification: [Plain-language explanation]"
- The clarification should explain the problem in simpler terms, what is being asked, and key concepts.
- No solutions, no hints, no extra commentary beyond the clarification.
- Output MUST be wrapped strictly between the markers:
<<<PROBLEMS>>>
${startAt}. [Problem statement]

Clarification: [Explanation]
${startAt + 1}. [Problem statement]

Clarification: [Explanation]
...
<<<END>>>
`;

  const defaultCap = 20000; // much higher default cap for complete questions
  const dynamicMaxTokens = Number.isFinite(k2MaxTokensEnv) && k2MaxTokensEnv > 0
    ? Math.min(defaultCap, k2MaxTokensEnv)
    : Math.min(defaultCap, Math.max(2000, count * 2000)); // Much higher per question
  const temperature = Number.isFinite(k2TempEnv) && k2TempEnv > 0 ? k2TempEnv : 0.3;

  const content = await askK2Think(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Continue the numbered list now." },
    ],
    { maxTokens: dynamicMaxTokens, temperature }
  );

  return content || "";
}