import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  query,
} from "firebase/firestore";
import { IUser } from "../context";
import { db } from "../firebase";

export type ParkingLot = {
  id: string;
  lotName: string;
  officeName: string;
  totalLots: number;
  latitude: number;
  longitude: number;
  currUsers: IUser[];
  createdAt: Timestamp | null;
};

export const parkingApi = {
  createParkingLot: async (params: Omit<ParkingLot, "id">): Promise<void> => {
    await addDoc(collection(db, "parking_lots"), params);
  },
  getParkingLots: async (): Promise<ParkingLot[]> => {
    const result: ParkingLot[] = [];
    try {
      const ref = collection(db, "parking_lots");
      const q = query(ref);
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        result.push(doc.data() as ParkingLot);
      });
    } finally {
      return result;
    }
  },
};
