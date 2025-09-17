import { projectId, publicAnonKey } from './supabase/info'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-08844c2c`

class ApiClient {
  private token: string | null = null

  // Store token (call this after login/signup)
  setAuthToken(token: string) {
    this.token = token
    localStorage.setItem("authToken", token) // persist across reloads
  }

  // Load token from localStorage (e.g., on app startup)
  loadAuthToken() {
    const stored = localStorage.getItem("authToken")
    if (stored) this.token = stored
  }

  private getHeaders(token?: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || this.token || publicAnonKey}`
    }
  }

  private async request(endpoint: string, options: RequestInit = {}, token?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(token),
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // ----------------------
  // 🔹 Auth
  // ----------------------

  async signup(email: string, password: string, name: string) {
    const res = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    })
    if (res.token) this.setAuthToken(res.token)
    return res
  }

  async login(email: string, password: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    if (res.token) this.setAuthToken(res.token)
    return res
  }

  async getUserProfile(token?: string) {
    return this.request('/users/profile', { method: 'GET' }, token)
  }

  // ----------------------
  // 🔹 Courses
  // ----------------------

  async saveCourseProgress(courseId: string, lessonId: string, progress: number, completed: boolean, token?: string) {
    return this.request('/courses/progress', {
      method: 'POST',
      body: JSON.stringify({ courseId, lessonId, progress, completed })
    }, token)
  }

  async getCourseProgress(courseId: string, token?: string) {
    return this.request(`/courses/${courseId}/progress`, { method: 'GET' }, token)
  }

  // ----------------------
  // 🔹 Quizzes
  // ----------------------

  async saveQuizResults(quizId: string, score: number, totalQuestions: number, timeSpent: number, answers: any[], token?: string) {
    return this.request('/quiz/results', {
      method: 'POST',
      body: JSON.stringify({ quizId, score, totalQuestions, timeSpent, answers })
    }, token)
  }

  async getQuizHistory(token?: string) {
    return this.request('/quiz/history', { method: 'GET' }, token)
  }

  // ----------------------
  // 🔹 Feynman
  // ----------------------

  async saveFeynmanExplanation(topicId: string, explanation: string, token?: string) {
    return this.request('/feynman/explanation', {
      method: 'POST',
      body: JSON.stringify({ topicId, explanation })
    }, token)
  }

  // ----------------------
  // 🔹 Pomodoro
  // ----------------------

  async savePomodoroSession(type: string, duration: number, subject: string, completed: boolean, token?: string) {
    return this.request('/pomodoro/session', {
      method: 'POST',
      body: JSON.stringify({ type, duration, subject, completed })
    }, token)
  }

  async getPomodoroHistory(token?: string) {
    return this.request('/pomodoro/history', { method: 'GET' }, token)
  }

  // ----------------------
  // 🔹 Mindmaps
  // ----------------------

  async saveMindmap(title: string, nodes: any[], connections: any[], token?: string) {
    return this.request('/mindmap/save', {
      method: 'POST',
      body: JSON.stringify({ title, nodes, connections })
    }, token)
  }

  async getMindmaps(token?: string) {
    return this.request('/mindmap/list', { method: 'GET' }, token)
  }

  async loadMindmap(mindmapId: string, token?: string) {
    return this.request(`/mindmap/${mindmapId}`, { method: 'GET' }, token)
  }

  // ----------------------
  // 🔹 Storage
  // ----------------------

  async uploadFile(bucket: string, path: string, file: File, token?: string) {
    const formData = new FormData()
    formData.append("file", file)

    return fetch(`${API_BASE_URL}/storage/upload`, {
      method: "POST",
      headers: { 'Authorization': `Bearer ${token || this.token || publicAnonKey}` },
      body: formData
    }).then(res => res.json())
  }

  // ----------------------
  // 🔹 Health check
  // ----------------------

  async healthCheck() {
    return this.request('/health', { method: 'GET' })
  }
}

export const api = new ApiClient()