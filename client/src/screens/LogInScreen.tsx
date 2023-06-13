import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useState } from "react"
import { Button, Input } from "react-native-elements"
import { colors } from "../global/styles"

enum PageState {
  SIGNIN = 0,
  SIGNUP,
}

type SigninInfo = {
  email: string
  password: string
}

type SignupInfo = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const LogInScreen = () => {
  const [state, setState] = useState<PageState>(PageState.SIGNIN)
  const [signinInfo, setSigninInfo] = useState({})
  const [signupInfo, setSignupInfo] = useState({})
  return (
    <View style={styles.container}>
      {state === PageState.SIGNIN ? (
        <>
          <Input placeholder="Email" />
          <Input placeholder="Password" secureTextEntry={true} />
          <Button
            title="Sign in"
            buttonStyle={{ backgroundColor: colors.red }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
            }}
            titleStyle={{ color: "white", marginHorizontal: 20 }}
          />
          <View style={styles.signupSection}>
            <Text>Don't have an account yet?</Text>
            <TouchableOpacity onPress={() => setState(PageState.SIGNUP)}>
              <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Input placeholder="Username" />
          <Input placeholder="Email" />
          <Input placeholder="Password" secureTextEntry={true} />
          <Input placeholder="Confirm Password" secureTextEntry={true} />
          <Button
            title="Sign up"
            buttonStyle={{ backgroundColor: colors.red }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
            }}
            titleStyle={{ color: "white", marginHorizontal: 20 }}
          />
          <View style={styles.signupSection}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={() => setState(PageState.SIGNIN)}>
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
