import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Brain,
  BookOpen,
  Target,
  Timer,
  Lightbulb,
  Map,
  X,
  Menu,
  Zap,
  Cpu,
} from "lucide-react";
import partnerLogo from "figma:asset/548663584d2c478a035003a6c96ff9ffc8f4a820.png";


interface LoginScreenProps {
  onLogin: () => void;
}

interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  opacity: number;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      desc: "Get personalized feedback and explanations",
    },
    {
      icon: BookOpen,
      title: "Interactive Courses",
      desc: "Upload resources and engage with content",
    },
    {
      icon: Target,
      title: "Active Recall",
      desc: "Quiz yourself with intelligent feedback",
    },
    {
      icon: Lightbulb,
      title: "Feynman Method",
      desc: "Explain concepts to solidify understanding",
    },
    {
      icon: Timer,
      title: "Pomodoro Sessions",
      desc: "Stay focused with structured study time",
    },
    {
      icon: Map,
      title: "Mind Mapping",
      desc: "Visualize and connect your knowledge",
    },
  ];

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Initialize particles for the circular visualization
    const newParticles: Particle[] = [];
    const particleCount = isMobile ? 80 : 150;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = isMobile
        ? 80 + Math.random() * 40
        : 120 + Math.random() * 60;
      const centerX = isMobile ? 150 : 200;
      const centerY = isMobile ? 150 : 200;

      newParticles.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    setParticles(newParticles);
  }, [isMobile]);

  useEffect(() => {
    const animate = () => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: particle.x + particle.dx,
          y: particle.y + particle.dy,
          dx: particle.dx + (Math.random() - 0.5) * 0.02,
          dy: particle.dy + (Math.random() - 0.5) * 0.02,
        })),
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !formData.name) {
      alert("Please enter your name.");
      return;
    }

    // For demo purposes, simulate successful authentication
    // In a real app, this would connect to your authentication backend
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create demo session
      const demoToken = `demo_token_${Date.now()}`;
      const demoUser = {
        id: 'demo_user_' + Date.now(),
        email: formData.email,
        name: formData.name || 'Demo User',
        created_at: new Date().toISOString()
      };

      // Store demo session data
      localStorage.setItem('supabase_token', demoToken);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      
      // Success feedback
      console.log(isLogin ? 'Demo login successful' : 'Demo signup successful');
      
      // Navigate to dashboard
      onLogin();
      
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Mobile Background with flowing gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Mobile Header */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium">
              Areté
            </span>
          </div>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Hero Section */}
        <div className="relative flex flex-col items-center justify-center px-6 pt-8">
          {/* Elite Learning Icon - Mobile */}
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              {/* Glow effect behind icon */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-purple-500/30 rounded-2xl blur-xl scale-110 animate-pulse"></div>
              
              {/* Icon container */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-2xl">
                {/* Geometric pattern inside */}
                <div className="relative">
                  <Cpu className="w-16 h-16 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Elite Learning Text - Mobile */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl font-semibold text-white leading-tight">
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Arete
              </span>
              <span className="block text-lg text-gray-300 mt-1">
                Elite Learning System
              </span>
            </h1>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">
                Built with the MBZUAI K2 Model,
                <br />
                <span className="text-cyan-300">to help you achieve mastery</span>
              </p>
              
              {/* Subtle partner logo */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 opacity-60">
                  <img 
                    src={partnerLogo} 
                    alt="AI Research Partner" 
                    className="w-8 h-8"
                  />
                  <span className="text-xs text-gray-400">Powered by Advanced AI Research</span>
                </div>
              </div>
            </div>
          </div>

          {/* Particle background for tech ambiance */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              {particles.map((particle, index) => (
                <circle
                  key={index}
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.size}
                  fill="#06b6d4"
                  opacity={particle.opacity * 0.5}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Auth Form */}
        <div className="relative z-10 px-6 pb-8">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-white">
                {isLogin ? "Welcome Back" : "Get Started"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="text-center space-y-3">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
                
                {/* Demo Login Button for Testing */}
                <div className="pt-4 border-t border-gray-700">
                  <Button
                    onClick={onLogin}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    Continue as Demo User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="text-xl font-medium">
                  Features
                </span>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 p-6 space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      {/* Background with flowing gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Left Panel - Main Content */}
      <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-medium">
                Areté
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Eng</span>
              <Button
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Main Content Area - Elite Learning Platform */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Elite Branding Section */}
            <div className="mb-12">
              {/* Futuristic Icon */}
              <div className="relative mb-8 flex justify-center">
                <div className="relative">
                  {/* Glow effects behind icon */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-2xl scale-110 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-purple-400/20 rounded-3xl blur-xl scale-105"></div>
                  
                  {/* Icon container */}
                  <div className="relative w-48 h-48 bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center border-4 border-white/20 backdrop-blur-sm shadow-2xl">
                    {/* Complex geometric pattern */}
                    <div className="relative">
                      <Cpu className="w-24 h-24 text-white" />
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                      {/* Neural network lines */}
                      <div className="absolute inset-0 opacity-30">
                        <svg className="w-full h-full">
                          <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="white" strokeWidth="1" opacity="0.5" />
                          <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="white" strokeWidth="1" opacity="0.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elite Branding Text */}
              <div className="space-y-6">
                <h1 className="text-6xl font-semibold text-white leading-tight tracking-wide">
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                    Arete
                  </span>
                  <span className="block text-2xl text-gray-300 mt-2 font-light">
                    Elite Learning System
                  </span>
                </h1>
                
                <div className="space-y-4">
                  <p className="text-lg text-gray-300 leading-relaxed max-w-md mx-auto tracking-wide">
                    Built with the MBZUAI K2 Model,
                    <br />
                    <span className="text-cyan-300 font-medium">to help you achieve mastery</span>
                  </p>
                  
                  {/* Subtle partner logo */}
                  <div className="flex justify-center">
                    <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                      <img 
                        src={partnerLogo} 
                        alt="AI Research Partner" 
                        className="w-10 h-10"
                      />
                      <span className="text-sm text-gray-400">Powered by Advanced AI Research</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elite Features Grid */}
            <div className="grid grid-cols-2 gap-6 max-w-lg">
              {features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-cyan-400/30"
                >
                  <feature.icon className="w-8 h-8 text-cyan-400 mb-3 mx-auto" />
                  <h3 className="font-medium text-sm mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ambient Tech Particle Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full">
              {particles.map((particle, index) => (
                <circle
                  key={index}
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.size}
                  fill="#06b6d4"
                  opacity={particle.opacity * 0.3}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-96 p-8 flex flex-col justify-center bg-gray-900/30 backdrop-blur-xl border-l border-gray-800 relative z-10">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {isLogin ? "Welcome Back" : "Get Started"}
            </CardTitle>
            <p className="text-gray-400">
              {isLogin
                ? "Sign in to continue learning"
                : "Create your account to begin"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm mb-2 text-gray-300">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="text-center space-y-3">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
              
              {/* Demo Login Button for Testing */}
              <div className="pt-4 border-t border-gray-700">
                <Button
                  onClick={onLogin}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  Continue as Demo User
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/20">
                <h4 className="font-medium text-blue-300 mb-2">
                  What you'll get:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-0"
                  >
                    AI Feedback
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-0"
                  >
                    Progress Tracking
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-600/20 text-blue-300 border-0"
                  >
                    Study Analytics
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}