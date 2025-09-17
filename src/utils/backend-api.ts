// Backend API utility for communicating with the Express server
const BACKEND_URL = 'http://localhost:5000';

export interface K2Request {
  mode: 'feynman' | 'analyze' | 'suggestions' | 'simplify' | 'coding' | 'course' | 'olympiad';
  userExplanation: string;
  topic?: string;
  context?: string;
}

export interface K2Response {
  success: boolean;
  content: string;
  usage?: any;
  error?: string;
}

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  success: boolean;
  content: string;
  error?: string;
}

// Call K2 API through backend
export async function callK2API(request: K2Request): Promise<K2Response> {
  try {
    const response = await fetch(`${BACKEND_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend API error:', error);
    return {
      success: false,
      content: 'Unable to connect to the AI service. Please check if the backend server is running.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Search through backend
export async function searchBackend(request: SearchRequest): Promise<SearchResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search API error:', error);
    return {
      success: false,
      content: 'Search temporarily unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Health check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
