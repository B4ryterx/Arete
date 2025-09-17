import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { ScrollArea } from './ui/scroll-area'
import { askK2Think } from '../lib/k2'
import {
  ArrowLeft,
  Clock,
  Mic,
  MicOff,
  Send,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Compass,
  Target,
  BookOpen,
  Zap,
  ChevronRight
} from 'lucide-react'

interface SocraticTutorModeProps {
  onNavigate: (screen: string) => void
  lessonTitle?: string
  lessonDuration?: string
}

interface Message {
  id: string
  type: 'tutor' | 'student'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface LearningCheckpoint {
  id: string
  title: string
  completed: boolean
  step: number
}

interface TeachingStep {
  id: string
  title: string
  description: string
  current: boolean
  completed: boolean
}

export function SocraticTutorMode({ 
  onNavigate, 
  lessonTitle = "Introduction to Machine Learning",
  lessonDuration = "15 min"
}: SocraticTutorModeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'tutor',
      content: "Hey! I'm K2, your learning buddy! 🧠 I'm here to help you understand this topic like a friend would - I'll ask some questions to see what you already know, then teach you the rest in a way that makes sense. Ready to dive in?",
      timestamp: new Date()
    }
  ])
  
  const [currentMessage, setCurrentMessage] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [lessonProgress, setLessonProgress] = useState(15)
  const [timeRemaining, setTimeRemaining] = useState('12 min')
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('Key insights discovered:\n\n• Machines can learn patterns from data\n• Learning involves improving performance on tasks')
  
  const [checkpoints, setCheckpoints] = useState<LearningCheckpoint[]>([
    { id: '1', title: 'Concept explained', completed: true, step: 1 },
    { id: '2', title: 'You discovered the rule', completed: false, step: 2 },
    { id: '3', title: 'Applied to example', completed: false, step: 3 },
    { id: '4', title: 'Checkpoint quiz passed', completed: false, step: 4 }
  ])
  
  const [teachingSteps, setTeachingSteps] = useState<TeachingStep[]>([
    { id: '1', title: 'Concept', description: 'Discover the core idea', current: false, completed: true },
    { id: '2', title: 'Reflection', description: 'Think deeper about it', current: true, completed: false },
    { id: '3', title: 'Example', description: 'See it in practice', current: false, completed: false },
    { id: '4', title: 'Checkpoint Quiz', description: 'Test understanding', current: false, completed: false }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate lesson timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setLessonProgress(prev => Math.min(prev + 2, 100))
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'student',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    const userMessage = currentMessage
    setCurrentMessage('')
    
    // Get K2 response
    setIsTyping(true)
    try {
      const tutorResponse = await generateK2Response(userMessage)
      const tutorMessage: Message = {
        id: `tutor-${Date.now()}`,
        type: 'tutor',
        content: tutorResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, tutorMessage])
      
      // Update checkpoints based on conversation
      updateCheckpoints(userMessage)
    } catch (error) {
      console.error('K2 Response Error:', error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'tutor',
        content: "Sorry, I had a little hiccup there! Can you try asking that again? I'm here to help! 😊",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateK2Response = async (studentInput: string): Promise<string> => {
    // Build conversation context
    const conversationHistory = messages.slice(-6).map(msg => ({
      role: msg.type === 'student' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }))

    const result = await askK2Think([
      {
        role: "system" as const,
        content: `You are K2, a friend who's really good at explaining things. Talk like you're having a casual conversation with a friend, not giving a lecture.

Keep responses SHORT and conversational - 2-3 sentences max. Ask one question at a time. Use simple words. Be encouraging and friendly.

Current topic: ${lessonTitle}

Just chat naturally - ask what they know, then explain things simply like you would to a friend over coffee.`
      },
      ...conversationHistory,
      {
        role: "user" as const,
        content: studentInput
      }
    ])

    return result
  }

  const updateCheckpoints = (studentInput: string) => {
    // Simple logic to simulate checkpoint completion
    if (studentInput.toLowerCase().includes('data') || studentInput.toLowerCase().includes('pattern')) {
      setCheckpoints(prev => prev.map(cp => 
        cp.id === '2' ? { ...cp, completed: true } : cp
      ))
      setTeachingSteps(prev => prev.map(step => 
        step.id === '2' ? { ...step, completed: true, current: false } :
        step.id === '3' ? { ...step, current: true } : step
      ))
    }
  }

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (isRecording) setIsRecording(false)
  }

  const toggleRecording = () => {
    if (!isVoiceMode) return
    
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCurrentMessage(transcript)
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const askForHint = () => {
    const hintMessage: Message = {
      id: `hint-${Date.now()}`,
      type: 'tutor',
      content: "💡 Hint: Think about how you learned to recognize faces or understand language. What kind of information did your brain use?",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, hintMessage])
  }

  const slowDown = () => {
    const slowMessage: Message = {
      id: `slow-${Date.now()}`,
      type: 'tutor',
      content: "Let's take a step back and break this down further. Machine learning is like teaching a computer to recognize patterns. What patterns do you notice in your daily life?",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, slowMessage])
  }

  const nextStep = () => {
    const currentStepIndex = teachingSteps.findIndex(step => step.current)
    if (currentStepIndex < teachingSteps.length - 1) {
      setTeachingSteps(prev => prev.map((step, index) => ({
        ...step,
        current: index === currentStepIndex + 1,
        completed: index <= currentStepIndex
      })))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-black to-purple-950/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
        {/* Header Bar */}
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
                onClick={() => onNavigate('course')}
                className="bg-gray-800/60 border-gray-600/50 text-white hover:bg-gray-700/60"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Course
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{lessonTitle}</h1>
                  <p className="text-gray-400 text-sm">Interactive Socratic Learning</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">{timeRemaining} remaining</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={lessonProgress} className="w-24 h-2" />
                <span className="text-sm text-white">{lessonProgress}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teaching Flow Map - Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-400" />
                  Teaching Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teachingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-600/20 border border-green-500/40' 
                          : step.current 
                          ? 'bg-blue-600/20 border border-blue-500/40' 
                          : 'bg-gray-800/40 border border-gray-700/30'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : step.current ? (
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        ) : (
                          <span className="text-xs text-gray-400">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.current ? 'text-blue-300' : step.completed ? 'text-green-300' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Checkpoints */}
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Checkpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checkpoints.map((checkpoint) => (
                    <motion.div
                      key={checkpoint.id}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        checkpoint.completed 
                          ? 'bg-green-600/10 border border-green-500/20' 
                          : 'bg-gray-800/30 border border-gray-700/30'
                      }`}
                    >
                      {checkpoint.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-500 rounded-full" />
                      )}
                      <span className={`text-sm ${
                        checkpoint.completed ? 'text-green-300' : 'text-gray-400'
                      }`}>
                        {checkpoint.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expandable Notes */}
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl">
              <CardHeader className="pb-2">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    Key Ideas
                  </CardTitle>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    showNotes ? 'rotate-90' : ''
                  }`} />
                </button>
              </CardHeader>
              {showNotes && (
                <CardContent>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key insights will appear here..."
                    className="bg-gray-800/40 border-gray-600/30 text-white min-h-24 text-sm resize-none"
                  />
                </CardContent>
              )}
            </Card>
          </motion.div>

          {/* Main Teaching Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-700/30 rounded-2xl h-[600px] flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Socratic Dialogue
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleVoiceMode}
                      className={`${
                        isVoiceMode 
                          ? 'bg-purple-600/20 border-purple-500/40 text-purple-300' 
                          : 'bg-gray-800/60 border-gray-600/50 text-gray-300'
                      }`}
                    >
                      {isVoiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      {isVoiceMode ? 'Voice Mode' : 'Text Mode'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-4 rounded-2xl ${
                            message.type === 'tutor'
                              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                              : 'bg-green-600/20 border border-green-500/30 text-green-100'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                message.type === 'tutor' 
                                  ? 'bg-blue-500' 
                                  : 'bg-green-500'
                              }`}>
                                {message.type === 'tutor' ? (
                                  <Brain className="w-3 h-3 text-white" />
                                ) : (
                                  <span className="text-xs font-semibold text-white">You</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl max-w-[80%]">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300">K2 is thinking...</span>
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isVoiceMode ? "Speak your response or type..." : "Type your response..."}
                      className="bg-gray-800/40 border-gray-600/30 text-white pr-12"
                      disabled={isTyping}
                    />
                    {isVoiceMode && (
                      <button
                        onClick={toggleRecording}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                          isRecording 
                            ? 'bg-red-500 animate-pulse' 
                            : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-4 h-4 text-white" />
                        ) : (
                          <Mic className="w-4 h-4 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Voice Mode Recording Animation */}
                {isRecording && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center mt-2"
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">Recording...</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-400 rounded-full animate-pulse"
                            style={{
                              height: `${Math.random() * 20 + 10}px`,
                              animationDelay: `${i * 100}ms`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Footer Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 bg-gray-900/40 backdrop-blur-xl border border-gray-700/30 rounded-2xl p-4"
            >
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={askForHint}
                  className="bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                  variant="outline"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Ask for Hint
                </Button>
                
                <Button 
                  onClick={slowDown}
                  className="bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                  variant="outline"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Slow Down / Go Deeper
                </Button>
                
                <Button 
                  onClick={nextStep}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next Step
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
