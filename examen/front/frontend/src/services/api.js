import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Asegúrate de que Django está corriendo
});

export default api;
