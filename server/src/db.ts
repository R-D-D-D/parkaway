import sqlite3, { Database } from "sqlite3"
import fs from "fs"
import { Statement } from "sqlite3"

sqlite3.verbose()

let db: Database

export function syncExec(command: string): Promise<void> {
  return new Promise((res) => {
    db.exec(command, () => {
      res()
    })
  })
}

export function syncRun(command: string, params: any): Promise<void> {
  return new Promise((res) => {
    db.run(command, params, () => {
      res()
    })
  })
}

export function syncAll<T>(command: string, params: any): Promise<T[]> {
  return new Promise((res) => {
    db.all<T>(command, params, (err: Error | null, rows: T[]) => {
      res(rows)
    })
  })
}

export async function init(): Promise<Database> {
  // Open a SQLite database, stored in the file db.sqlite
  db = new sqlite3.Database("db.sqlite")
  await syncExec(fs.readFileSync(__dirname + "/sql/schema.sql").toString())
  return db
}
