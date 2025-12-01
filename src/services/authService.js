import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password, preferredLanguage) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    preferredLanguage
  });
  return response.data;
};
