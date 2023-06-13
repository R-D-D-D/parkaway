import db from "../db"
import { getUnixTime } from "../utils/date"

export interface IUser {
  username: string
  email: string
  userPassword: string
}

export const create = async (user: IUser) => {
  const { username, email, userPassword } = user
  db.run(
    "INSERT INTO users (username, email, user_password, created_at) VALUES (?, ?, ?)",
    [username, email, userPassword, getUnixTime(new Date())],
    (err: unknown) => {
      console.log(err)
    }
  )
}
