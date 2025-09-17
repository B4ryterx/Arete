import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  Brain, BookOpen, Target, Timer, TrendingUp, Award, Clock, Zap, 
  Medal, Trophy, Star, CheckCircle, ArrowRight, User, Flame, 
  MessageSquare, Calendar, Map, Sparkles, Users, Wrench, Loader2, Microscope
} from 'lucide-react'
import { runAllK2Tests } from '../utils/k2-test'

interface DashboardProps {
  onNavigate: (screen: string) => void
}

interface Badge {
  id: string
  title: string
  description: string
  icon: any
  earned: boolean
  color: string
  progress?: number
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [xpProgress, setXpProgress] = useState(0)
  const [k2TestResults, setK2TestResults] = useState<any>(null)
  const [isTestingK2, setIsTestingK2] = useState(false)

  useEffect(() => {
    loadUserData()
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animate XP progress bar
    if (userStats) {
      const timer = setTimeout(() => {
        setXpProgress(68) // 68% towards next level
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userStats])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('supabase_token')
      const demoUser = localStorage.getItem('demo_user')
      
      if (token && demoUser) {
        // Use demo user data
        const user = JSON.parse(demoUser)
        const demoStats = {
          profile: {
            name: user.name,
            email: user.email,
            avatar: null,
            level: 3,
            xp: 2750,
            xpToNext: 4000,
            totalStudyHours: 47.5,
            coursesCompleted: 8,
            streakDays: 12
          },
          stats: {
            weeklyGoal: 20,
            weeklyProgress: 14.5,
            avgRetention: 87,
            totalQuizzes: 24
          }
        }
        setUserStats(demoStats)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testK2AI = async () => {
    setIsTestingK2(true)
    try {
      const results = await runAllK2Tests()
      setK2TestResults(results)
      console.log('K2 Test Results:', results)
    } catch (error) {
      console.error('K2 Test Error:', error)
      setK2TestResults({
        connection: { success: false, message: 'Test failed', error: error.message },
        quiz: { success: false, message: 'Test failed', error: error.message }
      })
    } finally {
      setIsTestingK2(false)
    }
  }

  const studyData = [
    { date: 'Mon', hours: 2.5, retention: 85 },
    { date: 'Tue', hours: 3.2, retention: 78 },
    { date: 'Wed', hours: 1.8, retention: 92 },
    { date: 'Thu', hours: 4.1, retention: 88 },
    { date: 'Fri', hours: 3.7, retention: 95 },
    { date: 'Sat', hours: 2.9, retention: 91 },
    { date: 'Sun', hours: 3.4, retention: 87 }
  ]

  const subjectMastery = [
    { subject: 'Mathematics', mastery: 92, lessons: 24 },
    { subject: 'Physics', mastery: 78, lessons: 18 },
    { subject: 'Chemistry', mastery: 85, lessons: 21 },
    { subject: 'Biology', mastery: 94, lessons: 16 }
  ]

  const activityDistribution = [
    { name: 'Course Study', value: 35, color: 'rgba(59, 130, 246, 0.8)' },
    { name: 'Quiz Practice', value: 25, color: 'rgba(16, 185, 129, 0.8)' },
    { name: 'Feynman Mode', value: 20, color: 'rgba(245, 158, 11, 0.8)' },
    { name: 'Pomodoro', value: 20, color: 'rgba(239, 68, 68, 0.8)' }
  ]

  const weeklyGoals = [
    { goal: 'Study 20 hours', current: 16, target: 20, icon: Clock, completed: false },
    { goal: 'Complete 50 quizzes', current: 50, target: 50, icon: Target, completed: true },
    { goal: 'Maintain 90% retention', current: 87, target: 90, icon: Brain, completed: false },
    { goal: 'Finish 3 courses', current: 2, target: 3, icon: BookOpen, completed: false }
  ]

  const badges: Badge[] = [
    {
      id: 'quiz-master',
      title: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: Target,
      earned: true,
      color: 'text-green-400',
      progress: 100
    },
    {
      id: 'streak-hero',
      title: 'Streak Hero',
      description: '10+ day streak',
      icon: Flame,
      earned: true,
      color: 'text-orange-400',
      progress: 100
    },
    {
      id: 'pomodoro-pro',
      title: 'Pomodoro Pro',
      description: '100 focus sessions',
      icon: Timer,
      earned: false,
      color: 'text-red-400',
      progress: 75
    },
    {
      id: 'knowledge-guru',
      title: 'Knowledge Guru',
      description: '90%+ avg retention',
      icon: Brain,
      earned: false,
      color: 'text-purple-400',
      progress: 87
    }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-lg shadow-black/50">
          <p className="text-gray-300 text-sm font-medium">{`${label}`}</p>
          <p className="text-blue-400 text-sm">
            {`Study Hours: ${payload[0].value.toFixed(1)}h`}
          </p>
          <p className="text-green-400 text-sm">
            {`Retention: ${payload[0].payload.retention}%`}
          </p>
        </div>
      )
    }
    return null
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden">
      {/* Enhanced Background with subtle blue-to-purple gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      
      <div className={`max-w-7xl mx-auto space-y-6 relative z-10 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header with Profile Card */}
        <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* K2 AI Test Button */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={testK2AI}
              disabled={isTestingK2}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50"
            >
              {isTestingK2 ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4 mr-2" />
              )}
              {isTestingK2 ? 'Testing K2...' : 'Test K2 AI'}
            </Button>
            
            {k2TestResults && (
              <div className="text-xs space-y-1">
                <div className={`flex items-center gap-1 ${k2TestResults.connection.success ? 'text-green-400' : 'text-red-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Connection: {k2TestResults.connection.success ? 'OK' : 'Failed'}
                </div>
                <div className={`flex items-center gap-1 ${k2TestResults.quiz.success ? 'text-green-400' : 'text-red-400'}`}>
                  <CheckCircle className="w-3 h-3" />
                  Quiz Gen: {k2TestResults.quiz.success ? 'OK' : 'Failed'}
                </div>
              </div>
            )}
          </div>
          
          {/* Profile Card */}
          <Card className="bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 shadow-lg shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-blue-500/30">
                  <AvatarImage src={userStats?.profile?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {userStats?.profile?.name ? getInitials(userStats.profile.name) : 'AR'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">
                    Hi {userStats?.profile?.name?.split(' ')[0] || 'Student'}, here's your progress this week
                  </p>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {userStats?.profile?.name || 'Demo User'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">{userStats?.profile?.streakDays || 0} day streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Level {userStats?.profile?.level || 1}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Progress and Actions */}
          <div className="flex flex-col items-end gap-4">
            {/* XP Progress Bar */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-lg p-4 min-w-[300px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">XP Progress</span>
                <span className="text-sm text-blue-400 font-medium">
                  {userStats?.profile?.xp || 0} / {userStats?.profile?.xpToNext || 4000}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={xpProgress} 
                  className="h-3 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500 [&>div]:shadow-lg [&>div]:shadow-blue-500/50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600/20 text-green-300 border-green-600/30 px-3 py-1 hover:bg-green-600/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this week
              </Badge>
              <button
                onClick={() => {
                  localStorage.removeItem('supabase_token')
                  localStorage.removeItem('demo_user')
                  window.location.reload()
                }}
                className="text-xs text-gray-400 hover:text-gray-300 px-3 py-2 hover:bg-gray-800/50 rounded-lg transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Gamification - Badges */}
        <Card className={`bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-xl border-gray-700/50 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-yellow-500/25' 
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <badge.icon className={`w-6 h-6 ${badge.earned ? 'text-yellow-400' : badge.color}`} />
                    {badge.earned && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </div>
                  <h4 className="font-medium text-white text-sm mb-1">{badge.title}</h4>
                  <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                  {!badge.earned && (
                    <Progress value={badge.progress} className="h-1.5" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced KPI Cards with Glowing Accents */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-white border-blue-500/30 backdrop-blur-xl hover:shadow-lg hover:shadow-blue-500/25 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 group-hover:text-blue-100 transition-colors">Total Study Time</p>
                  <p className="text-2xl font-semibold group-hover:text-white transition-colors">
                    {userStats?.profile?.totalStudyHours ? `${userStats.profile.totalStudyHours}h` : '47.5h'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-300 group-hover:text-blue-200 transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 text-white border-green-500/30 backdrop-blur-xl hover:shadow-lg hover:shadow-green-500/25 hover:border-green-400/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 group-hover:text-green-100 transition-colors">Avg. Retention</p>
                  <p className="text-2xl font-semibold group-hover:text-white transition-colors">
                    {userStats?.stats?.avgRetention || 87}%
                  </p>
                </div>
                <Brain className="w-8 h-8 text-green-300 group-hover:text-green-200 transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 text-white border-orange-500/30 backdrop-blur-xl hover:shadow-lg hover:shadow-orange-500/25 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 group-hover:text-orange-100 transition-colors">Quizzes Completed</p>
                  <p className="text-2xl font-semibold group-hover:text-white transition-colors">{userStats?.stats?.totalQuizzes || 24}</p>
                </div>
                <Target className="w-8 h-8 text-orange-300 group-hover:text-orange-200 transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 text-white border-purple-500/30 backdrop-blur-xl hover:shadow-lg hover:shadow-purple-500/25 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 group-hover:text-purple-100 transition-colors">Current Streak</p>
                  <p className="text-2xl font-semibold group-hover:text-white transition-colors">{userStats?.profile?.streakDays || 12} days</p>
                </div>
                <Zap className="w-8 h-8 text-purple-300 group-hover:text-purple-200 transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts with Custom Tooltips */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Enhanced Study Progress Chart */}
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Weekly Study Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(55, 65, 81, 0.3)" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3b82f6" 
                    fill="url(#colorHours)" 
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enhanced Activity Distribution with Flattened Colors */}
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-blue-400" />
                Learning Activity Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={activityDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      border: '1px solid rgba(75, 85, 99, 0.5)', 
                      borderRadius: '8px',
                      backdropFilter: 'blur(12px)',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Goals Section with Animations */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Subject Mastery */}
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Subject Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjectMastery.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-white">{subject.subject}</span>
                    <span className="text-sm text-gray-400">{subject.mastery}%</span>
                  </div>
                  <Progress 
                    value={subject.mastery} 
                    className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" 
                  />
                  <p className="text-xs text-gray-500">{subject.lessons} lessons completed</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Enhanced Weekly Goals */}
          <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-blue-400" />
                Weekly Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {goal.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />
                      ) : (
                        <goal.icon className="w-4 h-4 text-blue-400" />
                      )}
                      <span className={`font-medium ${goal.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                        {goal.goal}
                      </span>
                      {goal.completed && (
                        <Badge className="bg-green-600/20 text-green-300 border-green-600/30 text-xs px-2 py-1">
                          Completed!
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">{goal.current}/{goal.target}</span>
                  </div>
                  <Progress 
                    value={(goal.current / goal.target) * 100} 
                    className={`h-2 ${goal.completed ? '[&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-green-400' : '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500'}`}
                  />
                </div>
              ))}
              
              {/* Suggested Next Goal */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-300 mb-1">Suggested Next Goal</h4>
                    <p className="text-sm text-gray-300 mb-2">Complete 5 Feynman explanations this week</p>
                    <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                      Set Goal <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Quick Actions with Icons and Shadows */}
        <Card className={`bg-gray-900/60 backdrop-blur-xl border-gray-700/50 transition-all duration-700 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => onNavigate('course')}
                className="p-8 bg-gradient-to-br from-blue-600/20 to-blue-700/20 hover:from-blue-600/30 hover:to-blue-700/30 rounded-xl transition-all duration-300 group border border-blue-600/30 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-2 transform"
              >
                <BookOpen className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                <p className="font-medium text-white group-hover:text-blue-200 transition-colors text-center">Course Mode</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Interactive lessons and AI tutoring</p>
              </button>
              <button 
                onClick={() => onNavigate('study')}
                className="p-8 bg-gradient-to-br from-purple-600/20 to-purple-700/20 hover:from-purple-600/30 hover:to-purple-700/30 rounded-xl transition-all duration-300 group border border-purple-600/30 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 transform"
              >
                <Brain className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                <p className="font-medium text-white group-hover:text-purple-200 transition-colors text-center">Study Mode</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Quiz, Feynman & Pomodoro tools</p>
              </button>
              <button 
                onClick={() => onNavigate('olympiad')}
                className="p-8 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 hover:from-yellow-600/30 hover:to-orange-600/30 rounded-xl transition-all duration-300 group border border-yellow-600/30 hover:border-yellow-500/50 hover:shadow-xl hover:shadow-yellow-500/25 hover:-translate-y-2 transform"
              >
                <Trophy className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                <p className="font-medium text-white group-hover:text-yellow-200 transition-colors text-center">Olympiad Mode</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Competitive challenges & rankings</p>
              </button>
              <button 
                onClick={() => onNavigate('research')}
                className="p-8 bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-xl transition-all duration-300 group border border-purple-600/30 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 transform relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs border-0">
                    NEW
                  </Badge>
                </div>
                <Microscope className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto" />
                <p className="font-medium text-white group-hover:text-purple-200 transition-colors text-center">Research Mode</p>
                <p className="text-sm text-gray-400 mt-2 text-center">Advanced AI research tools</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}