import express from "express"
import { createUser, signinUser } from "./controllers/users"
import { createParkingLot, listParkingLots } from "./controllers/parking_lot"
import {
  createParkingAction,
  listParkingAction,
} from "./controllers/parking_action"
const router = express.Router()

// middleware that is specific to this router
// router.use((req, res, next) => {
//   console.log("Time: ", Date.now())
//   next()
// })

// define the home page route
router.post("/users", createUser)
router.post("/signin", signinUser)
router.post("/parking-lots", createParkingLot)
router.get("/parking-lots", listParkingLots)
router.post("/parking-actions", createParkingAction)
router.get("/parking-actions", listParkingAction)

export default router
