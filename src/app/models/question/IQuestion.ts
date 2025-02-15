import {EQuestionCategory} from "./EQuestionCategory";
import {IUser} from "../user/IUser";
import {IAnswer} from "../answer/IAnswer";

export interface IQuestion {
  id: string;
  title: string;
  content: string;
  category: EQuestionCategory;
  author: IUser;
  answers?: IAnswer[]; //Используется только на клиенте
  bestAnswerId?: string;
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}
