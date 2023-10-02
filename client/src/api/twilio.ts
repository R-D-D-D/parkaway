import { ApiResponse, request } from "./common"

type Message = {
  toPhoneNumber: string
  text: string
}

export const twilioApi = {
  createMsg: async (params: Message): Promise<ApiResponse<Message>> => {
    return (await request.post<ApiResponse<Message>>("/twilio-msg", params))
      .data
  },
}
