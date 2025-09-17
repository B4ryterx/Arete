import React, { useState, useEffect, useMemo } from 'react';
import { generateOlympiadProblemsViaK2, generateOlympiadProblemsContinue, askK2Think } from "../lib/k2";
import katex from 'katex';
import 'katex/dist/katex.min.css';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { 
  Trophy, Clock, Target, Zap, ChevronLeft, CheckCircle, Code, Calculator, 
  BookOpen, Users, User, Plus, Upload, Search, Sparkles, Play, Timer,
  Monitor, ExternalLink, Copy, Send, FileText, Download, Settings, Cpu, Loader2, HelpCircle, Lightbulb
} from 'lucide-react';

interface OlympiadModeProps {
  onNavigate: (screen: string) => void;
}


// Component to display the full solution as formatted text
const FullSolutionDisplay: React.FC<{ solution: string }> = ({ solution }) => {
  return (
    <div 
      className="text-gray-300 prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ 
        __html: solution
          .replace(/\n/g, '<br>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="text-blue-300">$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 py-0.5 rounded text-green-300">$1</code>')
      }}
    />
  );
};

type OlympiadType = 'coding' | 'math' | 'text';
type PracticeMode = 'individual' | 'group';
type CodingEnvironment = 'builtin' | 'external';
type ProblemStyle = 'pure' | 'clarified';
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  progress: number;
  score: number;
  status: 'waiting' | 'active' | 'completed';
}

interface FetchedQuestion {
  id: number;
  question: string;
  type: OlympiadType;
  difficulty?: string;
}

interface K2Result {
  ok: boolean;
  content: string;
  items?: string[];
  error?: string;
}

export function OlympiadMode({ onNavigate }: OlympiadModeProps) {
  const [currentView, setCurrentView] = useState<'type-selection' | 'setup' | 'group-setup' | 'problem-sources' | 'session' | 'results'>('type-selection');
  const [selectedType, setSelectedType] = useState<OlympiadType | null>(null);
  const [olympiadName, setOlympiadName] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('individual');
  const [codingEnvironment, setCodingEnvironment] = useState<CodingEnvironment>('builtin');
  const [problemStyle, setProblemStyle] = useState<ProblemStyle>('pure');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medium');
  const [groupName, setGroupName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [searchPastQuestions, setSearchPastQuestions] = useState(false);
  const [generateNewProblems, setGenerateNewProblems] = useState(true);
  const [uploadResources, setUploadResources] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [clarifications, setClarifications] = useState<string[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [grading, setGrading] = useState<Record<number, { status: "pending" | "correct" | "incorrect" | "error"; feedback?: string }>>({});
  const [hints, setHints] = useState<Record<number, string>>({});
  const [solutions, setSolutions] = useState<Record<number, string>>({});
  const [fullSolutions, setFullSolutions] = useState<Record<number, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [scores, setScores] = useState<Record<number, number>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [externalIDEConnected, setExternalIDEConnected] = useState(false);
  const [externalIDEName, setExternalIDEName] = useState<string>("");
  const [codeRunOutput, setCodeRunOutput] = useState<string>("");
  const [busyAction, setBusyAction] = useState<"hint" | "solution" | "full-solution" | "grade" | "run" | "connect" | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("javascript");

  // Mock group members
  const mockGroupMembers: GroupMember[] = [
    { id: '1', name: 'Alex Johnson', email: 'alex@school.edu', progress: 60, score: 240, status: 'active' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@school.edu', progress: 80, score: 320, status: 'active' },
    { id: '3', name: 'Mike Rodriguez', email: 'mike@school.edu', progress: 40, score: 160, status: 'active' },
  ];

  // Enhanced completeness detection for different question types
  function checkProblemCompleteness(problem: string): boolean {
    if (!problem || problem.trim().length < 50) return false;
    
    const trimmed = problem.trim();
    
    // Check for minimum length threshold
    if (trimmed.length < 100) return false;
    
    // Check for proper ending punctuation
    const hasProperEnding = /[.!?]$/.test(trimmed);
    
    // Check for question indicators
    const hasQuestionIndicators = /(find|prove|determine|calculate|show|solve|compute|evaluate|construct|demonstrate|what|how|why|which|when|where|explain|describe|analyze|compare|contrast)[^.!?]*$/i.test(trimmed);
    
    // Check for mathematical completeness (for math problems)
    const hasMathCompleteness = /(?:prove|show|find|determine|calculate|solve|evaluate|construct|demonstrate).*?(?:given|let|suppose|assume|if|when|where|such that|for all|there exists|for some)/i.test(trimmed);
    
    // Check for coding problem completeness
    const hasCodingCompleteness = /(?:implement|write|create|design|develop|build|code|program).*?(?:function|class|method|algorithm|solution|approach)/i.test(trimmed);
    
    // Check for text/essay completeness
    const hasTextCompleteness = /(?:analyze|discuss|explain|describe|compare|contrast|evaluate|critique|examine|explore|investigate|argue|defend|support|refute).*?(?:text|passage|article|excerpt|work|piece|document)/i.test(trimmed);
    
    // Check for multiple sentences (indicates more complete thought)
    const hasMultipleSentences = (trimmed.match(/[.!?]/g) || []).length >= 2;
    
    // Check for specific problem structure indicators
    const hasProblemStructure = /(?:problem|question|task|challenge|exercise|assignment).*?(?:solution|answer|result|conclusion)/i.test(trimmed);
    
    // Very long problems are likely complete even without perfect structure
    const isVeryLong = trimmed.length > 500;
    
    // Determine completeness based on multiple criteria
    const basicCompleteness = hasProperEnding || hasQuestionIndicators || isVeryLong;
    const advancedCompleteness = hasMathCompleteness || hasCodingCompleteness || hasTextCompleteness || hasMultipleSentences || hasProblemStructure;
    
    const isComplete = basicCompleteness && (advancedCompleteness || trimmed.length > 200);
    
    console.log(`Problem completeness check:`, {
      length: trimmed.length,
      hasProperEnding,
      hasQuestionIndicators,
      hasMathCompleteness,
      hasCodingCompleteness,
      hasTextCompleteness,
      hasMultipleSentences,
      hasProblemStructure,
      isVeryLong,
      isComplete,
      preview: trimmed.substring(0, 100) + "..."
    });
    
    return isComplete;
  }

  // Parse numbered or bulleted blocks from a plain text response
  function parseBlocks(text: string): { problems: string[], clarifications: string[] } {
    if (!text) return { problems: [], clarifications: [] };
    
    console.log("Raw text length:", text.length);
    console.log("Raw text preview:", text.substring(0, 500));
    
    // Prefer explicit markers if present
    const startIdx = text.indexOf('<<<PROBLEMS>>>');
    const endIdx = text.indexOf('<<<END>>>');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      text = text.slice(startIdx + '<<<PROBLEMS>>>'.length, endIdx);
      console.log("Extracted content between markers:", text);
    }
    
    const cleaned = text.trim();
    const problems: string[] = [];
    const clarifications: string[] = [];
    
    // More robust parsing - try multiple approaches
    // First try: numbered list with any format
    const numberedRegex = /(?:^|\n)\s*(\d+[\.\)]\s+)([\s\S]*?)(?=(?:^|\n)\s*\d+[\.\)]\s+|$)/gm;
    let match;
    while ((match = numberedRegex.exec(cleaned)) !== null) {
      const item = (match[2] || "").trim();
      console.log("Found numbered item length:", item.length);
      console.log("Found numbered item:", item.substring(0, 200) + "...");
      
      if (item.length > 0) {
        const clarificationMatch = item.match(/^(.*?)\n\s*Clarification:\s*(.*)$/s);
        if (clarificationMatch) {
          problems.push(clarificationMatch[1].trim());
          clarifications.push(clarificationMatch[2].trim());
        } else {
          problems.push(item);
          clarifications.push('');
        }
      }
    }
    
    // If no numbered items found, try bullet points
    if (problems.length === 0) {
      const bulletRegex = /(?:^|\n)\s*[-*]\s+([\s\S]*?)(?=(?:^|\n)\s*[-*]\s+|$)/gm;
      while ((match = bulletRegex.exec(cleaned)) !== null) {
        const item = (match[1] || "").trim();
        console.log("Found bullet item:", item.substring(0, 100) + "...");
        if (item.length > 0) {
          const clarificationMatch = item.match(/^(.*?)\n\s*Clarification:\s*(.*)$/s);
          if (clarificationMatch) {
            problems.push(clarificationMatch[1].trim());
            clarifications.push(clarificationMatch[2].trim());
          } else {
            problems.push(item);
            clarifications.push('');
          }
        }
      }
    }
    
    // Final fallback: split by double newlines
    if (problems.length === 0) {
      console.log("Using paragraph fallback");
      const paragraphs = cleaned
        .split(/\n{2,}/)
        .map((c) => c.trim())
        .filter((c) => c && c.length > 0);
      
      console.log("Found paragraphs:", paragraphs.length);
      paragraphs.forEach((para, index) => {
        console.log(`Paragraph ${index + 1}:`, para.substring(0, 100) + "...");
        const clarificationMatch = para.match(/^(.*?)\n\s*Clarification:\s*(.*)$/s);
        if (clarificationMatch) {
          problems.push(clarificationMatch[1].trim());
          clarifications.push(clarificationMatch[2].trim());
        } else {
          problems.push(para);
          clarifications.push('');
        }
      });
    }
    
    console.log("Final problems count:", problems.length);
    console.log("Final problems:", problems.map(p => p.substring(0, 50) + "..."));
    
    // Check for incomplete problems and sort them so complete ones come first
    const problemsWithCompleteness = problems.map((problem, index) => {
      // Enhanced completeness detection
      const isComplete = checkProblemCompleteness(problem);
      
      return {
        problem: isComplete ? problem : problem + " [Note: This problem may be incomplete due to generation limits]",
        isComplete,
        originalIndex: index
      };
    });
    
    // Sort so complete problems come first, incomplete ones last
    const sortedProblems = problemsWithCompleteness.sort((a, b) => {
      if (a.isComplete && !b.isComplete) return -1;
      if (!a.isComplete && b.isComplete) return 1;
      return a.originalIndex - b.originalIndex; // Maintain original order within same completeness level
    });
    
    // Extract the sorted problems and clarifications
    const completedProblems = sortedProblems.map(item => item.problem);
    const sortedClarifications = sortedProblems.map(item => clarifications[item.originalIndex] || '');
    
    console.log("Question ordering - Complete first:", sortedProblems.map((item, index) => 
      `Q${index + 1}: ${item.isComplete ? '✅ Complete' : '⚠️ Incomplete'} (orig: ${item.originalIndex + 1})`
    ));
    
    const completeCount = sortedProblems.filter(item => item.isComplete).length;
    const incompleteCount = sortedProblems.length - completeCount;
    console.log(`Final ordering: ${completeCount} complete questions first, ${incompleteCount} incomplete questions last`);
    
    return { problems: completedProblems, clarifications: sortedClarifications };
  }

  // K2 call helper
  async function callAskK2(
    messages: Array<{ role: "system" | "user"; content: string }>
  ): Promise<K2Result> {
    try {
      const reply = await askK2Think(messages);
      return { ok: true, content: reply };
    } catch (e: any) {
      return { ok: false, content: "", error: String(e?.message || e) };
    }
  }

  // AI-powered hint generation
  const requestHint = async () => {
    if (!questions[currentQuestion]) return;
    setBusyAction("hint");
    const result = await callAskK2([
      { role: "system", content: "You are K2-Think, a world-class Olympiad coach. Provide a minimal hint without spoiling the solution." },
      { role: "user", content: `Give a helpful hint for this ${selectedType} problem:\n${questions[currentQuestion]}` }
    ]);
    if (result.ok) {
      setHints(prev => ({ ...prev, [currentQuestion]: result.content }));
    }
    setBusyAction(null);
  };

  // AI-powered solution generation
  const requestSolution = async () => {
    if (!questions[currentQuestion]) return;
    setBusyAction("solution");
    const result = await callAskK2([
      { 
        role: "system", 
        content: "You are K2-Think, a world-class Olympiad coach. Provide a complete step-by-step solution using proper LaTeX mathematical notation. Use $inline math$ and $$display math$$ for all mathematical expressions. Be thorough and show all steps clearly." 
      },
      { 
        role: "user", 
        content: `Give the complete solution for this ${selectedType} problem:\n${questions[currentQuestion]}\n\nProvide a detailed step-by-step solution with proper mathematical formatting using LaTeX notation.` 
      }
    ]);
    if (result.ok) {
      setSolutions(prev => ({ ...prev, [currentQuestion]: result.content }));
    }
    setBusyAction(null);
  };

  // AI-powered full solution generation - continuation of existing solution
  const requestFullSolution = async () => {
    if (!questions[currentQuestion]) return;
    setBusyAction("full-solution");
    
    // Get the existing solution to continue from
    const existingSolution = solutions[currentQuestion] || '';
    
    const result = await callAskK2([
      { 
        role: "system", 
        content: `You are K2, a world-class Olympiad coach. Continue and complete the solution that was already started.

The user has already seen a partial solution. Your job is to:
1. **Continue from where it left off** - Don't repeat what's already shown
2. **Complete the solution** - Finish all remaining steps
3. **Add missing details** - Fill in any gaps or skipped steps
4. **Provide the final answer** - Give a clear, boxed final result
5. **Add verification** - Show that the solution is correct

Use proper mathematical notation with LaTeX formatting. Be thorough and complete the working.` 
      },
      { 
        role: "user", 
        content: `Continue and complete this ${selectedType} olympiad problem solution:

**Problem:** ${questions[currentQuestion]}

**Existing Solution (continue from here):**
${existingSolution}

**Your Task:** Continue from where the solution left off and complete it with all remaining steps, final answer, and verification.` 
      }
    ]);
    if (result.ok) {
      setFullSolutions(prev => ({ ...prev, [currentQuestion]: result.content }));
    }
    setBusyAction(null);
  };

  // Code execution for built-in IDE
  const runCode = async () => {
    if (!answers[currentQuestion]?.trim()) {
      setCodeRunOutput("Please write some code before running.");
      return;
    }

    setBusyAction("run");
    setCodeRunOutput("Running code...");

    try {
      // For now, we'll use a simple approach - in a real implementation, 
      // you'd want to use a proper code execution service or sandbox
      const code = answers[currentQuestion];
      
      // Basic syntax validation
      if (code.includes('console.log') || code.includes('print')) {
        // Simulate code execution with AI analysis
        const result = await callAskK2([
          { 
            role: "system", 
            content: "You are a code execution assistant. Analyze the provided code and simulate its execution. Provide the expected output and any errors. Be helpful and educational." 
          },
          { 
            role: "user", 
            content: `Please analyze and simulate the execution of this ${selectedLanguage} code:\n\n\`\`\`${selectedLanguage}\n${code}\n\`\`\`\n\nProvide the expected output and any potential issues.` 
          }
        ]);
        
        if (result.ok) {
          setCodeRunOutput(result.content);
        } else {
          setCodeRunOutput(`Error: ${result.error || "Code execution failed"}`);
        }
      } else {
        setCodeRunOutput("Code appears to be valid. In a full implementation, this would execute in a secure sandbox environment.\n\nNote: This is a demo environment. For production use, integrate with a proper code execution service.");
      }
    } catch (error) {
      setCodeRunOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setBusyAction(null);
    }
  };

  // AI-powered grading with scoring
  const checkAnswer = async () => {
    if (!questions[currentQuestion] || !answers[currentQuestion]?.trim()) {
      setGrading(prev => ({ 
        ...prev, 
        [currentQuestion]: { 
          status: "error", 
          feedback: "Please provide an answer before checking." 
        } 
      }));
      return;
    }

    setBusyAction("grade");
    setGrading(prev => ({ ...prev, [currentQuestion]: { status: "pending" } }));
    
    const result = await callAskK2([
      { role: "system", content: "You are K2-Think, a world-class Olympiad coach. Grade the answer and provide detailed feedback. Be strict but fair in your assessment." },
      { role: "user", content: `Problem: ${questions[currentQuestion]}\nAnswer: ${answers[currentQuestion]}\n\nGrade this answer and provide detailed feedback. Consider correctness, methodology, and completeness.` }
    ]);
    
    if (result.ok) {
      const content = result.content.toLowerCase();
      const isCorrect = (content.includes("correct") || content.includes("right") || content.includes("accurate")) && 
                       !content.includes("incorrect") && !content.includes("wrong") && !content.includes("error");
      
      const points = isCorrect ? getQuestionPoints(currentQuestion) : 0;
      
      setGrading(prev => ({ 
        ...prev, 
        [currentQuestion]: { 
          status: isCorrect ? "correct" : "incorrect", 
          feedback: result.content 
        } 
      }));

      // Update scores and completion status
      if (isCorrect) {
        setScores(prev => ({ ...prev, [currentQuestion]: points }));
        setCompletedQuestions(prev => new Set([...prev, currentQuestion]));
        setTotalScore(prev => prev + points);
      }
    } else {
      setGrading(prev => ({ 
        ...prev, 
        [currentQuestion]: { 
          status: "error", 
          feedback: result.error || "Grading failed" 
        } 
      }));
    }
    setBusyAction(null);
  };

  // Calculate points based on difficulty and question number
  const getQuestionPoints = (questionIndex: number) => {
    const basePoints = {
      easy: 10,
      medium: 20,
      hard: 30
    };
    return basePoints[difficultyLevel] + (questionIndex * 5); // Bonus for later questions
  };

  // Mathematical rendering function
  const renderMath = (text: string) => {
    if (!text) return '';
    
    try {
      // Handle both inline $...$ and block $$...$$ math
      return text
        .replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
          try {
            return katex.renderToString(expr.trim(), { 
              displayMode: true, 
              throwOnError: false,
              strict: false
            });
          } catch (e) {
            return `<div class="math-error">$$${expr}$$</div>`;
          }
        })
        .replace(/\$([^$\n]+?)\$/g, (_, expr) => {
          try {
            return katex.renderToString(expr.trim(), { 
              displayMode: false, 
              throwOnError: false,
              strict: false
            });
          } catch (e) {
            return `<span class="math-error">$${expr}$</span>`;
          }
        });
    } catch (e) {
      return text;
    }
  };

  // Timer effect for session
  useEffect(() => {
    if (sessionStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && sessionStarted) {
      setCurrentView('results');
    }
  }, [timeLeft, sessionStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTypeSelection = (type: OlympiadType) => {
    setSelectedType(type);
    setCurrentView('setup');
  };

  const handleSetupComplete = () => {
    if (practiceMode === 'group') {
      setCurrentView('group-setup');
    } else {
      setCurrentView('problem-sources');
    }
  };

  const handleGroupSetupComplete = () => {
    // Mock adding group members
    setGroupMembers(mockGroupMembers);
    setCurrentView('problem-sources');
  };

  const startOlympiadSession = async () => {
    if (!selectedType) return;
    setErrorMessage("");
    setLoadingProblems(true);
    setQuestions([]);
    setClarifications([]);
    setSessionStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setHints({});
    setSolutions({});
    setGrading({});
    setCompletedQuestions(new Set());
    setScores({});
    setTotalScore(0);

    try {
      // Use the competition name for specific search, fallback to olympiad name or type
      // For math, automatically focus on mathematical competitions
      let searchQuery = competitionName || olympiadName || `${selectedType} Olympiad problems`;
      if (selectedType === 'math' && !competitionName) {
        searchQuery = olympiadName || 'IMO USAMO Putnam mathematical competition problems';
      }
      console.log("Searching for competition:", searchQuery);
      
      const base = await generateOlympiadProblemsViaK2({
        query: searchQuery,
        count: numberOfQuestions,
        maxResults: Math.max(6, numberOfQuestions + 2),
        problemStyle: problemStyle,
        difficulty: difficultyLevel,
      });
      console.log("K2 content:", base);
      let { problems, clarifications: baseClarifications } = parseBlocks(base);
      console.log("Parsed problems:", problems);
      console.log("Parsed clarifications:", baseClarifications);
      console.log("Problem lengths:", problems.map(p => p.length));
      
      if (problems.length < numberOfQuestions) {
        const cont = await generateOlympiadProblemsContinue({
          query: searchQuery,
          startAt: Math.max(2, problems.length + 1),
          count: Math.max(0, numberOfQuestions - problems.length),
          maxResults: Math.max(6, numberOfQuestions + 2),
          problemStyle: problemStyle,
          difficulty: difficultyLevel,
        });
        console.log("K2 continuation content:", cont);
        const { problems: contProblems, clarifications: contClarifications } = parseBlocks(cont);
        problems = [...problems, ...contProblems].slice(0, numberOfQuestions);
        baseClarifications = [...baseClarifications, ...contClarifications].slice(0, numberOfQuestions);
      }
      
      setQuestions(problems);
      setClarifications(baseClarifications);
      setCurrentView('session');
      setSessionStarted(true);
    } catch (e: any) {
      setErrorMessage(String(e?.message || e));
    } finally {
      setLoadingProblems(false);
    }
  };

  const getTypeIcon = (type: OlympiadType) => {
    switch (type) {
      case 'coding': return Code;
      case 'math': return Calculator;
      case 'text': return BookOpen;
    }
  };

  const getTypeColor = (type: OlympiadType) => {
    switch (type) {
      case 'coding': return 'from-blue-600/20 to-blue-700/20 border-blue-600/30 hover:border-blue-500/50 hover:shadow-blue-500/25';
      case 'math': return 'from-green-600/20 to-green-700/20 border-green-600/30 hover:border-green-500/50 hover:shadow-green-500/25';
      case 'text': return 'from-purple-600/20 to-purple-700/20 border-purple-600/30 hover:border-purple-500/50 hover:shadow-purple-500/25';
    }
  };

  const getTypeTextColor = (type: OlympiadType) => {
    switch (type) {
      case 'coding': return 'text-blue-400';
      case 'math': return 'text-green-400';
      case 'text': return 'text-purple-400';
    }
  };

  // Type Selection View
  if (currentView === 'type-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Choose Your Olympiad Mode
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select the type of Olympiad challenge you'd like to participate in
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(['coding', 'math', 'text'] as const).map((type) => {
              const Icon = getTypeIcon(type);
              return (
                <Card 
                  key={type}
                  className={`bg-gradient-to-br ${getTypeColor(type)} hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 transform`}
                  onClick={() => handleTypeSelection(type)}
                >
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900/50 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className={`w-8 h-8 ${getTypeTextColor(type)}`} />
                    </div>
                    <CardTitle className="capitalize">
                      {type === 'coding' && '🖥️ Coding Olympiad'}
                      {type === 'math' && '🔢 Math Olympiad'}
                      {type === 'text' && '📖 Text/Verbal Olympiad'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-300 mb-4">
                      {type === 'coding' && 'Programming challenges and algorithm problems'}
                      {type === 'math' && 'Mathematical calculations and proofs'}
                      {type === 'text' && 'Literary analysis and verbal reasoning'}
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {type === 'coding' && (
                        <>
                          <li>• Data structures & algorithms</li>
                          <li>• Code optimization</li>
                          <li>• Problem solving</li>
                        </>
                      )}
                      {type === 'math' && (
                        <>
                          <li>• Calculus & algebra</li>
                          <li>• Number theory</li>
                          <li>• Geometry & proofs</li>
                        </>
                      )}
                      {type === 'text' && (
                        <>
                          <li>• Reading comprehension</li>
                          <li>• Critical analysis</li>
                          <li>• Essay writing</li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Setup View
  if (currentView === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentView('type-selection')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            {selectedType && (
              <div className="inline-flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = getTypeIcon(selectedType);
                  return <Icon className={`w-8 h-8 ${getTypeTextColor(selectedType)}`} />;
                })()}
                <h1 className="text-3xl capitalize">{selectedType} Olympiad Setup</h1>
              </div>
            )}
            <p className="text-gray-300">Configure your Olympiad challenge</p>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
              <CardTitle>Olympiad Configuration</CardTitle>
        </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="olympiad-name">Olympiad Name</Label>
                <Input
                  id="olympiad-name"
                  placeholder="e.g., IMO Practice, ICPC Regional, Literature Analysis Challenge"
                  value={olympiadName}
                  onChange={(e) => setOlympiadName(e.target.value)}
                  className="bg-gray-700/50 border-gray-600"
                />
          </div>

              <div className="space-y-2">
                <Label htmlFor="competition-name">Specific Competition (Optional)</Label>
                <Input
                  id="competition-name"
                  placeholder={selectedType === 'math' 
                    ? "e.g., IMO 2023, USAMO, Putnam Competition, AMC 12, AIME" 
                    : selectedType === 'coding'
                    ? "e.g., ICPC World Finals, Google Code Jam, Facebook Hacker Cup"
                    : "e.g., Literature Analysis, Debate Competition, Essay Contest"
                  }
                  value={competitionName}
                  onChange={(e) => setCompetitionName(e.target.value)}
                  className="bg-gray-700/50 border-gray-600"
                />
                <p className="text-sm text-gray-400">
                  {selectedType === 'math' 
                    ? "Enter a specific math competition (IMO, USAMO, Putnam, etc.) to get authentic competition problems"
                    : "Enter a specific competition name to get questions related to that competition"
                  }
                </p>
              </div>

              <div className="space-y-4">
                <Label>Practice Mode</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPracticeMode('individual')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      practiceMode === 'individual'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Individual Practice</p>
                    <p className="text-xs text-gray-400 mt-1">Practice on your own</p>
                  </button>
                  <button
                    onClick={() => setPracticeMode('group')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      practiceMode === 'group'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Group Practice</p>
                    <p className="text-xs text-gray-400 mt-1">Compete with friends</p>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Number of Questions</Label>
                <div className="flex items-center gap-4">
                  <Input
              type="number"
                    min="1"
                    max="30"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="w-24 bg-gray-700/50 border-gray-600"
                  />
                  <span className="text-gray-400 text-sm">1-30 questions</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Difficulty Level</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setDifficultyLevel('easy')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficultyLevel === 'easy'
                        ? 'border-green-500 bg-green-500/20 text-green-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Target className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Easy</p>
                    <p className="text-xs text-gray-400 mt-1">Beginner-friendly</p>
                  </button>
                  <button
                    onClick={() => setDifficultyLevel('medium')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficultyLevel === 'medium'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Zap className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Medium</p>
                    <p className="text-xs text-gray-400 mt-1">Intermediate</p>
                  </button>
                  <button
                    onClick={() => setDifficultyLevel('hard')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficultyLevel === 'hard'
                        ? 'border-red-500 bg-red-500/20 text-red-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Hard</p>
                    <p className="text-xs text-gray-400 mt-1">Advanced</p>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Problem Style</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setProblemStyle('pure')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      problemStyle === 'pure'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Trophy className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Pure Olympiad</p>
                    <p className="text-xs text-gray-400 mt-1">Authentic IMO-style wording</p>
                  </button>
                  <button
                    onClick={() => setProblemStyle('clarified')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      problemStyle === 'clarified'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <BookOpen className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">With Clarifications</p>
                    <p className="text-xs text-gray-400 mt-1">Original + plain explanation</p>
                  </button>
                </div>
              </div>

              {selectedType === 'coding' && (
                <div className="space-y-4">
                  <Label>Coding Environment</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCodingEnvironment('builtin')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        codingEnvironment === 'builtin'
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Monitor className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">Built-in IDE</p>
                      <p className="text-xs text-gray-400 mt-1">Powered by VS Code</p>
                    </button>
                    <button
                      onClick={() => setCodingEnvironment('external')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        codingEnvironment === 'external'
                          ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <ExternalLink className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-medium">Connect External IDE</p>
                      <p className="text-xs text-gray-400 mt-1">Use your preferred IDE</p>
                    </button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleSetupComplete}
                disabled={!olympiadName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Group Setup View
  if (currentView === 'group-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentView('setup')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-4">Group Setup</h1>
            <p className="text-gray-300">Create your Olympiad group and invite members</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>Group Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="e.g., School A ICPC Team, Math Club Squad"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-gray-700/50 border-gray-600"
            />
          </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-emails">Invite Members</Label>
                  <Textarea
                    id="invite-emails"
                    placeholder="Enter email addresses separated by commas&#10;example1@school.edu, example2@school.edu"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 h-24"
            />
          </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Invites
          </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Share Code
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Group Code:</strong> OLYMP-2024-XJ9K
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Share this code for others to join your group quickly
                  </p>
                </div>
        </CardContent>
      </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Group Members ({mockGroupMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGroupMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          <Cpu className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        Ready
                      </Badge>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleGroupSetupComplete}
                  className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                  disabled={!groupName.trim()}
                >
                  Continue to Problem Sources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Problem Sources View
  if (currentView === 'problem-sources') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentView(practiceMode === 'group' ? 'group-setup' : 'setup')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-4">Problem Sources</h1>
            <p className="text-gray-300">Choose how to generate your Olympiad problems</p>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle>Problem Generation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={searchPastQuestions}
                    onCheckedChange={(checked) => setSearchPastQuestions(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="w-5 h-5 text-blue-400" />
                      <Label>Search past Olympiad questions</Label>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Find questions from previous competitions like IMO, ICPC, USACO, etc. (AI-powered search coming soon)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={generateNewProblems}
                    onCheckedChange={(checked) => setGenerateNewProblems(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <Label>Generate new problems with similar rigor</Label>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Create fresh problems matching the difficulty and style of official Olympiad competitions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={uploadResources}
                    onCheckedChange={(checked) => setUploadResources(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-5 h-5 text-green-400" />
                      <Label>Upload resources to guide problem generation</Label>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Upload PDFs, notes, or textbook chapters to create problems based on specific topics
                    </p>
                    {uploadResources && (
                      <div className="mt-3 p-4 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-gray-500 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Click to upload files or drag and drop</p>
                        <p className="text-gray-500 text-xs mt-1">PDF, DOC, TXT up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700">
                <Button
                  onClick={startOlympiadSession}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                  disabled={(!generateNewProblems && !searchPastQuestions && !uploadResources) || loadingProblems}
                >
                  {loadingProblems ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Problems...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start {olympiadName || 'Olympiad'}
                    </>
                  )}
          </Button>

                {loadingProblems && (
                  <div className="mt-4 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-400">Generating Olympiad problems...</p>
                  </div>
                )}
              </div>
        </CardContent>
      </Card>
        </div>
      </div>
    );
  }

  // Session View
  if (currentView === 'session') {
    const currentQuestionData = { question: questions[currentQuestion] || "", difficulty: 'Medium' } as const;
    const progress = questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
            <Trophy className="w-4 h-4 mr-2" />
            {olympiadName || 'Olympiad Session'}
          </Badge>
          <div className="flex items-center gap-2 text-white">
            <Timer className="w-4 h-4" />
            <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700 mb-6">
        <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Question {currentQuestion + 1} of {questions.length}
          </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-400">
                        Completed: {completedQuestions.size}/{questions.length}
                      </span>
                      <span className="text-sm font-medium text-green-400">
                        Score: {totalScore} points
                      </span>
                      {(() => {
                        const completeQuestions = questions.filter(q => !q.includes('[Note: This problem may be incomplete due to generation limits]')).length;
                        const incompleteQuestions = questions.length - completeQuestions;
                        return incompleteQuestions > 0 ? (
                          <span className="text-sm text-orange-400 flex items-center gap-1">
                            ⚠️ {incompleteQuestions} incomplete
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      difficultyLevel === 'easy' ? 'bg-green-600' :
                      difficultyLevel === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    </Badge>
                    {completedQuestions.has(currentQuestion) && (
                      <Badge className="bg-green-600">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                </div>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
              <CardContent>
                <div 
                  className="text-lg mb-6 prose prose-invert max-w-none question-content"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMath(currentQuestionData.question || (loadingProblems ? 'Loading problems…' : errorMessage || 'No questions yet'))
                  }}
                />
                
                {problemStyle === 'clarified' && clarifications[currentQuestion] && (
                  <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Clarification
                    </h4>
                    <div 
                      className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: renderMath(clarifications[currentQuestion])
                      }}
                    />
                  </div>
                )}
                
                {selectedType === 'coding' && (
                  <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400">Code Editor</span>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                          >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="typescript">TypeScript</option>
                          </select>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={runCode}
                          disabled={busyAction === "run"}
                        >
                          {busyAction === "run" ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {busyAction === "run" ? "Running..." : "Run Code"}
                        </Button>
                      </div>
          <Textarea
                        placeholder={selectedLanguage === 'python' 
                          ? "# Write your solution here..." 
                          : selectedLanguage === 'java' 
                          ? "// Write your solution here..." 
                          : selectedLanguage === 'cpp' || selectedLanguage === 'c'
                          ? "// Write your solution here..."
                          : "// Write your solution here..."
                        }
                        className="bg-transparent border-none text-green-400 font-mono min-h-[200px] resize-none"
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                      />
                    </div>
                    
                    {/* Code Output */}
                    {codeRunOutput && (
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400 text-sm">Output</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCodeRunOutput("")}
                            className="text-gray-400 hover:text-white"
                          >
                            Clear
                          </Button>
                        </div>
                        <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                          {codeRunOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'math' && (
                  <Textarea
                    placeholder="Show your work and calculations here..."
                    className="bg-gray-700/50 border-gray-600 min-h-[200px]"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                  />
                )}

                {selectedType === 'text' && (
          <Textarea
                    placeholder="Write your analysis and response here..."
                    className="bg-gray-700/50 border-gray-600 min-h-[200px]"
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                  />
                )}
              </CardContent>
            </Card>

            {/* AI Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                onClick={requestHint}
                disabled={busyAction === "hint"}
                variant="outline"
                size="sm"
              >
                {busyAction === "hint" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <HelpCircle className="w-4 h-4 mr-2" />
                )}
                {hints[currentQuestion] ? 'Hint (Shown)' : 'Get Hint'}
              </Button>
              <Button
                onClick={requestSolution}
                disabled={busyAction === "solution"}
                variant="outline"
                size="sm"
              >
                {busyAction === "solution" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                {solutions[currentQuestion] ? 'Solution (Shown)' : 'Get Solution'}
              </Button>
              {solutions[currentQuestion] && (
                <Button
                  onClick={requestFullSolution}
                  disabled={busyAction === "full-solution"}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                >
                  {busyAction === "full-solution" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  {fullSolutions[currentQuestion] ? 'Complete Solution (Shown)' : 'Complete Solution'}
                </Button>
              )}
              <Button
                onClick={checkAnswer}
                disabled={busyAction === "grade" || !answers[currentQuestion]?.trim()}
                variant="outline"
                size="sm"
                className={!answers[currentQuestion]?.trim() ? "opacity-50 cursor-not-allowed" : ""}
              >
                {busyAction === "grade" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {completedQuestions.has(currentQuestion) ? 'Completed ✓' : 'Check Answer'}
              </Button>
            </div>

            {/* Show hints, solutions, and grading results */}
            {hints[currentQuestion] && (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-300 mb-2 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Hint
                </h4>
                <p className="text-gray-300 text-sm">{hints[currentQuestion]}</p>
              </div>
            )}

            {solutions[currentQuestion] && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-green-300 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Solution
                </h4>
                <div 
                  className="text-gray-300 text-sm prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMath(solutions[currentQuestion])
                  }}
                />
              </div>
            )}

            {fullSolutions[currentQuestion] && (
              <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Complete Solution (Continuation)
                </h4>
                <div className="text-gray-300 text-sm">
                  <FullSolutionDisplay solution={fullSolutions[currentQuestion]} />
                </div>
              </div>
            )}

            {grading[currentQuestion] && (
              <div className={`mb-4 p-4 rounded-lg ${
                grading[currentQuestion].status === 'correct' ? 'bg-green-500/10 border border-green-500/20' :
                grading[currentQuestion].status === 'incorrect' ? 'bg-red-500/10 border border-red-500/20' :
                'bg-gray-500/10 border border-gray-500/20'
              }`}>
                <h4 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                  grading[currentQuestion].status === 'correct' ? 'text-green-300' :
                  grading[currentQuestion].status === 'incorrect' ? 'text-red-300' :
                  'text-gray-300'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                  {grading[currentQuestion].status === 'correct' ? 'Correct!' : 
                   grading[currentQuestion].status === 'incorrect' ? 'Incorrect' : 'Grading...'}
                </h4>
                {grading[currentQuestion].feedback && (
                  <div 
                    className="text-gray-300 text-sm prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMath(grading[currentQuestion].feedback || '')
                    }}
                  />
                )}
              </div>
            )}

          <div className="flex justify-between">
            <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                  } else {
                    setCurrentView('results');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentQuestion === questions.length - 1 ? 'Finish Olympiad' : 'Next Question'}
            </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress Tracker */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question, index) => {
                    const isCompleted = completedQuestions.has(index);
                    const hasAnswer = answers[index]?.trim();
                    const score = scores[index] || 0;
                    const isQuestionComplete = !question.includes('[Note: This problem may be incomplete due to generation limits]');
                    
                    return (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          index === currentQuestion ? 'bg-blue-500/20 border border-blue-500/50' :
                          isCompleted ? 'bg-green-500/20' : 
                          hasAnswer ? 'bg-yellow-500/20' : 'bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isCompleted ? 'bg-green-600' : 
                            hasAnswer ? 'bg-yellow-600' : 'bg-gray-600'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {isCompleted ? 'Completed' : 
                               index === currentQuestion ? 'Current' : 
                               hasAnswer ? 'Answered' : 'Pending'}
                            </span>
                            {!isQuestionComplete && (
                              <span className="text-xs text-orange-400 flex items-center gap-1">
                                ⚠️ Incomplete
                              </span>
                            )}
                          </div>
                        </div>
                        {isCompleted && (
                          <span className="text-xs font-medium text-green-400">
                            +{score}pts
                          </span>
                        )}
                      </div>
                    );
                  })}
          </div>
        </CardContent>
      </Card>

            {/* Resources */}
            {uploadResources && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">reference_material.pdf</span>
                      <Button size="sm" variant="ghost">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Members (if in group mode) */}
            {practiceMode === 'group' && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Group Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupMembers.map((member) => (
                      <div key={member.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{member.name}</span>
                          <span className="text-xs text-gray-400">{member.progress}%</span>
                        </div>
                        <Progress value={member.progress} className="h-1" />
                      </div>
                    ))}
          </div>
        </CardContent>
      </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Results View
  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Olympiad Complete!
            </h1>
            <p className="text-xl text-gray-300">
              {olympiadName || 'Your Olympiad challenge'} results
            </p>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((completedQuestions.size / questions.length) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {completedQuestions.size === questions.length ? 'A+' : 
                   completedQuestions.size >= questions.length * 0.8 ? 'A' :
                   completedQuestions.size >= questions.length * 0.6 ? 'B' :
                   completedQuestions.size >= questions.length * 0.4 ? 'C' : 'D'}
                </div>
                <div className="text-sm text-gray-400">Grade</div>
              </div>
            </div>
          </div>

          {practiceMode === 'individual' ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gray-800/50 border-gray-700 text-center">
        <CardHeader>
                  <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <CardTitle className="text-blue-400">Time Taken</CardTitle>
        </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-2">{formatTime(1800 - timeLeft)}</div>
                  <p className="text-gray-400">Total duration</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardHeader>
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <CardTitle className="text-green-400">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-2">{completedQuestions.size}/{questions.length}</div>
                  <p className="text-gray-400">Completed</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardHeader>
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <CardTitle className="text-yellow-400">Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-2">{totalScore}</div>
                  <p className="text-gray-400">Points Earned</p>
                </CardContent>
              </Card>
          </div>
          ) : (
            <Card className="bg-gray-800/50 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Group Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...groupMembers, { id: 'you', name: 'You', email: 'you@school.edu', progress: 100, score: 850, status: 'completed' as const }]
                    .sort((a, b) => b.score - a.score)
                    .map((member, index) => (
                    <div 
                      key={member.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        member.id === 'you' ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-gray-700/50'
                      }`}
                    >
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          <Cpu className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`font-medium ${member.id === 'you' ? 'text-blue-300' : 'text-white'}`}>
                          {member.name}
                        </p>
                        <p className="text-gray-400 text-sm">{member.score} points</p>
                      </div>
                      {member.id === 'you' && (
                        <Badge className="bg-blue-600 text-white">You</Badge>
                      )}
                    </div>
                  ))}
          </div>
        </CardContent>
      </Card>
          )}

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => onNavigate('leaderboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Global Leaderboard
            </Button>
            <Button
              onClick={() => setCurrentView('type-selection')}
              variant="outline"
            >
              New Olympiad
            </Button>
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="ghost"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}