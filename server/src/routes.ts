import express from "express"
import { createUser } from "./controllers/users"
const router = express.Router()

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log("Time: ", Date.now())
//   next()
// })

// define the home page route
router.post("/user", createUser)

// define the about route
router.get("/user/:userId", (req, res) => {
  res.send("About birds")
})

export default router
