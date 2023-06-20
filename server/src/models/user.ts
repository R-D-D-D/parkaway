import { syncAll, syncRun } from "../db"
import { getUnixTime } from "../utils/date"

export type User = {
  username: string
  email: string
  userPassword: string
}

export type DbUser = {
  id: number
  username: string
  email: string
  user_password: string
  is_admin: boolean
  created_at: number
}

export const create = async (user: User): Promise<DbUser> => {
  const { username, email, userPassword } = user
  await syncRun(
    "INSERT INTO users (username, email, user_password, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
    [username, email, userPassword, false, getUnixTime(new Date())]
  )
  const rows = await syncAll<DbUser>("SELECT * FROM users WHERE email = ?", [
    email,
  ])
  if (rows.length === 1 && rows[0].user_password === userPassword) {
    return rows[0]
  } else {
    throw new Error("Retrieving failed")
  }
}

export const signin = async (user: Omit<User, "username">): Promise<DbUser> => {
  const { email, userPassword } = user
  const rows = await syncAll<DbUser>("SELECT * FROM users WHERE email = ?", [
    email,
  ])
  if (rows.length === 1 && rows[0].user_password === userPassword) {
    return rows[0]
  } else {
    throw new Error("Invalid User")
  }
}
