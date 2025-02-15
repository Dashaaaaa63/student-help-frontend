import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest, debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  Observable,
  of, shareReplay,
  switchMap,
  tap, throttleTime,
} from "rxjs";
import {RestService} from "./rest.service";
import {IQuestion} from "../models/question/IQuestion";
import {IAnswer} from "../models/answer/IAnswer";
import {IMarkBestAnswerRequest} from "../models/answer/IMarkBestAnswerRequest";
import {ICreateQuestionRequest} from "../models/question/ICreateQuestionRequest";
import {IUpdateQuestionRequest} from "../models/question/IUpdateQuestionRequest";

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<string>('all');
  private pageSubject = new BehaviorSubject<number>(1);
  private pageSizeSubject = new BehaviorSubject<number>(10);
  private hideQuestionsWithoutAnswersSubject = new BehaviorSubject(false);
  private sortFieldSubject = new BehaviorSubject<keyof IQuestion>('createdAt');
  private sortOrderSubject = new BehaviorSubject<'asc' | 'desc'>('desc');
  private userIdSubject = new BehaviorSubject<string | null>(null);


  data$ = combineLatest([
    //distinctUntilChanged() Фильтрует повторяющиеся значения параметров, предотвращая лишние запросы.
    this.searchQuerySubject.pipe(distinctUntilChanged(), debounceTime(500)), // Сделаем задержку для применения изменений в полсекунды
    this.categorySubject.pipe(distinctUntilChanged()),
    this.pageSubject.pipe(distinctUntilChanged(), throttleTime(1000)), // Ограничение до одного запроса в секунду
    this.pageSizeSubject.pipe(distinctUntilChanged()),
    this.hideQuestionsWithoutAnswersSubject.pipe(distinctUntilChanged()),
    this.sortFieldSubject.pipe(distinctUntilChanged()),
    this.sortOrderSubject.pipe(distinctUntilChanged()),
    this.userIdSubject.pipe(distinctUntilChanged()),
  ]).pipe(
    tap(() => this.setLoading(true)),
    switchMap(([search, category, page, pageSize, hideWithoutAnswers, sortBy, sortOrder, filterByUser]) => {
      return this.restService.getQuestions({
        search: search,
        category: category,
        page: page,
        limit: pageSize,
        hideWithoutAnswers: hideWithoutAnswers,
        sortBy: sortBy,
        sortOrder: sortOrder,
        userId: filterByUser
      }).pipe(
        shareReplay(1), // Кэширование последнего результата
        catchError((error) => {
          this.setLoading(false);
          console.log('Ошибка загрузки вопроса:', error)
          return of({items: [], total: 0});
        })
      )
    }),
    tap(() => this.setLoading(false)),
    catchError(() => {
      this.setLoading(false);
      return of({items: [], total: 0})
    })
  )

  questions$ = this.data$.pipe(map((data) => data.items));
  totalQuestions$ = this.data$.pipe(map((data) => data.total));

  private loadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingSubject.asObservable();

  constructor(private restService: RestService) {
  }

  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  setCategory(category: string): void {
    this.categorySubject.next(category);
  }

  setPage(page: number): void {
    this.pageSubject.next(page);
  }

  setPageSize(pageSize: number): void {
    this.pageSizeSubject.next(pageSize);
  }

  setHideQuestionsWithoutAnswers(hide: boolean): void {
    this.hideQuestionsWithoutAnswersSubject.next(hide);
  }

  setSort(field: keyof IQuestion, order: 'asc' | 'desc'): void {
    this.sortFieldSubject.next(field);
    this.sortOrderSubject.next(order);
  }

  setUserId(userId: string | null): void {
    this.userIdSubject.next(userId);
  }

  resetSort(): void {
    this.sortFieldSubject.next('createdAt');
    this.sortOrderSubject.next('desc');
  }

  getQuestionWithAnswers(questionId: string): Observable<IQuestion> {
    const question$ = this.restService.getQuestion(questionId);
    const answers$ = this.restService.getAnswersByQuestionId(questionId);

    return forkJoin([question$, answers$]).pipe(
      map(([question, answers]) => {
          return {
            ...question,
            answers: answers || [],
          }
        }
      )
    )
  }

  updateQuestion(id: string, updateData: IQuestion): Observable<IQuestion> {
    const request: IUpdateQuestionRequest = {
      title: updateData.title,
      content: updateData.content,
      category: updateData.category,
      bestAnswerId: updateData.bestAnswerId
    }
    return this.restService.updateQuestion(id, request);
  }

  markAsBestAnswer(questionId: string, answerId: string): Observable<IAnswer> {
    return this.restService.markAsBestAnswer({answerId: answerId, questionId: questionId} as IMarkBestAnswerRequest)
  }

  addAnswer(questionId: string, content: string): Observable<IAnswer> {
    const request = {
      questionId: questionId,
      content: content
    }
    return this.restService.createAnswer(request);
  }

  createQuestion(createQuestionRequest: ICreateQuestionRequest): Observable<void> {
    return this.restService.createQuestion(createQuestionRequest);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.restService.deleteQuestion(id);
  }

  deleteAnswer(id: string): Observable<void> {
    return this.restService.deleteAnswer(id);
  }

  private setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
  }

  private resetPage(): void {
    this.pageSubject.next(1); // Сбрасываем страницу на первую
  }
}
