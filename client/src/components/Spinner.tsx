import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { colors } from '../global/styles'

const Spinner = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.red} />
    </View>
  )
}

export default Spinner

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#fff'
  }
})