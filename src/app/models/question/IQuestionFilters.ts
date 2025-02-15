import {EQuestionCategory} from "./EQuestionCategory";

export interface IQuestionFilters {
  search?: string;
  category?: EQuestionCategory;
  page?: number;
  limit?: number;
}
