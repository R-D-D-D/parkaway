import React from "react"
import { StyleProp, View, ViewStyle } from "react-native"
import SearchableDropdown from "react-native-searchable-dropdown"

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
  return (
    <View style={containerStyle}>
      <SearchableDropdown
        onTextChange={() => {}}
        // Change listner on the searchable input
        onItemSelect={onItemSelect}
        // Called after the selection from the dropdown
        containerStyle={{ padding: 5, borderRadius: 10 }}
        // Suggestion container style
        textInputStyle={{
          // Inserted text style
          padding: 12,
          borderWidth: 1,
          borderColor: "#ccc",
          backgroundColor: "#FAF7F6",
          borderRadius: 20,
        }}
        onPress={() => console.log("asdoifj")}
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
    </View>
  )
}
