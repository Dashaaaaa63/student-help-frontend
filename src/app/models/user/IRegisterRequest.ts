import {ILoginRequest} from "./ILoginRequest";

export interface IRegisterRequest extends ILoginRequest {
  username: string;
}
