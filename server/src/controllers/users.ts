import { Request, Response } from "express"
import { User, create, signin } from "../models/user"
import { objToCamelKey } from "../utils/case"

export const createUser = async (req: Request, res: Response) => {
  const user: User = req.body
  try {
    const dbUser = await create(user)
    res.json({ status: "success", data: objToCamelKey(dbUser) })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}

export const signinUser = async (req: Request, res: Response) => {
  const user: Omit<User, "username"> = req.body
  try {
    const dbUser = await signin(user)
    res.json({ status: "success", data: objToCamelKey(dbUser) })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}
