import {Component, OnInit} from '@angular/core';
import {QuestionsService} from "../../../services/questions.service";
import {EQuestionCategory} from "../../../models/question/EQuestionCategory";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {AsyncPipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {CardModule} from "primeng/card";
import {PaginatorModule} from "primeng/paginator";
import {Router} from "@angular/router";
import {ButtonDirective} from "primeng/button";
import {DialogService, DynamicDialogModule, DynamicDialogRef} from "primeng/dynamicdialog";
import {
  CreateQuestionDialogComponent
} from "../../../shared/components/create-question-dialog/create-question-dialog.component";
import {ICreateQuestionRequest} from "../../../models/question/ICreateQuestionRequest";
import {MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-questions-list',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    AsyncPipe,
    ProgressSpinnerModule,
    NgIf,
    CardModule,
    NgForOf,
    SlicePipe,
    PaginatorModule,
    ButtonDirective,
    ToastModule,
    DynamicDialogModule,
    CreateQuestionDialogComponent
  ],
  templateUrl: './questions-list.component.html',
  styleUrl: './questions-list.component.scss',
  providers: [DialogService, MessageService]
})
export class QuestionsListComponent implements OnInit {
  questions$ = this.questionsService.questions$;
  totalQuestions$ = this.questionsService.totalQuestions$;
  isLoading$ = this.questionsService.isLoading$;

  categories: Array<{ label: string, value: string }> = [];
  selectedCategory = 'all';
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;

  constructor(
    private questionsService: QuestionsService,
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.loadQuestions();
    this.categories.push({
      label: "Все категории",
      value: 'all'
    });
    Object.keys(EQuestionCategory).forEach((key) => {
      const value = EQuestionCategory[key as keyof typeof EQuestionCategory];
      this.categories.push({
        label: value,
        value: value,
      })
    })
  }

  loadQuestions(): void {
    this.questionsService.setCategory(this.selectedCategory);
    this.questionsService.setSearchQuery(this.searchQuery);
  }

  onCategoryChange(): void {
    this.questionsService.setCategory(this.selectedCategory);
  }

  onSearch(): void {
    this.questionsService.setSearchQuery(this.searchQuery);
  }

  onPageChange(event: any): void {
    this.currentPage = event.page + 1; // PrimeNG начинает с 0, а мы используем 1-based индексацию
    this.questionsService.setPage(this.currentPage);
  }

  viewDetails(questionId: string): void {
    this.router.navigate([`/questions/${questionId}`]);
  }

  showCreateQuestionDialog() {
    const ref = this.dialogService.open(CreateQuestionDialogComponent, {
      header: 'Создать вопрос',
      width: '450px',
      contentStyle: { 'max-height' : '500px', overflow: 'auto'},
      baseZIndex: 10000
    });

    ref.onClose.subscribe({
       next: (createQuestionRequest: ICreateQuestionRequest) => {
         this.questionsService.createQuestion(createQuestionRequest).subscribe({
           next: () => this.loadQuestions(),
           error: (error) => this.messageService.add({
             severity: 'error',
             summary: 'Произошла ошибка',
             detail: `При создании вопроса произошла ошибка: ${error.error}`
           })
         })
       },
      error: (error) => this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: error.error
      })
    })
  }


}

