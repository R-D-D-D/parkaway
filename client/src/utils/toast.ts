import Toast from "react-native-root-toast"

export const showLongToast = (msg: string) => {
  Toast.show(msg, {
    duration: Toast.durations.LONG,
    position: 40,
  })
}

export const showShortToast = (msg: string) => {
  Toast.show(msg, {
    duration: Toast.durations.SHORT,
    position: 40,
  })
}
