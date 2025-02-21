import {Component, computed, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OverlayPanel, OverlayPanelModule} from "primeng/overlaypanel";
import {IQuestion} from "../../../models/question/IQuestion";
import {ISortOption} from "../../../models/question/ISortOption";
import {ISortOrderOption} from "../../../models/question/ISortOrderOption";
import {QuestionsService} from "../../../services/questions.service";
import {Router} from "@angular/router";
import {DialogService, DynamicDialogModule} from "primeng/dynamicdialog";
import {MessageService} from "primeng/api";
import {PaginatorModule, PaginatorState} from "primeng/paginator";
import {
  CreateQuestionDialogComponent
} from "../create-question-dialog/create-question-dialog.component";
import {ICreateQuestionRequest} from "../../../models/question/ICreateQuestionRequest";
import {EQuestionCategory} from "../../../models/question/EQuestionCategory";
import {AuthDialogComponent} from "../auth-dialog/auth-dialog.component";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {AsyncPipe, DatePipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {CardModule} from "primeng/card";
import {Button, ButtonDirective} from "primeng/button";
import {TagModule} from "primeng/tag";
import {CheckboxModule} from "primeng/checkbox";
import {BadgeModule} from "primeng/badge";
import {AuthService} from "../../../services/auth.service";
import {Subscription} from "rxjs";
import {PanelModule} from "primeng/panel";

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
    DynamicDialogModule,
    TagModule,
    CheckboxModule,
    DatePipe,
    OverlayPanelModule,
    BadgeModule,
    Button,
    PanelModule,
  ],
  templateUrl: './questions-list.component.html',
  styleUrl: './questions-list.component.scss'
})
export class QuestionsListComponent implements OnInit, OnDestroy {
  // 1. Декораторы
  @ViewChild('filtersPanel') filtersPanel!: OverlayPanel;
  @Input() userId: string | null = null;

  // 2. Константы
  private readonly DEFAULT_SORT_FIELD: keyof IQuestion = 'createdAt';
  private readonly DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

  // 3. Observable потоки
  readonly questions$ = this.questionsService.questions$;
  readonly totalQuestions$ = this.questionsService.totalQuestions$;
  readonly isLoading$ = this.questionsService.isLoading$;

  // 4. Состояние компонента
  categories: Array<{ label: string; value: string }> = [];
  selectedCategory = 'all';
  searchQuery = '';
  currentPage = 1;
  pageSize = 12;
  hideQuestionsWithoutAnswers = false;
  isAuth = false;

  // 5. Параметры сортировки
  currentSortField: ISortOption = {label: 'По дате создания', value: 'createdAt'};
  currentSortOrder: ISortOrderOption = {label: 'По убыванию', value: 'desc'};
  readonly sortOptions: ISortOption[] = [
    {label: 'По наличию лучшего ответа', value: 'bestAnswerId'},
    {label: 'По количеству ответов', value: 'answersCount'},
    {label: 'По дате создания', value: 'createdAt'},
    {label: 'По дате обновления', value: 'updatedAt'},
  ];
  readonly sortOrderOptions: ISortOrderOption[] = [
    {label: 'По возрастанию', value: 'asc'},
    {label: 'По убыванию', value: 'desc'},
  ];
  private appliedFilters = {
    hideAnswered: this.hideQuestionsWithoutAnswers,
    sortField: this.currentSortField.value,
    sortOrder: this.currentSortOrder.value
  }

  // 6. Подписки
  private isAuthSubscription = new Subscription();

  constructor(
    private readonly questionsService: QuestionsService,
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
  ) {
  }

  // 7. Методы жизненного цикла
  ngOnInit(): void {
    this.initComponent();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  // 8. Публичные методы (вызываемые из шаблона)
  toggleFiltersPanel(event: Event): void {
    this.filtersPanel.toggle(event);
  }

  applyFilters(): void {
    // Сохраняем текущие значения как примененные
    this.appliedFilters = {
      hideAnswered: this.hideQuestionsWithoutAnswers,
      sortField: this.currentSortField.value,
      sortOrder: this.currentSortOrder.value
    };

    this.applyFiltersLogic();
    this.filtersPanel.hide();
  }

  resetFilters(): void {
    // Сбрасываем appliedFilters к значениям по умолчанию
    this.appliedFilters = {
      hideAnswered: false,
      sortField: this.DEFAULT_SORT_FIELD,
      sortOrder: this.DEFAULT_SORT_ORDER
    };

    this.resetFiltersLogic();
    this.filtersPanel.hide();
  }

  onCategoryChange(): void {
    this.questionsService.setCategory(this.selectedCategory);
  }

  onSearch(): void {
    this.questionsService.setSearchQuery(this.searchQuery);
  }

  onPageChange(event: PaginatorState): void {
    const newPage = event.page ? event.page + 1 : 1;
    const newPageSize = event.rows ?? 10;

    if (this.currentPage !== newPage) {
      this.currentPage = newPage;
      this.questionsService.setPage(this.currentPage);
    }

    if (this.pageSize !== newPageSize) {
      this.pageSize = newPageSize;
      this.questionsService.setPageSize(this.pageSize);
    }
  }

  viewDetails(questionId: string): void {
    this.router.navigate([`/questions/${questionId}`]);
  }

  showCreateQuestionDialog(): void {
    if (!this.isAuth) {
      this.showAuthDialog();
      return;
    }

    const ref = this.dialogService.open(CreateQuestionDialogComponent, {
      header: 'Создать вопрос',
      contentStyle: {
        'max-height': '1200px',
        overflow: 'auto',
        'max-width': '640px'
      },
      baseZIndex: 10000
    });

    ref.onClose.subscribe({
      next: (createQuestionRequest: ICreateQuestionRequest) => {
        if (createQuestionRequest) {
          this.handleQuestionCreation(createQuestionRequest);
        }
      },
      error: (error) => this.showErrorNotification(error)
    });
  }

  // 9. Приватные методы
  private initComponent(): void {
    this.loadQuestions();
    this.initCategories();
    this.initAuthSubscription();
  }

  private initCategories(): void {
    this.categories.push({label: "Все категории", value: 'all'});
    Object.keys(EQuestionCategory).forEach((key) => {
      const value = EQuestionCategory[key as keyof typeof EQuestionCategory];
      this.categories.push({label: value, value});
    });
  }

  private initAuthSubscription(): void {
    this.isAuthSubscription = this.authService.isAuthenticated$
      .subscribe(auth => this.isAuth = auth);
  }

  private applyFiltersLogic(): void {
    this.questionsService.setHideQuestionsWithoutAnswers(this.hideQuestionsWithoutAnswers);
    this.questionsService.setSort(
      this.currentSortField.value,
      this.currentSortOrder.value
    );
  }

  private resetFiltersLogic(): void {
    this.hideQuestionsWithoutAnswers = false;
    this.currentSortField = {label: 'По дате создания', value: 'createdAt'};
    this.currentSortOrder = {label: 'По убыванию', value: 'desc'};
    this.questionsService.setHideQuestionsWithoutAnswers(false);
    this.questionsService.resetSort();
  }

  private loadQuestions(): void {
    this.questionsService.setCategory(this.selectedCategory);
    this.questionsService.setSearchQuery(this.searchQuery);
    this.questionsService.setUserId(this.userId);
  }

  private showAuthDialog(): void {
    this.dialogService.open(AuthDialogComponent, {
      header: 'Вход',
      baseZIndex: 10000,
    }).onClose.subscribe({
      next: () => {
        if (this.isAuth) {
          this.showCreateQuestionDialog();
        }
      }
    });
  }

  private handleQuestionCreation(request: ICreateQuestionRequest): void {
    this.questionsService.createQuestion(request).subscribe({
      next: () => this.initComponent(),
      error: (error) => this.showErrorNotification(error)
    });
  }

  private showErrorNotification(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: error.error || 'Неизвестная ошибка'
    });
  }

  private cleanupSubscriptions(): void {
    this.isAuthSubscription.unsubscribe();
  }

  // 10. Геттеры
  get activeFiltersCount(): number {
    let count = 0;
    if (this.appliedFilters.hideAnswered) count++;
    if (this.appliedFilters.sortField !== this.DEFAULT_SORT_FIELD) count++;
    if (this.appliedFilters.sortOrder !== this.DEFAULT_SORT_ORDER) count++;
    return count;
  }
}
