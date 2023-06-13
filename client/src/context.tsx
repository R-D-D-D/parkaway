import { createContext } from "react"

export interface IUser {
  username: string
  email: string
}

interface IContext {
  user?: IUser
}

export const AppContext = createContext<IContext>({})
