// K2 API Test Utility
import { askK2Think } from '../lib/k2'

export interface K2TestResult {
  success: boolean
  message: string
  response?: string
  error?: string
}

export async function testK2Connection(): Promise<K2TestResult> {
  try {
    console.log('🧪 Testing K2 API connection...')
    
    // Check environment variables
    const apiKey = (import.meta as any).env?.VITE_CEREBRAS_API_KEY
    const baseUrl = (import.meta as any).env?.VITE_CEREBRAS_BASE_URL
    
    if (!apiKey || !baseUrl) {
      return {
        success: false,
        message: 'Missing API configuration',
        error: `API Key: ${apiKey ? 'Present' : 'Missing'}, Base URL: ${baseUrl ? 'Present' : 'Missing'}`
      }
    }
    
    console.log('✅ Environment variables present')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base URL:', baseUrl)
    
    // Test basic connection
    const result = await askK2Think([
      {
        role: "system",
        content: "You are K2. Respond with exactly 'OK' to confirm you're working."
      },
      {
        role: "user",
        content: "Test"
      }
    ])
    
    console.log('📥 K2 Response:', result)
    
    if (!result || typeof result !== 'string') {
      return {
        success: false,
        message: 'Invalid response from K2',
        error: 'Response is not a string'
      }
    }
    
    const cleanResult = result.trim()
    
    if (cleanResult.includes('⚠️') || cleanResult.includes('Error') || cleanResult.includes('Missing')) {
      return {
        success: false,
        message: 'K2 returned an error',
        response: cleanResult,
        error: 'Response contains error indicators'
      }
    }
    
    if (cleanResult.length === 0) {
      return {
        success: false,
        message: 'Empty response from K2',
        error: 'Response is empty'
      }
    }
    
    return {
      success: true,
      message: 'K2 connection successful',
      response: cleanResult
    }
    
  } catch (error) {
    console.error('❌ K2 Test Error:', error)
    return {
      success: false,
      message: 'K2 connection failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function testK2QuizGeneration(): Promise<K2TestResult> {
  try {
    console.log('🧪 Testing K2 quiz generation...')
    
    const result = await askK2Think([
      {
        role: "system",
        content: "Create a beginner level Machine Learning quiz with exactly 2 questions. Return valid JSON only."
      },
      {
        role: "user",
        content: "Generate 2 questions for beginner level. Format: {\"questions\": [{\"id\": 1, \"question\": \"Q?\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct\": 0, \"explanation\": \"...\"}]}"
      }
    ])
    
    console.log('📥 K2 Quiz Response:', result)
    
    if (!result || typeof result !== 'string') {
      return {
        success: false,
        message: 'Invalid response from K2',
        error: 'Response is not a string'
      }
    }
    
    // Try to parse as JSON
    try {
      let cleanResult = result.trim()
      
      // Remove markdown
      cleanResult = cleanResult.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Find JSON boundaries
      const jsonStart = cleanResult.indexOf('{')
      const jsonEnd = cleanResult.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd <= jsonStart) {
        return {
          success: false,
          message: 'No valid JSON found in response',
          response: cleanResult,
          error: 'Response does not contain valid JSON'
        }
      }
      
      cleanResult = cleanResult.substring(jsonStart, jsonEnd)
      const quizData = JSON.parse(cleanResult)
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        return {
          success: false,
          message: 'Invalid quiz structure',
          response: cleanResult,
          error: 'Response does not contain questions array'
        }
      }
      
      return {
        success: true,
        message: `Quiz generation successful - ${quizData.questions.length} questions generated`,
        response: cleanResult
      }
      
    } catch (parseError) {
      return {
        success: false,
        message: 'Failed to parse quiz JSON',
        response: result,
        error: parseError instanceof Error ? parseError.message : String(parseError)
      }
    }
    
  } catch (error) {
    console.error('❌ K2 Quiz Test Error:', error)
    return {
      success: false,
      message: 'K2 quiz generation failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Global test function for easy access
export async function runAllK2Tests(): Promise<{ connection: K2TestResult, quiz: K2TestResult }> {
  console.log('🚀 Running all K2 tests...')
  
  const connectionTest = await testK2Connection()
  const quizTest = await testK2QuizGeneration()
  
  console.log('📊 Test Results:')
  console.log('Connection:', connectionTest.success ? '✅' : '❌', connectionTest.message)
  console.log('Quiz Generation:', quizTest.success ? '✅' : '❌', quizTest.message)
  
  return { connection: connectionTest, quiz: quizTest }
}
