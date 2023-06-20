import { IUser } from "../context"
import { SigninInfo, SignupInfo } from "../screens/LogInScreen"
import { ApiResponse, request } from "./common"

export const userApi = {
  createUser: async (params: SignupInfo): Promise<ApiResponse<IUser>> => {
    return (await request.post<ApiResponse<IUser>>("/users", params)).data
  },

  signinUser: async (params: SigninInfo): Promise<ApiResponse<IUser>> => {
    return (await request.post<ApiResponse<IUser>>("/signin", params)).data
  },
}
