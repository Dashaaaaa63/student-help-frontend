import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {IQuestion} from "../../../models/question/IQuestion";
import {QuestionsService} from "../../../services/questions.service";
import {AuthService} from "../../../services/auth.service";
import {MessageService} from "primeng/api";
import { CommonModule, NgForOf, NgIf} from "@angular/common";
import {ButtonDirective} from "primeng/button";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IAnswer} from "../../../models/answer/IAnswer";
import {Subscription} from "rxjs";
import {IUser} from "../../../models/user/IUser";
import {ToastModule} from "primeng/toast";
import {InputTextareaModule} from "primeng/inputtextarea";
import {IUpdateQuestionRequest} from "../../../models/question/IUpdateQuestionRequest";

@Component({
  selector: 'app-questions-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    ButtonDirective,
    FormsModule,
    NgForOf,
    ToastModule,
    ReactiveFormsModule,
    InputTextareaModule,
  ],
  templateUrl: './questions-detail.component.html',
  styleUrl: './questions-detail.component.scss',
  providers: [MessageService]
})
export class QuestionsDetailComponent {
  question!: IQuestion;
  bestAnswer: IAnswer | undefined;
  answersWithoutBestAnswer: IAnswer[] | undefined;
  isAuthenticated = false;
  isEditing = false;
  currentUser: IUser | null = null;
  answerForm!: FormGroup;

  isAuthenticatedSubscription = new Subscription();
  currentUserSubscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private questionsService: QuestionsService,
    public authService: AuthService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    const questionId = this.route.snapshot.paramMap.get('id')!;
    this.questionsService.getQuestionWithAnswers(questionId).subscribe((data) => {
      this.question = data;
      this.bestAnswer = data.answers?.find((el) => el._id === data.bestAnswerId);
      this.answersWithoutBestAnswer = data.answers?.filter((el) => !el.isBest);
    });
    this.isAuthenticatedSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => this.isAuthenticated = isAuth
    })
    this.currentUserSubscription = this.authService.currentUser$.subscribe({
      next: (user) => this.currentUser = user
    })
    this.initAnswerForm()
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveEditedQuestion(updatedQuestion: IQuestion) {
    this.questionsService.updateQuestion(this.question._id, updatedQuestion).subscribe({
      next: (question) => {
        this.question = question;
        this.toggleEdit()
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка обновления вопроса',
          detail: `Во время обновления вопроса возникла ошибка: ${err.error}`
        })
      }
    });
  }

  markAsBestAnswer(answerId: string) {
    this.questionsService.markAsBestAnswer(this.question._id, answerId).subscribe(() => {
      this.ngOnInit(); // Обновляем данные после изменения
    });
  }

  submitAnswer() {
    if (this.answerForm.valid) {
      const content: string = this.answerForm.controls['content'].value;
      this.questionsService.addAnswer(this.question._id, content).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Ответ успешно отправлен'
          });
          this.ngOnInit();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: `Ошибка при отправке запроса: ${err}`
          });
        }
      })
    }

  }

  initAnswerForm(): void {
    this.answerForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(20)]],
    });
  }


}
