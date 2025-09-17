import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Upload, 
  FileText, 
  Play, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  MessageCircle,
  Send,
  Brain,
  Calendar,
  FileUp,
  Loader2,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  Map,
  BookOpenCheck,
  Lightbulb,
  Edit3,
  Plus,
  AlertCircle
} from 'lucide-react'
import { askK2Think } from '../lib/k2'
// import * as XLSX from 'xlsx' // Temporarily disabled for browser compatibility
import Papa from 'papaparse'
import * as pdfjsLib from 'pdfjs-dist'
// import * as mammoth from 'mammoth' // Temporarily disabled for browser compatibility

interface CourseModeProps {
  onNavigate: (screen: string) => void
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: Date
}

interface CourseModule {
  id: string
  title: string
  lessons: CourseLesson[]
  isExpanded: boolean
  category: 'fundamentals' | 'advanced' | 'mastery'
}

interface CourseLesson {
  id: string
  title: string
  content: string
  duration: string
  isCompleted: boolean
  isCurrentLesson: boolean
}

interface LearningObjective {
  id: string
  text: string
  completed: boolean
}

export function CourseMode({ onNavigate }: CourseModeProps) {
  // Core state management
  const [currentView, setCurrentView] = useState<'upload' | 'course' | 'lesson'>('lesson')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState('Machine Learning')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'ML_Fundamentals.pdf',
      type: 'pdf',
      size: '2.4 MB',
        uploadedAt: new Date()
    },
    {
      id: '2', 
      name: 'Neural_Networks_Video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedAt: new Date()
    }
  ])
  const [courseModules, setCourseModules] = useState<CourseModule[]>([
      {
        id: 'module-1',
        title: 'Fundamentals',
      category: 'fundamentals',
        isExpanded: true,
        lessons: [
          {
            id: 'lesson-1-1',
          title: 'Introduction to Machine Learning',
          content: 'This lesson covers the fundamental principles of machine learning, including supervised and unsupervised learning paradigms, key terminology, and real-world applications.',
            duration: '15 min',
            isCompleted: false,
            isCurrentLesson: true
          },
          {
            id: 'lesson-1-2',
          title: 'Data Preprocessing Techniques',
          content: 'Learn essential data preprocessing methods including cleaning, normalization, and feature engineering.',
            duration: '18 min',
            isCompleted: false,
            isCurrentLesson: false
        },
        {
          id: 'lesson-1-3',
          title: 'Linear Regression Fundamentals',
          content: 'Understanding linear regression as the foundation of machine learning algorithms.',
          duration: '22 min',
            isCompleted: false,
            isCurrentLesson: false
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Advanced Topics',
      category: 'advanced',
        isExpanded: false,
        lessons: [
          {
            id: 'lesson-2-1',
          title: 'Neural Networks Architecture',
          content: 'Deep dive into neural network architectures, backpropagation, and optimization techniques.',
          duration: '25 min',
            isCompleted: false,
            isCurrentLesson: false
          },
          {
            id: 'lesson-2-2',
          title: 'Convolutional Neural Networks',
          content: 'Specialized networks for image processing and computer vision applications.',
          duration: '28 min',
          isCompleted: false,
          isCurrentLesson: false
        },
        {
          id: 'lesson-2-3',
          title: 'Model Optimization & Regularization',
          content: 'Advanced techniques to improve model performance and prevent overfitting.',
          duration: '20 min',
            isCompleted: false,
            isCurrentLesson: false
          }
        ]
      },
      {
        id: 'module-3',
        title: 'Mastery & Assessment',
      category: 'mastery',
        isExpanded: false,
        lessons: [
          {
            id: 'lesson-3-1',
          title: 'Model Evaluation & Validation',
          content: 'Comprehensive methods for evaluating model performance and ensuring generalizability.',
            duration: '20 min',
            isCompleted: false,
            isCurrentLesson: false
        },
        {
          id: 'lesson-3-2',
          title: 'Real-World ML Applications',
          content: 'Case studies and practical implementation of machine learning in various industries.',
          duration: '30 min',
            isCompleted: false,
            isCurrentLesson: false
          }
        ]
      }
  ])
  
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(
    courseModules[0].lessons[0]
  )
  
  const [notes, setNotes] = useState('This is a fascinating introduction to ML concepts. Key points:\n\n• Machine learning enables computers to learn patterns from data\n• Supervised learning uses labeled datasets for training\n• Applications span from recommendation systems to autonomous vehicles')
  
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([
    { id: '1', text: 'Understand the fundamental concepts of machine learning', completed: true },
    { id: '2', text: 'Distinguish between supervised and unsupervised learning', completed: false },
    { id: '3', text: 'Identify real-world applications of ML algorithms', completed: false },
    { id: '4', text: 'Evaluate when to apply different learning paradigms', completed: false }
  ])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // PDF processing function using PDF.js
  const processPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''
      
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        text += pageText + '\n\n'
      }
      
      return text.trim()
    } catch (error) {
      console.error('PDF processing error:', error)
      throw new Error(`Failed to process PDF: ${error}`)
    }
  }

  // K2 AI state
  const [k2Explanation, setK2Explanation] = useState('')
  const [practiceQuestions, setPracticeQuestions] = useState('')
  const [isGettingExplanation, setIsGettingExplanation] = useState(false)
  const [isGettingQuestions, setIsGettingQuestions] = useState(false)

  // Adaptive Course System
  const [currentModule, setCurrentModule] = useState<any>(null)
  const [moduleProgress, setModuleProgress] = useState<'intro' | 'explanation' | 'practice' | 'quiz' | 'summary'>('intro')
  const [studentAnswers, setStudentAnswers] = useState<any[]>([])
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [isGeneratingModule, setIsGeneratingModule] = useState(false)
  const [documentContent, setDocumentContent] = useState('')
  const [studentPerformance, setStudentPerformance] = useState<'strong' | 'weak' | 'partial'>('strong')
  const [quizQuestionCount, setQuizQuestionCount] = useState(5)

  // Wow factors - Gamification and Visual Effects
  const [showCelebration, setShowCelebration] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [totalLessons, setTotalLessons] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Sample subjects
  const subjects = [
    'Machine Learning',
    'Deep Learning',
    'Data Science', 
    'Computer Vision',
    'Natural Language Processing',
    'Mathematics',
    'Physics', 
    'Chemistry',
    'Biology',
    'Computer Science'
  ]

  // Calculate progress
  const calculateProgress = () => {
    const allLessons = courseModules.flatMap(m => m.lessons)
    const completedLessons = allLessons.filter(l => l.isCompleted).length
    return allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 15
  }

  const completedLessonsCount = courseModules.flatMap(m => m.lessons).filter(l => l.isCompleted).length
  const totalLessonsCount = courseModules.flatMap(m => m.lessons).length

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setCourseModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, isExpanded: !module.isExpanded }
        : module
    ))
  }

  // Select lesson
  const selectLesson = (lesson: CourseLesson) => {
    setCourseModules(prev => prev.map(module => ({
      ...module,
      lessons: module.lessons.map(l => ({
        ...l,
        isCurrentLesson: l.id === lesson.id
      }))
    })))
    
    setCurrentLesson(lesson)
    setCurrentView('lesson')
  }

  // Mark lesson as completed
  const completeLesson = () => {
    if (!currentLesson) return
    
    setCourseModules(prev => prev.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => 
        lesson.id === currentLesson.id
          ? { ...lesson, isCompleted: true }
          : lesson
      )
    })))
    
    // Find next lesson
    const allLessons = courseModules.flatMap(m => m.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id)
    const nextLesson = allLessons[currentIndex + 1]
    
    if (nextLesson) {
      selectLesson(nextLesson)
    }
  }

  // Toggle learning objective completion
  const toggleObjective = (id: string) => {
    setLearningObjectives(prev => prev.map(obj => 
      obj.id === id ? { ...obj, completed: !obj.completed } : obj
    ))
  }

  // Handle file upload with actual content processing
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      let allContent = ''
      const newFiles: UploadedFile[] = []
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress((i / files.length) * 80) // Progress to 80%
        
        let content = ''
        const fileType = file.type
        
        try {
          if (fileType === 'application/pdf') {
            // For PDF files, extract text using PDF.js
            try {
              const pdfText = await processPDF(file)
              content = `PDF Content from ${file.name}:\n\n${pdfText}`
            } catch (pdfError) {
              console.error('PDF processing error:', pdfError)
              content = `PDF Content: ${file.name} - Error processing PDF: ${pdfError}`
            }
          } else if (fileType.includes('text/')) {
            content = await file.text()
          } else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            // For Word documents, we'll use a simple text extraction
            // Word parsing is temporarily disabled for browser compatibility
            content = `Word Document: ${file.name} - Word text extraction is temporarily disabled for browser compatibility. The file has been uploaded but content extraction needs to be implemented with a browser-compatible Word library.`
          } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                     fileType === 'application/vnd.ms-excel') {
            // Excel file processing is temporarily disabled for browser compatibility
            content = `Excel Data: ${file.name} - Excel processing is temporarily disabled for browser compatibility. The file has been uploaded but data extraction needs to be implemented with a browser-compatible Excel library.`
          } else if (fileType === 'text/csv') {
            // CSV file processing using Papa Parse
            try {
              const text = await file.text()
              const parsed = Papa.parse(text, { header: true })
              content = `CSV Data from ${file.name}:\n${JSON.stringify(parsed.data, null, 2)}`
            } catch (csvError) {
              console.error('CSV processing error:', csvError)
              content = `CSV Data: ${file.name} - Error processing CSV: ${csvError}`
            }
          } else {
            content = `File: ${file.name} - Unsupported file type for text extraction.`
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          content = `Error processing ${file.name}: ${error}`
        }
        
        allContent += `\n\n--- ${file.name} ---\n${content}`
        
        // Add to uploaded files list
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 
                file.type.includes('video') ? 'video' : 
                file.type.includes('spreadsheet') || file.type.includes('excel') ? 'spreadsheet' :
                file.type.includes('csv') ? 'csv' : 'document',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedAt: new Date()
        })
      }
      
      // Set the extracted content for AI course generation
      setDocumentContent(allContent)
      setUploadedFiles(prev => [...prev, ...newFiles])
      setUploadProgress(100)
      
      // Show success message
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error('File upload error:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fundamentals':
        return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'advanced':
        return <Zap className="w-4 h-4 text-purple-400" />
      case 'mastery':
        return <Target className="w-4 h-4 text-green-400" />
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />
    }
  }

  // Gamification functions
  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount
      const newLevel = Math.floor(newXp / 100) + 1
      if (newLevel > currentLevel) {
        setCurrentLevel(newLevel)
        setShowCelebration(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        setTimeout(() => setShowCelebration(false), 5000)
      }
      return newXp
    })
  }

  const checkAchievements = () => {
    const newAchievements: string[] = []
    
    if (totalLessons >= 1 && !achievements.includes('First Steps')) {
      newAchievements.push('First Steps')
    }
    if (totalLessons >= 5 && !achievements.includes('Dedicated Learner')) {
      newAchievements.push('Dedicated Learner')
    }
    if (streak >= 3 && !achievements.includes('Streak Master')) {
      newAchievements.push('Streak Master')
    }
    if (currentLevel >= 5 && !achievements.includes('Level Up')) {
      newAchievements.push('Level Up')
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements])
      setShowCelebration(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setTimeout(() => setShowCelebration(false), 5000)
    }
  }

  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true)
    setTypingText('')
    let index = 0
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        if (callback) callback()
      }
    }, 20)
  }

  // Adaptive Course Generation
  const generateAdaptiveModule = async (moduleNumber: number = 1) => {
    setIsGeneratingModule(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2 in Adaptive Course Mode. You're a friendly tutor who guides students step by step.

Rules for teaching:
1. Begin with the **Intro** section (overview + learning objectives)
2. Move to **Explanation**, teaching step by step, with Socratic questions where possible
3. Provide **Practice problems** (2-3, with hints)
4. After practice, generate a **Quiz** (${quizQuestionCount} questions)
   - Wait for the student's answers
   - Evaluate responses, showing what is right/wrong and why
5. Based on quiz results:
   • If high score (80%+): advance to the next module, slightly harder
   • If weak (<80%): review this module with simpler examples before moving on
   • If partial: reinforce weak points, then carefully progress
6. End with a **Summary** of key points
7. Always generate only the **current step** (Intro → Explanation → Practice → Quiz → Summary)
   Wait for user input before continuing

⚡ Always teach in an **adaptive, conversational style**, like a tutor guiding a student.

Return the response in a structured JSON format with these exact keys:
{
  "lessonTitle": "string",
  "learningObjectives": ["string1", "string2", "string3", "string4"],
  "introduction": "string",
  "explanation": "string with Socratic questions",
  "practiceQuestions": [
    {
      "question": "string",
      "hint": "string",
      "solution": "string",
      "difficulty": "easy|medium|hard"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "type": "mcq|short_answer|applied",
      "options": ["option1", "option2", "option3", "option4"] (only for MCQ),
      "correctAnswer": "string",
      "explanation": "string"
    }
  ],
  "summary": ["takeaway1", "takeaway2", "takeaway3"],
  "nextModulePreview": "string"
}`
        },
        {
          role: "user",
          content: `Generate Module ${moduleNumber} for the subject: ${selectedSubject}

${documentContent ? `Based on this course material: ${documentContent}` : 'No specific material provided - create a comprehensive module'}

Student Performance Level: ${studentPerformance}
Previous Module Performance: ${quizScore ? `${quizScore}%` : 'First module'}

Create an engaging, structured learning module that adapts to the student's current level.`
        }
      ])
      
      // Parse the JSON response
      let moduleData
      try {
        // Clean the response to extract JSON
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          moduleData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.log('Raw response:', result)
        
        // Fallback: create a basic module structure
        moduleData = {
          lessonTitle: `Module ${moduleNumber}: ${selectedSubject} Fundamentals`,
          learningObjectives: [
            "Understand the core concepts",
            "Apply knowledge through practice",
            "Demonstrate understanding through assessment"
          ],
          introduction: result.substring(0, 500) + "...",
          explanation: result,
          practiceQuestions: [
            {
              question: "What is the main concept you learned?",
              hint: "Think about the key points discussed",
              solution: "The main concept is...",
              difficulty: "easy"
            }
          ],
          quiz: [
            {
              question: "Explain the main concept in your own words",
              type: "short_answer",
              correctAnswer: "Student's own explanation",
              explanation: "Great job explaining the concept!"
            }
          ],
          summary: ["Key concept learned", "Practical application", "Next steps"],
          nextModulePreview: "We'll build on this foundation in the next module"
        }
      }
      
      // Add module number for tracking
      moduleData.moduleNumber = moduleNumber
      
      setCurrentModule(moduleData)
      setModuleProgress('intro')
      setStudentAnswers([])
      setQuizScore(null)
      
      // Add gamification
      addXp(50)
      setTotalLessons(prev => prev + 1)
      checkAchievements()
      
    } catch (error) {
      console.error('Error generating module:', error)
      // Fallback to simple explanation
      setCurrentModule({
        lessonTitle: `${selectedSubject} - Module ${moduleNumber}`,
        learningObjectives: ['Understand key concepts', 'Apply knowledge', 'Analyze problems'],
        introduction: 'This module covers fundamental concepts in the subject.',
        explanation: 'Detailed explanation will be provided here.',
        practiceQuestions: [],
        quiz: [],
        summary: ['Key concepts learned'],
        nextModulePreview: 'Next module will build on these concepts.'
      })
    } finally {
      setIsGeneratingModule(false)
    }
  }

  const submitQuizAnswer = (questionIndex: number, answer: string) => {
    setStudentAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[questionIndex] = answer
      return newAnswers
    })
  }

  const evaluateQuiz = () => {
    if (!currentModule || !currentModule.quiz) return
    
    let correct = 0
    currentModule.quiz.forEach((question: any, index: number) => {
      const studentAnswer = studentAnswers[index]
      if (studentAnswer && studentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
        correct++
      }
    })
    
    const score = Math.round((correct / currentModule.quiz.length) * 100)
    setQuizScore(score)
    
    // Determine performance level
    if (score >= 80) {
      setStudentPerformance('strong')
    } else if (score < 60) {
      setStudentPerformance('weak')
    } else {
      setStudentPerformance('partial')
    }
    
    setModuleProgress('summary')
    
    // Add gamification
    addXp(score)
    checkAchievements()
  }

  const nextModule = () => {
    generateAdaptiveModule((currentModule?.moduleNumber || 0) + 1)
  }

  // K2 AI functions
  const getK2Explanation = async () => {
    setIsGettingExplanation(true)
    try {
      // Use current lesson or current module for explanation
      const lessonTitle = currentLesson?.title || currentModule?.lessonTitle || 'the current topic'
      const lessonContent = currentLesson?.content || currentModule?.introduction || 'the material you\'re studying'
      
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a friend who explains things really well. Keep it conversational and not too long.

- Talk like you're explaining to a friend
- Use simple analogies and examples
- Keep explanations concise but helpful
- Ask engaging questions
- Be encouraging and friendly

Explain this topic in a way that's easy to understand and remember.`
        },
        {
          role: "user",
          content: `Explain this lesson topic:\n\n**Lesson Title:** ${lessonTitle}\n**Lesson Content:** ${lessonContent}\n**Subject:** ${selectedSubject}\n\nKeep it conversational and not too long. Explain it like you're talking to a friend.`
        }
      ])
      
      // Add gamification
      addXp(30)
      setTotalLessons(prev => prev + 1)
      checkAchievements()
      
      // Type the response for wow effect
      typeText(result, () => {
        setK2Explanation(result)
      })
    } catch (error) {
      console.error('K2 Explanation Error:', error)
      setK2Explanation(`Error getting K2 explanation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGettingExplanation(false)
    }
  }

  const getPracticeQuestions = async () => {
    if (!currentLesson) return
    
    setIsGettingQuestions(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a friend who helps with practice. Keep it simple and encouraging.

- Ask a few good questions to test understanding
- Give helpful hints without spoiling answers
- Explain solutions clearly but briefly
- Use friendly, encouraging language
- Make it feel like studying with a friend

Create some practice questions that help them learn without being overwhelming.`
        },
        {
          role: "user",
          content: `Create practice questions for this lesson:\n\n**Lesson Title:** ${currentLesson.title}\n**Lesson Content:** ${currentLesson.content}\n**Subject:** ${selectedSubject}\n\nKeep it simple and friendly - just a few good questions to help them learn.`
        }
      ])
      
      // Add gamification
      addXp(25)
      setTotalLessons(prev => prev + 1)
      checkAchievements()
      
      // Type the response for wow effect
      typeText(result, () => {
        setPracticeQuestions(result)
      })
    } catch (error) {
      console.error('Practice Questions Error:', error)
      setPracticeQuestions(`Error getting practice questions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGettingQuestions(false)
    }
  }

  // Enhanced lesson learning screen
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-purple-950/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        </div>
        
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -10,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 10,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Achievement Celebration */}
      {showCelebration && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-2xl shadow-2xl text-center">
            <div className="text-2xl font-bold mb-2">🎉 Achievement Unlocked! 🎉</div>
            <div className="text-lg">Level {currentLevel} - {xp} XP</div>
            {achievements.length > 0 && (
              <div className="text-sm mt-2">
                New Achievement: {achievements[achievements.length - 1]}
              </div>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header Area */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => onNavigate('dashboard')}
                className="bg-gray-800/60 border-gray-600/50 text-white hover:bg-gray-700/60 hover:border-gray-500/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              <div>
                  <h1 className="text-2xl font-semibold text-white">{selectedSubject} Course</h1>
                  <p className="text-gray-400 text-sm">Built with the MBZUAI K2 Model</p>
                  </div>
                </div>
              </div>
            
            <div className="flex items-center gap-4">
              {/* Gamification Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300">Level {currentLevel}</span>
            </div>
                <div className="flex items-center gap-2 bg-purple-600/20 px-3 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300">{xp} XP</span>
          </div>
                <div className="flex items-center gap-2 bg-green-600/20 px-3 py-2 rounded-lg">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-green-300">{streak} Streak</span>
                </div>
              </div>

              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Materials
              </Button>
              
              {/* File Processing Status */}
              {isUploading && (
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing files... {uploadProgress}%</span>
                </div>
              )}
              
              {documentContent && !isUploading && (
                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Files processed! Content ready for AI course generation</span>
                </div>
              )}
            </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept=".pdf,.doc,.docx,.txt,.mp4,.mov,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden" 
                />
              </div>

          {/* Progress Bar */}
                <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Course Progress</span>
              <span className="text-blue-300">{completedLessonsCount}/{totalLessonsCount} lessons completed</span>
                  </div>
            <div className="relative">
              <Progress value={calculateProgress()} className="h-3 bg-gray-800/50" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-white">{calculateProgress()}%</span>
                        </div>
                      </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Course Outline */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-blue-400" />
                  Course Outline
                </CardTitle>
                </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-6 space-y-6">
                      {courseModules.map((module) => (
                      <motion.div 
                        key={module.id} 
                        className="space-y-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="flex items-center gap-4 w-full p-4 text-left rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-200 border border-gray-700/30 group"
                        >
                          <div className="flex-shrink-0">
                            {getCategoryIcon(module.category)}
                          </div>
                          <span className="font-medium text-white flex-1 text-left">{module.title}</span>
                          <div className="flex-shrink-0">
                            {module.isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                            )}
                          </div>
                          </button>
                          
                        <AnimatePresence>
                          {module.isExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-8 space-y-2"
                            >
                              {module.lessons.map((lesson) => (
                                <motion.button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-start gap-4 w-full p-4 rounded-xl text-left transition-all duration-200 group ${
                                    lesson.isCurrentLesson
                                      ? 'bg-blue-600/20 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                                      : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
                                  }`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {lesson.isCompleted ? (
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                    ) : lesson.isCurrentLesson ? (
                                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-gray-500 rounded-full" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white leading-tight mb-2 group-hover:text-blue-300 transition-colors">
                                      {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                      <span className="text-xs text-gray-400">{lesson.duration}</span>
                                  </div>
                            </div>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
          </motion.div>

          {/* Main Content Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Lesson Introduction */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3">
                      <motion.div 
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Play className="w-4 h-4 text-white" />
                      </motion.div>
                      {currentLesson?.title}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                      {currentLesson?.duration}
                    </Badge>
            </div>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30">
                    <p className="text-gray-300 leading-relaxed text-base mb-4">
                      {currentLesson?.content}
                    </p>
                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={() => onNavigate('socratic-tutor')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                      >
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                        </motion.div>
                        Start Interactive Learning
                      </Button>
                    </motion.div>
                    
                    {/* Quiz Question Count Selector */}
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm text-gray-300 font-medium">
                        Quiz Questions:
                      </label>
                      <select
                        value={quizQuestionCount}
                        onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={isGeneratingModule}
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                        <option value={7}>7 Questions</option>
                        <option value={10}>10 Questions</option>
                      </select>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={() => generateAdaptiveModule(1)}
                        disabled={isGeneratingModule}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                      >
                        {isGeneratingModule ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                          </motion.div>
                        )}
                        Start Adaptive Course
                      </Button>
                    </motion.div>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* K2 Enhanced Explanation Card */}
            <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 backdrop-blur-xl border border-blue-500/20 rounded-2xl">
                <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-white">K2 Enhanced Explanation</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="text-blue-200 text-sm">
                  Get personalized explanations, interactive examples, and adaptive content tailored to your learning style.
                </p>
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={getK2Explanation}
                      disabled={isGettingExplanation}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      {isGettingExplanation ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                        </motion.div>
                      )}
                      Get K2 Explanation
                    </Button>
                  </motion.div>
                    
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={getPracticeQuestions}
                      disabled={isGettingQuestions}
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                    >
                      {isGettingQuestions ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                        </motion.div>
                      )}
                      Practice Questions
                    </Button>
                  </motion.div>
                  </div>
                </CardContent>
              </Card>

            {/* K2 Explanation Display */}
            {k2Explanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-500/20 rounded-2xl shadow-lg shadow-blue-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-300">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-5 h-5" />
                      </motion.div>
                      K2 Teaching Session
                      {isTyping && (
                        <motion.div
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-blue-400"
                        >
                          ...
                        </motion.div>
                      )}
                    </CardTitle>
                    <p className="text-blue-200 text-sm mt-2">
                      Comprehensive teaching explanation with examples, analogies, and interactive elements
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {isTyping ? typingText : k2Explanation}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                      <Button 
                        onClick={() => getPracticeQuestions()}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Practice Questions
                      </Button>
                      <Button 
                        onClick={() => onNavigate('socratic-tutor')}
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask K2 Questions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Practice Questions Display */}
            {practiceQuestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-500/20 rounded-2xl shadow-lg shadow-purple-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-300">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Target className="w-5 h-5" />
                      </motion.div>
                      K2 Practice Session
                      {isTyping && (
                        <motion.div
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-purple-400"
                        >
                          ...
                        </motion.div>
                      )}
                    </CardTitle>
                    <p className="text-purple-200 text-sm mt-2">
                      Progressive practice questions with hints, solutions, and explanations
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {isTyping ? typingText : practiceQuestions}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3">
                      <Button 
                        onClick={() => getK2Explanation()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Get More Teaching
                      </Button>
                      <Button 
                        onClick={() => onNavigate('quiz')}
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Take Full Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Adaptive Course Module Interface */}
            {currentModule && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Module Header */}
                <Card className="bg-gradient-to-br from-green-600/10 to-teal-600/10 border-green-500/20 rounded-2xl shadow-lg shadow-green-500/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-green-300 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Brain className="w-6 h-6" />
                        </motion.div>
                        {currentModule.lessonTitle}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">K2 Adaptive Course</span>
        </div>
      </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-300">{currentModule.introduction}</p>
                      
                      {/* Learning Objectives */}
                      <div>
                        <h4 className="text-green-300 font-semibold mb-2">Learning Objectives:</h4>
                        <ul className="space-y-1">
                          {currentModule.learningObjectives?.map((objective: string, index: number) => (
                            <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              {objective}
                            </li>
                          ))}
                        </ul>
        </div>
      </div>
                  </CardContent>
                </Card>
      
                {/* Module Progress Navigation */}
                <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
                  <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
                        {['intro', 'explanation', 'practice', 'quiz', 'summary'].map((step, index) => (
                          <motion.button
                            key={step}
                            onClick={() => setModuleProgress(step as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                              moduleProgress === step
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                          </motion.button>
                        ))}
          </div>
          
                      {quizScore !== null && (
          <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">Quiz Score:</span>
                          <Badge className={`${
                            quizScore >= 80 ? 'bg-green-600' : 
                            quizScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {quizScore}%
                          </Badge>
          </div>
                      )}
        </div>
                  </CardContent>
                </Card>

                {/* Module Content Based on Progress */}
                {moduleProgress === 'explanation' && (
                  <Card className="bg-blue-600/10 border-blue-500/20 rounded-2xl">
              <CardHeader>
                      <CardTitle className="text-blue-300 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        K2 Enhanced Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {currentModule.explanation}
                  </div>
                    </CardContent>
                  </Card>
                )}

                {moduleProgress === 'practice' && currentModule.practiceQuestions && (
                  <Card className="bg-orange-600/10 border-orange-500/20 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-orange-300 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Guided Practice
                      </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                      {currentModule.practiceQuestions.map((question: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Question {index + 1} ({question.difficulty})</h4>
                          <p className="text-gray-300 mb-3">{question.question}</p>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="text-orange-300 border-orange-500/30">
                              Show Hint
                            </Button>
                            <Button variant="outline" size="sm" className="text-green-300 border-green-500/30">
                              Show Solution
                            </Button>
                </div>
                  </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {moduleProgress === 'quiz' && currentModule.quiz && (
                  <Card className="bg-purple-600/10 border-purple-500/20 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-purple-300 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Knowledge Check Quiz
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentModule.quiz.map((question: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Question {index + 1}</h4>
                          <p className="text-gray-300 mb-3">{question.question}</p>
                          
                          {question.type === 'mcq' ? (
                <div className="space-y-2">
                              {question.options.map((option: string, optIndex: number) => (
                                <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${index}`}
                                    value={option}
                                    onChange={(e) => submitQuizAnswer(index, e.target.value)}
                                    className="text-purple-500"
                                  />
                                  <span className="text-gray-300">{option}</span>
                                </label>
                              ))}
                </div>
                          ) : (
                            <textarea
                              placeholder="Your answer..."
                              onChange={(e) => submitQuizAnswer(index, e.target.value)}
                              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                              rows={3}
                            />
                          )}
                        </div>
                      ))}
                      
                  <Button 
                        onClick={evaluateQuiz}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                        Submit Quiz
                  </Button>
                    </CardContent>
                  </Card>
                )}

                {moduleProgress === 'summary' && (
                  <div className="space-y-4">
                    <Card className="bg-green-600/10 border-green-500/20 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-green-300 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Module Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-white font-medium mb-2">Key Takeaways:</h4>
                            <ul className="space-y-1">
                              {currentModule.summary?.map((takeaway: string, index: number) => (
                                <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                                  {takeaway}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {currentModule.nextModulePreview && (
                            <div>
                              <h4 className="text-white font-medium mb-2">Next Module Preview:</h4>
                              <p className="text-gray-300 text-sm">{currentModule.nextModulePreview}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex gap-3">
                  <Button 
                        onClick={nextModule}
                        className="bg-green-600 hover:bg-green-700 text-white"
                  >
                        Next Module
                  </Button>
                  <Button 
                        onClick={() => setCurrentModule(null)}
                    variant="outline"
                        className="border-gray-600 text-gray-300"
                  >
                        End Course
                  </Button>
                </div>
          </div>
                )}
              </motion.div>
            )}

            {/* Learning Objectives Card */}
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningObjectives.map((objective) => (
                    <motion.div
                      key={objective.id}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                        objective.completed 
                          ? 'bg-green-600/10 border border-green-500/20' 
                          : 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50'
                      }`}
                      onClick={() => toggleObjective(objective.id)}
                    >
                      <div className="flex-shrink-0">
                        {objective.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
                        )}
                        </div>
                      <p className={`text-sm ${objective.completed ? 'text-green-300 line-through' : 'text-gray-300'}`}>
                        {objective.text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Notes Section */}
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  Your Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take notes while you learn..."
                  className="bg-gray-800/40 border-gray-600/30 text-white min-h-32 resize-none rounded-xl"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-6"
        >
          <div className="flex flex-wrap gap-4 justify-center">
                <Button 
              onClick={completeLesson}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
                </Button>
                
                <Button 
              onClick={() => onNavigate('quiz')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
                >
              <BookOpenCheck className="w-4 h-4 mr-2" />
              Take Quiz
                </Button>
                
                <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl"
                >
              <Brain className="w-4 h-4 mr-2" />
              Generate with K2
                </Button>
                
                <Button 
                  onClick={() => onNavigate('mindmap')}
                  variant="outline"
              className="border-gray-600/50 text-gray-300 hover:bg-gray-800/40 px-6 py-3 rounded-xl"
                >
              <Map className="w-4 h-4 mr-2" />
                  Create Mindmap
                </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}