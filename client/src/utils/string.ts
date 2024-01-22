export const nameToAbbr = (name: string) => {
  const nameArr = name.split(" ")
  return nameArr
    .slice(0, 2)
    .map((str) => str[0]?.toUpperCase() || "")
    .join("")
}
