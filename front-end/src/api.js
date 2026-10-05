import axios from "axios";

const API = axios.create({
  baseURL: "https://focuse-guard-ai-q44i.vercel.app",
});

export default API;