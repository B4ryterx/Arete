import { Badge } from './ui/badge'
import { Brain, BookOpen, BarChart3, User, Trophy, Microscope } from 'lucide-react'

interface NavigationProps {
  currentScreen: string
  onNavigate: (screen: string) => void
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'course', label: 'Course Mode', icon: BookOpen },
    { id: 'study', label: 'Study Mode', icon: Brain },
    { id: 'olympiad', label: 'Olympiad Mode', icon: Trophy },
    { id: 'research', label: 'Research Mode', icon: Microscope },
  ]

  if (currentScreen === 'login') return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Arete</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentScreen === item.id
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-600/50'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {currentScreen === item.id && (
                  <Badge className="bg-blue-600 text-white text-xs border-0">Active</Badge>
                )}
              </button>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">Student</p>
              <p className="text-xs text-gray-400">Level 15</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}