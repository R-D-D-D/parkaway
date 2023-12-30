import { IUser } from "../context"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth"
import { SigninInfo, SignupInfo } from "../screens/LogInScreen"
import { ApiResponse, request } from "./common"
import { auth, db } from "../firebase"
import { FirebaseError } from "firebase/app"
import { doc, getDoc } from "firebase/firestore"

const formatFirebaseUserToIUser = ({
  firebaseUser,
  userPassword,
  isAdmin = false,
}: {
  firebaseUser: User
  userPassword: string
  isAdmin?: boolean
}): IUser => ({
  username: firebaseUser.displayName ?? "",
  email: firebaseUser.email ?? "",
  userPassword,
  createdAt: firebaseUser.metadata.creationTime ?? "",
  isAdmin,
  id: firebaseUser.uid,
})

const isUserAdmin = async (email: string): Promise<boolean> => {
  const docRef = doc(db, "user_admin", email)
  const docSnap = await getDoc(docRef)
  return docSnap.exists()
}

export const userApi = {
  createUser: async (params: SignupInfo): Promise<ApiResponse<IUser>> => {
    try {
      const { email, userPassword } = params
      if (!email || !userPassword) throw new Error()

      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        userPassword
      )
      const { user } = res

      return {
        status: "success",
        data: formatFirebaseUserToIUser({
          firebaseUser: user,
          userPassword,
        }),
      }
    } catch (e) {
      console.error(e)
      let message = ""
      if (e instanceof FirebaseError) {
        message = e.message
      }
      return {
        status: "failed",
        message,
        data: {} as IUser,
      }
    }
  },

  signinUser: async (params: SigninInfo): Promise<ApiResponse<IUser>> => {
    try {
      const { email, userPassword } = params
      if (!email || !userPassword) throw new Error()

      // throws error if fail auth
      const res = await signInWithEmailAndPassword(auth, email, userPassword)

      const { user } = res

      return {
        status: "success",
        data: formatFirebaseUserToIUser({
          firebaseUser: user,
          userPassword,
          isAdmin: await isUserAdmin(email),
        }),
      }
    } catch (e) {
      console.error(e)
      let message = ""
      if (e instanceof FirebaseError) {
        message = e.message
      }
      return {
        status: "failed",
        message,
        data: {} as IUser,
      }
    }
  },
}
