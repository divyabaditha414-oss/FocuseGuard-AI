import axios from "axios";

const API = axios.create({
  baseURL: "https://focus-guard-ai-q44i.vercel.app",
});

export default API;