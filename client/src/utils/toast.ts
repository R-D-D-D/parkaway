import { Notifier, Easing, NotifierComponents } from "react-native-notifier"

export type AlertTypes = "error" | "warn" | "info" | "success"

export const showToast = (params: {
  title: string
  description?: string
  type: AlertTypes
  duration?: number
}) => {
  const { title, description = undefined, type, duration = 3500 } = params
  Notifier.showNotification({
    title: title,
    description: description,
    duration: duration,
    showAnimationDuration: 800,
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: type,
    },
  })
}

export const showCustomToast = (params: any) => {
  Notifier.showNotification(params)
}
