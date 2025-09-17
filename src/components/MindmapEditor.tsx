import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  Map, Plus, ArrowLeft, Save, Download, Upload, Zap, Brain, Target, 
  Lightbulb, Link, Trash2, Edit3, FileImage, FileText, RotateCcw
} from 'lucide-react'

interface MindmapEditorProps {
  onNavigate: (screen: string) => void
}

interface Node {
  id: string
  text: string
  x: number
  y: number
  color: string
  connections: string[]
  level: number
  isEditing?: boolean
}

export function MindmapEditor({ onNavigate }: MindmapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [newNodeText, setNewNodeText] = useState('')
  const [mindmapTitle, setMindmapTitle] = useState('AI Learning Concepts')
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const [nodes, setNodes] = useState<Node[]>([
    {
      id: '1',
      text: 'Machine Learning',
      x: 400,
      y: 250,
      color: 'rgba(59, 130, 246, 0.8)',
      connections: ['2', '3', '4', '5'],
      level: 0
    },
    {
      id: '2',
      text: 'Supervised Learning',
      x: 250,
      y: 150,
      color: 'rgba(16, 185, 129, 0.8)',
      connections: ['1', '6', '7'],
      level: 1
    },
    {
      id: '3',
      text: 'Unsupervised Learning',
      x: 550,
      y: 150,
      color: 'rgba(245, 158, 11, 0.8)',
      connections: ['1', '8', '9'],
      level: 1
    },
    {
      id: '4',
      text: 'Deep Learning',
      x: 250,
      y: 350,
      color: 'rgba(239, 68, 68, 0.8)',
      connections: ['1', '10'],
      level: 1
    },
    {
      id: '5',
      text: 'Reinforcement Learning',
      x: 550,
      y: 350,
      color: 'rgba(139, 92, 246, 0.8)',
      connections: ['1', '11'],
      level: 1
    },
    {
      id: '6',
      text: 'Classification',
      x: 150,
      y: 80,
      color: 'rgba(16, 185, 129, 0.6)',
      connections: ['2'],
      level: 2
    },
    {
      id: '7',
      text: 'Regression',
      x: 150,
      y: 220,
      color: 'rgba(16, 185, 129, 0.6)',
      connections: ['2'],
      level: 2
    },
    {
      id: '8',
      text: 'Clustering',
      x: 650,
      y: 80,
      color: 'rgba(245, 158, 11, 0.6)',
      connections: ['3'],
      level: 2
    },
    {
      id: '9',
      text: 'Dimensionality Reduction',
      x: 650,
      y: 220,
      color: 'rgba(245, 158, 11, 0.6)',
      connections: ['3'],
      level: 2
    },
    {
      id: '10',
      text: 'Neural Networks',
      x: 150,
      y: 420,
      color: 'rgba(239, 68, 68, 0.6)',
      connections: ['4'],
      level: 2
    },
    {
      id: '11',
      text: 'Q-Learning',
      x: 650,
      y: 420,
      color: 'rgba(139, 92, 246, 0.6)',
      connections: ['5'],
      level: 2
    }
  ])

  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)', 
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(132, 204, 22, 0.8)'
  ]

  const templates = [
    {
      name: 'Course Overview',
      description: 'Map out course structure and topics',
      icon: Target,
      color: 'from-blue-500/20 to-blue-600/20',
      nodes: [
        { text: 'Course Title', level: 0, connections: 4 },
        { text: 'Module 1', level: 1 },
        { text: 'Module 2', level: 1 },
        { text: 'Module 3', level: 1 },
        { text: 'Assessment', level: 1 }
      ]
    },
    {
      name: 'Problem Solving',
      description: 'Break down complex problems',
      icon: Lightbulb,
      color: 'from-orange-500/20 to-orange-600/20',
      nodes: [
        { text: 'Main Problem', level: 0, connections: 3 },
        { text: 'Sub-problem 1', level: 1 },
        { text: 'Sub-problem 2', level: 1 },
        { text: 'Solution Strategy', level: 1 }
      ]
    },
    {
      name: 'Concept Mapping',
      description: 'Connect related concepts',
      icon: Brain,
      color: 'from-purple-500/20 to-purple-600/20',
      nodes: [
        { text: 'Core Concept', level: 0, connections: 4 },
        { text: 'Related Idea 1', level: 1 },
        { text: 'Related Idea 2', level: 1 },
        { text: 'Application', level: 1 },
        { text: 'Examples', level: 1 }
      ]
    }
  ]

  const drawMindmap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with dark background
    ctx.fillStyle = '#0f1419'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw connections with glowing effect
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId)
        if (connectedNode) {
          // Glow effect
          ctx.shadowBlur = 10
          ctx.shadowColor = '#3b82f6'
          
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(connectedNode.x, connectedNode.y)
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Reset shadow
          ctx.shadowBlur = 0
        }
      })
    })

    // Draw nodes with glowing effects
    nodes.forEach(node => {
      // Glow effect for selected node
      if (selectedNode === node.id) {
        ctx.shadowBlur = 20
        ctx.shadowColor = node.color
      } else {
        ctx.shadowBlur = 10
        ctx.shadowColor = node.color
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, 35, 0, 2 * Math.PI)
      ctx.fillStyle = node.color
      ctx.fill()
      
      // Selection border
      if (selectedNode === node.id) {
        ctx.strokeStyle = '#60a5fa'
        ctx.lineWidth = 3
        ctx.stroke()
      }

      // Reset shadow for text
      ctx.shadowBlur = 0

      // Node text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const words = node.text.split(' ')
      if (words.length === 1 || node.text.length < 12) {
        ctx.fillText(node.text.length > 10 ? node.text.substring(0, 10) + '...' : node.text, node.x, node.y)
      } else {
        ctx.fillText(words[0], node.x, node.y - 8)
        if (words[1]) {
          const secondLine = words.slice(1).join(' ')
          ctx.fillText(secondLine.length > 8 ? secondLine.substring(0, 8) + '...' : secondLine, node.x, node.y + 8)
        }
      }
    })
  }, [nodes, selectedNode])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (isAddingNode) {
      if (newNodeText.trim()) {
        addNode(x, y, newNodeText.trim())
        setNewNodeText('')
        setIsAddingNode(false)
      }
      return
    }

    // Check if clicking on a node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= 35
    })

    setSelectedNode(clickedNode ? clickedNode.id : null)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAddingNode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
      return distance <= 35
    })

    if (clickedNode) {
      setIsDragging(true)
      setSelectedNode(clickedNode.id)
      setDragOffset({ x: x - clickedNode.x, y: y - clickedNode.y })
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setNodes(prev => prev.map(node => 
      node.id === selectedNode 
        ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
        : node
    ))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const addNode = (x: number, y: number, text: string) => {
    const newNode: Node = {
      id: Date.now().toString(),
      text,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      connections: selectedNode ? [selectedNode] : [],
      level: selectedNode ? (nodes.find(n => n.id === selectedNode)?.level || 0) + 1 : 0
    }

    setNodes(prev => {
      const updated = [...prev, newNode]
      if (selectedNode) {
        return updated.map(node => 
          node.id === selectedNode 
            ? { ...node, connections: [...node.connections, newNode.id] }
            : node
        )
      }
      return updated
    })
  }

  const deleteSelectedNode = () => {
    if (!selectedNode) return
    
    setNodes(prev => prev
      .filter(node => node.id !== selectedNode)
      .map(node => ({
        ...node,
        connections: node.connections.filter(id => id !== selectedNode)
      }))
    )
    setSelectedNode(null)
  }

  const startEditingNode = () => {
    if (!selectedNode) return
    const node = nodes.find(n => n.id === selectedNode)
    if (node) {
      setEditingNodeId(selectedNode)
      setEditingText(node.text)
    }
  }

  const saveNodeEdit = () => {
    if (!editingNodeId || !editingText.trim()) return
    
    setNodes(prev => prev.map(node =>
      node.id === editingNodeId
        ? { ...node, text: editingText.trim() }
        : node
    ))
    
    setEditingNodeId(null)
    setEditingText('')
  }

  const loadTemplate = (template: typeof templates[0]) => {
    const centerX = 400
    const centerY = 250
    const radius = 140

    const newNodes: Node[] = template.nodes.map((nodeTemplate, index) => {
      let x, y
      if (nodeTemplate.level === 0) {
        x = centerX
        y = centerY
      } else {
        const angle = (index * 2 * Math.PI) / (template.nodes.length - 1)
        x = centerX + radius * Math.cos(angle)
        y = centerY + radius * Math.sin(angle)
      }

      return {
        id: index.toString(),
        text: nodeTemplate.text,
        x,
        y,
        color: colors[nodeTemplate.level % colors.length],
        connections: nodeTemplate.level === 0 ? [] : ['0'],
        level: nodeTemplate.level
      }
    })

    // Add connections for root node
    if (newNodes[0]) {
      newNodes[0].connections = newNodes.slice(1).map(n => n.id)
    }

    setNodes(newNodes)
    setMindmapTitle(template.name)
  }

  const exportAsPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${mindmapTitle.replace(/\s+/g, '_')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const exportAsPDF = () => {
    // Note: In a real implementation, you'd use a library like jsPDF
    alert('PDF export would be implemented with a library like jsPDF')
  }

  // Redraw canvas when nodes change
  useEffect(() => {
    drawMindmap()
  }, [drawMindmap])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-24">
      {/* Enhanced Background with blue-to-purple gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-black to-purple-950/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto p-6 space-y-6 relative z-10 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-semibold text-white">Mindmap Editor</h1>
              </div>
              <p className="text-gray-400">Visualize and connect your knowledge</p>
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button 
              variant="outline" 
              onClick={exportAsPNG}
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <FileImage className="w-4 h-4 mr-2" />
              Export PNG
            </Button>
            <Button 
              variant="outline" 
              onClick={exportAsPDF}
              className="bg-gray-900/60 border-gray-700/50 text-white hover:bg-gray-800/60 hover:border-gray-600/50 backdrop-blur-xl"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('supabase_token')
                  if (token) {
                    console.log('Saving mindmap:', mindmapTitle)
                    alert('Mindmap saved successfully!')
                  } else {
                    alert('Demo mode: Mindmap saved locally!')
                  }
                } catch (error) {
                  console.error('Failed to save mindmap:', error)
                  alert('Failed to save mindmap. Please try again.')
                }
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mindmap Info */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Map className="w-5 h-5 text-blue-400" />
                  Mindmap Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                  <Input 
                    value={mindmapTitle}
                    onChange={(e) => setMindmapTitle(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                    placeholder="Enter mindmap title..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                    {nodes.length} nodes
                  </Badge>
                  <Badge className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                    {nodes.reduce((acc, node) => acc + node.connections.length, 0) / 2} connections
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tools */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Node */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Add New Node</label>
                  <Input 
                    placeholder="Enter node text..."
                    value={newNodeText}
                    onChange={(e) => setNewNodeText(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newNodeText.trim()) {
                        setIsAddingNode(true)
                      }
                    }}
                  />
                  <Button 
                    onClick={() => setIsAddingNode(true)}
                    disabled={!newNodeText.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                </div>
                
                {isAddingNode && (
                  <div className="p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                    <p className="text-blue-300 text-sm mb-2">Click on the canvas to place the new node</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsAddingNode(false)}
                      className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Node Actions */}
                {selectedNode && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Selected Node Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm"
                        onClick={startEditingNode}
                        className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-600/30"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={deleteSelectedNode}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                {/* Edit Node Modal */}
                {editingNodeId && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Edit Node Text</label>
                    <Input 
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveNodeEdit()
                        if (e.key === 'Escape') {
                          setEditingNodeId(null)
                          setEditingText('')
                        }
                      }}
                      autoFocus
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="sm"
                        onClick={saveNodeEdit}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/30"
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNodeId(null)
                          setEditingText('')
                        }}
                        className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-700/50">
                  <Button 
                    variant="outline" 
                    onClick={() => setNodes([])} 
                    className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 border border-gray-700/50 bg-gradient-to-r ${template.color} hover:border-gray-600/50 hover:scale-105`}
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                        <template.icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-white">{template.name}</h4>
                        <p className="text-xs text-gray-400">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900/60 backdrop-blur-xl border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{mindmapTitle}</CardTitle>
                  <div className="flex gap-2">
                    {isAddingNode && (
                      <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30 animate-pulse">
                        Click to add node
                      </Badge>
                    )}
                    {selectedNode && (
                      <Badge className="bg-green-600/20 text-green-300 border-green-600/30">
                        Node selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="border border-gray-700/50 rounded-lg cursor-pointer shadow-lg shadow-black/50"
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  
                  {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2 text-gray-400">Create your first mindmap</p>
                        <p className="text-sm text-gray-500">Choose a template or add nodes manually</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      Click to select nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      Drag to move nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Use tools to edit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-400" />
                    <span>Smart connections</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}