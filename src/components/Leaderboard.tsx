import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronLeft, Trophy, Medal, Award, Cpu } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  accuracy: number;
  time: string;
  isCurrentUser?: boolean;
  avatar?: string;
}

interface LeaderboardProps {
  onNavigate: (screen: string) => void;
}

export function Leaderboard({ onNavigate }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState('global');

  // Mock leaderboard data
  const globalLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Alexandra Chen', score: 2847, accuracy: 94, time: '18:32' },
    { rank: 2, name: 'Marcus Rodriguez', score: 2834, accuracy: 92, time: '19:45' },
    { rank: 3, name: 'Yuki Tanaka', score: 2821, accuracy: 96, time: '21:12' },
    { rank: 4, name: 'Emma Thompson', score: 2798, accuracy: 88, time: '17:23' },
    { rank: 5, name: 'David Kumar', score: 2785, accuracy: 91, time: '20:08' },
    { rank: 6, name: 'Sarah Wilson', score: 2772, accuracy: 89, time: '19:56' },
    { rank: 7, name: 'Alex Johnson', score: 2745, accuracy: 85, time: '22:14', isCurrentUser: true },
    { rank: 8, name: 'Maria Garcia', score: 2731, accuracy: 87, time: '21:37' },
    { rank: 9, name: 'Ryan O\'Connor', score: 2718, accuracy: 83, time: '23:45' },
    { rank: 10, name: 'Lisa Zhang', score: 2695, accuracy: 86, time: '22:51' }
  ];

  const courseLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Marcus Rodriguez', score: 1823, accuracy: 95, time: '15:23' },
    { rank: 2, name: 'Alex Johnson', score: 1798, accuracy: 91, time: '16:45', isCurrentUser: true },
    { rank: 3, name: 'Emma Thompson', score: 1785, accuracy: 89, time: '17:12' },
    { rank: 4, name: 'David Kumar', score: 1772, accuracy: 93, time: '18:34' },
    { rank: 5, name: 'Sarah Wilson', score: 1756, accuracy: 87, time: '19:08' }
  ];

  const weeklyLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Alex Johnson', score: 485, accuracy: 92, time: '12:34', isCurrentUser: true },
    { rank: 2, name: 'Yuki Tanaka', score: 467, accuracy: 94, time: '13:21' },
    { rank: 3, name: 'Marcus Rodriguez', score: 451, accuracy: 88, time: '14:56' },
    { rank: 4, name: 'Emma Thompson', score: 438, accuracy: 86, time: '15:43' },
    { rank: 5, name: 'David Kumar', score: 423, accuracy: 90, time: '16:12' }
  ];

  const getLeaderboardData = () => {
    switch (activeTab) {
      case 'course':
        return courseLeaderboard;
      case 'week':
        return weeklyLeaderboard;
      default:
        return globalLeaderboard;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-gray-400 text-lg">#{rank}</span>;
    }
  };

  const getScoreColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-400';
    if (rank <= 10) return 'text-blue-400';
    return 'text-gray-300';
  };

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xl text-gray-300">
            See how you rank against other Arete learners
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="global" className="text-sm">Global</TabsTrigger>
            <TabsTrigger value="course" className="text-sm">This Course</TabsTrigger>
            <TabsTrigger value="week" className="text-sm">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-center">
                  {activeTab === 'global' && 'Global Rankings'}
                  {activeTab === 'course' && 'Course Rankings - Computer Science Fundamentals'}
                  {activeTab === 'week' && 'Weekly Rankings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-700 text-sm text-gray-400">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-2">Name</div>
                  <div className="col-span-1 text-center">Score</div>
                  <div className="col-span-1 text-center">Accuracy</div>
                  <div className="col-span-1 text-center">Best Time</div>
                </div>

                {/* Leaderboard Entries */}
                <div className="space-y-2">
                  {getLeaderboardData().map((entry) => (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-6 gap-4 p-4 rounded-lg transition-all ${
                        entry.isCurrentUser
                          ? 'bg-blue-500/20 border border-blue-500/50'
                          : 'hover:bg-gray-700/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Name with Avatar */}
                      <div className="col-span-2 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            <Cpu className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className={`${entry.isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                            {entry.name}
                            {entry.isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs border-blue-500 text-blue-400">
                                You
                              </Badge>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className={getScoreColor(entry.rank)}>{entry.score}</span>
                      </div>

                      {/* Accuracy */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-gray-300">{entry.accuracy}%</span>
                      </div>

                      {/* Time */}
                      <div className="col-span-1 flex items-center justify-center">
                        <span className="text-gray-300">{entry.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl text-blue-400">
                        {getLeaderboardData().find(entry => entry.isCurrentUser)?.rank || '-'}
                      </div>
                      <div className="text-sm text-gray-400">Your Rank</div>
                    </div>
                    <div>
                      <div className="text-2xl text-green-400">
                        {getLeaderboardData().find(entry => entry.isCurrentUser)?.score || '-'}
                      </div>
                      <div className="text-sm text-gray-400">Your Score</div>
                    </div>
                    <div>
                      <div className="text-2xl text-purple-400">
                        {getLeaderboardData().find(entry => entry.isCurrentUser)?.accuracy || '-'}%
                      </div>
                      <div className="text-sm text-gray-400">Your Accuracy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => onNavigate('olympiad')}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Take Olympiad Test
          </Button>
          <Button
            onClick={() => onNavigate('competition')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Medal className="w-4 h-4 mr-2" />
            Join Competition
          </Button>
        </div>
      </div>
    </div>
  );
}