import express, { Request, Response } from "express"
import dotenv from "dotenv"
import router from "./routes"
import { init as initDb } from "./db"

dotenv.config()

const app = express()
const port = process.env.PORT
initDb()

app.use("/", router)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
