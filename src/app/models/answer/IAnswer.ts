import {IUser} from "../user/IUser";

export interface IAnswer {
  id: string;
  content: string;
  isBest: boolean;
  createdAt: Date;
  author: IUser;
  questionId: string;
  updateAt: Date;
}
