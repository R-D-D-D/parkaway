import { Request, Response } from "express"
import { objToCamelKey } from "../utils/case"
import { ParkingAction, create, list } from "../models/parking_action"

export const createParkingAction = async (req: Request, res: Response) => {
  const parkingAction: ParkingAction = req.body
  try {
    await create(parkingAction)
    res.json({ status: "success" })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}

export const listParkingAction = async (req: Request, res: Response) => {
  const { limit } = req.query
  try {
    const dbParkingActions = await list(parseInt(limit as string))
    res.json({
      status: "success",
      data: dbParkingActions.map((lot) => objToCamelKey(lot)),
    })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}
