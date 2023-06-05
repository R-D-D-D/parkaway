import { format } from "date-fns"

export const formatDate = (date: Date | number, f: string) => {
  return format(date, f)
}
