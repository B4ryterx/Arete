import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { askK2Think } from '../lib/k2';
import { 
  ChevronLeft, 
  Target, 
  MessageSquare, 
  Timer, 
  Brain,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Map,
  Loader2,
  Lightbulb,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyModeProps {
  onNavigate: (screen: string) => void;
}

export function StudyMode({ onNavigate }: StudyModeProps) {
  const [currentView, setCurrentView] = useState<'hub' | 'quiz' | 'feynman' | 'pomodoro'>('hub');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [aiProgressAnalysis, setAiProgressAnalysis] = useState('');
  const [aiStudyPlan, setAiStudyPlan] = useState('');
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);
  const [isAnalyzingProgress, setIsAnalyzingProgress] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Study stats for the hub
  const studyStats = {
    weeklyGoal: 20,
    hoursThisWeek: 14.5,
    completedSessions: 12,
    focusStreak: 5
  };

  // AI-powered study functions
  const getAIRecommendations = async () => {
    setIsGettingRecommendations(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are an AI study coach. Analyze the student's study patterns and provide personalized recommendations for: 1) Optimal study times, 2) Study techniques that work best for them, 3) Areas to focus on, 4) How to improve focus and retention. Be specific and actionable."
        },
        {
          role: "user",
          content: `Study Statistics:\n- Weekly Goal: ${studyStats.weeklyGoal} hours\n- Hours This Week: ${studyStats.hoursThisWeek} hours\n- Completed Sessions: ${studyStats.completedSessions}\n- Focus Streak: ${studyStats.focusStreak} days\n\nPlease provide personalized study recommendations based on this data.`
        }
      ]);
      setAiRecommendations(result);
    } catch (error) {
      setAiRecommendations(`Error getting recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingRecommendations(false);
    }
  };

  const getAIProgressAnalysis = async () => {
    setIsAnalyzingProgress(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are a learning analytics expert. Analyze the student's progress and provide insights on: 1) Performance trends, 2) Strengths and weaknesses, 3) Learning velocity, 4) Areas needing attention, 5) Recommendations for improvement."
        },
        {
          role: "user",
          content: `Study Progress Data:\n- Weekly Goal: ${studyStats.weeklyGoal} hours\n- Hours This Week: ${studyStats.hoursThisWeek} hours\n- Completed Sessions: ${studyStats.completedSessions}\n- Focus Streak: ${studyStats.focusStreak} days\n\nPlease analyze this progress and provide detailed insights.`
        }
      ]);
      setAiProgressAnalysis(result);
    } catch (error) {
      setAiProgressAnalysis(`Error analyzing progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzingProgress(false);
    }
  };

  const getAIStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are an expert study planner. Create a personalized study plan based on the student's data. Include: 1) Daily study schedule, 2) Subject prioritization, 3) Study techniques to use, 4) Break recommendations, 5) Goal milestones. Make it practical and achievable."
        },
        {
          role: "user",
          content: `Create a study plan for:\n- Weekly Goal: ${studyStats.weeklyGoal} hours\n- Hours This Week: ${studyStats.hoursThisWeek} hours\n- Completed Sessions: ${studyStats.completedSessions}\n- Focus Streak: ${studyStats.focusStreak} days\n\nGenerate a comprehensive study plan.`
        }
      ]);
      setAiStudyPlan(result);
    } catch (error) {
      setAiStudyPlan(`Error generating study plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const studyModes = [
    {
      id: 'quiz',
      title: 'Quiz Mode',
      description: 'Practice quizzes linked to course topics',
      icon: Target,
      color: 'from-green-600/20 to-green-700/20 border-green-600/30 hover:border-green-500/50 hover:shadow-green-500/25',
      textColor: 'text-green-400',
      features: ['Track progress', 'Identify weaknesses', 'Adaptive difficulty', 'Instant feedback'],
      stats: { completed: 24, accuracy: 87 }
    },
    {
      id: 'feynman',
      title: 'Feynman Mode', 
      description: 'Explain concepts in your own words',
      icon: MessageSquare,
      color: 'from-orange-600/20 to-orange-700/20 border-orange-600/30 hover:border-orange-500/50 hover:shadow-orange-500/25',
      textColor: 'text-orange-400',
      features: ['Write explanations', 'Improve clarity', 'AI feedback', 'Deep understanding'],
      stats: { explanations: 8, clarity: 92 }
    },
    {
      id: 'pomodoro',
      title: 'Pomodoro Mode',
      description: 'Structured focus sessions with breaks',
      icon: Timer,
      color: 'from-red-600/20 to-red-700/20 border-red-600/30 hover:border-red-500/50 hover:shadow-red-500/25',
      textColor: 'text-red-400',
      features: ['Custom durations', 'Break reminders', 'Session tracking', 'Focus analytics'],
      stats: { sessions: 35, avgFocus: 28 }
    },
    {
      id: 'mindmap',
      title: 'Mindmap Editor',
      description: 'Visualize concepts and connections',
      icon: Map,
      color: 'from-indigo-600/20 to-indigo-700/20 border-indigo-600/30 hover:border-indigo-500/50 hover:shadow-indigo-500/25',
      textColor: 'text-indigo-400',
      features: ['Visual mapping', 'Connect ideas', 'Export options', 'Collaborative editing'],
      stats: { mindmaps: 12, nodes: 156 }
    }
  ];

  const handleModeSelect = (modeId: string) => {
    if (modeId === 'quiz') {
      onNavigate('quiz');
    } else if (modeId === 'feynman') {
      onNavigate('feynman');
    } else if (modeId === 'pomodoro') {
      onNavigate('pomodoro');
    } else if (modeId === 'mindmap') {
      onNavigate('mindmap');
    }
  };

  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header */}
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

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Study Mode
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your learning method and boost your understanding with focused study tools
            </p>
          </div>

          {/* AI Study Assistant */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Brain className="w-5 h-5" />
                  AI Study Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={getAIRecommendations}
                    disabled={isGettingRecommendations}
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                  >
                    {isGettingRecommendations ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lightbulb className="w-4 h-4 mr-2" />
                    )}
                    Get Recommendations
                  </Button>
                  <Button
                    onClick={getAIProgressAnalysis}
                    disabled={isAnalyzingProgress}
                    variant="outline"
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    {isAnalyzingProgress ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <BarChart3 className="w-4 h-4 mr-2" />
                    )}
                    Analyze Progress
                  </Button>
                  <Button
                    onClick={getAIStudyPlan}
                    disabled={isGeneratingPlan}
                    variant="outline"
                    className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Output Panels */}
          {aiRecommendations && (
            <Card className="mb-6 bg-purple-600/10 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Lightbulb className="w-5 h-5" />
                  AI Study Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-wrap">{aiRecommendations}</div>
              </CardContent>
            </Card>
          )}

          {aiProgressAnalysis && (
            <Card className="mb-6 bg-blue-600/10 border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <BarChart3 className="w-5 h-5" />
                  AI Progress Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-wrap">{aiProgressAnalysis}</div>
              </CardContent>
            </Card>
          )}

          {aiStudyPlan && (
            <Card className="mb-6 bg-green-600/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-300">
                  <Sparkles className="w-5 h-5" />
                  AI Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-wrap">{aiStudyPlan}</div>
              </CardContent>
            </Card>
          )}

          {/* Study Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-4">
                <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl text-white mb-1">{studyStats.hoursThisWeek}h</div>
                <p className="text-xs text-gray-400">This Week</p>
                <Progress 
                  value={(studyStats.hoursThisWeek / studyStats.weeklyGoal) * 100} 
                  className="h-1 mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-4">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl text-white mb-1">{studyStats.completedSessions}</div>
                <p className="text-xs text-gray-400">Sessions Done</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-4">
                <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl text-white mb-1">{studyStats.focusStreak}</div>
                <p className="text-xs text-gray-400">Day Streak</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 text-center">
              <CardContent className="p-4">
                <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl text-white mb-1">{Math.round((studyStats.hoursThisWeek / studyStats.weeklyGoal) * 100)}%</div>
                <p className="text-xs text-gray-400">Weekly Goal</p>
              </CardContent>
            </Card>
          </div>

          {/* Study Mode Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {studyModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.03, 
                    y: -8,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`bg-gradient-to-br ${mode.color} hover:shadow-2xl transition-all duration-300 cursor-pointer group`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <CardHeader className="text-center">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 bg-gray-900/50 rounded-full mx-auto mb-4"
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: 360,
                          transition: { duration: 0.6 }
                        }}
                      >
                        <Icon className={`w-8 h-8 ${mode.textColor}`} />
                      </motion.div>
                      <CardTitle className="text-xl">{mode.title}</CardTitle>
                      <p className="text-gray-300 text-sm">{mode.description}</p>
                    </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <ul className="space-y-1">
                      {mode.features.map((feature, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Stats */}
                    <div className="pt-4 border-t border-gray-700/50">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        {mode.id === 'quiz' && (
                          <>
                            <div>
                              <div className="text-lg text-white">{mode.stats.completed}</div>
                              <div className="text-xs text-gray-400">Quizzes</div>
                            </div>
                            <div>
                              <div className="text-lg text-white">{mode.stats.accuracy}%</div>
                              <div className="text-xs text-gray-400">Accuracy</div>
                            </div>
                          </>
                        )}
                        {mode.id === 'feynman' && (
                          <>
                            <div>
                              <div className="text-lg text-white">{mode.stats.explanations}</div>
                              <div className="text-xs text-gray-400">Explanations</div>
                            </div>
                            <div>
                              <div className="text-lg text-white">{mode.stats.clarity}%</div>
                              <div className="text-xs text-gray-400">Clarity</div>
                            </div>
                          </>
                        )}
                        {mode.id === 'pomodoro' && (
                          <>
                            <div>
                              <div className="text-lg text-white">{mode.stats.sessions}</div>
                              <div className="text-xs text-gray-400">Sessions</div>
                            </div>
                            <div>
                              <div className="text-lg text-white">{mode.stats.avgFocus}m</div>
                              <div className="text-xs text-gray-400">Avg Focus</div>
                            </div>
                          </>
                        )}
                        {mode.id === 'mindmap' && (
                          <>
                            <div>
                              <div className="text-lg text-white">{mode.stats.mindmaps}</div>
                              <div className="text-xs text-gray-400">Mindmaps</div>
                            </div>
                            <div>
                              <div className="text-lg text-white">{mode.stats.nodes}</div>
                              <div className="text-xs text-gray-400">Total Nodes</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        className={`w-full ${mode.textColor} hover:${mode.textColor} bg-transparent border border-current hover:bg-current/10`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModeSelect(mode.id);
                        }}
                      >
                        Start {mode.title}
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Stats Section */}
          <Card className="mt-12 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Recent Study Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white">Calculus Quiz</p>
                      <p className="text-gray-400 text-sm">Completed 2 hours ago</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                    95% Score
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Timer className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-white">Focus Session</p>
                      <p className="text-gray-400 text-sm">Completed yesterday</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                    25 min
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white">Physics Explanation</p>
                      <p className="text-gray-400 text-sm">Completed 3 days ago</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30">
                    Clear
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Map className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-white">ML Concepts Mindmap</p>
                      <p className="text-gray-400 text-sm">Created 4 days ago</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30">
                    24 Nodes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}