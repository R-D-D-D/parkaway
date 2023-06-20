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
    "SELECT * FROM parking_actions LIMIT ?",
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
  const newUsers: Array<number> = JSON.parse(
    await syncGet<string>("SELECT curr_users FROM parking_lots WHERE id = ?", [
      parkingLotId,
    ])
  )
  if (isPark) {
    newUsers.splice(newUsers.indexOf(userId), 1)
  } else {
    newUsers.push(userId)
  }
  await syncRun(
    `INSERT INTO parking_actions (user_id, parking_lot_id, is_park, created_at) VALUES (?, ?, ?, ?);
    UPDATE parking_lots SET free_lots = (SELECT free_lots ${
      isPark ? "-" : "+"
    } 1 FROM parking_lots WHERE id = ?), curr_users = ? WHERE id = ?;
    `,
    [
      userId,
      parkingLotId,
      isPark,
      getUnixTime(new Date()),
      parkingLotId,
      newUsers,
      parkingLotId,
    ]
  )
}
