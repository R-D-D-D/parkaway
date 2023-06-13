import dateFns from "date-fns"

export const getUnixTime = (date: Date): number => {
  return dateFns.getUnixTime(new Date())
}

export const parseUnixTime = (timestamp: number): Date => {
  return dateFns.fromUnixTime(timestamp)
}

export const format = (date: Date | number, format: string): string => {
  return dateFns.format(date, format)
}
