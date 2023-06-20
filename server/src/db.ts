import sqlite3, { Database } from "sqlite3"
import fs from "fs"
import { Statement } from "sqlite3"

sqlite3.verbose()

let db: Database

export function syncExec(command: string): Promise<void> {
  return new Promise((res, rej) => {
    db.exec(command, (err) => {
      if (err !== null) rej(err)
      res()
    })
  })
}

export function syncRun(command: string, params?: any): Promise<void> {
  return new Promise((res, rej) => {
    db.run(command, params, (err) => {
      if (err !== null) rej(err)
      res()
    })
  })
}

export function syncAll<T>(command: string, params?: any): Promise<T[]> {
  return new Promise((res, rej) => {
    db.all<T>(command, params, (err: Error | null, rows: T[]) => {
      if (err !== null) rej(err)
      res(rows)
    })
  })
}

export function syncGet<T>(command: string, params?: any): Promise<T> {
  return new Promise((res, rej) => {
    db.get<T>(command, params, (err: Error | null, row: T) => {
      if (err !== null) rej(err)
      res(row)
    })
  })
}

export async function init(): Promise<Database> {
  // Open a SQLite database, stored in the file db.sqlite
  db = new sqlite3.Database("db.sqlite")
  try {
    await syncExec(fs.readFileSync(__dirname + "/sql/schema.sql").toString())
  } catch (e) {
    console.log(e)
  }
  return db
}
