import * as React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import Icon, { IconType } from "react-native-dynamic-vector-icons"
/**
 * ? Local Imports
 */
import styles, { iconCircle } from "./IconContainer.style"

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>

interface IIconContainerProps {
  iconName?: string
  iconType?: string
  iconSize?: number
  iconColor?: string
  iconDisable?: boolean
  iconBackgroundColor?: string
  iconStyle?: CustomStyleProp
  iconComponent?: JSX.Element
  containerHeight?: number
}

const IconContainer: React.FC<IIconContainerProps> = ({
  iconStyle,
  iconName = "home",
  iconType = "Entypo",
  iconSize = 26,
  iconColor = "#fff",
  iconDisable = false,
  iconComponent,
  iconBackgroundColor = "#FFEAEA",
}) => {
  if (iconDisable) return null
  return (
    <View style={[styles.iconContainer, iconStyle]}>
      <View style={iconCircle(iconDisable, iconBackgroundColor)}>
        <View style={[styles.iconStyle]}>
          {iconComponent || (
            <Icon
              name={iconName}
              type={iconType as IconType}
              size={iconSize}
              color={iconColor}
            />
          )}
        </View>
      </View>
    </View>
  )
}

export default IconContainer
