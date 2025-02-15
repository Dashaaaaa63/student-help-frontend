import {IQuestion} from "./IQuestion";

export interface ISortOption {
  label: string;
  value: keyof IQuestion;
}
