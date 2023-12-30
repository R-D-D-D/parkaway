import Axios from "axios"
import { config } from "../configs"

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export const request = Axios.create({
  baseURL: config.apiDomain,
  responseType: "json" as const,
  headers: {
    "Content-Type": "application/json",
  },
})
