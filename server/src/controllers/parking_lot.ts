import { Request, Response } from "express"
import { objToCamelKey } from "../utils/case"
import { ParkingLot, create, list } from "../models/parking_lot"

export const createParkingLot = async (req: Request, res: Response) => {
  const parkingLot: ParkingLot = req.body
  try {
    const dbParkingLot = await create(parkingLot)
    res.json({ status: "success", data: objToCamelKey(dbParkingLot) })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}

export const listParkingLots = async (req: Request, res: Response) => {
  try {
    const dbParkingLots = await list()
    res.json({
      status: "success",
      data: dbParkingLots.map((lot) => objToCamelKey(lot)),
    })
  } catch (e) {
    console.log(e)
    res.json({ status: (e as { message: string }).message })
  }
}
