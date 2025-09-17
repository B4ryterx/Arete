import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  ChevronLeft, 
  Users, 
  Clock, 
  Trophy, 
  Plus, 
  Play, 
  Cpu,
  Timer,
  Target,
  Medal
} from 'lucide-react';

interface CompetitionSession {
  id: string;
  name: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  duration: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prize: string;
}

interface Participant {
  id: string;
  name: string;
  progress: number;
  score: number;
  status: 'active' | 'completed' | 'waiting';
}

interface CompetitionSessionsProps {
  onNavigate: (screen: string) => void;
}

export function CompetitionSessions({ onNavigate }: CompetitionSessionsProps) {
  const [currentView, setCurrentView] = useState<'lobby' | 'waiting' | 'active'>('lobby');
  const [selectedSession, setSelectedSession] = useState<CompetitionSession | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState(300); // 5 minutes
  const [sessionTime, setSessionTime] = useState(1800); // 30 minutes
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Mock sessions data
  const availableSessions: CompetitionSession[] = [
    {
      id: '1',
      name: 'Algorithm Speedrun',
      participants: 12,
      maxParticipants: 20,
      startTime: '2:30 PM',
      duration: 30,
      difficulty: 'Hard',
      prize: '500 points'
    },
    {
      id: '2',
      name: 'Data Structures Derby',
      participants: 8,
      maxParticipants: 15,
      startTime: '3:00 PM',
      duration: 25,
      difficulty: 'Medium',
      prize: '300 points'
    },
    {
      id: '3',
      name: 'Quick Math Challenge',
      participants: 5,
      maxParticipants: 10,
      startTime: '3:30 PM',
      duration: 15,
      difficulty: 'Easy',
      prize: '150 points'
    }
  ];

  // Mock participants for waiting room
  const waitingParticipants: Participant[] = [
    { id: '1', name: 'Alexandra Chen', progress: 0, score: 0, status: 'waiting' },
    { id: '2', name: 'Marcus Rodriguez', progress: 0, score: 0, status: 'waiting' },
    { id: '3', name: 'You', progress: 0, score: 0, status: 'waiting' },
    { id: '4', name: 'Emma Thompson', progress: 0, score: 0, status: 'waiting' },
    { id: '5', name: 'David Kumar', progress: 0, score: 0, status: 'waiting' }
  ];

  // Mock participants for active session
  const activeParticipants: Participant[] = [
    { id: '1', name: 'Alexandra Chen', progress: 85, score: 340, status: 'active' },
    { id: '2', name: 'Marcus Rodriguez', progress: 92, score: 380, status: 'active' },
    { id: '3', name: 'You', progress: 70, score: 280, status: 'active' },
    { id: '4', name: 'Emma Thompson', progress: 88, score: 350, status: 'active' },
    { id: '5', name: 'David Kumar', progress: 100, score: 420, status: 'completed' }
  ];

  // Timer effects
  useEffect(() => {
    if (currentView === 'waiting' && timeUntilStart > 0) {
      const timer = setTimeout(() => setTimeUntilStart(timeUntilStart - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeUntilStart === 0 && currentView === 'waiting') {
      setCurrentView('active');
    }
  }, [timeUntilStart, currentView]);

  useEffect(() => {
    if (currentView === 'active' && sessionTime > 0) {
      const timer = setTimeout(() => setSessionTime(sessionTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionTime, currentView]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 border-green-500';
      case 'Medium': return 'text-yellow-400 border-yellow-500';
      case 'Hard': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const joinSession = (session: CompetitionSession) => {
    setSelectedSession(session);
    setCurrentView('waiting');
  };

  const createSession = () => {
    // Mock create session - would open a modal in real implementation
    alert('Create Session feature coming soon!');
  };

  if (currentView === 'lobby') {
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Competition Arena
            </h1>
            <p className="text-xl text-gray-300">
              Join live competitions and challenge students worldwide
            </p>
          </div>

          {/* Create Session Button */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={createSession}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Session
            </Button>
          </div>

          {/* Available Sessions */}
          <div className="space-y-4">
            <h2 className="text-2xl mb-6 text-center">Available Sessions</h2>
            
            {availableSessions.map((session) => (
              <Card key={session.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl">{session.name}</h3>
                        <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{session.participants}/{session.maxParticipants}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{session.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          <span>{session.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>{session.prize}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => joinSession(session)}
                      className="bg-blue-600 hover:bg-blue-700 ml-4"
                      disabled={session.participants >= session.maxParticipants}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {session.participants >= session.maxParticipants ? 'Full' : 'Join'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentView('lobby')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Leave Session
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl mb-4">Waiting Room</h1>
            <p className="text-xl text-gray-300">{selectedSession?.name}</p>
          </div>

          {/* Countdown */}
          <Card className="bg-gray-800/50 border-gray-700 mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl mb-4">Starting in</h2>
              <div className="text-6xl font-mono text-blue-400 mb-4">
                {formatTime(timeUntilStart)}
              </div>
              <p className="text-gray-400">Get ready for the competition!</p>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({waitingParticipants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {waitingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        <Cpu className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className={participant.name === 'You' ? 'text-blue-400' : 'text-white'}>
                      {participant.name}
                    </span>
                    {participant.name === 'You' && (
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            <Medal className="w-4 h-4 mr-2" />
            Live Competition
          </Badge>
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg">{formatTime(sessionTime)}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestion} of 10</CardTitle>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Hard
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg mb-4">
                  What is the time complexity of the optimal solution for the Traveling Salesman Problem?
                </h3>
                <div className="space-y-3">
                  {['O(n!)', 'O(n²)', 'O(2^n)', 'O(n log n)'].map((option, index) => (
                    <button
                      key={index}
                      className="w-full p-3 text-left rounded-lg border border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 transition-all"
                    >
                      <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button className="bg-blue-600 hover:bg-blue-700">Submit & Next</Button>
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Live Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeParticipants
                    .sort((a, b) => b.score - a.score)
                    .map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        participant.name === 'You' 
                          ? 'bg-blue-500/20 border border-blue-500/50' 
                          : 'bg-gray-700/50'
                      }`}
                    >
                      <div className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${participant.name === 'You' ? 'text-blue-300' : 'text-white'}`}>
                          {participant.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {participant.score} pts
                        </div>
                        <Progress 
                          value={participant.progress} 
                          className="h-1 mt-1"
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        {participant.status === 'completed' ? '✓' : `${participant.progress}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}