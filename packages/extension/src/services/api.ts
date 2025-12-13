import axios, { AxiosError } from "axios";
import { setupErrorInterceptor } from "./errorUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const assistantApi = axios.create({
  baseURL: API_BASE_URL,
});

assistantApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    return setupErrorInterceptor(error);
  }
);
