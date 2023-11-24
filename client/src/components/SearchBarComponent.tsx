import React from "react";
import SearchableDropdown from "react-native-searchable-dropdown";

export interface SearchBarComponentProps {
  search: string;
  setSearch: (text: string) => void;
  data: string[];
}

interface SearchableDropdownInput {
  id: number;
  name: string;
}

export const SearchBarComponent: React.FC<SearchBarComponentProps> = ({
  search,
  setSearch,
  data,
}) => {
  const items: SearchableDropdownInput[] = data.map((d, id) => ({
    id,
    name: d,
  }));
  return (
    <SearchableDropdown
      onTextChange={(text: string) => setSearch(text)}
      // Change listner on the searchable input
      onItemSelect={({ id, name }: SearchableDropdownInput) => alert(name)}
      // Called after the selection from the dropdown
      containerStyle={{ padding: 5 }}
      // Suggestion container style
      textInputStyle={{
        // Inserted text style
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#FAF7F6",
      }}
      itemStyle={{
        // Single dropdown item style
        padding: 10,
        marginTop: 2,
        backgroundColor: "#FAF9F8",
        borderColor: "#bbb",
        borderWidth: 1,
      }}
      itemTextStyle={{
        // Text style of a single dropdown item
        color: "#222",
      }}
      itemsContainerStyle={{
        // Items container style you can pass maxHeight
        // To restrict the items dropdown hieght
        maxHeight: "50%",
      }}
      items={items}
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
  );
};
