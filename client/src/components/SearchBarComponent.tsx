import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import SearchableDropdown from "react-native-searchable-dropdown"
import { Button, Icon } from "react-native-elements"
import { IconType } from "react-native-dynamic-vector-icons"
import { useNavigation } from "@react-navigation/native"
import { TouchableOpacity } from "react-native"

export interface SearchBarComponentProps {
  data: SearchableDropdownInput[]
  onItemSelect: (item: SearchableDropdownInput) => void
  containerStyle: StyleProp<ViewStyle>
}

export interface SearchableDropdownInput {
  id: number // has to be number or the component drops this
  name: string
}

export const SearchBarComponent: React.FC<SearchBarComponentProps> = ({
  data,
  onItemSelect,
  containerStyle,
}) => {
  const navigation = useNavigation()

  return (
    <View style={containerStyle}>
      <SearchableDropdown
        onTextChange={() => {}}
        // Change listner on the searchable input
        onItemSelect={onItemSelect}
        // Called after the selection from the dropdown
        containerStyle={{
          padding: 5,
          borderRadius: 10,
          // backgroundColor: "transparent",
        }}
        // Suggestion container style
        textInputStyle={{
          // Inserted text style
          padding: 12,
          borderWidth: 1,
          borderColor: "#ccc",
          backgroundColor: "#FAF7F6",
          borderRadius: 20,
          width: "90%",
          marginLeft: "auto",
        }}
        listProps={{}}
        itemStyle={{
          // Single dropdown item style
          padding: 10,
          marginTop: 2,
          // backgroundColor: "#FAF9F8",
        }}
        itemTextStyle={{
          // Text style of a single dropdown item
          color: "#222",
        }}
        itemsContainerStyle={{
          // Items container style you can pass maxHeight
          // To restrict the items dropdown height
          maxHeight: "80%",
          backgroundColor: "white",
        }}
        items={data}
        // Mapping of item array
        defaultIndex={2}
        // Default selected item index
        placeholder="Search here..."
        // Place holder for the search input
        resetValue={false}
        // Reset textInput Value with true and false state
        underlineColorAndroid="transparent"
        // To remove the underline from the android input
      />
      <TouchableOpacity
        style={{
          // padding: 6,
          // borderRadius: 20,
          width: 50,
          height: 50,
          // marginBottom: 8,
          // marginTop: 8,
          position: "absolute",
          left: 0,
          top: 12,
        }}
        onPress={() => {
          navigation.navigate("Home")
        }}
      >
        <Icon
          name={"chevron-left"}
          type={IconType.MaterialCommunityIcons}
          size={30}
          color={"black"}
        />
      </TouchableOpacity>
    </View>
  )
}
