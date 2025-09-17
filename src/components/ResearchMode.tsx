import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { askK2Think } from '../lib/k2'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { 
  ArrowLeft, 
  FileText, 
  Network, 
  BookOpen, 
  BarChart3,
  Brain,
  Mic,
  MicOff,
  Send,
  Search,
  Download,
  Save,
  Share,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  MessageSquare,
  Upload,
  Settings,
  BarChart,
  PieChart,
  LineChart,
  Globe,
  Link,
  Quote,
  Bookmark,
  Star,
  Eye,
  ThumbsUp,
  MessageCircle,
  Filter,
  SortAsc,
  RefreshCw,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Database,
  Layers,
  GitBranch,
  MapPin,
  Compass,
  Award,
  Loader2,
  List,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'

interface ResearchModeProps {
  onNavigate: (screen: string) => void
}

interface Message {
  id: string
  type: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface UploadedPaper {
  name: string
  content: string
  type: string
}

interface PaperAnalysis {
  title: string
  authors: string[]
  abstract: string
  keyConcepts: string[]
  methodology: string
  findings: string[]
  implications: string[]
  relatedPapers: string[]
  questions: string[]
  summary?: string
  section_breakdown?: {
    abstract?: string[]
    introduction: string[]
    methodology?: string[]
    method: string[]
    results: string[]
    discussion?: string[]
    conclusion?: string[]
  }
  key_terms?: Array<{term: string, definition: string} | string>
  argument_flow?: string
  critical_points?: string[]
  socratic_questions?: string[]
  next_steps?: string[]
}

interface LiteratureNode {
  id: string
  title: string
  authors: string[]
  year: number
  citations: number
  category: 'foundational' | 'recent' | 'emerging'
  x: number
  y: number
  connections: string[]
}

interface LiteratureMap {
  nodes: LiteratureNode[]
  connections: Array<{from: string, to: string, strength: number}>
  gaps: string[]
  trends: string[]
}

interface ThesisSection {
  id: string
  title: string
  status: 'complete' | 'in-progress' | 'planned'
  feedback: string
  suggestions: string[]
  content: string
  order: number
}

interface ThesisStructure {
  title: string
  sections: ThesisSection[]
  timeline: string[]
  milestones: string[]
}

interface DataStep {
  id: string
  title: string
  description: string
  completed: boolean
  example: string
  step: string
  status: string
}

interface DataAnalysis {
  steps: DataStep[]
  visualizations: string[]
  insights: string[]
  recommendations: string[]
}

interface PaperSection {
  id: string
  title: string
  content: string
  keyPoints: string[]
  completed: boolean
}

interface LiteratureNode {
  id: string
  title: string
  authors: string[]
  year: number
  citations: number
  category: 'foundational' | 'recent' | 'emerging'
  x: number
  y: number
  connections: string[]
}

interface ThesisSection {
  id: string
  title: string
  status: 'complete' | 'in-progress' | 'planned'
  feedback: string
  suggestions: string[]
  content: string
  order: number
}

interface DataStep {
  id: string
  title: string
  description: string
  completed: boolean
  example: string
  step: string
  status: string
}

export default function ResearchMode({ onNavigate }: ResearchModeProps) {
  const [currentMode, setCurrentMode] = useState<'dissection' | 'literature' | 'thesis' | 'analysis' | null>(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [sidebarSection, setSidebarSection] = useState('dashboard')
  const [userXP, setUserXP] = useState(2847)
  const [userLevel, setUserLevel] = useState(12)
  const [currentProject, setCurrentProject] = useState('Deep Learning in Healthcare: A Systematic Review')
  
  // AI-related state
  const [researchTopic, setResearchTopic] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingMap, setIsGeneratingMap] = useState(false)
  const [isGeneratingThesis, setIsGeneratingThesis] = useState(false)
  const [isAnalyzingData, setIsAnalyzingData] = useState(false)
  const [paperAnalysis, setPaperAnalysis] = useState<PaperAnalysis | null>(null)
  const [literatureMap, setLiteratureMap] = useState<LiteratureMap | null>(null)
  const [thesisStructure, setThesisStructure] = useState<ThesisStructure | null>(null)
  const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis | null>(null)
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [fileInputRef] = useState(useRef<HTMLInputElement>(null))
  const [dataInputRef] = useState(useRef<HTMLInputElement>(null))
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Welcome to Research Mode! I'm your K2 research assistant. I can help you dissect papers, map literature, guide your thesis, and analyze data. What would you like to explore today?",
      timestamp: new Date()
    }
  ])

  const [paperSections, setPaperSections] = useState<PaperSection[]>([
    {
      id: '1',
      title: 'Abstract & Introduction',
      content: 'This paper presents a comprehensive systematic review of deep learning applications in healthcare, focusing on diagnostic imaging and predictive analytics.',
      keyPoints: ['Systematic review methodology', 'Focus on diagnostic imaging', 'Predictive analytics applications'],
      completed: true
    },
    {
      id: '2',
      title: 'Literature Review',
      content: 'Previous studies have shown promising results in medical image analysis using CNNs and transformer architectures.',
      keyPoints: ['CNN applications', 'Transformer architectures', 'Medical image analysis'],
      completed: true
    },
    {
      id: '3',
      title: 'Methodology',
      content: 'The authors conducted a systematic search across PubMed, IEEE Xplore, and ACM Digital Library for papers published between 2018-2023.',
      keyPoints: ['Database selection criteria', 'Time range: 2018-2023', 'Systematic search protocol'],
      completed: false
    },
    {
      id: '4',
      title: 'Results & Discussion',
      content: 'Analysis of 156 papers reveals significant advancements in diagnostic accuracy and clinical workflow integration.',
      keyPoints: ['156 papers analyzed', 'Diagnostic accuracy improvements', 'Clinical workflow integration'],
      completed: false
    }
  ])

  const [literatureNodes, setLiteratureNodes] = useState<LiteratureNode[]>([
    {
      id: '1',
      title: 'Deep Learning for Medical Image Analysis',
      authors: ['Litjens, G.', 'Kooi, T.', 'Bejnordi, B.E.'],
      year: 2017,
      citations: 4521,
      category: 'foundational',
      x: 300,
      y: 200,
      connections: ['2', '3']
    },
    {
      id: '2',
      title: 'Attention U-Net: Learning Where to Look',
      authors: ['Oktay, O.', 'Schlemper, J.'],
      year: 2018,
      citations: 2103,
      category: 'recent',
      x: 500,
      y: 300,
      connections: ['1', '4']
    },
    {
      id: '3',
      title: 'Vision Transformers in Medical Imaging',
      authors: ['Chen, J.', 'Lu, Y.', 'Yu, Q.'],
      year: 2021,
      citations: 892,
      category: 'emerging',
      x: 400,
      y: 400,
      connections: ['1', '2']
    }
  ])

  const [thesisSections, setThesisSections] = useState<ThesisSection[]>([
    {
      id: '1',
      title: 'Introduction & Problem Statement',
      status: 'complete',
      feedback: 'Strong problem motivation and clear research questions.',
      suggestions: ['Consider adding more recent statistics', 'Expand on societal impact'],
      content: 'Introduction content here',
      order: 1
    },
    {
      id: '2',
      title: 'Literature Review',
      status: 'in-progress',
      feedback: 'Good coverage of foundational work. Need more recent papers.',
      suggestions: ['Add 2023-2024 publications', 'Include comparative analysis table'],
      content: 'Literature review content here',
      order: 2
    },
    {
      id: '3',
      title: 'Methodology',
      status: 'planned',
      feedback: 'Outline looks promising. Consider experimental design details.',
      suggestions: ['Define evaluation metrics', 'Add dataset descriptions', 'Include ethics considerations'],
      content: 'Methodology content here',
      order: 3
    }
  ])

  const [dataSteps, setDataSteps] = useState<DataStep[]>([
    {
      id: '1',
      title: 'Data Collection & Validation',
      description: 'Gather, clean, and validate your dataset for analysis',
      completed: true,
      example: 'Load CSV file, check for missing values, validate data types',
      step: 'Data Collection & Validation',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Exploratory Data Analysis',
      description: 'Understand distributions, correlations, and patterns',
      completed: true,
      example: 'Generate histograms, correlation matrix, summary statistics',
      step: 'Exploratory Data Analysis',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Statistical Analysis',
      description: 'Apply appropriate statistical tests and models',
      completed: false,
      example: 'T-tests, ANOVA, regression analysis, effect size calculations',
      step: 'Statistical Analysis',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Visualization & Interpretation',
      description: 'Create meaningful visualizations and interpret results',
      completed: false,
      example: 'Publication-ready plots, result interpretation, limitations discussion',
      step: 'Visualization & Interpretation',
      status: 'pending'
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // AI Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let content = ''
      const fileType = file.type

      if (fileType === 'application/pdf') {
        // For PDF files, we'll use a simple text extraction
        // In a real app, you'd use pdf-parse or similar
        content = `PDF Content: ${file.name} - This would contain the actual PDF text content extracted using pdf-parse library.`
      } else if (fileType.includes('text/')) {
        content = await file.text()
      } else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        // For Word documents
        content = `Word Document: ${file.name} - This would contain the actual document content extracted using mammoth library.`
      } else {
        content = `File: ${file.name} - Unsupported file type for text extraction.`
      }

      await analyzePaper(content)
    } catch (error) {
      console.error('File upload error:', error)
    }
  }

  const handleDataUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      let data = null
      const fileType = file.type

      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          fileType === 'application/vnd.ms-excel') {
        // Excel file
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer)
        data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any
      } else if (fileType === 'text/csv') {
        // CSV file
        const text = await file.text()
        data = Papa.parse(text, { header: true }).data
      } else {
        data = { message: `Unsupported file type: ${fileType}` } as any
      }

      setUploadedData(data)
      await analyzeData(data)
    } catch (error) {
      console.error('Data upload error:', error)
    }
  }

  const analyzePaper = async (paperContent: string) => {
    setIsAnalyzing(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, an expert research paper analyst. Your job is to dissect academic papers and present insights in a clear, structured format.

          **ANALYSIS TASKS:**
          1. **Core Summary**: Extract the main research question, methodology, and key findings in 2-3 clear paragraphs
          2. **Section Analysis**: Break down each major section (Abstract, Introduction, Methods, Results, Discussion, Conclusion) with 3-5 key points each
          3. **Key Concepts**: Identify and define 8-12 important technical terms with simple explanations
          4. **Research Flow**: Map the logical progression from problem → approach → findings → implications
          5. **Critical Assessment**: Highlight 4-6 strengths, limitations, and areas for improvement
          6. **Learning Questions**: Generate 5-6 thought-provoking questions to test understanding
          7. **Future Directions**: Suggest 3-4 related research areas or follow-up studies

          **OUTPUT FORMAT** (JSON only):
          {
            "title": "Paper title or main topic",
            "summary": "2-3 paragraph overview of the research",
            "section_breakdown": {
              "abstract": ["key point 1", "key point 2", "key point 3"],
              "introduction": ["key point 1", "key point 2", "key point 3"],
              "methodology": ["key point 1", "key point 2", "key point 3"],
              "results": ["key point 1", "key point 2", "key point 3"],
              "discussion": ["key point 1", "key point 2", "key point 3"],
              "conclusion": ["key point 1", "key point 2", "key point 3"]
            },
            "key_terms": [
              {"term": "Technical Term 1", "definition": "Simple explanation"},
              {"term": "Technical Term 2", "definition": "Simple explanation"}
            ],
            "argument_flow": "Clear explanation of how the research progresses logically",
            "critical_points": [
              "Strength: Clear methodology",
              "Limitation: Small sample size",
              "Improvement: More diverse dataset needed"
            ],
            "socratic_questions": [
              "What is the main research question being addressed?",
              "How does the methodology support the research objectives?",
              "What are the most significant findings and why?",
              "What limitations might affect the validity of results?",
              "How could this research be extended or improved?",
              "What are the practical implications of these findings?"
            ],
            "next_steps": [
              "Read related papers on [specific topic]",
              "Explore [specific methodology] applications",
              "Investigate [specific research gap]"
            ]
          }`
        },
        {
          role: "user",
          content: `Please analyze this research paper and provide a comprehensive breakdown:\n\n${paperContent}`
        }
      ])
      
      try {
        // Clean and extract JSON from response
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          setPaperAnalysis(analysis)
        } else {
          // Fallback: create structured response from text
          const lines = result.split('\n').filter(line => line.trim())
          setPaperAnalysis({
            title: lines[0] || "Research Paper Analysis",
            authors: ["Unknown Authors"],
            abstract: result.substring(0, 200) + "...",
            keyConcepts: ["Key Concept 1", "Key Concept 2"],
            methodology: "Research approach described",
            findings: ["Main findings presented"],
            implications: ["Results interpreted"],
            relatedPapers: ["Related paper 1", "Related paper 2"],
            questions: ["What is the main research question?"],
            summary: result.substring(0, 500) + "...",
            section_breakdown: {
              abstract: ["Key findings extracted from abstract"],
              introduction: ["Research problem identified", "Objectives stated"],
              methodology: ["Research approach described", "Data collection methods"],
              method: ["Research approach described", "Data collection methods"],
              results: ["Main findings presented", "Statistical significance noted"],
              discussion: ["Results interpreted", "Implications discussed"],
              conclusion: ["Key takeaways", "Future work suggested"]
            },
            key_terms: [
              {term: "Key Concept 1", definition: "Definition extracted from context"},
              {term: "Key Concept 2", definition: "Definition extracted from context"}
            ],
            argument_flow: "Research progression from problem identification to conclusions",
            critical_points: [
              "Analysis of research strengths and limitations",
              "Assessment of methodology appropriateness",
              "Evaluation of result validity"
            ],
            socratic_questions: [
              "What is the main research question?",
              "How was the research conducted?",
              "What are the key findings?",
              "What are the limitations?",
              "How could this be improved?"
            ],
            next_steps: [
              "Explore related research areas",
              "Investigate methodological improvements",
              "Consider practical applications"
            ]
          })
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        // Create a well-formatted fallback
        setPaperAnalysis({
          title: "Research Paper Analysis",
          authors: ["Unknown Authors"],
          abstract: result.substring(0, 200) + "...",
          keyConcepts: ["Research", "Methodology"],
          methodology: "Research approach and methods",
          findings: ["Key findings and data"],
          implications: ["Interpretation and implications"],
          relatedPapers: ["Related paper 1", "Related paper 2"],
          questions: ["What problem does this research address?"],
          summary: result,
          section_breakdown: {
            abstract: ["Summary of main findings"],
            introduction: ["Problem statement and objectives"],
            methodology: ["Research approach and methods"],
            method: ["Research approach and methods"],
            results: ["Key findings and data"],
            discussion: ["Interpretation and implications"],
            conclusion: ["Main takeaways and future work"]
          },
          key_terms: [
            {term: "Research", definition: "Systematic investigation of a subject"},
            {term: "Methodology", definition: "The approach used to conduct research"}
          ],
          argument_flow: "The research follows a logical progression from problem identification through methodology to conclusions",
          critical_points: [
            "Research addresses an important question",
            "Methodology appears appropriate for the research goals",
            "Results are clearly presented and analyzed"
          ],
          socratic_questions: [
            "What problem does this research address?",
            "How was the research conducted?",
            "What are the main findings?",
            "What are the implications of these findings?",
            "How could this research be extended?"
          ],
          next_steps: [
            "Read related papers in the field",
            "Explore similar methodologies",
            "Consider practical applications"
          ]
        })
      }
    } catch (error) {
      console.error('Paper analysis error:', error)
      // Show error message to user
      setPaperAnalysis({
        title: "Analysis Error",
        authors: [],
        abstract: "",
        keyConcepts: [],
        methodology: "",
        findings: [],
        implications: [],
        relatedPapers: [],
        questions: [],
        summary: "There was an error analyzing the paper. Please try again.",
        section_breakdown: { abstract: [], introduction: [], methodology: [], method: [], results: [], discussion: [], conclusion: [] },
        key_terms: [],
        argument_flow: "",
        critical_points: [],
        socratic_questions: [],
        next_steps: []
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateLiteratureMap = async () => {
    if (!researchTopic.trim()) return
    
    setIsGeneratingMap(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2 in **Adaptive Literature Map Mode**.
          
          Input: Research topic or question  
          [Insert topic here]  
          
          Your tasks:  
          1. **Field Overview**: Create a high-level map of the research landscape.  
          2. **Key Papers**: Identify 8-12 seminal papers, recent breakthroughs, and review articles.  
          3. **Research Gaps**: Highlight areas where more work is needed.  
          4. **Trends & Directions**: Note emerging themes, methodologies, or technologies.  
          5. **Personalized Path**: Suggest a reading order based on the student's background.  
          
          ⚡ Output format: JSON with fields:
          {
            "nodes": [{"id": "...", "title": "...", "authors": [...], "year": 2023, "connections": [...], "relevance": 0.9, "category": "..."}],
            "connections": [{"from": "...", "to": "...", "strength": 0.8}],
            "gaps": [...],
            "trends": [...]
          }`
        },
        {
          role: "user",
          content: `Generate a literature map for: ${researchTopic}`
        }
      ])
      
      try {
        const map = JSON.parse(result)
        setLiteratureMap(map)
      } catch (parseError) {
        setLiteratureMap({
          nodes: [],
          connections: [],
          gaps: [],
          trends: []
        })
      }
    } catch (error) {
      console.error('Literature map generation error:', error)
    } finally {
      setIsGeneratingMap(false)
    }
  }

  const generateThesisStructure = async () => {
    if (!researchTopic.trim()) return
    
    setIsGeneratingThesis(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2 in **Thesis / Capstone Mentor Mode**.
          
          Input: Research topic, thesis type, and student background  
          [Insert details here]  
          
          Your tasks:  
          1. **Structure Planning**: Create a detailed outline with chapters, sections, and subsections.  
          2. **Timeline & Milestones**: Break down the work into manageable phases with deadlines.  
          3. **Writing Guidance**: Provide specific advice for each section (e.g., "Start your literature review with a broad overview, then narrow down to your specific research gap").  
          4. **Feedback Framework**: Offer a rubric for self-assessment and peer review.  
          5. **Resource Recommendations**: Suggest tools, databases, and writing resources.  
          
          ⚡ Output format: JSON with fields:
          {
            "title": "...",
            "sections": [{"title": "...", "content": "...", "order": 1, "status": "pending", "notes": [...]}],
            "timeline": [...],
            "milestones": [...]
          }`
        },
        {
          role: "user",
          content: `Generate a thesis structure for: ${researchTopic}`
        }
      ])
      
      try {
        const structure = JSON.parse(result)
        setThesisStructure(structure)
      } catch (parseError) {
        setThesisStructure({
          title: researchTopic,
          sections: [],
          timeline: [],
          milestones: []
        })
      }
    } catch (error) {
      console.error('Thesis structure generation error:', error)
    } finally {
      setIsGeneratingThesis(false)
    }
  }

  const analyzeData = async (data: any) => {
    setIsAnalyzingData(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2 in **Real-world Data / Experiment Integration Mode**.
          
          Input: Dataset (CSV, Excel, or JSON) and research context  
          [Insert data here]  
          
          Your tasks:  
          1. **Data Exploration**: Provide summary statistics, identify patterns, and suggest visualizations.  
          2. **Statistical Analysis**: Recommend appropriate tests, models, or techniques.  
          3. **Interpretation**: Help explain results in the context of the research question.  
          4. **Visualization Suggestions**: Recommend charts, graphs, or plots that best represent the data.  
          5. **Next Steps**: Suggest follow-up analyses or data collection.  
          
          ⚡ Output format: JSON with fields:
          {
            "steps": [{"step": "...", "description": "...", "status": "pending", "result": "..."}],
            "visualizations": [...],
            "insights": [...],
            "recommendations": [...]
          }`
        },
        {
          role: "user",
          content: `Analyze this data:\n\n${JSON.stringify(data, null, 2)}`
        }
      ])
      
      try {
        const analysis = JSON.parse(result)
        setDataAnalysis(analysis)
      } catch (parseError) {
        setDataAnalysis({
          steps: [],
          visualizations: [],
          insights: [],
          recommendations: []
        })
      }
    } catch (error) {
      console.error('Data analysis error:', error)
    } finally {
      setIsAnalyzingData(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setCurrentMessage('')

    try {
      const systemPrompt = getSystemPromptForMode(currentMode)
      const result = await askK2Think([
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: currentMessage
        }
      ])

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: result,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Message sending error:', error)
    }
  }

  const getSystemPromptForMode = (mode: string | null) => {
    switch (mode) {
      case 'dissection':
        return "You are K2, a research paper analysis expert. Help the user understand and dissect research papers with clear explanations, key insights, and critical analysis."
      case 'literature':
        return "You are K2, a literature mapping specialist. Help the user navigate research landscapes, identify key papers, and understand research trends and gaps."
      case 'thesis':
        return "You are K2, a thesis and academic writing mentor. Help the user structure their research, plan their writing, and provide guidance on academic writing best practices."
      case 'analysis':
        return "You are K2, a data analysis expert. Help the user analyze data, interpret results, and suggest appropriate statistical methods and visualizations."
      default:
        return "You are K2, a research assistant. Help the user with their research needs."
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (isRecording) setIsRecording(false)
  }

  const toggleRecording = () => {
    if (!isVoiceMode) return
    setIsRecording(!isRecording)
  }

  const getModeIcon = (mode: string | null) => {
    switch (mode) {
      case 'dissection': return <FileText className="w-5 h-5" />
      case 'literature': return <Network className="w-5 h-5" />
      case 'thesis': return <BookOpen className="w-5 h-5" />
      case 'analysis': return <BarChart3 className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getModeTitle = (mode: string | null) => {
    switch (mode) {
      case 'dissection': return 'Research Paper Dissection'
      case 'literature': return 'Literature Mapping'
      case 'thesis': return 'Thesis Mentor'
      case 'analysis': return 'Data Analysis'
      default: return 'Research Mode'
    }
  }

  const renderModeContent = () => {
    switch (currentMode) {
      case 'dissection':
        return (
          <div className="space-y-6">
            {/* Paper Upload Section */}
            <Card className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 backdrop-blur-xl border-indigo-500/30 rounded-2xl shadow-lg shadow-indigo-500/10">
              <CardHeader>
                <CardTitle className="text-indigo-300 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Upload Research Paper
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <span className="text-gray-300 text-sm">
                      Supported: PDF, Word, Text files
                    </span>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing paper with AI...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demo Paper Analysis */}
            {!paperAnalysis && !isAnalyzing && (
              <div className="space-y-6">
                {/* Demo Paper Card */}
                <Card className="bg-gradient-to-br from-gray-800/20 to-gray-700/20 backdrop-blur-xl border-gray-600/30 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-300 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Sample Paper Analysis
                    </CardTitle>
                    <p className="text-gray-400 text-sm">Click "Analyze Sample" to see AI-powered paper dissection in action</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                        <h3 className="text-white font-semibold mb-2">"Deep Learning Approaches for Medical Image Analysis: A Comprehensive Review"</h3>
                        <p className="text-gray-300 text-sm mb-2">Authors: Smith, J., Johnson, A., Williams, B. (2024)</p>
                        <p className="text-gray-400 text-sm">
                          This paper presents a comprehensive review of deep learning techniques applied to medical image analysis, 
                          covering convolutional neural networks, attention mechanisms, and transfer learning approaches...
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const sampleContent = `Title: Deep Learning Approaches for Medical Image Analysis: A Comprehensive Review
Authors: Smith, J., Johnson, A., Williams, B.
Abstract: This paper presents a comprehensive review of deep learning techniques applied to medical image analysis. We examine convolutional neural networks, attention mechanisms, and transfer learning approaches. Our analysis covers 150+ papers from 2020-2024, revealing significant improvements in accuracy and efficiency. Key findings include 15% average accuracy improvement with attention mechanisms and 30% reduction in training time with transfer learning.

Introduction: Medical image analysis has evolved rapidly with deep learning. Traditional methods struggled with complex patterns, but CNNs have revolutionized the field. This review examines recent advances and identifies future research directions.

Methodology: We analyzed 150+ papers from top conferences (MICCAI, ISBI, CVPR). Papers were categorized by technique, application domain, and performance metrics. Statistical analysis revealed trends in accuracy, efficiency, and clinical applicability.

Results: Attention mechanisms improved accuracy by 15% on average. Transfer learning reduced training time by 30%. Vision transformers showed 8% better performance than CNNs for certain tasks. Clinical deployment increased by 40% in 2023.

Discussion: The field is moving toward more efficient, interpretable models. Challenges remain in data privacy, model generalization, and real-time processing. Future work should focus on federated learning and edge deployment.

Conclusion: Deep learning has transformed medical image analysis. Continued research in efficiency and interpretability will drive clinical adoption.`
                          analyzePaper(sampleContent)
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze Sample Paper with AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-blue-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-300">150+</div>
                      <div className="text-sm text-gray-300">Papers Analyzed</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border-green-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-300">15%</div>
                      <div className="text-sm text-gray-300">Avg Accuracy Improvement</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-purple-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-300">30%</div>
                      <div className="text-sm text-gray-300">Training Time Reduction</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* AI Analysis Results */}
            {paperAnalysis && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-xl border-violet-500/30 rounded-2xl shadow-lg shadow-violet-500/10">
                  <CardHeader>
                    <CardTitle className="text-violet-300 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      AI Paper Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-white font-semibold mb-2">Key Insights</h3>
                        <p className="text-gray-300">{paperAnalysis.summary || paperAnalysis.abstract || 'This paper presents a comprehensive review of deep learning techniques applied to medical image analysis...'}</p>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">Key Concepts</h3>
                        <div className="flex flex-wrap gap-2">
                          {(paperAnalysis.key_terms || paperAnalysis.keyConcepts || ['Deep Learning', 'Medical Imaging', 'CNN', 'Attention Mechanisms', 'Transfer Learning']).map((concept, index) => (
                            <Badge key={index} className="bg-indigo-600/20 text-indigo-300 border-indigo-500/30">
                              {typeof concept === 'string' ? concept : concept.term || concept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Breakdown */}
                {paperAnalysis.section_breakdown && (
                  <Card className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 backdrop-blur-xl border-teal-500/30 rounded-2xl shadow-lg shadow-teal-500/10">
                    <CardHeader>
                      <CardTitle className="text-teal-300 flex items-center gap-2">
                        <List className="w-5 h-5" />
                        Section Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(paperAnalysis.section_breakdown).map(([section, points]) => (
                          <div key={section} className="p-4 bg-teal-600/10 rounded-lg border border-teal-500/20">
                            <h4 className="text-teal-200 font-semibold mb-2 capitalize">{section}</h4>
                            <ul className="space-y-1">
                              {points.map((point, index) => (
                                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Socratic Questions */}
                {paperAnalysis.socratic_questions && (
                  <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-xl border-amber-500/30 rounded-2xl shadow-lg shadow-amber-500/10">
                    <CardHeader>
                      <CardTitle className="text-amber-300 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Socratic Questions for Deep Understanding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paperAnalysis.socratic_questions.map((question, index) => (
                          <div key={index} className="p-4 bg-amber-600/10 rounded-lg border border-amber-500/20">
                            <p className="text-amber-200">{question}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Critical Analysis */}
                {paperAnalysis.critical_points && (
                  <Card className="bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-xl border-red-500/30 rounded-2xl shadow-lg shadow-red-500/10">
                    <CardHeader>
                      <CardTitle className="text-red-300 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Critical Analysis Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paperAnalysis.critical_points.map((point, index) => (
                          <div key={index} className="p-3 bg-red-600/10 rounded-lg border border-red-500/20">
                            <p className="text-red-200">{point}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Section Breakdown */}
            <Card className="bg-card/60 backdrop-blur-xl border-border rounded-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Section Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {paperSections.map((section) => (
                    <motion.div
                      key={section.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                        section.completed 
                          ? 'bg-chart-2/10 border-chart-2/20' 
                          : 'bg-muted/20 border-border hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {section.completed ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-chart-2" />
                        ) : (
                          <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                        <h4 className="font-medium text-foreground text-sm sm:text-base">{section.title}</h4>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm mb-3">{section.content}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {section.keyPoints.map((point, index) => (
                          <span key={index} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">
                            {point}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Socratic Questions */}
            {paperAnalysis && paperAnalysis.socratic_questions && (
              <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/40 backdrop-blur-xl border-green-500/30 rounded-2xl shadow-lg shadow-green-500/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    Socratic Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {paperAnalysis.socratic_questions.map((question, index) => (
                      <div key={index} className="p-3 bg-green-600/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-300 text-xs sm:text-sm">{question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'literature':
        return (
          <div className="space-y-6">
            {/* Research Topic Input */}
            <Card className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-xl border-violet-500/30 rounded-2xl shadow-lg shadow-violet-500/10">
              <CardHeader>
                <CardTitle className="text-violet-300 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Literature Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Research Topic
                    </label>
                    <Input
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      placeholder="Enter your research topic (e.g., 'machine learning in healthcare')"
                      className="bg-black/20 border-violet-500/30 text-white placeholder-gray-400 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={generateLiteratureMap}
                      disabled={!researchTopic.trim() || isGeneratingMap}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
                    >
                      {isGeneratingMap ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Network className="w-4 h-4 mr-2" />
                      )}
                      {isGeneratingMap ? 'Generating Map...' : 'Generate Literature Map'}
                    </Button>
                    <Button
                      onClick={() => {
                        setResearchTopic('machine learning in healthcare')
                        generateLiteratureMap()
                      }}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Literature Map */}
            {!literatureMap && !isGeneratingMap && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-gray-800/20 to-gray-700/20 backdrop-blur-xl border-gray-600/30 rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-300 flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Sample Literature Map
                    </CardTitle>
                    <p className="text-gray-400 text-sm">Click "Demo" to see AI-powered literature mapping in action</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-700/20 rounded-lg border border-gray-600/30">
                        <h3 className="text-white font-semibold mb-2">"Machine Learning in Healthcare" Literature Network</h3>
                        <p className="text-gray-300 text-sm mb-2">Generated from 200+ papers across 5 years</p>
                        <p className="text-gray-400 text-sm">
                          This map shows the interconnected research landscape of ML applications in healthcare, 
                          revealing key research clusters, emerging trends, and knowledge gaps...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-blue-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-300">200+</div>
                      <div className="text-sm text-gray-300">Papers Mapped</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border-green-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-300">15</div>
                      <div className="text-sm text-gray-300">Research Clusters</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-purple-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-300">8</div>
                      <div className="text-sm text-gray-300">Knowledge Gaps</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-xl border-orange-500/30 rounded-xl shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-300">5</div>
                      <div className="text-sm text-gray-300">Emerging Trends</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Literature Network Visualization */}
            {literatureMap && (
              <Card className="bg-gradient-to-br from-blue-950/60 to-cyan-950/40 backdrop-blur-xl border-blue-500/30 rounded-2xl shadow-lg shadow-blue-500/10 h-64 sm:h-96">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <Network className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    Literature Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative h-full p-4 sm:p-6 pt-0">
                  <div className="absolute inset-4 bg-gray-800/20 rounded-lg flex items-center justify-center">
                    <p className="text-gray-300 text-sm">Interactive literature map with {literatureMap.nodes.length} papers will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subfield Analysis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-primary/10 backdrop-blur-xl border-primary/20 rounded-xl">
                <CardHeader className="pb-3 p-3 sm:p-4">
                  <CardTitle className="text-primary text-sm sm:text-base">Foundational Works</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Total Papers</span>
                      <Badge className="bg-primary/20 text-primary text-xs">24</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Avg Citations</span>
                      <Badge className="bg-primary/20 text-primary text-xs">2.1k</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-chart-5/10 backdrop-blur-xl border-chart-5/20 rounded-xl">
                <CardHeader className="pb-3 p-3 sm:p-4">
                  <CardTitle className="text-chart-5 text-sm sm:text-base">Recent Advances</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Total Papers</span>
                      <Badge className="bg-chart-5/20 text-chart-5 text-xs">18</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Avg Citations</span>
                      <Badge className="bg-chart-5/20 text-chart-5 text-xs">856</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-chart-2/10 backdrop-blur-xl border-chart-2/20 rounded-xl sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3 p-3 sm:p-4">
                  <CardTitle className="text-chart-2 text-sm sm:text-base">Emerging Trends</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Total Papers</span>
                      <Badge className="bg-chart-2/20 text-chart-2 text-xs">12</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs sm:text-sm">Avg Citations</span>
                      <Badge className="bg-chart-2/20 text-chart-2 text-xs">234</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Research Gaps */}
            {literatureMap && literatureMap.gaps && (
              <Card className="bg-gradient-to-br from-orange-950/60 to-red-950/40 backdrop-blur-xl border-orange-500/30 rounded-2xl shadow-lg shadow-orange-500/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    Identified Research Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {literatureMap.gaps.map((gap, index) => (
                      <div key={index} className="p-3 bg-orange-600/10 border border-orange-500/20 rounded-lg">
                        <h4 className="text-orange-300 font-medium mb-1 text-sm">Research Gap {index + 1}</h4>
                        <p className="text-gray-300 text-xs sm:text-sm">{gap}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'thesis':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Research Topic Input */}
            <Card className="bg-gradient-to-br from-purple-950/60 to-pink-950/40 backdrop-blur-xl border-purple-500/30 rounded-2xl shadow-lg shadow-purple-500/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base">Generate Thesis Structure</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Research Topic
                    </label>
                    <Input
                      value={researchTopic}
                      onChange={(e) => setResearchTopic(e.target.value)}
                      placeholder="Enter your research topic for thesis structure..."
                      className="bg-gray-800/40 border-gray-600/30 text-white placeholder-gray-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <Button
                    onClick={generateThesisStructure}
                    disabled={!researchTopic.trim() || isGeneratingThesis}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
                  >
                    {isGeneratingThesis ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingThesis ? 'Generating Structure...' : 'Generate Thesis Structure'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Thesis Structure */}
            {thesisStructure && (
              <Card className="bg-gradient-to-br from-blue-950/60 to-cyan-950/40 backdrop-blur-xl border-blue-500/30 rounded-2xl shadow-lg shadow-blue-500/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    Thesis Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-4">
                    {thesisStructure.sections.map((section, index) => (
                      <div key={index} className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                        <h4 className="text-blue-300 font-medium mb-2 text-sm">{section.title}</h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2">{section.content}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600/20 text-blue-300 text-xs">{section.status}</Badge>
                          <span className="text-gray-400 text-xs">Order: {section.order}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Writing Milestones */}
            <Card className="bg-card/60 backdrop-blur-xl border-border rounded-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-chart-5" />
                  Next Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-chart-5/10 border border-chart-5/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-chart-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-chart-5 font-medium text-sm truncate">Complete Literature Review</p>
                      <p className="text-muted-foreground text-xs">Due: Next Monday</p>
                    </div>
                    <Badge className="bg-chart-5/20 text-chart-5 text-xs whitespace-nowrap">High Priority</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-primary font-medium text-sm truncate">Draft Methodology Section</p>
                      <p className="text-muted-foreground text-xs">Due: End of week</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-xs whitespace-nowrap">Medium Priority</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                    <Users className="w-4 h-4 text-chart-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-chart-2 font-medium text-sm truncate">Schedule Advisor Meeting</p>
                      <p className="text-muted-foreground text-xs">This week</p>
                    </div>
                    <Badge className="bg-chart-2/20 text-chart-2 text-xs whitespace-nowrap">Low Priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citation Suggestions */}
            <Card className="bg-card/60 backdrop-blur-xl border-border rounded-xl">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-chart-3" />
                  Suggested Citations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                    <p className="text-foreground font-medium text-sm mb-1">Transformer Networks for Medical Image Segmentation</p>
                    <p className="text-muted-foreground text-xs mb-2">Chen et al., 2023 • Nature Machine Intelligence</p>
                    <p className="text-muted-foreground text-xs">Highly relevant for your methodology section on deep learning architectures.</p>
                  </div>
                  <div className="p-3 border border-border rounded-lg hover:bg-muted/20 transition-colors">
                    <p className="text-foreground font-medium text-sm mb-1">Ethical AI in Healthcare: A Framework for Responsible Deployment</p>
                    <p className="text-muted-foreground text-xs mb-2">Rodriguez & Kim, 2024 • Science</p>
                    <p className="text-muted-foreground text-xs">Perfect addition to your ethics and limitations discussion.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'analysis':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Data Upload Section */}
            <Card className="bg-gradient-to-br from-purple-950/60 to-pink-950/40 backdrop-blur-xl border-purple-500/30 rounded-2xl shadow-lg shadow-purple-500/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Database className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-sm sm:text-base">Upload Data for Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Data File
                    </label>
                    <input
                      ref={dataInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleDataUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => dataInputRef.current?.click()}
                      disabled={isAnalyzingData}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25"
                    >
                      {isAnalyzingData ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isAnalyzingData ? 'Analyzing...' : 'Upload Data File'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Analysis Results */}
            {dataAnalysis && (
              <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/40 backdrop-blur-xl border-green-500/30 rounded-2xl shadow-lg shadow-green-500/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-4">
                    {dataAnalysis.steps.map((step, index) => (
                      <div key={index} className="p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
                        <h4 className="text-green-300 font-medium mb-2 text-sm">{step.step}</h4>
                        <p className="text-gray-300 text-xs sm:text-sm mb-2">{step.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600/20 text-green-300 text-xs">{step.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F1C] text-white relative overflow-hidden">
      {/* Futuristic Background with Glowing Shapes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-violet-950/30 to-teal-950/40"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-teal-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
        {/* Enhanced Top Navigation Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/20 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-sm border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-all duration-300 bg-black/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Button>
              </motion.div>
              
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  <Brain className="w-6 h-6 text-white relative z-10" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400 bg-clip-text text-transparent">
                    Arete Research
                  </h1>
                  <p className="text-gray-300 text-sm font-medium">Advanced Learning & Analysis</p>
                </div>
              </div>
            </div>

            {/* Mode Switcher - Only show when in a specific mode */}
            {currentMode && (
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-2xl border border-indigo-500/20 p-1 rounded-xl w-full lg:w-auto overflow-x-auto shadow-lg">
                {(['dissection', 'literature', 'thesis', 'analysis'] as const).map((mode, index) => (
                  <motion.div
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant={currentMode === mode ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentMode(mode)}
                      className={`flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
                        currentMode === mode
                          ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 border-indigo-400/50'
                          : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-violet-500/20 border-transparent'
                      }`}
                    >
                      <motion.div
                        animate={currentMode === mode ? { 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        {getModeIcon(mode)}
                      </motion.div>
                      <span className="hidden xs:inline text-xs sm:text-sm font-medium">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Futuristic Profile & XP */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <span className="text-white font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {userXP.toLocaleString()} XP
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs font-medium">Level {userLevel} Researcher</p>
                </div>
                <div className="relative">
                  <motion.div 
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                    <Award className="w-5 h-5 text-white relative z-10" />
                  </motion.div>
                  <motion.div 
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-black shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Futuristic Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="xl:col-span-1"
          >
            <Card className="bg-black/20 backdrop-blur-2xl border-indigo-500/20 rounded-2xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center"
                  >
                    <Compass className="w-4 h-4 text-white" />
                  </motion.div>
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'indigo' },
                    { id: 'courses', label: 'My Courses', icon: BookOpen, color: 'violet' },
                    { id: 'upload', label: 'Upload Materials', icon: Upload, color: 'teal' },
                    { id: 'notes', label: 'Saved Notes', icon: Bookmark, color: 'amber' },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'cyan' },
                    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
                  ].map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setSidebarSection(item.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 text-left rounded-lg transition-all duration-300 text-sm ${
                        sidebarSection === item.id
                          ? `bg-gradient-to-r from-${item.color}-600/20 to-${item.color}-500/20 border border-${item.color}-500/30 text-${item.color}-300 shadow-lg shadow-${item.color}-500/10`
                          : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-violet-500/20'
                      }`}
                    >
                      <motion.div
                        animate={sidebarSection === item.id ? { rotate: [0, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.div>
                      <span className="hidden sm:inline xl:inline font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-3"
          >
            {/* Research Tools Grid */}
            {!currentMode ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400 bg-clip-text text-transparent mb-2">
                    Research Tools
                  </h2>
                  <p className="text-gray-300 text-lg">Choose your research tool to get started</p>
                </div>

                {/* Research Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      id: 'dissection',
                      title: 'Paper Dissection',
                      description: 'Upload and analyze research papers with AI-powered insights',
                      icon: FileText,
                      color: 'from-indigo-500 to-violet-500',
                      bgColor: 'from-indigo-600/20 to-violet-600/20',
                      borderColor: 'border-indigo-500/30',
                      textColor: 'text-indigo-300',
                      features: ['PDF Analysis', 'Key Concepts', 'Socratic Questions', 'Critical Analysis']
                    },
                    {
                      id: 'literature',
                      title: 'Literature Mapping',
                      description: 'Create interactive literature maps and identify research gaps',
                      icon: Network,
                      color: 'from-violet-500 to-purple-500',
                      bgColor: 'from-violet-600/20 to-purple-600/20',
                      borderColor: 'border-violet-500/30',
                      textColor: 'text-violet-300',
                      features: ['Research Networks', 'Gap Analysis', 'Trend Identification', 'Citation Mapping']
                    },
                    {
                      id: 'thesis',
                      title: 'Thesis Mentor',
                      description: 'Get AI guidance for thesis structure and academic writing',
                      icon: BookOpen,
                      color: 'from-teal-500 to-cyan-500',
                      bgColor: 'from-teal-600/20 to-cyan-600/20',
                      borderColor: 'border-teal-500/30',
                      textColor: 'text-teal-300',
                      features: ['Structure Planning', 'Writing Guidance', 'Milestone Tracking', 'Citation Help']
                    },
                    {
                      id: 'analysis',
                      title: 'Data Analysis',
                      description: 'Upload data files for statistical analysis and visualization',
                      icon: BarChart3,
                      color: 'from-amber-500 to-orange-500',
                      bgColor: 'from-amber-600/20 to-orange-600/20',
                      borderColor: 'border-amber-500/30',
                      textColor: 'text-amber-300',
                      features: ['Statistical Analysis', 'Data Visualization', 'Insights Generation', 'Report Creation']
                    }
                  ].map((tool, index) => (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentMode(tool.id as any)}
                      className="group cursor-pointer"
                    >
                      <Card className={`bg-gradient-to-br ${tool.bgColor} backdrop-blur-2xl ${tool.borderColor} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                        <CardHeader className="p-6 text-center">
                          <motion.div
                            className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 relative overflow-hidden`}
                            whileHover={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                            <tool.icon className="w-8 h-8 text-white relative z-10" />
                          </motion.div>
                          <CardTitle className={`text-xl font-bold ${tool.textColor} mb-2`}>
                            {tool.title}
                          </CardTitle>
                          <p className="text-gray-300 text-sm mb-4">
                            {tool.description}
                          </p>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="space-y-2">
                            {tool.features.map((feature, featureIndex) => (
                              <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                                className="flex items-center gap-2"
                              >
                                <div className={`w-2 h-2 bg-gradient-to-r ${tool.color} rounded-full`}></div>
                                <span className="text-gray-300 text-sm">{feature}</span>
                              </motion.div>
                            ))}
                          </div>
                          <motion.div
                            className="mt-4 flex items-center justify-center gap-2 text-sm font-medium"
                            whileHover={{ x: 5 }}
                          >
                            <span className={tool.textColor}>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Back Button and Header */}
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMode(null)}
                      className="flex items-center gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/50 transition-all duration-300 bg-black/20"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Tools
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                      <div className="relative z-10">
                        {getModeIcon(currentMode)}
                      </div>
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-400 bg-clip-text text-transparent">
                        {getModeTitle(currentMode)}
                      </h2>
                      <p className="text-gray-300 text-sm font-medium">{currentProject}</p>
                    </div>
                  </div>
                </div>

                {/* Mode Content */}
                <div className="min-h-[400px]">
                  {renderModeContent()}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel - AI Assistant */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:col-span-1 space-y-4 sm:space-y-6"
          >
            {/* Futuristic AI Chat Assistant */}
            <Card className="bg-black/20 backdrop-blur-2xl border-teal-500/20 rounded-2xl h-[400px] sm:h-[500px] flex flex-col shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transition-all duration-300">
              <CardHeader className="pb-3 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-sm sm:text-base">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/25 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
                      <Brain className="w-5 h-5 text-white relative z-10" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                      K2 Assistant
                    </span>
                  </CardTitle>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleVoiceMode}
                      className={`transition-all duration-300 bg-black/20 ${
                        isVoiceMode 
                          ? 'bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/10' 
                          : 'border-gray-600/50 text-gray-300 hover:bg-gray-700/60'
                      }`}
                    >
                      {isVoiceMode ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 pr-2 mb-4">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-lg ${
                            message.type === 'assistant'
                              ? 'bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/30 text-teal-100 shadow-teal-500/10'
                              : 'bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-indigo-100 shadow-indigo-500/10'
                          }`}
                        >
                          <p className="leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs opacity-60">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {message.type === 'assistant' && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-teal-400 rounded-full"
                              />
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask K2 anything..."
                      className="bg-black/20 border-teal-500/30 text-white pr-10 text-sm focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 backdrop-blur-xl"
                    />
                    {isVoiceMode && (
                      <motion.button
                        onClick={toggleRecording}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-300 ${
                          isRecording 
                            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/25' 
                            : 'bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/25'
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-3 h-3 text-white" />
                        ) : (
                          <Mic className="w-3 h-3 text-white" />
                        )}
                      </motion.button>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white p-2 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 transition-all duration-300"
                      size="sm"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Futuristic Quick Actions */}
            <Card className="bg-black/20 backdrop-blur-2xl border-violet-500/20 rounded-2xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300">
              <CardHeader className="p-4">
                <CardTitle className="text-white text-sm sm:text-base flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-6 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center"
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </motion.div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {[
                    { icon: Zap, label: 'Generate Quiz', color: 'indigo', gradient: 'from-indigo-600/20 to-violet-600/20', border: 'border-indigo-500/30', text: 'text-indigo-300', hover: 'hover:bg-indigo-600/30' },
                    { icon: Download, label: 'Export PDF', color: 'violet', gradient: 'from-violet-600/20 to-purple-600/20', border: 'border-violet-500/30', text: 'text-violet-300', hover: 'hover:bg-violet-600/30' },
                    { icon: Save, label: 'Save Notes', color: 'teal', gradient: 'from-teal-600/20 to-cyan-600/20', border: 'border-teal-500/30', text: 'text-teal-300', hover: 'hover:bg-teal-600/30' }
                  ].map((action, index) => (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className={`w-full ${action.gradient} ${action.border} ${action.text} ${action.hover} justify-start text-sm shadow-lg transition-all duration-300 bg-black/20`} 
                        variant="outline"
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          <action.icon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        </motion.div>
                        {action.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Futuristic Footer Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-black/20 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl p-4 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center"
                >
                  <Compass className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-gray-300 text-sm font-medium">Research Progress</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-24 sm:w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-teal-500 rounded-full shadow-lg shadow-indigo-500/25"
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-white font-medium">Step 3 of 6</span>
              </div>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-600 hover:from-indigo-700 hover:via-violet-700 hover:to-teal-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                Continue Research
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Futuristic Recording Animation */}
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-32 right-6 flex items-center gap-2 bg-black/30 backdrop-blur-2xl border border-red-500/30 px-4 py-2 rounded-full shadow-lg shadow-red-500/25"
        >
          <motion.div 
            className="w-3 h-3 bg-red-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity 
            }}
          />
          <span className="text-red-300 text-sm font-medium">Recording...</span>
        </motion.div>
      )}
    </div>
  )
}