import axios, { AxiosError } from 'axios';
import { ApiError } from './ApiError';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const assistantApi = axios.create({
  baseURL: API_BASE_URL,
});

assistantApi.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => Promise.reject(ApiError.fromAxiosError(error))
);
