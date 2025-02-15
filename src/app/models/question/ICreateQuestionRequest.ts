import {EQuestionCategory} from "./EQuestionCategory";

export interface ICreateQuestionRequest {
  title: string;
  content: string;
  category: EQuestionCategory;
}
