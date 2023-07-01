import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useContext, useEffect, useState } from "react"
import { Button, Input } from "react-native-elements"
import { colors } from "../global/styles"
import { userApi } from "../api/user"
import { AppContext } from "../context"
import Toast from "react-native-root-toast"
import { showLongToast, showShortToast } from "../utils/toast"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation"

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
  const [signinInfo, setSigninInfo] = useState<SigninInfo>(null)
  const [signupInfo, setSignupInfo] = useState<SignupInfo>(null)
  const { setUser } = useContext(AppContext)
  const navigation = useNavigation<LogInScreenNavigationProp>()

  useEffect(() => {
    setSigninInfo(null)
    setSignupInfo(null)
  }, [pageState])

  const submit = async () => {
    if (pageState === PageState.SIGNIN) {
      if (signinInfo.email && signinInfo.userPassword) {
        try {
          const resp = await userApi.signinUser(signinInfo)
          // console.log("[LoginScreen: signin user call]", resp)
          if (resp.status === "success") {
            showShortToast("success")
            setUser(resp.data)
            navigation.navigate("Main", { screen: "Home" })
          } else {
            showLongToast(resp.status)
          }
        } catch (e) {
          showLongToast(e.message)
        }
      }
    } else {
      if (
        signupInfo.email &&
        signupInfo.userPassword &&
        signupInfo.username &&
        signupInfo.confirmUserPassword === signupInfo.userPassword
      ) {
        try {
          const resp = await userApi.createUser(signupInfo)
          // console.log("[LoginScreen: create user call]", resp)
          if (resp.status === "success") {
            showShortToast("success")
            setUser(resp.data)
            navigation.navigate("Main")
          } else {
            showLongToast(resp.status)
          }
        } catch (e) {
          showLongToast(e.message)
        }
      }
    }
  }

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
          />
          <Input
            placeholder="Password"
            onChangeText={(userPassword) =>
              setSignupInfo({ ...signupInfo, userPassword })
            }
            autoCapitalize="none"
            value={signupInfo?.userPassword ?? ""}
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
