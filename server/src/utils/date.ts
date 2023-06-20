import * as df from "date-fns"

export const getUnixTime = (date: Date): number => {
  return df.getUnixTime(date)
}

export const parseUnixTime = (timestamp: number): Date => {
  return df.fromUnixTime(timestamp)
}

export const format = (date: Date | number, format: string): string => {
  return df.format(date, format)
}
