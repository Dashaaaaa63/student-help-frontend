export interface IGetQuestionsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  hideWithoutAnswers?: boolean;
  sortBy?: string;
  sortOrder?: string;
  userId?: string | null;

  [key: string]: string | number | boolean | null | undefined;
}
