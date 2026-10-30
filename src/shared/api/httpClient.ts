import axios from 'axios'
import { apiConfig } from './apiConfig'

/** Shared HTTP boundary; configure CSRF and session behavior with the backend contract. */
export const httpClient = axios.create({
  baseURL: apiConfig.baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})
