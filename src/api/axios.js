import axios from "axios";

const api = axios.create({
  baseURL: "https://chat-application-mern-ou51.onrender.com",
  withCredentials: true,
});

export default api;