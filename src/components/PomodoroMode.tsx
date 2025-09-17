import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Play, Pause, RotateCcw, Coffee, Brain, ArrowLeft, Settings, BarChart3, Clock, Lightbulb, Target, Sparkles, Loader2, MessageSquare, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { askK2Think } from '../lib/k2'

interface PomodoroModeProps {
  onNavigate: (screen: string) => void
}

export function PomodoroMode({ onNavigate }: PomodoroModeProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<'work' | 'break' | 'longBreak'>('work')
  const [sessionCount, setSessionCount] = useState(0)
  const [todayStats, setTodayStats] = useState({
    sessions: 3,
    totalTime: 135,
    focusTime: 105,
    breakTime: 30
  })

  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
    subject: 'Mathematics'
  })

  const [currentTask, setCurrentTask] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  // K2 AI states
  const [aiStudyPlan, setAiStudyPlan] = useState('')
  const [aiMotivation, setAiMotivation] = useState('')
  const [aiTaskSuggestions, setAiTaskSuggestions] = useState('')
  const [aiSessionAnalysis, setAiSessionAnalysis] = useState('')
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGettingMotivation, setIsGettingMotivation] = useState(false)
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false)
  const [isAnalyzingSession, setIsAnalyzingSession] = useState(false)
  const [sessionNotes, setSessionNotes] = useState('')

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature']
  
  const recentSessions = [
    { subject: 'Mathematics', duration: 25, type: 'focus', time: '10:30 AM' },
    { subject: 'Physics', duration: 5, type: 'break', time: '10:55 AM' },
    { subject: 'Mathematics', duration: 25, type: 'focus', time: '11:00 AM' },
    { subject: 'Chemistry', duration: 5, type: 'break', time: '11:25 AM' },
    { subject: 'Physics', duration: 25, type: 'focus', time: '11:30 AM' }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSessionComplete = async () => {
    // Save completed session to backend
    try {
      const token = localStorage.getItem('supabase_token')
      if (token) {
        const { api } = await import('../utils/api')
        const duration = currentSession === 'work' ? settings.workDuration : 
                        currentSession === 'longBreak' ? settings.longBreak : settings.shortBreak
        
        await api.savePomodoroSession(currentSession, duration, settings.subject, true, token)
      }
    } catch (error) {
      console.error('Failed to save Pomodoro session:', error)
    }
    
    setIsRunning(false)
    setSessionCount(prev => prev + 1)
    
    // Auto-generate motivation for completed work sessions
    if (currentSession === 'work') {
      try {
        const result = await askK2Think([
          {
            role: "system",
            content: `You are K2, a motivational study coach. Provide a short, encouraging message for completing a Pomodoro session.

Be:
- Congratulatory and positive
- Specific to their achievement
- Motivating for the next session
- Brief (1-2 sentences)

Celebrate their focus and encourage continued progress.`
          },
          {
            role: "user",
            content: `The student just completed a ${settings.workDuration}-minute work session on ${settings.subject}. They've completed ${sessionCount + 1} sessions today. Task: ${currentTask || 'No specific task'}. Give them a quick motivational message!`
          }
        ])
        setAiMotivation(result)
      } catch (error) {
        console.error('Error generating motivation:', error)
      }
    }
    
    if (currentSession === 'work') {
      // Start break
      if ((sessionCount + 1) % settings.sessionsUntilLongBreak === 0) {
        setCurrentSession('longBreak')
        setTimeLeft(settings.longBreak * 60)
      } else {
        setCurrentSession('break')
        setTimeLeft(settings.shortBreak * 60)
      }
    } else {
      // Start work session
      setCurrentSession('work')
      setTimeLeft(settings.workDuration * 60)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentSession('work')
    setTimeLeft(settings.workDuration * 60)
  }

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work': return 'bg-blue-500'
      case 'break': return 'bg-green-500'
      case 'longBreak': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  const getSessionText = () => {
    switch (currentSession) {
      case 'work': return 'Focus Session'
      case 'break': return 'Short Break'
      case 'longBreak': return 'Long Break'
      default: return 'Focus Session'
    }
  }

  const getSessionIcon = () => {
    switch (currentSession) {
      case 'work': return Brain
      case 'break': return Coffee
      case 'longBreak': return Coffee
      default: return Brain
    }
  }

  // K2 AI Functions
  const generateStudyPlan = async () => {
    setIsGeneratingPlan(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a personal study coach. Create a personalized study plan for Pomodoro sessions.

Create a study plan that includes:
1. **Study Goals** - What the student should achieve
2. **Session Structure** - How to organize Pomodoro sessions
3. **Subject Focus** - Specific topics to cover
4. **Progress Tracking** - How to measure success
5. **Motivation Tips** - Ways to stay focused and motivated

Be encouraging, practical, and specific to the subject they're studying.`
        },
        {
          role: "user",
          content: `Create a study plan for ${settings.subject} using Pomodoro technique. The student wants to study for ${settings.workDuration}-minute sessions with ${settings.shortBreak}-minute breaks. Current task: ${currentTask || 'No specific task set'}.`
        }
      ])
      setAiStudyPlan(result)
    } catch (error) {
      setAiStudyPlan(`Error generating study plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const getMotivation = async () => {
    setIsGettingMotivation(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a motivational study coach. Provide encouraging, personalized motivation for the student's Pomodoro session.

Be:
- Encouraging and supportive
- Specific to their current study situation
- Motivational but not overwhelming
- Focused on their progress and potential
- Practical and actionable

Keep it short (2-3 sentences) and inspiring.`
        },
        {
          role: "user",
          content: `The student is studying ${settings.subject} for ${settings.workDuration} minutes. They've completed ${sessionCount} sessions today. Current task: ${currentTask || 'No specific task'}. Session type: ${getSessionText()}. Give them motivation to keep going!`
        }
      ])
      setAiMotivation(result)
    } catch (error) {
      setAiMotivation(`Error getting motivation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGettingMotivation(false)
    }
  }

  const getTaskSuggestions = async () => {
    setIsGettingSuggestions(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a study planning expert. Suggest specific, actionable tasks for Pomodoro sessions.

For each suggestion, provide:
- A clear, specific task
- Why it's good for a ${settings.workDuration}-minute session
- How to break it down if needed
- Expected outcome

Make suggestions practical and achievable within the time frame.`
        },
        {
          role: "user",
          content: `Suggest 3-5 specific study tasks for ${settings.subject} that can be completed in ${settings.workDuration}-minute Pomodoro sessions. The student is currently working on: ${currentTask || 'No specific task'}.`
        }
      ])
      setAiTaskSuggestions(result)
    } catch (error) {
      setAiTaskSuggestions(`Error getting suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGettingSuggestions(false)
    }
  }

  const analyzeSession = async () => {
    setIsAnalyzingSession(true)
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: `You are K2, a learning analytics expert. Analyze the student's Pomodoro session performance and provide insights.

Analyze:
1. **Session Performance** - How well they focused
2. **Productivity Patterns** - When they're most effective
3. **Areas for Improvement** - What they can do better
4. **Recommendations** - Specific advice for next sessions
5. **Progress Recognition** - Celebrate their achievements

Be encouraging, specific, and actionable.`
        },
        {
          role: "user",
          content: `Analyze this Pomodoro session:
- Subject: ${settings.subject}
- Session Type: ${getSessionText()}
- Duration: ${settings.workDuration} minutes
- Sessions Completed Today: ${sessionCount}
- Task: ${currentTask || 'No specific task'}
- Session Notes: ${sessionNotes || 'No notes provided'}

Provide analysis and recommendations.`
        }
      ])
      setAiSessionAnalysis(result)
    } catch (error) {
      setAiSessionAnalysis(`Error analyzing session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzingSession(false)
    }
  }

  const SessionIcon = getSessionIcon()

  const progressPercentage = () => {
    const totalTime = currentSession === 'work' 
      ? settings.workDuration * 60 
      : currentSession === 'break' 
        ? settings.shortBreak * 60 
        : settings.longBreak * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      {/* Enhanced Background with blue-to-purple gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-white">Pomodoro Mode</h1>
              </div>
              <p className="text-gray-400">Stay focused with structured study sessions</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Timer */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${getSessionColor()} rounded-full flex items-center justify-center`}>
                    <SessionIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{getSessionText()}</CardTitle>
                    <p className="text-gray-600">{settings.subject}</p>
                  </div>
                </div>
                <Badge className={`${getSessionColor()} text-white px-4 py-2`}>
                  Session {sessionCount + 1}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Circular Progress */}
                <motion.div 
                  className="relative w-64 h-64 mx-auto"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 256 256">
                    <circle
                      cx="128"
                      cy="128"
                      r="112"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="128"
                      cy="128"
                      r="112"
                      fill="none"
                      stroke={currentSession === 'work' ? '#3b82f6' : currentSession === 'break' ? '#10b981' : '#8b5cf6'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 112}`}
                      strokeDashoffset={`${2 * Math.PI * 112 * (1 - progressPercentage() / 100)}`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 112}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 112 * (1 - progressPercentage() / 100)}` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{
                        filter: isRunning ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="text-center"
                      animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div 
                        className="text-5xl font-mono font-bold text-gray-900"
                        animate={timeLeft <= 60 && isRunning ? { color: ['#111827', '#ef4444', '#111827'] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {formatTime(timeLeft)}
                      </motion.div>
                      <motion.p 
                        className="text-gray-600 mt-2"
                        animate={isRunning ? { opacity: [0.6, 1, 0.6] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isRunning ? 'In Progress' : 'Paused'}
                      </motion.p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Session Info */}
                <div className="bg-gray-100/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="text-gray-600">Work Session</div>
                      <div className="font-semibold text-lg text-blue-600">{settings.workDuration} min</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Sessions Today</div>
                      <div className="font-semibold text-lg text-green-600">{sessionCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Short Break</div>
                      <div className="font-semibold text-lg text-orange-600">{settings.shortBreak} min</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Long Break</div>
                      <div className="font-semibold text-lg text-purple-600">{settings.longBreak} min</div>
                    </div>
                  </div>
                  <div className="text-center mt-3 pt-3 border-t border-gray-300/50">
                    <span className="text-gray-600">Subject: </span>
                    <span className="font-semibold text-gray-800">{settings.subject}</span>
                  </div>
                </div>

                {/* Current Task */}
                <div className="space-y-2">
                  <label className="block font-medium">Current Task (Optional)</label>
                  <Input 
                    placeholder="What are you working on?"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    className="bg-white/50"
                  />
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={startTimer} size="lg" className="px-8">
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={pauseTimer} size="lg" variant="outline" className="px-8">
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </Button>
                    </motion.div>
                  )}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={resetTimer} variant="outline" size="lg">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </motion.div>
                </div>

                {/* Study Blocks Progress */}
                <div className="mt-6">
                  <p className="text-center text-gray-600 mb-3">Study Sessions Progress</p>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, index) => (
                      <motion.div
                        key={index}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                          index < sessionCount 
                            ? 'bg-blue-500 border-blue-500 text-white' 
                            : index === sessionCount && isRunning
                            ? 'bg-blue-100 border-blue-500 text-blue-600'
                            : 'bg-gray-100 border-gray-300 text-gray-400'
                        }`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {index < sessionCount ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            ✓
                          </motion.div>
                        ) : index === sessionCount && isRunning ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Brain className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          index + 1
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* K2 AI Assistant Section */}
            <Card className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm border-purple-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Brain className="w-5 h-5" />
                  K2 AI Study Assistant
                </CardTitle>
                <p className="text-gray-400 text-sm">Get personalized study help and motivation</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={generateStudyPlan}
                    disabled={isGeneratingPlan}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Study Plan
                  </Button>
                  <Button
                    onClick={getMotivation}
                    disabled={isGettingMotivation}
                    variant="outline"
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    {isGettingMotivation ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Motivation
                  </Button>
                  <Button
                    onClick={getTaskSuggestions}
                    disabled={isGettingSuggestions}
                    variant="outline"
                    className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                  >
                    {isGettingSuggestions ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lightbulb className="w-4 h-4 mr-2" />
                    )}
                    Task Ideas
                  </Button>
                  <Button
                    onClick={analyzeSession}
                    disabled={isAnalyzingSession}
                    variant="outline"
                    className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                  >
                    {isAnalyzingSession ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    )}
                    Analyze
                  </Button>
                </div>

                {/* Session Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Session Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about your session, what you learned, or any challenges..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="bg-gray-800/50 border-gray-600/30 text-gray-300 placeholder-gray-500"
                    rows={3}
                  />
                </div>

                {/* AI Response Displays */}
                {aiStudyPlan && (
                  <div className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Study Plan
                    </h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiStudyPlan}</p>
                  </div>
                )}

                {aiMotivation && (
                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Motivation
                    </h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiMotivation}</p>
                  </div>
                )}

                {aiTaskSuggestions && (
                  <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Task Suggestions
                    </h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiTaskSuggestions}</p>
                  </div>
                )}

                {aiSessionAnalysis && (
                  <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-4">
                    <h4 className="text-orange-300 font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Session Analysis
                    </h4>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{aiSessionAnalysis}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Settings - Always Visible */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-sm border-blue-500/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <Clock className="w-5 h-5" />
                  Quick Settings
                </CardTitle>
                <p className="text-gray-400 text-sm">Customize your Pomodoro sessions</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Options */}
                <div>
                  <label className="block font-medium text-gray-300 mb-3">Quick Presets</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({...settings, workDuration: 25, shortBreak: 5, longBreak: 15, sessionsUntilLongBreak: 4})}
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                    >
                      Classic (25/5/15)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({...settings, workDuration: 45, shortBreak: 10, longBreak: 20, sessionsUntilLongBreak: 3})}
                      className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                    >
                      Extended (45/10/20)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({...settings, workDuration: 15, shortBreak: 3, longBreak: 10, sessionsUntilLongBreak: 6})}
                      className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                    >
                      Sprint (15/3/10)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings({...settings, workDuration: 30, shortBreak: 7, longBreak: 20, sessionsUntilLongBreak: 4})}
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      Balanced (30/7/20)
                    </Button>
                  </div>
                </div>

                {/* Current Settings Display */}
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Work:</span>
                      <span className="text-white ml-2 font-semibold">{settings.workDuration}min</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Short Break:</span>
                      <span className="text-white ml-2 font-semibold">{settings.shortBreak}min</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Long Break:</span>
                      <span className="text-white ml-2 font-semibold">{settings.longBreak}min</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sessions:</span>
                      <span className="text-white ml-2 font-semibold">{settings.sessionsUntilLongBreak}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-700/50">
                    <span className="text-gray-400">Subject:</span>
                    <span className="text-white ml-2 font-semibold">{settings.subject}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full border-gray-600/30 text-gray-300 hover:bg-gray-700/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showSettings ? 'Hide' : 'Show'} Advanced Settings
                </Button>
              </CardContent>
            </Card>

            {/* Advanced Settings Panel */}
            {showSettings && (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Advanced Settings
                  </CardTitle>
                  <p className="text-gray-600 text-sm">Fine-tune your Pomodoro experience</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Duration Settings */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Session Durations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium mb-2 text-gray-700">Work Duration (minutes)</label>
                        <Input 
                          type="number"
                          min="5"
                          max="60"
                          value={settings.workDuration}
                          onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                          className="bg-white/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 15-45 minutes</p>
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700">Short Break (minutes)</label>
                        <Input 
                          type="number"
                          min="1"
                          max="30"
                          value={settings.shortBreak}
                          onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})}
                          className="bg-white/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 3-10 minutes</p>
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700">Long Break (minutes)</label>
                        <Input 
                          type="number"
                          min="5"
                          max="60"
                          value={settings.longBreak}
                          onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})}
                          className="bg-white/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 10-30 minutes</p>
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700">Sessions until Long Break</label>
                        <Input 
                          type="number"
                          min="2"
                          max="10"
                          value={settings.sessionsUntilLongBreak}
                          onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value) || 4})}
                          className="bg-white/50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Recommended: 3-6 sessions</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Study Subject</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map(subject => (
                        <Button
                          key={subject}
                          variant={settings.subject === subject ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSettings({...settings, subject})}
                          className={settings.subject === subject 
                            ? "bg-blue-600 text-white" 
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                          }
                        >
                          {subject}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Session Summary */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Session Summary</h4>
                    <p className="text-sm text-blue-700">
                      You'll work for <strong>{settings.workDuration} minutes</strong>, 
                      take a <strong>{settings.shortBreak}-minute break</strong>, 
                      and repeat this <strong>{settings.sessionsUntilLongBreak} times</strong> 
                      before taking a <strong>{settings.longBreak}-minute long break</strong>.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Total cycle time: {(settings.workDuration + settings.shortBreak) * (settings.sessionsUntilLongBreak - 1) + settings.workDuration + settings.longBreak} minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{todayStats.sessions}</div>
                    <p className="text-sm text-blue-700">Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{todayStats.focusTime}m</div>
                    <p className="text-sm text-green-700">Focus Time</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Goal</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-600">105 of 140 minutes completed</p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Next Break In:</h4>
                  <p className="text-sm text-blue-800">
                    {settings.sessionsUntilLongBreak - (sessionCount % settings.sessionsUntilLongBreak)} sessions
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      session.type === 'focus' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {session.type === 'focus' ? (
                        <Brain className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Coffee className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{session.subject}</p>
                      <p className="text-xs text-gray-600">{session.duration}m • {session.time}</p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        session.type === 'focus' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {session.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setSettings({...settings, workDuration: 25, shortBreak: 5})
                    resetTimer()
                  }}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Classic (25/5)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setSettings({...settings, workDuration: 50, shortBreak: 10})
                    resetTimer()
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Extended (50/10)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    setSettings({...settings, workDuration: 15, shortBreak: 5})
                    resetTimer()
                  }}
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Quick (15/5)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}