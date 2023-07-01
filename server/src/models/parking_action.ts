import { syncAll, syncGet, syncRun } from "../db"
import { objToCamelKey } from "../utils/case"
import { getUnixTime } from "../utils/date"
import { ParkingLot } from "./parking_lot"
import { DbUser, User } from "./user"

export type ParkingAction = {
  isPark: boolean
  userId: number
  parkingLotId: number
}

export type DbParkingAction = {
  id: number
  is_park: boolean
  user_id: number
  parking_lot_id: number
  created_at: number
}

export const list = async (
  limit: number
): Promise<(DbParkingAction & User & ParkingLot)[]> => {
  return await syncAll<DbParkingAction & User & ParkingLot>(
    `SELECT pa.id, pa.is_park, pa.user_id, pa.parking_lot_id, pa.created_at, u.email, u.username, pl.lot_name, pl.office_name
      FROM parking_actions pa 
      LEFT JOIN users u 
      ON pa.user_id = u.id 
      LEFT JOIN parking_lots pl 
      ON pa.parking_lot_id = pl.id
      ORDER BY pa.created_at DESC LIMIT ?`,
    [limit]
  )
}

export const create = async ({
  userId,
  parkingLotId,
  isPark,
}: {
  userId: number
  parkingLotId: number
  isPark: boolean
}): Promise<void> => {
  const { curr_users } = await syncGet<string>(
    "SELECT curr_users FROM parking_lots WHERE id = ?",
    [parkingLotId]
  )
  const newUsers: Array<number> = JSON.parse(curr_users)
  if (isPark) {
    newUsers.push(userId)
  } else {
    newUsers.splice(newUsers.indexOf(userId), 1)
  }
  await syncRun(
    `INSERT INTO parking_actions (user_id, parking_lot_id, is_park, created_at) VALUES (?, ?, ?, ?)`,
    [userId, parkingLotId, isPark, getUnixTime(new Date())]
  )
  await syncRun(
    `UPDATE parking_lots SET free_lots = (SELECT free_lots ${
      isPark ? "-" : "+"
    } 1 FROM parking_lots WHERE id = ?), curr_users = ? WHERE id = ?`,
    [parkingLotId, JSON.stringify(newUsers), parkingLotId]
  )
}
