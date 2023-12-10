import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as SplashScreen from "expo-splash-screen"
import { useCallback, useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NotifierWrapper } from "react-native-notifier"
import { RootSiblingParent } from "react-native-root-siblings"
import AppWrapper from "./src/AppWrapper"
import { AppContextProvider } from "./src/context"

const SCREEN_WIDTH = Dimensions.get("window").width
SplashScreen.preventAutoHideAsync()

const App = () => {
  const [appIsReady, setAppIsReady] = useState(false)
  const queryClient = new QueryClient()
  const notifierRef = useRef()

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <RootSiblingParent>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NotifierWrapper>
              <AppContextProvider>
                <BottomSheetModalProvider>
                  <View style={styles.container} onLayout={onLayoutRootView}>
                    <AppWrapper />
                  </View>
                </BottomSheetModalProvider>
              </AppContextProvider>
            </NotifierWrapper>
          </GestureHandlerRootView>
        </NavigationContainer>
      </QueryClientProvider>
    </RootSiblingParent>
  )
}

export default App
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: colors.white,
    // paddingBottom: 30,
  },
})
