import { syncAll, syncGet, syncRun } from "../db"
import { getUnixTime } from "../utils/date"

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

export const list = async (limit: number): Promise<DbParkingAction[]> => {
  return await syncAll<DbParkingAction>(
    "SELECT * FROM parking_actions ORDER BY created_at DESC LIMIT ?",
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
