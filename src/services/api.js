import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const loginAPI = (credentials) => API.post('/auth/login', credentials);
export const registerAPI = (userData) => API.post('/auth/register', userData);
export const logoutAPI = () => API.post('/auth/logout');
export const getProfileAPI = () => API.get('/auth/profile');

// Quizzes
export const getQuizzesAPI = () => API.get('/quizzes');
export const getQuizByIdAPI = (id) => API.get(`/quizzes/${id}`);
export const createQuizAPI = (quizData) => API.post('/quizzes/', quizData);
export const updateQuizAPI = (id, quizData) => API.put(`/quizzes/${id}`, quizData);
export const deleteQuizAPI = (id) => API.delete(`/quizzes/${id}`);
export const addQuestionToQuizAPI = (quizId, questionData) =>
  API.post(`/quizzes/${quizId}/question`, questionData);
export const addQuestionsToQuizAPI = (quizId, questionsData) =>
  API.post(`/quizzes/${quizId}/questions`, questionsData);

// Questions
export const getQuestionsAPI = () => API.get('/questions/');
export const getQuestionByIdAPI = (id) => API.get(`/questions/${id}`);
export const createQuestionAPI = (questionData) => API.post('/questions/', questionData);
export const updateQuestionAPI = (id, questionData) => API.put(`/questions/${id}`, questionData);
export const deleteQuestionAPI = (id) => API.delete(`/questions/${id}`);

export default API;
