import { createClient } from "jsr:@supabase/supabase-js@2"
import { cors } from "npm:hono/cors"
import { Hono } from "npm:hono"
import { logger } from "npm:hono/logger"
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS and logging
app.use("*", cors())
app.use("*", logger(console.log))

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Auth middleware for protected routes
const authMiddleware = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
    // Allow anonymous access for some routes
    return next()
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('user', user)
  return next()
}

// User registration
app.post('/make-server-08844c2c/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })
    
    if (error) {
      console.log('Signup error:', error)
      return c.json({ error: error.message }, 400)
    }
    
    // Initialize user data
    const userId = data.user.id
    await kv.set(`user:${userId}:profile`, {
      name,
      email,
      level: 1,
      totalStudyTime: 0,
      streakDays: 0,
      createdAt: new Date().toISOString()
    })
    
    await kv.set(`user:${userId}:stats`, {
      sessionsCompleted: 0,
      quizzesCompleted: 0,
      averageRetention: 0,
      pomodorosSessions: 0,
      coursesEnrolled: 0
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Internal server error during signup' }, 500)
  }
})

// Get user profile and stats
app.get('/make-server-08844c2c/users/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const profile = await kv.get(`user:${user.id}:profile`)
    const stats = await kv.get(`user:${user.id}:stats`)
    
    return c.json({
      profile: profile || {},
      stats: stats || {}
    })
  } catch (error) {
    console.log('Get profile error:', error)
    return c.json({ error: 'Failed to fetch user profile' }, 500)
  }
})

// Update user stats
app.post('/make-server-08844c2c/users/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const updates = await c.req.json()
    const currentStats = await kv.get(`user:${user.id}:stats`) || {}
    
    const updatedStats = { ...currentStats, ...updates, updatedAt: new Date().toISOString() }
    await kv.set(`user:${user.id}:stats`, updatedStats)
    
    return c.json({ stats: updatedStats })
  } catch (error) {
    console.log('Update stats error:', error)
    return c.json({ error: 'Failed to update user stats' }, 500)
  }
})

// Save course progress
app.post('/make-server-08844c2c/courses/progress', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { courseId, lessonId, progress, completed } = await c.req.json()
    
    const progressKey = `user:${user.id}:course:${courseId}`
    const currentProgress = await kv.get(progressKey) || { lessons: {} }
    
    currentProgress.lessons[lessonId] = {
      progress,
      completed,
      completedAt: completed ? new Date().toISOString() : null
    }
    
    await kv.set(progressKey, currentProgress)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Save course progress error:', error)
    return c.json({ error: 'Failed to save course progress' }, 500)
  }
})

// Get course progress
app.get('/make-server-08844c2c/courses/:courseId/progress', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const courseId = c.req.param('courseId')
    const progress = await kv.get(`user:${user.id}:course:${courseId}`)
    
    return c.json({ progress: progress || { lessons: {} } })
  } catch (error) {
    console.log('Get course progress error:', error)
    return c.json({ error: 'Failed to fetch course progress' }, 500)
  }
})

// Save quiz results
app.post('/make-server-08844c2c/quiz/results', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { quizId, score, totalQuestions, timeSpent, answers } = await c.req.json()
    
    const resultId = `${Date.now()}`
    const result = {
      quizId,
      score,
      totalQuestions,
      accuracy: (score / totalQuestions) * 100,
      timeSpent,
      answers,
      completedAt: new Date().toISOString()
    }
    
    await kv.set(`user:${user.id}:quiz:${resultId}`, result)
    
    // Update user stats
    const currentStats = await kv.get(`user:${user.id}:stats`) || {}
    currentStats.quizzesCompleted = (currentStats.quizzesCompleted || 0) + 1
    currentStats.averageRetention = result.accuracy // Simplified calculation
    await kv.set(`user:${user.id}:stats`, currentStats)
    
    return c.json({ success: true, resultId })
  } catch (error) {
    console.log('Save quiz results error:', error)
    return c.json({ error: 'Failed to save quiz results' }, 500)
  }
})

// Get quiz history
app.get('/make-server-08844c2c/quiz/history', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const results = await kv.getByPrefix(`user:${user.id}:quiz:`)
    return c.json({ results })
  } catch (error) {
    console.log('Get quiz history error:', error)
    return c.json({ error: 'Failed to fetch quiz history' }, 500)
  }
})

// Save Feynman explanation
app.post('/make-server-08844c2c/feynman/explanation', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { topicId, explanation } = await c.req.json()
    
    // Simulate AI feedback (in a real app, this would call an AI service)
    const feedback = {
      clarity: Math.floor(Math.random() * 30) + 70, // 70-100
      accuracy: Math.floor(Math.random() * 20) + 80, // 80-100
      completeness: Math.floor(Math.random() * 40) + 60, // 60-100
      suggestions: [
        "Great job explaining the core concept! Consider adding a specific example to make it clearer.",
        "Your explanation shows good understanding. Try to simplify the technical terms for better clarity.",
        "Consider adding more concrete examples to illustrate the concept better."
      ],
      strengths: [
        "Clear logical flow",
        "Good use of analogies",
        "Accurate technical details"
      ],
      improvements: [
        "Add more examples",
        "Simplify complex terms",
        "Include common misconceptions"
      ],
      generatedAt: new Date().toISOString()
    }
    
    const explanationId = `${Date.now()}`
    await kv.set(`user:${user.id}:feynman:${explanationId}`, {
      topicId,
      explanation,
      feedback,
      createdAt: new Date().toISOString()
    })
    
    return c.json({ feedback, explanationId })
  } catch (error) {
    console.log('Save Feynman explanation error:', error)
    return c.json({ error: 'Failed to process explanation' }, 500)
  }
})

// Save Pomodoro session
app.post('/make-server-08844c2c/pomodoro/session', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { type, duration, subject, completed } = await c.req.json()
    
    const sessionId = `${Date.now()}`
    await kv.set(`user:${user.id}:pomodoro:${sessionId}`, {
      type, // 'work', 'break', 'longBreak'
      duration,
      subject,
      completed,
      createdAt: new Date().toISOString()
    })
    
    // Update user stats
    if (completed && type === 'work') {
      const currentStats = await kv.get(`user:${user.id}:stats`) || {}
      currentStats.sessionsCompleted = (currentStats.sessionsCompleted || 0) + 1
      currentStats.totalStudyTime = (currentStats.totalStudyTime || 0) + duration
      await kv.set(`user:${user.id}:stats`, currentStats)
    }
    
    return c.json({ success: true, sessionId })
  } catch (error) {
    console.log('Save Pomodoro session error:', error)
    return c.json({ error: 'Failed to save Pomodoro session' }, 500)
  }
})

// Get Pomodoro history
app.get('/make-server-08844c2c/pomodoro/history', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const sessions = await kv.getByPrefix(`user:${user.id}:pomodoro:`)
    return c.json({ sessions })
  } catch (error) {
    console.log('Get Pomodoro history error:', error)
    return c.json({ error: 'Failed to fetch Pomodoro history' }, 500)
  }
})

// Save mindmap
app.post('/make-server-08844c2c/mindmap/save', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const { title, nodes, connections } = await c.req.json()
    
    const mindmapId = `${Date.now()}`
    await kv.set(`user:${user.id}:mindmap:${mindmapId}`, {
      title,
      nodes,
      connections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
    return c.json({ success: true, mindmapId })
  } catch (error) {
    console.log('Save mindmap error:', error)
    return c.json({ error: 'Failed to save mindmap' }, 500)
  }
})

// Get user mindmaps
app.get('/make-server-08844c2c/mindmap/list', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const mindmaps = await kv.getByPrefix(`user:${user.id}:mindmap:`)
    return c.json({ mindmaps })
  } catch (error) {
    console.log('Get mindmaps error:', error)
    return c.json({ error: 'Failed to fetch mindmaps' }, 500)
  }
})

// Load specific mindmap
app.get('/make-server-08844c2c/mindmap/:mindmapId', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const mindmapId = c.req.param('mindmapId')
    const mindmap = await kv.get(`user:${user.id}:mindmap:${mindmapId}`)
    
    if (!mindmap) {
      return c.json({ error: 'Mindmap not found' }, 404)
    }
    
    return c.json({ mindmap })
  } catch (error) {
    console.log('Load mindmap error:', error)
    return c.json({ error: 'Failed to load mindmap' }, 500)
  }
})

// Health check
app.get('/make-server-08844c2c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

Deno.serve(app.fetch)