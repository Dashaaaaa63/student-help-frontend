import {EQuestionCategory} from "./EQuestionCategory";

export interface IUpdateQuestionRequest {
  title?: string;
  content?: string;
  category?: EQuestionCategory;
  bestAnswerId?: string;
}
