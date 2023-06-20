import { syncAll, syncRun } from "../db"
import { objToCamelKey } from "../utils/case"
import { getUnixTime } from "../utils/date"
import { User, DbUser } from "./user"

export type ParkingLot = {
  lotName: string
  officeName: string
  totalLots: number
  latitude: number
  longitude: number
  freeLots: number
  currUsers: string
}

export type DbParkingLot = {
  id: number
  lot_name: string
  office_name: string
  total_lots: number
  free_lots: number
  curr_users: string
  latitude: number
  longitude: number
  created_at: number
}

export const create = async (parkingLot: ParkingLot): Promise<DbParkingLot> => {
  const { lotName, officeName, totalLots, longitude, latitude } = parkingLot
  await syncRun(
    "INSERT INTO parking_lots (lot_name, office_name, total_lots, free_lots, longitude, latitude, curr_users, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      lotName,
      officeName,
      totalLots,
      totalLots,
      longitude,
      latitude,
      JSON.stringify([]),
      getUnixTime(new Date()),
    ]
  )
  const rows = await syncAll<DbParkingLot>(
    "SELECT * FROM parking_lots WHERE lot_name = ? AND office_name = ?",
    [lotName, officeName]
  )
  if (rows.length === 1) {
    return rows[0]
  } else {
    throw new Error("Retrieving failed")
  }
}

export const list = async (): Promise<DbParkingLot[]> => {
  const parkingLots = await syncAll<DbParkingLot>("SELECT * FROM parking_lots")
  const users = await syncAll<DbUser>("SELECT * FROM users")
  const usersMap = new Map(users.map((user) => [user.id, objToCamelKey(user)]))
  // map curr_users string array to users
  return parkingLots.map((lot) => ({
    ...lot,
    curr_users: JSON.parse(lot.curr_users).map((u: number) => usersMap.get(u)),
  }))
}
