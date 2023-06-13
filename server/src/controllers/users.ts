import { Request, Response } from "express"
import { IUser, create } from "../models/user"

export const createUser = async (req: Request, res: Response) => {
  const user: IUser = req.body
  await create(user)
  res.send("Success")
}
