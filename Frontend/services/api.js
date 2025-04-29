import axios from 'axios';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_APIBASE_URL || 'http://localhost:5000', // Backend server URL
});

export default api;