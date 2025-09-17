import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginScreen } from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { CourseMode } from './components/CourseMode'
import { StudyMode } from './components/StudyMode'
import { QuizMode } from './components/QuizMode'
import { FeynmanMode } from './components/FeynmanMode'
import { PomodoroMode } from './components/PomodoroMode'
import { MindmapEditor } from './components/MindmapEditor'
import { OlympiadMode } from './components/OlympiadMode'
import { SocraticTutorMode } from './components/SocraticTutorMode'
import ResearchMode from './components/ResearchMode'
import { Navigation } from './components/Navigation'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = () => {
      const token = localStorage.getItem('supabase_token')
      const demoUser = localStorage.getItem('demo_user')
      
      if (token && demoUser) {
        try {
          const user = JSON.parse(demoUser)
          if (user && user.id) {
            console.log('Found existing demo session for:', user.email)
            setIsLoggedIn(true)
            setCurrentScreen('dashboard')
          }
        } catch (error) {
          console.error('Session check failed:', error)
          localStorage.removeItem('supabase_token')
          localStorage.removeItem('demo_user')
        }
      }
    }
    
    checkExistingSession()
  }, [])

  const handleLogin = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setIsLoggedIn(true)
      setCurrentScreen('dashboard')
      setIsTransitioning(false)
    }, 500)
  }

  const handleNavigate = (screen: string) => {
    if (screen === currentScreen) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentScreen(screen)
      setIsTransitioning(false)
    }, 300)
  }

  const renderScreen = () => {
    if (!isLoggedIn) {
      return <LoginScreen onLogin={handleLogin} />
    }

    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'course':
        return <CourseMode onNavigate={handleNavigate} />
      case 'socratic-tutor':
        return <SocraticTutorMode onNavigate={handleNavigate} />
      case 'study':
        return <StudyMode onNavigate={handleNavigate} />
      case 'quiz':
        return <QuizMode onNavigate={handleNavigate} />
      case 'feynman':
        return <FeynmanMode onNavigate={handleNavigate} />
      case 'pomodoro':
        return <PomodoroMode onNavigate={handleNavigate} />
      case 'mindmap':
        return <MindmapEditor onNavigate={handleNavigate} />
      case 'olympiad':
        return <OlympiadMode onNavigate={handleNavigate} />
      case 'research':
        return <ResearchMode onNavigate={handleNavigate} />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* Animated transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white">Loading...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Screen content with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ 
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1.0]
          }}
          className={`${isLoggedIn ? 'pb-24' : ''}`}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation with slide-up animation */}
      <AnimatePresence>
        {isLoggedIn && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}