import { View, Text, StyleSheet } from "react-native"
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { RootStack } from "./navigation"
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { AppContext } from "./context"
import { IBottomsheetNotification } from "./hooks/useNotification"
import { colors } from "./global/styles"
import { Button, Image } from "react-native-elements"

const AppWrapper = () => {
  const { notificationQueue } = useContext(AppContext)
  const [currNoti, setCurrNoti] = useState<null | IBottomsheetNotification>()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index)
  }, [])

  useEffect(() => {
    if (notificationQueue.length > 0) {
      setCurrNoti(notificationQueue[0])
      bottomSheetModalRef.current?.present()
    }
  }, [notificationQueue])

  return (
    <>
      <RootStack />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={["50%"]}
        onChange={handleSheetChanges}
        onDismiss={() => {
          console.log("dismissed")
          currNoti?.onCancel?.()
        }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.titleTextStyle}>{currNoti?.title}</Text>
          <Image style={styles.img} source={require("../assets/car.png")} />
          <Text style={styles.descTextStyle}>{currNoti?.description}</Text>
          <Button
            title={"View parking lot"}
            buttonStyle={{
              backgroundColor: colors.red,
            }}
            containerStyle={{
              width: 200,
              alignSelf: "center",
              marginTop: 20,
            }}
            titleStyle={{ color: "white", marginHorizontal: 20 }}
            onPress={() => {
              currNoti?.onConfirm?.()
              bottomSheetModalRef.current?.close()
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  titleTextStyle: {
    fontSize: 21,
    paddingTop: 10,
    letterSpacing: 0,
    fontWeight: 500,
  },
  descTextStyle: {
    fontSize: 16,
    color: colors.grey2,
    textAlign: "center",
    width: 300,
  },
  img: {
    width: 70,
    height: 70,
    marginTop: 10,
  },
})

export default AppWrapper
