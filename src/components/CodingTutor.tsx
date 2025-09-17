import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { askK2Think } from '../lib/k2';
import { 
  ChevronLeft, 
  Code, 
  Play, 
  CheckCircle, 
  XCircle,
  Monitor,
  ExternalLink,
  Download,
  Key,
  Link,
  CheckCircle2,
  Loader2,
  Lightbulb,
  Brain,
  MessageSquare
} from 'lucide-react';

interface CodingTutorProps {
  onNavigate: (screen: string) => void;
}

interface IDE {
  name: string;
  icon: string;
  description: string;
  supported: boolean;
}

export function CodingTutor({ onNavigate }: CodingTutorProps) {
  const [currentView, setCurrentView] = useState<'landing' | 'builtin' | 'ide-selection' | 'ide-connected'>('landing');
  const [selectedIDE, setSelectedIDE] = useState<string | null>(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [code, setCode] = useState(`def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test your function
print(fibonacci(10))`);
  const [output, setOutput] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiHints, setAiHints] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGettingHints, setIsGettingHints] = useState(false);
  const [isGettingFeedback, setIsGettingFeedback] = useState(false);

  // AI-powered code analysis
  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are an expert coding tutor. Analyze the provided code and give detailed feedback on: 1) Code quality and best practices, 2) Potential bugs or issues, 3) Performance considerations, 4) Suggestions for improvement. Be educational and constructive."
        },
        {
          role: "user",
          content: `Please analyze this code:\n\n\`\`\`python\n${code}\n\`\`\``
        }
      ]);
      setAiAnalysis(result);
    } catch (error) {
      setAiAnalysis(`Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI-powered hints
  const getHints = async () => {
    if (!code.trim()) return;
    
    setIsGettingHints(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are a coding tutor. Provide helpful hints to guide the student without giving away the solution. Focus on: 1) Key concepts they should consider, 2) Common approaches to similar problems, 3) Debugging tips, 4) Next steps to try."
        },
        {
          role: "user",
          content: `The student is working on this code and needs hints:\n\n\`\`\`python\n${code}\n\`\`\`\n\nProvide helpful hints without giving away the complete solution.`
        }
      ]);
      setAiHints(result);
    } catch (error) {
      setAiHints(`Error getting hints: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingHints(false);
    }
  };

  // AI-powered feedback
  const getFeedback = async () => {
    if (!code.trim()) return;
    
    setIsGettingFeedback(true);
    try {
      const result = await askK2Think([
        {
          role: "system",
          content: "You are a coding mentor. Provide encouraging feedback on the student's code, highlighting what they did well and offering constructive suggestions for improvement. Be supportive and educational."
        },
        {
          role: "user",
          content: `Please provide feedback on this student's code:\n\n\`\`\`python\n${code}\n\`\`\`\n\nFocus on both strengths and areas for improvement.`
        }
      ]);
      setAiFeedback(result);
    } catch (error) {
      setAiFeedback(`Error getting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGettingFeedback(false);
    }
  };

  const supportedIDEs: IDE[] = [
    {
      name: 'VS Code',
      icon: '🔵',
      description: 'Most popular code editor with rich extensions',
      supported: true
    },
    {
      name: 'PyCharm',
      icon: '🐍',
      description: 'Professional Python IDE with advanced debugging',
      supported: true
    },
    {
      name: 'IntelliJ IDEA',
      icon: '💡',
      description: 'Powerful Java development environment',
      supported: true
    },
    {
      name: 'Sublime Text',
      icon: '📝',
      description: 'Lightweight and fast text editor',
      supported: true
    },
    {
      name: 'Other IDE',
      icon: '⚙️',
      description: 'Connect any other development environment',
      supported: false
    }
  ];

  const mockProblems = [
    {
      title: "Fibonacci Sequence",
      difficulty: "Easy",
      description: "Write a function that returns the nth Fibonacci number. The Fibonacci sequence starts with 0 and 1, and each subsequent number is the sum of the previous two.",
      examples: [
        { input: "fibonacci(0)", output: "0" },
        { input: "fibonacci(1)", output: "1" },
        { input: "fibonacci(10)", output: "55" }
      ],
      constraints: [
        "0 ≤ n ≤ 30",
        "Function should be named 'fibonacci'"
      ]
    }
  ];

  const handleRunCode = () => {
    // Mock code execution
    setOutput(`Running code...
    
Output:
55

✅ Test Case 1: Passed
✅ Test Case 2: Passed  
✅ Test Case 3: Passed

Execution time: 0.023s
Memory usage: 2.1 MB

All test cases passed! Great job! 🎉`);
  };

  const handleIDESelection = (ide: string) => {
    if (ide === 'Other IDE') {
      alert('Custom IDE integration coming soon!');
      return;
    }
    setSelectedIDE(ide);
    setShowConnectionModal(true);
  };

  const handleConnectionComplete = () => {
    setShowConnectionModal(false);
    setCurrentView('ide-connected');
  };

  if (currentView === 'landing') {
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Coding Tutor
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Practice coding with AI guidance. Choose your preferred development environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Built-in Editor Option */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-blue-400">Use Built-in Editor</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-6">
                  Start coding immediately with our integrated code editor. Perfect for quick practice and learning.
                </p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>✅ Syntax highlighting</li>
                  <li>✅ Instant feedback</li>
                  <li>✅ Built-in test cases</li>
                  <li>✅ No setup required</li>
                </ul>
                <Button
                  onClick={() => setCurrentView('builtin')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Coding
                </Button>
              </CardContent>
            </Card>

            {/* Connect External IDE Option */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer group">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-purple-400">Connect External IDE</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-6">
                  Connect your favorite IDE for a seamless development experience with advanced features.
                </p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>✅ Your preferred environment</li>
                  <li>✅ Advanced debugging</li>
                  <li>✅ Custom extensions</li>
                  <li>✅ Professional workflow</li>
                </ul>
                <Button
                  onClick={() => setCurrentView('ide-selection')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Connect IDE
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'ide-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => setCurrentView('landing')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl mb-4">Select Your IDE</h1>
            <p className="text-xl text-gray-300">
              Choose your preferred development environment to connect with Arete
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedIDEs.map((ide) => (
              <Card 
                key={ide.name}
                className={`bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all cursor-pointer ${
                  !ide.supported ? 'opacity-60' : ''
                }`}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{ide.icon}</div>
                  <CardTitle className="text-lg">{ide.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-400 text-sm mb-4">{ide.description}</p>
                  {ide.supported ? (
                    <Button
                      onClick={() => handleIDESelection(ide.name)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full"
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Connection Modal */}
        <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{supportedIDEs.find(ide => ide.name === selectedIDE)?.icon}</span>
                Connect {selectedIDE}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <p className="text-gray-300">
                To connect {selectedIDE}, follow these steps:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-600">1</Badge>
                  <div>
                    <p className="text-white">Download the Arete extension</p>
                    <p className="text-gray-400 text-sm">Install our official plugin from the marketplace</p>
                    <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download Extension
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-600">2</Badge>
                  <div>
                    <p className="text-white">Paste your API key</p>
                    <p className="text-gray-400 text-sm">Connect your Arete account for seamless integration</p>
                    <div className="flex gap-2 mt-2">
                      <code className="bg-gray-900 px-2 py-1 rounded text-xs text-green-400">
                        arete_api_key_demo_12345
                      </code>
                      <Button size="sm" variant="outline">
                        <Key className="w-4 h-4 mr-2" />
                        Copy Key
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-600">3</Badge>
                  <div>
                    <p className="text-white">Test the connection</p>
                    <p className="text-gray-400 text-sm">Verify everything is working correctly</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowConnectionModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnectionComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Setup
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (currentView === 'ide-connected') {
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
          <Badge className="bg-green-600 text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            {selectedIDE} Connected
          </Badge>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-4">IDE Connected Successfully! 🎉</h1>
            <p className="text-xl text-gray-300">
              Your {selectedIDE} is now linked. You can submit code directly from your IDE.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Connection Status */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-green-400" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <span className="text-green-300">IDE Connection</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <span className="text-green-300">API Authentication</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <span className="text-green-300">Code Submission</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>Pro Tip:</strong> Use Ctrl+Shift+A (or Cmd+Shift+A on Mac) in {selectedIDE} 
                    to submit your code directly to Arete for instant feedback!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Last Submission */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white">Fibonacci Sequence</span>
                      <Badge className="bg-green-600">Passed</Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">Submitted from {selectedIDE}</p>
                    <div className="text-xs text-gray-500">
                      ✅ All test cases passed • Runtime: 0.023s
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => alert('Opening last submission details...')}
                  >
                    View Last Submission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="bg-gray-800/50 border-gray-700 mt-8">
            <CardHeader>
              <CardTitle>How to Use Your Connected IDE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h3 className="text-lg mb-2">Code in {selectedIDE}</h3>
                  <p className="text-gray-400 text-sm">
                    Write your solutions using your favorite IDE with all its features
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h3 className="text-lg mb-2">Submit to Arete</h3>
                  <p className="text-gray-400 text-sm">
                    Use the keyboard shortcut or extension button to submit your code
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h3 className="text-lg mb-2">Get Feedback</h3>
                  <p className="text-gray-400 text-sm">
                    Receive instant AI feedback and test results in your IDE
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'builtin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setCurrentView('landing')}
            variant="ghost" 
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Badge variant="outline" className="border-green-500 text-green-400">
            <Code className="w-4 h-4 mr-2" />
            Built-in Editor
          </Badge>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Problem Statement */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{mockProblems[0].title}</CardTitle>
                  <Badge className="bg-green-600">{mockProblems[0].difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {mockProblems[0].description}
                </p>
                
                <div>
                  <h4 className="text-white mb-2">Examples:</h4>
                  <div className="space-y-2">
                    {mockProblems[0].examples.map((example, index) => (
                      <div key={index} className="bg-gray-900/50 p-2 rounded text-xs">
                        <div className="text-blue-400">Input: {example.input}</div>
                        <div className="text-green-400">Output: {example.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white mb-2">Constraints:</h4>
                  <ul className="space-y-1">
                    {mockProblems[0].constraints.map((constraint, index) => (
                      <li key={index} className="text-gray-400 text-xs">• {constraint}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Code Editor</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={analyzeCode}
                      disabled={isAnalyzing}
                      variant="outline"
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Brain className="w-4 h-4 mr-2" />
                      )}
                      Analyze
                    </Button>
                    <Button 
                      onClick={getHints}
                      disabled={isGettingHints}
                      variant="outline"
                      size="sm"
                    >
                      {isGettingHints ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lightbulb className="w-4 h-4 mr-2" />
                      )}
                      Hints
                    </Button>
                    <Button 
                      onClick={getFeedback}
                      disabled={isGettingFeedback}
                      variant="outline"
                      size="sm"
                    >
                      {isGettingFeedback ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Feedback
                    </Button>
                    <Button 
                      onClick={handleRunCode}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-transparent border-none text-green-400 resize-none min-h-[300px] font-mono"
                    placeholder="Write your code here..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Output Panel */}
            {output && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Output
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    <pre className="text-gray-300 whitespace-pre-wrap">{output}</pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis Panel */}
            {aiAnalysis && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    AI Code Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm">
                    <div className="text-gray-300 whitespace-pre-wrap">{aiAnalysis}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Hints Panel */}
            {aiHints && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    AI Hints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm">
                    <div className="text-gray-300 whitespace-pre-wrap">{aiHints}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Feedback Panel */}
            {aiFeedback && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm">
                    <div className="text-gray-300 whitespace-pre-wrap">{aiFeedback}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}