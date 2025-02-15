import {Injectable} from '@angular/core';
import {ILoginRequest} from "../models/user/ILoginRequest";
import {Observable} from "rxjs";
import {IAuthResponse} from "../models/user/IAuthResponse";
import {HttpClient, HttpParams} from "@angular/common/http";
import {IRegisterRequest} from "../models/user/IRegisterRequest";
import {IGetQuestionsParams} from "../models/question/IGetQuestionsParams";
import {IGetQuestionsResponse} from "../models/question/IGetQuestionsResponse";
import {IQuestion} from "../models/question/IQuestion";
import {IUpdateQuestionRequest} from "../models/question/IUpdateQuestionRequest";
import {ICreateQuestionRequest} from "../models/question/ICreateQuestionRequest";
import {ICreateAnswerRequest} from "../models/answer/ICreateAnswerRequest";
import {IAnswer} from "../models/answer/IAnswer";
import {IMarkBestAnswerRequest} from "../models/answer/IMarkBestAnswerRequest";
import {IUser} from "../models/user/IUser";
import {IChangePasswordRequest} from "../models/user/IChangePasswordRequest";
import {IUpdateUserRequest} from "../models/user/IUpdateUserRequest";
import {IChangePasswordResponse} from "../models/user/IChangePasswordResponse";

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private host = 'http://localhost:3000'

  constructor(private http: HttpClient) {
  }

  /* Auth */
  login(loginRequest: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.host}/auth/login`, loginRequest);
  }

  register(registerRequest: IRegisterRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(`${this.host}/auth/register`, registerRequest);
  }

  /* Users */
  getUser(): Observable<IUser> {
    return this.http.get<IUser>(`${this.host}/users/`);
  }

  updateUser(userData: IUpdateUserRequest): Observable<Partial<IUser>> {
    return this.http.put<Partial<IUser>>(`${this.host}/users`, userData);
  }

  changePassword(passwordData: IChangePasswordRequest): Observable<IChangePasswordResponse> {
    return this.http.put<IChangePasswordResponse>(`${this.host}/users/change-password`, passwordData);
  }

  /* Questions */
  getQuestions(params: IGetQuestionsParams): Observable<IGetQuestionsResponse> {
    let httpParams = new HttpParams();

    // Преобразуем каждый параметр в HttpParams
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof IGetQuestionsParams];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    })

    return this.http.get<IGetQuestionsResponse>(`${this.host}/questions`, {params: httpParams});
  }

  getQuestion(id: string): Observable<IQuestion> {
    return this.http.get<IQuestion>(`${this.host}/questions/${id}`);
  }

  updateQuestion(id: string, data: IUpdateQuestionRequest): Observable<IQuestion> {
    return this.http.put<IQuestion>(`${this.host}/questions/${id}`, data);
  }

  createQuestion(createData: ICreateQuestionRequest): Observable<void> {
    return this.http.post<void>(`${this.host}/questions/`, createData);
  }

  deleteQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/questions/${questionId}`);
  }

  /* Answer */
  createAnswer(createAnswerRequest: ICreateAnswerRequest): Observable<IAnswer> {
    return this.http.post<IAnswer>(`${this.host}/answers`, createAnswerRequest);
  }

  markAsBestAnswer(markBestAnswerRequest: IMarkBestAnswerRequest): Observable<IAnswer> {
    return this.http.put<IAnswer>(`${this.host}/answers/best`, markBestAnswerRequest);
  }

  getAnswersByQuestionId(questionId: string): Observable<IAnswer[]> {
    return this.http.get<IAnswer[]>(`${this.host}/answers/${questionId}`);
  }

  deleteAnswer(answerId: string): Observable<void> {
    return this.http.delete<void>(`${this.host}/answers/${answerId}`)
  }
}
