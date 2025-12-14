import axios, { AxiosError } from "axios";
import { setupErrorInterceptor } from "./errorUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "Environment variable VITE_API_BASE_URL is not defined. " +
      "Ensure you have run the project using secrets manager."
  );
}

export const assistantApi = axios.create({
  baseURL: API_BASE_URL,
});

assistantApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    return setupErrorInterceptor(error);
  }
);
