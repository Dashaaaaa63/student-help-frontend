import {IQuestion} from "./IQuestion";

export interface IGetQuestionsResponse{
  items: Array<IQuestion>;
  total: number;
}
