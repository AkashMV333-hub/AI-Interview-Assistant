import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  signup: async (data: { name: string; email: string; password: string; role: string }) => {
    return fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string; role: string }) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Rooms API
export const roomsAPI = {
  createRoom: async (data: { title: string }) => {
    return fetchWithAuth('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getRooms: async () => {
    return fetchWithAuth('/rooms');
  },

  getRoomByCode: async (roomCode: string) => {
    return fetchWithAuth(`/rooms/${roomCode}`);
  },

  joinRoom: async (roomCode: string) => {
    return fetchWithAuth(`/rooms/${roomCode}/join`, {
      method: 'POST',
    });
  },
};

// Candidates API
export const candidatesAPI = {
  createCandidate: async (data: {
    id: string;
    roomCode: string;
    name: string;
    email: string;
    phone: string;
    resumeText: string;
    resumeFile?: {
      name: string;
      type: string;
      data: string;
    };
    profileDescription?: string;
  }) => {
    return fetchWithAuth('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCandidatesByRoom: async (roomCode: string) => {
    return fetchWithAuth(`/candidates/room/${roomCode}`);
  },

  getCandidateById: async (id: string) => {
    return fetchWithAuth(`/candidates/${id}`);
  },

  updateCandidate: async (
    id: string,
    data: {
      status?: string;
      chatHistory?: any[];
      questionsAnswers?: any[];
      finalScore?: number;
      summary?: string;
      profileDescription?: string;
    }
  ) => {
    return fetchWithAuth(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  addChatMessage: async (id: string, message: any) => {
    return fetchWithAuth(`/candidates/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  addQuestionAnswer: async (id: string, questionAnswer: any) => {
    return fetchWithAuth(`/candidates/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionAnswer }),
    });
  },

  deleteCandidate: async (id: string) => {
    return fetchWithAuth(`/candidates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
};
