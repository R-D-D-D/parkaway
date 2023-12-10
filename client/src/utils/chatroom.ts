// sorts user ids in asc order, then join it by dash
// EG
// user.id = 1
// otherUser.id = 10
// returns "1-10"
export const generateChatroomId = ({
  userId,
  otherUserId,
}: {
  userId: string | number
  otherUserId: string | number
}): string => {
  const arr = [userId, otherUserId]
  arr.sort((a, b) => String(a).localeCompare(String(b)))
  return arr.join("-")
}
