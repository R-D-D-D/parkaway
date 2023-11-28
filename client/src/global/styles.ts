import { getStatusBarHeight } from "react-native-status-bar-height"
import { Dimensions } from "react-native"

export const SCREEN_WIDTH = Dimensions.get("window").width
export const SCREEN_HEIGHT = Dimensions.get("window").height

export const colors = {
  buttons: "#ff8c52",
  grey: "#bebebe",
  grey1: "#43484d",
  grey2: "#5e6977",
  grey3: "#86939e",
  grey4: "#bdc6cf",
  grey5: "#e1e8ee",
  grey6: "#eeeeee",
  grey7: "#F2f9f9",
  grey10: "#d6d6d6",
  CardComment: "#86939e",
  cardbackground: "white",
  statusbar: "#ff8c52",
  heaherText: "white",
  lightgreen: "#66DF48",
  blue: "#286ef0",
  blue1: "#007bff",
  black: "#000000",
  white: "#ffffff",
  darkBlue: "#2d328a",
  pagebackground: "white",
  red: "#FF5252",
  green: "#7DF47D",
  green1: "#28a745",
}

export const parameters = {
  statusBarHeight: getStatusBarHeight(),
  headerHeight: 70,

  styledButton: {
    backgroundColor: "#ff8c52",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ff8c52",
    height: 50,
    paddingHorizontal: 20,
    width: "100%",
  },

  buttonTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -3,
  },
}

export const title = {
  color: "#ff8c52",
  fontSize: 20,
  fontWeight: "bold",
}
