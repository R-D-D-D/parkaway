import { camelCase } from "change-case"

export const objToCamelKey = (obj: {
  [k: string]: unknown
}): { [k: string]: unknown } => {
  let temp = {}
  Object.keys(obj).forEach((key) => {
    Object.assign(temp, { [camelCase(key)]: obj[key] })
  })
  return temp
}
