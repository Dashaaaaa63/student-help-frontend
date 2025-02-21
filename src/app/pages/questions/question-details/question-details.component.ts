import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {IQuestion} from "../../../models/question/IQuestion";
import {QuestionsService} from "../../../services/questions.service";
import {AuthService} from "../../../services/auth.service";
import {MessageService} from "primeng/api";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IAnswer} from "../../../models/answer/IAnswer";
import {Subscription, tap} from "rxjs";
import {IUser} from "../../../models/user/IUser";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ConfirmationDialogService} from "../../../shared/components/confirmation-dialog/confirmation-dialog.service";
import {DialogService,} from "primeng/dynamicdialog";
import {EditorModule} from "primeng/editor";
import {
  HeaderTemplateForEditorComponent
} from "../../../shared/components/header-template-for-editor/header-template-for-editor.component";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {CardModule} from "primeng/card";

@Component({
  selector: 'app-question-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    InputTextareaModule,
    EditorModule,
    HeaderTemplateForEditorComponent,
    Button,
    ProgressSpinnerModule,
    CardModule,
  ],
  templateUrl: './question-details.component.html',
  styleUrl: './question-details.component.scss',
  providers: [DialogService, ConfirmationDialogService]
})
export class QuestionDetailsComponent implements OnInit, OnDestroy {
  question!: IQuestion;
  bestAnswer: IAnswer | undefined;
  answersWithoutBestAnswer: IAnswer[] | undefined;
  isAuthenticated = false;
  isEditing = false;
  currentUser: IUser | null = null;
  newAnswerText: string | null = null;
  newQuestionText: string | null = null;

  editQuestionLoading = false;
  createAnswerLoading = false;
  markAnswersAsBestLoading = false;
  deleteQuestionLoading = false;
  deleteAnswerLoading = false;
  isQuestionLoading = false;

  isAuthenticatedSubscription = new Subscription();
  currentUserSubscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionsService: QuestionsService,
    public authService: AuthService,
    private messageService: MessageService,
    private confirmationDialogService: ConfirmationDialogService
  ) {
  }

  ngOnInit(): void {
    this.initStates()
  }

  ngOnDestroy(): void {
    this.isAuthenticatedSubscription.unsubscribe()
    this.currentUserSubscription.unsubscribe()
  }

  initStates(): void {
    const questionId = this.route.snapshot.paramMap.get('id');
    if (!questionId) {
      this.router.navigate(['/questions']);
      return;
    }

    this.isQuestionLoading = true;
    // console.log('isQuestionLoad:', this.isComponentInitialized()); // Добавьте этот лог
    this.questionsService.getQuestionWithAnswers(questionId).subscribe({
      next: (data) => {
        this.question = data;
        this.bestAnswer = data.answers?.find((el) => el.id === data.bestAnswerId);
        this.answersWithoutBestAnswer = data.answers?.filter((el) => !el.isBest);
        this.isQuestionLoading = false;
      },
      error: ({ error }) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка при загрузке вопроса',
          detail: JSON.stringify(error),
        });
        this.isQuestionLoading = false;
      }
    });
    this.isAuthenticatedSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => this.isAuthenticated = isAuth
    })
    this.currentUserSubscription = this.authService.currentUser$.subscribe({
      next: (user) => this.currentUser = user
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveEditedQuestion() {
    if (!this.newQuestionText) {
      return;
    }
    if (this.newQuestionText.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: `Ошибка валидации`,
        detail: 'Отсутствует текст вопроса'
      });
      return;
    }
    this.editQuestionLoading = true
    this.question.content = this.newQuestionText

    this.questionsService.updateQuestion(this.question.id, this.question).subscribe({
      next: () => {
        this.toggleEdit();
        this.newQuestionText = null;
        this.editQuestionLoading = false;
        this.initStates();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка обновления вопроса',
          detail: `Во время обновления вопроса возникла ошибка: ${err.error}`
        });
        this.editQuestionLoading = false
      }
    });
  }

  markAsBestAnswer(answerId: string) {
    this.markAnswersAsBestLoading = true;
    this.questionsService.markAsBestAnswer(this.question.id, answerId).subscribe(() => {
      this.markAnswersAsBestLoading = false;
      this.initStates(); // Обновляем данные после изменения
    });
  }

  submitAnswer() {
    if (!this.newAnswerText || this.newAnswerText.length == 0) {
      this.messageService.add({
        severity: 'error',
        summary: `Ошибка валидации`,
        detail: 'Отсутствует текст ответа'
      });
      return;
    }
    this.createAnswerLoading = true;
    this.questionsService.addAnswer(this.question.id, this.newAnswerText).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Ответ успешно отправлен'
        });
        this.initStates();
        this.newAnswerText = null;
        this.createAnswerLoading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: `Ошибка при отправке запроса: ${JSON.stringify(err.error)}`
        });
        this.createAnswerLoading = false;
      }
    })
  }

  deleteQuestion(): void {
    this.confirmationDialogService.confirm(
      'Подтверждение',
      'Вы уверены, что хотите удалить вопрос?'
    ).pipe(
      tap(() => this.deleteQuestionLoading = true)
    ).subscribe({
      next: (result) => {
        if (result) {
          this.questionsService.deleteQuestion(this.question.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Вопрос удален'
              });
              this.router.navigate(['/questions']);
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка удаления вопроса',
                detail: JSON.stringify(error.error),
              });
              this.deleteQuestionLoading = false;
            }
          });
        } else {
          this.deleteQuestionLoading = false;
        }
      }
    });
  }

  deleteAnswer(answerId: string): void {
    this.confirmationDialogService.confirm(
      'Подтверждение',
      'Вы уверены, что хотите удалить ответ?'
    ).pipe(
      tap(() => this.deleteAnswerLoading = true)
    ).subscribe({
      next: (result) => {
        if (result) {
          this.questionsService.deleteAnswer(answerId).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Ответ удален'
              });
              this.deleteAnswerLoading = false;
              this.initStates()
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Ошибка удаления ответа',
                detail: JSON.stringify(error.error),
              });
              this.deleteAnswerLoading = false;
            }
          });
        }
        this.deleteAnswerLoading = false;
      }
    });
  }
}
