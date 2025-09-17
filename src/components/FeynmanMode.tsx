import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { askK2Think } from '../lib/k2'
import { studyPrompts } from '../lib/prompts'
import { Lightbulb, ArrowLeft, Brain, CheckCircle, AlertCircle, Sparkles, MessageSquare, Loader2, Target, BookOpen, Star, Trophy, Zap, Rocket, Award, Flame, Crown } from 'lucide-react'

interface FeynmanModeProps {
  onNavigate: (screen: string) => void
}

export function FeynmanMode({ onNavigate }: FeynmanModeProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>('integration-parts')
  const [customTopic, setCustomTopic] = useState('')
  const [useCustomTopic, setUseCustomTopic] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [feedbackGenerated, setFeedbackGenerated] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState('')
  const [aiSimplification, setAiSimplification] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGettingSuggestions, setIsGettingSuggestions] = useState(false)
  const [isSimplifying, setIsSimplifying] = useState(false)
  
  // Wow factor states
  const [showCelebration, setShowCelebration] = useState(false)
  const [achievements, setAchievements] = useState<('first-explanation' | 'detailed-explainer' | 'streak-master' | 'feynman-novice' | 'feynman-expert')[]>([])
  const [streak, setStreak] = useState(0)
  const [totalExplanations, setTotalExplanations] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isGettingFeedback, setIsGettingFeedback] = useState(false)

  // Achievement system
  const checkAchievements = (explanationLength: number) => {
    const newAchievements: ('first-explanation' | 'detailed-explainer' | 'streak-master' | 'feynman-novice' | 'feynman-expert')[] = []
    
    if (explanationLength >= 100 && !achievements.includes('first-explanation')) {
      newAchievements.push('first-explanation')
    }
    if (explanationLength >= 500 && !achievements.includes('detailed-explainer')) {
      newAchievements.push('detailed-explainer')
    }
    if (streak >= 3 && !achievements.includes('streak-master')) {
      newAchievements.push('streak-master')
    }
    if (totalExplanations >= 5 && !achievements.includes('feynman-novice')) {
      newAchievements.push('feynman-novice')
    }
    if (totalExplanations >= 10 && !achievements.includes('feynman-expert')) {
      newAchievements.push('feynman-expert')
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements])
      setShowCelebration(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      setTimeout(() => setShowCelebration(false), 5000)
    }
  }

  // XP and leveling system
  const addXp = (amount: number) => {
    setXp(prev => {
      const newXp = prev + amount
      const newLevel = Math.floor(newXp / 100) + 1
      if (newLevel > currentLevel) {
        setCurrentLevel(newLevel)
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      return newXp
    })
  }

  // Typing effect for AI responses
  const typeText = (text: string, callback: (text: string) => void) => {
    setIsTyping(true)
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.substring(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsTyping(false)
        callback(text)
      }
    }, 20)
  }

  const topics = [
    {
      id: 'integration-parts',
      title: 'Integration by Parts',
      subject: 'Calculus',
      difficulty: 'Intermediate',
      description: 'Explain how integration by parts works and when to use it',
      keyPoints: ['LIATE rule', 'Formula derivation', 'Example applications']
    },
    {
      id: 'quantum-entanglement',
      title: 'Quantum Entanglement',
      subject: 'Physics',
      difficulty: 'Advanced',
      description: 'Describe quantum entanglement in simple terms',
      keyPoints: ['Paired particles', 'Measurement effects', 'Non-locality']
    },
    {
      id: 'organic-reactions',
      title: 'SN2 Reactions',
      subject: 'Chemistry',
      difficulty: 'Intermediate',
      description: 'Explain SN2 nucleophilic substitution reactions',
      keyPoints: ['Nucleophile attack', 'Leaving group departure', 'Stereochemistry']
    },
    {
      id: 'photosynthesis',
      title: 'Photosynthesis',
      subject: 'Biology',
      difficulty: 'Beginner',
      description: 'Describe how plants convert light into energy',
      keyPoints: ['Light reactions', 'Calvin cycle', 'Chlorophyll']
    },
    {
      id: 'supply-demand',
      title: 'Supply and Demand',
      subject: 'Economics',
      difficulty: 'Beginner',
      description: 'Explain the basic principles of supply and demand',
      keyPoints: ['Market equilibrium', 'Price elasticity', 'Market forces']
    },
    {
      id: 'machine-learning',
      title: 'Machine Learning',
      subject: 'Computer Science',
      difficulty: 'Advanced',
      description: 'Explain machine learning in simple terms',
      keyPoints: ['Training data', 'Algorithms', 'Predictions']
    }
  ]

  const steps = [
    { id: 'topic', title: 'Choose Topic', description: 'Select a concept to explain' },
    { id: 'explain', title: 'Explain Simply', description: 'Write your explanation' },
    { id: 'feedback', title: 'Get Feedback', description: 'Review AI analysis' }
  ]

  // AI-powered explanation analysis
  const analyzeExplanation = async () => {
    if (!explanation.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      const topicTitle = useCustomTopic ? customTopic : selectedTopicData?.title || 'Unknown';
      const topicSubject = useCustomTopic ? 'Custom Topic' : selectedTopicData?.subject || 'Unknown';
      
      const prompt = studyPrompts.feynman({
        topic: `${topicTitle} (${topicSubject})`,
        studentExplanation: explanation
      });
      const result = await askK2Think(prompt);
      
      console.log('✅ K2 API response received:', result);
      
      // Wow factors
      setTotalExplanations(prev => prev + 1);
      setStreak(prev => prev + 1);
      addXp(25);
      checkAchievements(explanation.length);
      
      // Set feedback as generated
      setFeedbackGenerated(true);
      
      // Typing effect for AI response
      typeText(result, (typedText) => {
        setAiAnalysis(typedText);
      });
      
    } catch (error) {
      console.error('❌ Error in analyzeExplanation:', error);
      setAiAnalysis(`Error analyzing explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI-powered suggestions for improvement
  const getSuggestions = async () => {
    if (!explanation.trim()) return;
    
    setIsGettingSuggestions(true);
    try {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      const topicTitle = useCustomTopic ? customTopic : selectedTopicData?.title || 'Unknown';
      const topicSubject = useCustomTopic ? 'Custom Topic' : selectedTopicData?.subject || 'Unknown';
      
      const prompt = studyPrompts.feynmanSuggestions({
        topic: `${topicTitle} (${topicSubject})`,
        studentExplanation: explanation
      });
      const result = await askK2Think(prompt);
      setAiSuggestions(result);
      setFeedbackGenerated(true);
    } catch (error) {
      setAiSuggestions(`Error getting suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingSuggestions(false);
    }
  };

  // AI-powered simplification
  const simplifyExplanation = async () => {
    if (!explanation.trim()) return;
    
    setIsSimplifying(true);
    try {
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      const topicTitle = useCustomTopic ? customTopic : selectedTopicData?.title || 'Unknown';
      const topicSubject = useCustomTopic ? 'Custom Topic' : selectedTopicData?.subject || 'Unknown';
      
      const prompt = studyPrompts.feynmanSimplification({
        topic: `${topicTitle} (${topicSubject})`,
        studentExplanation: explanation
      });
      const result = await askK2Think(prompt);
      setAiSimplification(result);
      setFeedbackGenerated(true);
    } catch (error) {
      setAiSimplification(`Error simplifying explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSimplifying(false);
    }
  };

  const startOver = () => {
    setExplanation('')
    setFeedbackGenerated(false)
    setCurrentStep(1)
    setAiAnalysis('')
    setAiSuggestions('')
    setAiSimplification('')
    setCustomTopic('')
    setUseCustomTopic(false)
    setSelectedTopic('integration-parts')
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      {/* Enhanced Background with blue-to-purple gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-2xl animate-float"></div>
          
          {/* Floating particles */}
          <div className="floating-particle top-1/4 left-1/3"></div>
          <div className="floating-particle top-1/3 right-1/4"></div>
          <div className="floating-particle bottom-1/3 left-1/5"></div>
          <div className="floating-particle bottom-1/4 right-1/3"></div>
          <div className="floating-particle top-2/3 left-2/3"></div>
          <div className="floating-particle top-1/5 right-1/5"></div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6 space-y-6 relative z-10">
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
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center animate-pulse">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-white">Feynman Mode</h1>
                {currentLevel > 1 && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
                    <Crown className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">Level {currentLevel}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400">Master concepts by explaining them as if teaching a 12-year-old</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* XP and Streak Display */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-lg px-4 py-2 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium">{xp} XP</span>
                </div>
                <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${(xp % 100)}%` }}
                  ></div>
                </div>
              </div>
              {streak > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 backdrop-blur-xl rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-white" />
                    <span className="text-white font-bold">{streak} Day Streak</span>
                  </div>
                </div>
              )}
            </div>
            <Badge className="bg-orange-600/20 text-orange-300 border-orange-600/30 px-4 py-2">
              <Lightbulb className="w-4 h-4 mr-2" />
              Explain to Learn
            </Badge>
          </div>
        </div>

        {/* Celebration Overlay */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-6xl animate-bounce">🎉</div>
              <div className="text-4xl animate-pulse mt-2">✨</div>
              <div className="text-5xl animate-ping mt-1">🌟</div>
            </div>
          </div>
        )}

        {/* Achievement Notification */}
        {showCelebration && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-white animate-bounce" />
                  <div>
                    <h3 className="font-bold text-white">Achievement Unlocked!</h3>
                    <p className="text-sm text-white/90">
                      {achievements[achievements.length - 1] === 'first-explanation' && 'First Explanation - You wrote your first explanation!'}
                      {achievements[achievements.length - 1] === 'detailed-explainer' && 'Detailed Explainer - You wrote a comprehensive explanation!'}
                      {achievements[achievements.length - 1] === 'streak-master' && 'Streak Master - You have a 3+ day streak!'}
                      {achievements[achievements.length - 1] === 'feynman-novice' && 'Feynman Novice - You have 5+ explanations!'}
                      {achievements[achievements.length - 1] === 'feynman-expert' && 'Feynman Expert - You have 10+ explanations!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Panel */}
        <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 shadow-xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-bold text-lg">{totalExplanations}</span>
                </div>
                <p className="text-gray-400 text-sm">Explanations</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-red-400" />
                  <span className="text-white font-bold text-lg">{streak}</span>
                </div>
                <p className="text-gray-400 text-sm">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold text-lg">{achievements.length}</span>
                </div>
                <p className="text-gray-400 text-sm">Achievements</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-bold text-lg">Level {currentLevel}</span>
                </div>
                <p className="text-gray-400 text-sm">Current Level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > index + 1 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : currentStep === index + 1 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {currentStep > index + 1 ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 ${
                      currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="font-medium">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Choose a Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                    selectedTopic === topic.id 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTopic(topic.id)
                    setCurrentStep(2)
                  }}
                >
                  <h3 className="font-medium mb-2">{topic.title}</h3>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{topic.subject}</Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        topic.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' :
                        topic.difficulty === 'Intermediate' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Key points:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {topic.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Custom Topic Input */}
            <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="useCustomTopic"
                  checked={useCustomTopic}
                  onChange={(e) => {
                    setUseCustomTopic(e.target.checked)
                    if (e.target.checked) {
                      setSelectedTopic(null)
                    } else {
                      setCustomTopic('')
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="useCustomTopic" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Or type your own topic
                </label>
              </div>
              
              {useCustomTopic && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="Enter your topic (e.g., 'Photosynthesis', 'Machine Learning', 'The French Revolution')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Button
                    onClick={() => {
                      if (customTopic.trim()) {
                        setCurrentStep(2)
                      }
                    }}
                    disabled={!customTopic.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Start Explaining: {customTopic}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {(selectedTopic || (useCustomTopic && customTopic.trim())) && (
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {useCustomTopic ? customTopic : topics.find(t => t.id === selectedTopic)?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="explain" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="explain">Your Explanation</TabsTrigger>
                  <TabsTrigger value="feedback">AI Feedback</TabsTrigger>
                </TabsList>
                
                <TabsContent value="explain" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Explain "{topics.find(t => t.id === selectedTopic)?.title}" as if teaching a friend:
                      </label>
                      <Textarea 
                        placeholder="Use the Feynman Technique: Explain this concept as if teaching a 12-year-old. Use simple language, analogies, and step-by-step reasoning. If you can't explain it simply, you don't understand it well enough..."
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        className="min-h-80 bg-white/50"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button 
                        onClick={analyzeExplanation}
                        disabled={isAnalyzing || explanation.length < 10}
                        variant="outline"
                        size="sm"
                        className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          explanation.length >= 10 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700' 
                            : 'opacity-50'
                        }`}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4 mr-2" />
                        )}
                        Analyze
                        {explanation.length >= 10 && <Sparkles className="w-3 h-3 ml-1 animate-pulse" />}
                      </Button>
                      <Button 
                        onClick={getSuggestions}
                        disabled={isGettingSuggestions || explanation.length < 10}
                        variant="outline"
                        size="sm"
                        className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          explanation.length >= 10 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700' 
                            : 'opacity-50'
                        }`}
                      >
                        {isGettingSuggestions ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Target className="w-4 h-4 mr-2" />
                        )}
                        Suggestions
                        {explanation.length >= 10 && <Zap className="w-3 h-3 ml-1 animate-pulse" />}
                      </Button>
                      <Button 
                        onClick={simplifyExplanation}
                        disabled={isSimplifying || explanation.length < 10}
                        variant="outline"
                        size="sm"
                        className={`transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                          explanation.length >= 10 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 hover:from-purple-600 hover:to-pink-700' 
                            : 'opacity-50'
                        }`}
                      >
                        {isSimplifying ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <BookOpen className="w-4 h-4 mr-2" />
                        )}
                        Simplify
                        {explanation.length >= 10 && <Rocket className="w-3 h-3 ml-1 animate-pulse" />}
                      </Button>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={startOver}>
                        Start Over
                      </Button>
                      <Button 
                        onClick={async () => {
                          if (explanation.length >= 10) {
                            setIsGettingFeedback(true);
                            setFeedbackGenerated(true);
                            setCurrentStep(3);
                            
                            try {
                              await analyzeExplanation();
                            } catch (error) {
                              console.error('K2 API Error:', error);
                              // Show a fallback response if API fails
                              setAiAnalysis('I apologize, but I\'m having trouble connecting to the AI service right now. Please check your internet connection and try again. Your explanation looks good - keep practicing the Feynman Technique!');
                            } finally {
                              setIsGettingFeedback(false);
                            }
                          }
                        }}
                        disabled={explanation.length < 10 || isGettingFeedback}
                        className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 ${
                          explanation.length >= 10 && !isGettingFeedback
                            ? 'hover:scale-105 hover:shadow-lg' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {isGettingFeedback ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isGettingFeedback ? 'Getting Feedback...' : 'Get K2 Feedback'}
                        {explanation.length >= 10 && !isGettingFeedback && <Sparkles className="w-3 h-3 ml-1 animate-pulse" />}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="feedback" className="space-y-4">
                  {!feedbackGenerated ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">No feedback yet</h3>
                      <p className="text-gray-500">Write an explanation and click "Get K2 Feedback" to see AI analysis.</p>
                    </div>
                  ) : (
                    <>
                      {/* AI Analysis Panel */}
                      {aiAnalysis && (
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg animate-slide-in-up">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                              <Brain className="w-5 h-5 animate-pulse" />
                              Feynman Analysis
                              <Award className="w-4 h-4 text-yellow-500 animate-bounce" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                              {aiAnalysis}
                              {isTyping && <span className="animate-pulse">|</span>}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Suggestions Panel */}
                      {aiSuggestions && (
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg animate-slide-in-up">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-900">
                              <Target className="w-5 h-5 animate-pulse" />
                              Feynman Suggestions
                              <Zap className="w-4 h-4 text-yellow-500 animate-bounce" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-green-800 whitespace-pre-wrap leading-relaxed">{aiSuggestions}</div>
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Simplification Panel */}
                      {aiSimplification && (
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 shadow-lg animate-slide-in-up">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-900">
                              <BookOpen className="w-5 h-5 animate-pulse" />
                              Simplified Explanation
                              <Rocket className="w-4 h-4 text-yellow-500 animate-bounce" />
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-purple-800 whitespace-pre-wrap leading-relaxed">{aiSimplification}</div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
