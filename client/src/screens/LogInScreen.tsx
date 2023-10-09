import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useContext, useEffect, useRef, useState } from "react"
import { Button, Input } from "react-native-elements"
import { colors } from "../global/styles"
import { userApi } from "../api/user"
import { AppContext } from "../context"
import Toast from "react-native-root-toast"
import { showToast } from "../utils/toast"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation"
import { auth, db } from "../firebase"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
} from "firebase/auth"
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
  updateDoc,
} from "firebase/firestore"

enum PageState {
  SIGNIN = 0,
  SIGNUP,
}

export type SigninInfo = {
  email?: string
  userPassword?: string
}

export type SignupInfo = {
  username?: string
  email?: string
  userPassword?: string
  confirmUserPassword?: string
}

type LogInScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LogIn"
>

const LogInScreen = () => {
  const [pageState, setPageState] = useState<PageState>(PageState.SIGNIN)
  const [signinInfo, setSigninInfo] = useState<SigninInfo>({})
  const [signupInfo, setSignupInfo] = useState<SignupInfo>({})
  const [formError, setFormError] = useState<{
    email?: string
    password?: string
  }>({})
  let timeout: any
  const { setUser } = useContext(AppContext)
  const navigation = useNavigation<LogInScreenNavigationProp>()
  const isValidEmail = (email: string): boolean => {
    return (
      String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ) !== null
    )
  }

  // useEffect(() => {
  //   clearTimeout(timeout)
  //   timeout = setTimeout(() => isValidForm())
  // }, [signinInfo, signupInfo])

  const isValidForm = () => {
    if (pageState === PageState.SIGNIN) {
      if (!(signinInfo.email && isValidEmail(signinInfo.email))) {
        setFormError({
          ...formError,
          email: "Please enter a valid email",
        })
        return false
      }
      if (!(signinInfo.userPassword && signinInfo.userPassword.length > 5)) {
        setFormError({
          ...formError,
          password: "Password must be at least 6 characters long",
        })
        return false
      }
    } else {
      if (!(signupInfo.email && isValidEmail(signupInfo.email))) {
        setFormError({
          ...formError,
          email: "Please enter a valid email",
        })
        return false
      }
      if (!(signupInfo.userPassword && signupInfo.userPassword.length > 5)) {
        setFormError({
          ...formError,
          password: "Password must be at least 6 characters long",
        })
        return false
      }
      if (signupInfo.confirmUserPassword !== signupInfo.userPassword) {
        setFormError({
          ...formError,
          password: "The passwords are not the same",
        })
        return false
      }
    }
    setFormError({})
    return true
  }

  useEffect(() => {
    setSigninInfo({})
    setSignupInfo({})
  }, [pageState])

  const submit = async () => {
    if (pageState === PageState.SIGNIN) {
      if (signinInfo?.email && signinInfo?.userPassword) {
        try {
          const resp = await userApi.signinUser(signinInfo)
          // console.log("[LoginScreen: signin user call]", resp)
          if (resp.status === "success") {
            setUser(resp.data)
            navigation.navigate("Main", { screen: "Home" })
          } else {
            showToast({
              title: resp.status,
              type: "error",
            })
          }
        } catch (e) {
          console.log(e)
          showToast({ title: (e as Error).message, type: "error" })
        }
      }
    } else {
      if (
        signupInfo?.email &&
        signupInfo?.userPassword &&
        signupInfo?.username &&
        signupInfo?.confirmUserPassword === signupInfo.userPassword
      ) {
        try {
          const resp = await userApi.createUser(signupInfo)
          // console.log("[LoginScreen: create user call]", resp)
          if (resp.status === "success") {
            setUser(resp.data)
            navigation.navigate("Main", { screen: "Home" })
          } else {
            showToast({ title: resp.status, type: "error" })
          }
        } catch (e) {
          showToast({ title: (e as Error).message, type: "error" })
        }
      } else {
        showToast({ title: "You have missing fields", type: "error" })
      }
    }
  }

  // const submit = async () => {
  //   if (pageState === PageState.SIGNIN) {
  //     if (signinInfo?.email && signinInfo?.userPassword) {
  //       signInWithEmailAndPassword(
  //         auth,
  //         signinInfo.email,
  //         signinInfo.userPassword
  //       ).then(() => {
  //         navigation.navigate("Main", { screen: "Home" })
  //       })
  //     }
  //   } else {
  //     if (
  //       signupInfo?.email &&
  //       signupInfo?.userPassword &&
  //       signupInfo?.username &&
  //       signupInfo?.confirmUserPassword === signupInfo.userPassword
  //     ) {
  //       createUserWithEmailAndPassword(
  //         auth,
  //         signupInfo.email,
  //         signupInfo.userPassword
  //       ).then((userCredential) => {
  //         const user = userCredential.user
  //         setDoc(doc(db, "users", user.uid), {
  //           uid: user.uid,
  //           email: signupInfo.email,
  //           name: signupInfo.username,
  //           req: [],
  //           realFriend: [],
  //         })
  //         updateProfile(user, {
  //           displayName: signupInfo.username,
  //           // photoURL: avatar ? avatar : 'https://robohash.org/default',
  //         })
  //         navigation.navigate("Main", { screen: "Home" })
  //       })
  //     }
  //   }
  // }

  return (
    <View style={styles.container}>
      {pageState === PageState.SIGNIN ? (
        <>
          <Input
            placeholder="Email"
            onChangeText={(email) => setSigninInfo({ ...signinInfo, email })}
            autoCapitalize="none"
            value={signinInfo?.email ?? ""}
          />
          <Input
            placeholder="Password"
            onChangeText={(userPassword) =>
              setSigninInfo({ ...signinInfo, userPassword })
            }
            autoCapitalize="none"
            value={signinInfo?.userPassword ?? ""}
          />
          <Button
            title="Sign in"
            buttonStyle={{ backgroundColor: colors.red }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
            }}
            titleStyle={{ color: "white", marginHorizontal: 20 }}
            onPress={() => submit()}
          />
          <View style={styles.signupSection}>
            <Text>Don't have an account yet?</Text>
            <TouchableOpacity onPress={() => setPageState(PageState.SIGNUP)}>
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Input
            placeholder="Username"
            onChangeText={(username) =>
              setSignupInfo({ ...signupInfo, username })
            }
            autoCapitalize="none"
            value={signupInfo?.username ?? ""}
          />
          <Input
            placeholder="Email"
            onChangeText={(email) => setSignupInfo({ ...signupInfo, email })}
            autoCapitalize="none"
            value={signupInfo?.email ?? ""}
            errorStyle={{ color: "red" }}
            errorMessage={formError.email}
          />
          <Input
            placeholder="Password"
            onChangeText={(userPassword) =>
              setSignupInfo({ ...signupInfo, userPassword })
            }
            autoCapitalize="none"
            value={signupInfo?.userPassword ?? ""}
            errorStyle={{ color: "red" }}
            errorMessage={formError.password}
          />
          <Input
            placeholder="Confirm Password"
            onChangeText={(confirmUserPassword) =>
              setSignupInfo({ ...signupInfo, confirmUserPassword })
            }
            autoCapitalize="none"
            value={signupInfo?.confirmUserPassword ?? ""}
          />
          <Button
            title="Sign up"
            buttonStyle={{ backgroundColor: colors.red }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
            }}
            titleStyle={{ color: "white", marginHorizontal: 20 }}
            onPress={() => submit()}
          />
          <View style={styles.signupSection}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => setPageState(PageState.SIGNIN)}>
              <Text style={styles.signupText}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

export default LogInScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: colors.blue,
    fontWeight: "bold",
    fontSize: 14,
  },
  signupSection: {
    marginTop: 20,
    alignItems: "center",
  },
})
