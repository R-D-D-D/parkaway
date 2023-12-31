import RNBounceable from "@freakycoder/react-native-bounceable"
import * as React from "react"
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native"
import Androw from "react-native-androw"
/**
 * ? Local Imports
 */
import { IconType } from "react-native-dynamic-vector-icons"
import styles, { _container } from "./Card.style"
import IconContainer from "./components/IconContainer/IconContainer"
import TextContainer from "./components/TextContainer/TextContainer"

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>
type CustomTextStyleProp = StyleProp<TextStyle> | Array<StyleProp<TextStyle>>

interface ICardProps {
  style?: CustomStyleProp
  onPress?: () => void
  iconDisable?: boolean
  iconName?: string
  iconType?: IconType
  iconSize?: number
  iconColor?: string
  borderRadius?: number
  topRightText?: string
  backgroundColor?: string
  bottomRightText?: string
  containerHeight?: number
  topRightComponent?: JSX.Element
  bottomRightComponent?: JSX.Element
  shadowStyle?: CustomStyleProp
  topRightTextStyle?: CustomTextStyleProp
  bottomRightTextStyle?: CustomTextStyleProp
  title?: string
}

const Card: React.FC<ICardProps> = ({
  style,
  onPress,
  shadowStyle,
  topRightText,
  bottomRightText,
  topRightTextStyle,
  topRightComponent,
  bottomRightTextStyle,
  bottomRightComponent,
  borderRadius = 15,
  iconDisable = false,
  backgroundColor = "#fff",
  containerHeight = undefined,
  iconName,
  iconColor,
  iconSize,
  iconType,
  title,
  ...rest
}) => {
  const renderTopRightComponent = () =>
    topRightComponent || (
      <View style={styles.topRightContainer}>
        <Text style={[styles.topRightTextStyle, topRightTextStyle]}>
          {topRightText}
        </Text>
      </View>
    )

  const renderBottomRightComponent = () =>
    bottomRightComponent || (
      <View style={styles.bottomRightContainer}>
        <Text style={[styles.bottomRightTextStyle, bottomRightTextStyle]}>
          {bottomRightText}
        </Text>
      </View>
    )

  return (
    <Androw style={[styles.shadowStyle, shadowStyle]}>
      <RNBounceable
        {...rest}
        style={[
          _container(
            containerHeight,
            iconDisable,
            borderRadius,
            backgroundColor
          ),
          style,
        ]}
        onPress={onPress}
      >
        <View style={styles.contentContainer}>
          <IconContainer
            iconDisable={iconDisable}
            iconName={iconName}
            iconType={iconType}
            iconSize={iconSize}
            iconColor={iconColor}
            containerHeight={containerHeight}
          />
          <TextContainer iconDisable={iconDisable} title={title} {...rest} />
          {renderTopRightComponent()}
          {renderBottomRightComponent()}
        </View>
      </RNBounceable>
    </Androw>
  )
}

export default Card
