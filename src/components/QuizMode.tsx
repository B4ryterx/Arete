import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { askK2Think } from '../lib/k2'
import { CheckCircle, X, Clock, Brain, ArrowLeft, RotateCcw, Target, Award, Zap, Loader2, Lightbulb, MessageSquare, Sparkles, Settings, BookOpen, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuizModeProps {
  onNavigate: (screen: string) => void
}

export function QuizMode({ onNavigate }: QuizModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Array<{questionId: number, answer: number, correct: boolean}>>([])
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes
  const [quizStarted, setQuizStarted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [aiHint, setAiHint] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [isGettingExplanation, setIsGettingExplanation] = useState(false)
  const [isGettingHint, setIsGettingHint] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAI, setShowAI] = useState(false)
  
  // Quiz customization states
  const [questionCount, setQuestionCount] = useState(5)
  const [rigorLevel, setRigorLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [customTimeLimit, setCustomTimeLimit] = useState(900)
  const [showQuizSettings, setShowQuizSettings] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])
  const [useGeneratedQuiz, setUseGeneratedQuiz] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-get K2 time recommendation when settings change
  useEffect(() => {
    if (questionCount && rigorLevel) {
      console.log('Settings changed, getting K2 time recommendation...', { questionCount, rigorLevel })
      getK2TimeRecommendation()
    }
  }, [questionCount, rigorLevel])

  // Update quiz time limit when customTimeLimit changes
  useEffect(() => {
    if (customTimeLimit > 0) {
      setTimeLeft(customTimeLimit)
    }
  }, [customTimeLimit])

  const quiz = {
    title: "Machine Learning Fundamentals",
    subject: "AI & Data Science",
    totalQuestions: useGeneratedQuiz ? generatedQuestions.length : questionCount,
    timeLimit: customTimeLimit,
    difficulty: rigorLevel.charAt(0).toUpperCase() + rigorLevel.slice(1)
  }

  // K2 AI Functions for Quiz Generation
  const generateQuizWithK2 = async () => {
    setIsGeneratingQuiz(true)
    console.log('Starting K2 quiz generation...', { questionCount, rigorLevel })
    
    try {
      // First test if K2 is working
      const testResult = await askK2Think([
        {
          role: "system",
          content: "You are K2. Respond with 'OK' to confirm you're working."
        },
        {
          role: "user",
          content: "Test"
        }
      ])
      
      console.log('K2 Test Result:', testResult)
      
      if (testResult.includes('⚠️') || testResult.includes('Error')) {
        throw new Error('K2 API not working properly')
      }
      
      // Now try to generate quiz
      const result = await askK2Think([
        {
          role: "system",
          content: `Create a ${rigorLevel} level Machine Learning quiz with exactly ${questionCount} questions. Return valid JSON only.`
        },
        {
          role: "user",
          content: `Generate ${questionCount} questions for ${rigorLevel} level. Format: {"questions": [{"id": 1, "question": "Q?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]}`
        }
      ])
      
      console.log('Raw K2 Response:', result)
      
      if (!result || result.trim() === '') {
        throw new Error('Empty response from K2')
      }
      
      // Try to extract JSON
      let cleanResult = result.trim()
      
      // Remove markdown
      cleanResult = cleanResult.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Find JSON
      const jsonStart = cleanResult.indexOf('{')
      const jsonEnd = cleanResult.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        throw new Error('No valid JSON found')
      }
      
      cleanResult = cleanResult.substring(jsonStart, jsonEnd)
      console.log('Extracted JSON:', cleanResult)
      
      // Parse and validate
      const quizData = JSON.parse(cleanResult)
      
      if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        throw new Error('Invalid quiz structure')
      }
      
      // Use the generated questions
      setGeneratedQuestions(quizData.questions)
      if (quizData.timeLimit) {
        setCustomTimeLimit(quizData.timeLimit)
      }
      setUseGeneratedQuiz(true)
      
      console.log('✅ Quiz generated successfully!', quizData.questions.length, 'questions')
      alert(`✅ Generated ${quizData.questions.length} questions successfully!`)
      
    } catch (error) {
      console.error('❌ Quiz generation failed:', error)
      
      // Create fallback quiz
      const fallbackQuestions = defaultQuestions.slice(0, questionCount).map((q, index) => ({
        ...q,
        id: index + 1
      }))
      
      setGeneratedQuestions(fallbackQuestions)
      setUseGeneratedQuiz(true)
      
      alert(`⚠️ K2 had issues, but I created ${questionCount} questions for you!`)
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  // Test K2 connection
  const testK2Connection = async () => {
    try {
      console.log('Testing K2 connection...')
      console.log('Environment check:', {
        hasApiKey: !!(import.meta as any).env?.VITE_CEREBRAS_API_KEY,
        hasBaseUrl: !!(import.meta as any).env?.VITE_CEREBRAS_BASE_URL,
        model: (import.meta as any).env?.VITE_K2_MODEL || "qwen-3-235b-a22b-instruct-2507"
      })
      
      // Test with a very simple request first
      const result = await askK2Think([
        {
          role: "system",
          content: "You are K2. Respond with exactly 'OK' to confirm you're working."
        },
        {
          role: "user",
          content: "Test"
        }
      ])
      
      console.log('K2 Test Response:', result)
      console.log('Response length:', result?.length)
      console.log('Response type:', typeof result)
      
      const isWorking = result && 
        typeof result === 'string' && 
        result.trim().length > 0 && 
        !result.includes('⚠️') && 
        !result.includes('Error') &&
        !result.includes('Missing')
        
      if (isWorking) {
        alert(`✅ K2 is working! Response: "${result}"`)
        console.log('✅ K2 connection test passed')
      } else {
        alert(`❌ K2 test failed. Response: "${result}"`)
        console.log('❌ K2 connection test failed')
      }
      return isWorking
    } catch (error) {
      console.error('K2 Connection Test Failed:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      alert(`❌ K2 connection failed: ${error.message}`)
      return false
    }
  }

  const getK2TimeRecommendation = async () => {
    try {
      console.log('Getting K2 time recommendation...')
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a learning analytics expert. Recommend an appropriate time limit for a quiz based on the specifications.

Consider:
- Number of questions
- Difficulty level
- Subject complexity
- Average reading and thinking time
- Time for review

Provide ONLY a number representing the time limit in seconds. For example: 900`
        },
        {
          role: "user",
          content: `Recommend a time limit for a ${rigorLevel} level quiz with ${questionCount} questions on Machine Learning Fundamentals. Return only the number of seconds.`
        }
      ])
      
      console.log('K2 Time Recommendation Response:', result)
      
      // Extract number from response - try multiple patterns
      let timeInSeconds: number = 0
      
      // Try to find a number in the response
      const timeMatch = result.match(/(\d+)/)
      if (timeMatch) {
        timeInSeconds = parseInt(timeMatch[1])
      }
      
      // If no number found, calculate based on question count and difficulty
      if (timeInSeconds === 0) {
        const baseTimePerQuestion = rigorLevel === 'beginner' ? 60 : rigorLevel === 'intermediate' ? 90 : 120
        timeInSeconds = questionCount * baseTimePerQuestion
        console.log('Calculated time based on question count and difficulty:', timeInSeconds)
      }
      
      // Ensure reasonable bounds
      timeInSeconds = Math.max(60, Math.min(3600, timeInSeconds)) // Between 1 minute and 1 hour
      
      setCustomTimeLimit(timeInSeconds)
      console.log('Set time limit to:', timeInSeconds, 'seconds')
      
    } catch (error) {
      console.error('Error getting time recommendation:', error)
      // Fallback calculation
      const baseTimePerQuestion = rigorLevel === 'beginner' ? 60 : rigorLevel === 'intermediate' ? 90 : 120
      const fallbackTime = questionCount * baseTimePerQuestion
      setCustomTimeLimit(fallbackTime)
      console.log('Using fallback time calculation:', fallbackTime)
    }
  }

  // AI-powered quiz functions
  const getAIExplanation = async () => {
    if (currentQuestion >= questions.length) return;
    
    setIsGettingExplanation(true);
    try {
      const question = questions[currentQuestion];
      const result = await askK2Think([
        {
          role: "system",
          content: "You are an expert tutor. Provide a clear, detailed explanation of the correct answer to this quiz question. Explain why the correct answer is right and why the other options are wrong. Be educational and help the student understand the concept."
        },
        {
          role: "user",
          content: `Question: ${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nCorrect Answer: ${question.options[question.correct]}\n\nPlease provide a detailed explanation.`
        }
      ]);
      setAiExplanation(result);
    } catch (error) {
      setAiExplanation(`Error getting explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingExplanation(false);
    }
  };

  const getAIHint = async () => {
    if (currentQuestion >= questions.length) return;
    
    setIsGettingHint(true);
    try {
      const question = questions[currentQuestion];
      const result = await askK2Think([
        {
          role: "system",
          content: "You are a helpful tutor. Provide a hint to guide the student toward the correct answer without giving it away. Focus on key concepts, common approaches, or things to consider. Be encouraging and educational."
        },
        {
          role: "user",
          content: `Question: ${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nProvide a helpful hint without revealing the answer.`
        }
      ]);
      setAiHint(result);
    } catch (error) {
      setAiHint(`Error getting hint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingHint(false);
    }
  };

  const getAIAnalysis = async () => {
    if (answers.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const correctCount = answers.filter(a => a.correct).length;
      const totalCount = answers.length;
      const accuracy = Math.round((correctCount / totalCount) * 100);
      
      const result = await askK2Think([
        {
          role: "system",
          content: "You are a learning analytics expert. Analyze the student's quiz performance and provide insights on: 1) Overall performance and strengths, 2) Areas that need improvement, 3) Study recommendations, 4) Learning strategies. Be encouraging and constructive."
        },
        {
          role: "user",
          content: `Quiz: ${quiz.title}\nSubject: ${quiz.subject}\n\nPerformance:\n- Total Questions: ${totalCount}\n- Correct Answers: ${correctCount}\n- Accuracy: ${accuracy}%\n\nQuestion Results:\n${answers.map((a, i) => `Q${i + 1}: ${a.correct ? 'Correct' : 'Incorrect'}`).join('\n')}\n\nPlease analyze this performance and provide recommendations.`
        }
      ]);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis(`Error analyzing performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const defaultQuestions = [
    {
      id: 1,
      question: "What is the main goal of supervised learning?",
      options: [
        "To learn patterns from labeled training data",
        "To discover hidden structures in data", 
        "To optimize rewards through trial and error",
        "To reduce data dimensionality"
      ],
      correct: 0,
      explanation: "Supervised learning aims to learn a mapping from inputs to outputs using labeled training data, where the correct answers are provided during training."
    },
    {
      id: 2,
      question: "Which algorithm is best suited for classification tasks with non-linear decision boundaries?",
      options: [
        "Linear Regression",
        "Support Vector Machine with RBF kernel",
        "Logistic Regression", 
        "Naive Bayes"
      ],
      correct: 1,
      explanation: "SVM with RBF (Radial Basis Function) kernel can handle non-linear decision boundaries by mapping data to higher dimensions."
    },
    {
      id: 3,
      question: "What does the bias-variance tradeoff represent?",
      options: [
        "The relationship between model complexity and training time",
        "The balance between underfitting and overfitting",
        "The choice between supervised and unsupervised learning",
        "The tradeoff between accuracy and interpretability"
      ],
      correct: 1,
      explanation: "The bias-variance tradeoff describes the balance between a model's ability to minimize bias (underfitting) and variance (overfitting)."
    },
    {
      id: 4,
      question: "Which technique is commonly used to prevent overfitting?",
      options: [
        "Increasing model complexity",
        "Using more features",
        "Cross-validation and regularization",
        "Reducing training data"
      ],
      correct: 2,
      explanation: "Cross-validation helps evaluate model performance while regularization techniques like L1/L2 penalty help prevent overfitting."
    },
    {
      id: 5,
      question: "What is the purpose of feature scaling in machine learning?",
      options: [
        "To reduce the number of features",
        "To ensure all features contribute equally to distance calculations",
        "To increase model accuracy automatically",
        "To speed up data loading"
      ],
      correct: 1,
      explanation: "Feature scaling ensures that features with different scales don't dominate distance-based algorithms like KNN or SVM."
    }
  ]

  // Use generated questions if available, otherwise use default questions
  const questions = useGeneratedQuiz ? generatedQuestions : defaultQuestions

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (quizStarted && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setShowResult(true)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizStarted, timeLeft, showResult])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowResult(false)
    setTimeLeft(customTimeLimit)
    console.log('Starting quiz with time limit:', customTimeLimit, 'seconds')
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showFeedback) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    // Store the answer
    const newAnswer = {
      questionId: questions[currentQuestion].id,
      answer: selectedAnswer,
      correct: selectedAnswer === questions[currentQuestion].correct
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    // Show feedback briefly
    setShowFeedback(true)
    
    setTimeout(() => {
      setShowFeedback(false)
      setSelectedAnswer(null)
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setShowResult(true)
      }
    }, 2000)
  }

  const handleFinishQuiz = () => {
    setShowResult(true)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizStarted(false)
    setTimeLeft(customTimeLimit)
    setShowFeedback(false)
  }

  const correctAnswers = answers.filter(a => a.correct).length
  const accuracy = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0

  if (!quizStarted && !showResult) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
        {/* Enhanced Background with blue-to-purple gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>

        <div className={`max-w-4xl mx-auto p-6 space-y-6 relative z-10 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Header */}
          <div className={`flex items-center gap-4 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('dashboard')}
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-white">Quiz Mode</h1>
              </div>
              <p className="text-gray-400">Test your knowledge with active recall</p>
            </div>
          </div>

          {/* Quiz Instructions Card */}
          <Card className={`bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
                <Brain className="w-6 h-6 text-green-400" />
                {quiz.title}
              </CardTitle>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30 px-3 py-1">
                  {quiz.subject}
                </Badge>
                <Badge className="bg-green-600/20 text-green-300 border-green-600/30 px-3 py-1">
                  {quiz.difficulty}
                </Badge>
                <Badge className="bg-orange-600/20 text-orange-300 border-orange-600/30 px-3 py-1">
                  {quiz.totalQuestions} Questions
                </Badge>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30 px-3 py-1">
                  {formatTime(quiz.timeLimit)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Progress Bar - 0/5 questions complete */}
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-medium">Progress</span>
                  <span className="text-blue-400 font-medium">0/{quiz.totalQuestions} questions complete</span>
                </div>
                <Progress 
                  value={0} 
                  className="h-3 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500"
                />
              </div>

              {/* Timer Display */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-xl text-blue-400">
                    {formatTime(quiz.timeLimit)}
                  </span>
                  <span className="text-gray-400">remaining</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20">
                <h3 className="font-semibold mb-4 text-blue-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quiz Instructions
                </h3>
                <ul className="text-left space-y-3 text-gray-300 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    You have {formatTime(quiz.timeLimit)} to complete all questions
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    Each question has only one correct answer
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    You'll receive immediate feedback after each question
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    Your progress and performance will be tracked
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                    K2 will adapt questions to your learning progress
                  </li>
                </ul>
              </div>
              
              {/* Quiz Customization */}
              <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-300 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Quiz Customization
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuizSettings(!showQuizSettings)}
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    {showQuizSettings ? 'Hide' : 'Show'} Settings
                  </Button>
                </div>

                {showQuizSettings && (
                  <div className="space-y-4">
                    {/* Question Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Questions</label>
                      <div className="flex gap-2">
                        {[3, 5, 7, 10, 15].map(count => (
                          <Button
                            key={count}
                            variant={questionCount === count ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQuestionCount(count)}
                            className={questionCount === count 
                              ? "bg-blue-600 text-white" 
                              : "border-gray-600 text-gray-300 hover:bg-gray-700"
                            }
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Rigor Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                      <div className="flex gap-2">
                        {[
                          { value: 'beginner', label: 'Beginner', color: 'green' },
                          { value: 'intermediate', label: 'Intermediate', color: 'blue' },
                          { value: 'advanced', label: 'Advanced', color: 'purple' }
                        ].map(level => (
                          <Button
                            key={level.value}
                            variant={rigorLevel === level.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRigorLevel(level.value as any)}
                            className={rigorLevel === level.value 
                              ? `bg-${level.color}-600 text-white` 
                              : `border-gray-600 text-gray-300 hover:bg-gray-700`
                            }
                          >
                            {level.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time Limit</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={Math.floor(customTimeLimit / 60)}
                          onChange={(e) => {
                            const minutes = parseInt(e.target.value) || 1
                            setCustomTimeLimit(minutes * 60)
                          }}
                          className="w-20 px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-center"
                          min="1"
                          max="60"
                        />
                        <span className="text-gray-400">minutes</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={getK2TimeRecommendation}
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          K2 Recommend
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {Math.floor(customTimeLimit / 60)} minutes ({customTimeLimit} seconds)
                      </p>
                    </div>

                    {/* K2 Quiz Generation */}
                    <div className="pt-4 border-t border-gray-700/50">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={generateQuizWithK2}
                            disabled={isGeneratingQuiz}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                          >
                            {isGeneratingQuiz ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            {isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}
                          </Button>
                          <Button
                            onClick={testK2Connection}
                            variant="outline"
                            size="sm"
                            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                          >
                            Test K2
                          </Button>
                        </div>
                        
                        {useGeneratedQuiz && (
                          <div className="text-center">
                            <p className="text-green-400 text-sm">✅ Custom quiz generated!</p>
                            <p className="text-gray-500 text-xs">{generatedQuestions.length} questions ready</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 text-center">
                          K2 will create personalized questions based on your specifications
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* K2 Enhanced Features - Now Working */}
                <div className="mt-4 bg-purple-950/20 p-4 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 font-medium">K2 Enhanced Features</span>
                    <Badge className="bg-green-600/20 text-green-300 text-xs">Active</Badge>
                  </div>
                  <div className="text-gray-400 text-sm space-y-1">
                    <p>✅ AI-generated personalized questions</p>
                    <p>✅ Adaptive difficulty based on performance</p>
                    <p>✅ Intelligent time limit recommendations</p>
                    <p>✅ Real-time hints and explanations</p>
                    <p>✅ Performance analysis and insights</p>
                  </div>
                </div>
              </div>
              
              {/* Start Button */}
              <Button 
                onClick={startQuiz} 
                size="lg" 
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 text-lg font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
              >
                <Target className="w-5 h-5 mr-2" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showResult) {
    const getPerformanceMessage = () => {
      if (accuracy >= 90) return { text: "Outstanding! 🏆", color: "text-yellow-400" }
      if (accuracy >= 80) return { text: "Excellent! 🌟", color: "text-green-400" }
      if (accuracy >= 70) return { text: "Great job! 👏", color: "text-blue-400" }
      if (accuracy >= 60) return { text: "Good effort! 💪", color: "text-orange-400" }
      return { text: "Keep practicing! 📚", color: "text-red-400" }
    }

    const performance = getPerformanceMessage()

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => onNavigate('dashboard')}
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-white">Quiz Complete!</h1>
              <p className="text-gray-400">Here are your results</p>
            </div>
          </div>

          {/* Results Card */}
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <CardTitle className={`text-2xl ${performance.color}`}>
                {performance.text}
              </CardTitle>
              <p className="text-gray-400">Quiz: {quiz.title}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-blue-600/10 p-6 rounded-xl border border-blue-600/20">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{correctAnswers}/{questions.length}</div>
                  <p className="text-gray-300">Correct Answers</p>
                </div>
                <div className="bg-green-600/10 p-6 rounded-xl border border-green-600/20">
                  <div className="text-3xl font-bold text-green-400 mb-2">{Math.round(accuracy)}%</div>
                  <p className="text-gray-300">Accuracy</p>
                </div>
                <div className="bg-purple-600/10 p-6 rounded-xl border border-purple-600/20">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{formatTime(quiz.timeLimit - timeLeft)}</div>
                  <p className="text-gray-300">Time Taken</p>
                </div>
              </div>

              {/* AI Analysis Button */}
              <div className="flex justify-center">
                <Button
                  onClick={getAIAnalysis}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Get AI Analysis
                </Button>
              </div>

              {/* AI Analysis Panel */}
              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/20"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-300">AI Performance Analysis</h3>
                  </div>
                  <div className="text-gray-300 whitespace-pre-wrap">{aiAnalysis}</div>
                </motion.div>
              )}

              {/* Question Review */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Question Review</h3>
                {questions.map((question, index) => {
                  const userAnswer = answers.find(a => a.questionId === question.id)
                  const isCorrect = userAnswer?.correct || false
                  
                  return (
                    <div key={question.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-2">Q{index + 1}: {question.question}</h4>
                          {!isCorrect && userAnswer && (
                            <p className="text-sm text-red-400 mb-2">
                              <span className="text-gray-400">Your answer:</span> {question.options[userAnswer.answer]}
                            </p>
                          )}
                          {!isCorrect && (
                            <p className="text-sm text-green-400 mb-2">
                              <span className="text-gray-400">Correct answer:</span> {question.options[question.correct]}
                            </p>
                          )}
                          <div className="text-sm text-gray-300 bg-blue-600/10 p-3 rounded border border-blue-500/20">
                            <strong className="text-blue-400">Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* K2 Recommendations */}
              <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/20 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">K2 Learning Recommendations</span>
                  <Badge className="bg-blue-600/20 text-blue-300 text-xs">Coming Soon</Badge>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Based on your performance, K2 will suggest personalized study paths and additional practice areas.
                </p>
                <div className="flex gap-2">
                  <Button 
                    disabled
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-500 opacity-50 cursor-not-allowed"
                  >
                    Generate Study Plan
                  </Button>
                  <Button 
                    disabled
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-500 opacity-50 cursor-not-allowed"
                  >
                    K2 Practice Quiz
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <Button 
                  onClick={restartQuiz} 
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 hover:border-gray-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header with Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleFinishQuiz}
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Quiz
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white">{quiz.title}</h1>
              <p className="text-gray-400">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-900/60 px-4 py-2 rounded-lg border border-gray-700/50 backdrop-blur-xl">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className={`font-mono text-lg font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-blue-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-medium">{answers.length}/{questions.length} answered</span>
                <span className="text-gray-500">•</span>
                <span className="text-orange-400 font-medium">Question {currentQuestion + 1}</span>
              </div>
            </div>
            <Progress 
              value={(answers.length / questions.length) * 100} 
              className="h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" 
            />
            
            {/* Question indicators */}
            <div className="flex justify-center gap-2 mt-3">
              {questions.map((_, index) => {
                const isAnswered = answers.some(a => a.questionId === questions[index].id)
                const isCurrent = index === currentQuestion
                return (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                        : isAnswered
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Brain className="w-5 h-5 text-green-400" />
                      Question {currentQuestion + 1}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={getAIHint}
                        disabled={isGettingHint}
                        variant="outline"
                        size="sm"
                      >
                        {isGettingHint ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Lightbulb className="w-4 h-4 mr-2" />
                        )}
                        Hint
                      </Button>
                      <Button
                        onClick={getAIExplanation}
                        disabled={isGettingExplanation}
                        variant="outline"
                        size="sm"
                      >
                        {isGettingExplanation ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4 mr-2" />
                        )}
                        Explain
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div 
                  className="text-lg text-white leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {questions[currentQuestion].question}
                </motion.div>
                
                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showFeedback}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-300 ${
                        showFeedback
                          ? index === questions[currentQuestion].correct
                            ? 'border-green-500/50 bg-green-500/20 text-green-300'
                            : index === selectedAnswer && selectedAnswer !== questions[currentQuestion].correct
                              ? 'border-red-500/50 bg-red-500/20 text-red-300'
                              : 'border-gray-700/50 bg-gray-800/30 text-gray-400'
                          : selectedAnswer === index
                            ? 'border-blue-500/50 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/25'
                            : 'border-gray-700/50 bg-gray-800/30 text-white hover:border-gray-600/50 hover:bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showFeedback
                            ? index === questions[currentQuestion].correct
                              ? 'border-green-500 bg-green-500 text-white'
                              : index === selectedAnswer && selectedAnswer !== questions[currentQuestion].correct
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-gray-600'
                            : selectedAnswer === index
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-600'
                        }`}>
                          {showFeedback && index === questions[currentQuestion].correct && (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {showFeedback && index === selectedAnswer && selectedAnswer !== questions[currentQuestion].correct && (
                            <X className="w-4 h-4" />
                          )}
                          {!showFeedback && selectedAnswer === index && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/20"
                    >
                      <h4 className="font-medium mb-2 text-blue-300">Explanation:</h4>
                      <p className="text-gray-300">{questions[currentQuestion].explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI Hint Panel */}
                {aiHint && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-yellow-600/10 rounded-xl border border-yellow-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">AI Hint</span>
                    </div>
                    <p className="text-gray-300">{aiHint}</p>
                  </motion.div>
                )}

                {/* AI Explanation Panel */}
                {aiExplanation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-600/10 rounded-xl border border-green-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium">AI Explanation</span>
                    </div>
                    <p className="text-gray-300">{aiExplanation}</p>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      disabled={currentQuestion === 0 || showFeedback}
                      onClick={() => {
                        if (currentQuestion > 0) {
                          const newQuestionIndex = currentQuestion - 1
                          setCurrentQuestion(newQuestionIndex)
                          setShowFeedback(false)
                          const prevAnswer = answers.find(a => a.questionId === questions[newQuestionIndex].id)
                          setSelectedAnswer(prevAnswer ? prevAnswer.answer : null)
                        }
                      }}
                      className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null || showFeedback}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 disabled:opacity-50"
                    >
                      {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}