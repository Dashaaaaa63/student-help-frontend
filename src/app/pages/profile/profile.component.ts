import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {IUser} from "../../models/user/IUser";
import {AuthService} from "../../services/auth.service";
import {Subscription} from "rxjs";
import {IChangePasswordRequest} from "../../models/user/IChangePasswordRequest";
import {DatePipe, NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {MessageService} from "primeng/api";
import {PasswordModule} from "primeng/password";
import {QuestionsListComponent} from "../../shared/components/questions-list/questions-list.component";
import {DialogService} from "primeng/dynamicdialog";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    DatePipe,
    ReactiveFormsModule,
    Button,
    InputTextModule,
    PasswordModule,
    QuestionsListComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [DialogService]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userProfile!: IUser;
  isEditMode = false;
  isLoading = false;

  private userSubscription = new Subscription();

  constructor(private fb: FormBuilder, private authService: AuthService, private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userProfile = user;
        this.initForms();
      }
    })
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6), this.passwordShouldNotMatchCurrentValidator('currentPassword')]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6), this.passwordsMatchValidator('newPassword')]],
      },
    );
  }

  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  // Валидатор: newPassword не должен совпадать с currentPassword
  passwordShouldNotMatchCurrentValidator(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const currentPassword = control.parent?.get(controlName)?.value;
      const newPassword = control.value;

      if (!currentPassword || !newPassword) {
        return null; // Если значения отсутствуют, пропускаем проверку
      }

      return currentPassword === newPassword ? { passwordMatchesCurrent: true } : null;
    };
  }

  // Валидатор: confirmPassword должно совпадать с newPassword
  passwordsMatchValidator(controlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.parent?.get(controlName)?.value;
      const confirmPassword = control.value;

      if (!newPassword || !confirmPassword) {
        return null; // Если значения отсутствуют, пропускаем проверку
      }

      return newPassword === confirmPassword ? null : { passwordsMismatch: true };
    };
  }


  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode
  }

  cancelEdit(): void {
    this.toggleEditMode();
    this.profileForm.reset();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.toggleEditMode();
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          detail: 'Данные профиля успешно изменены'
        })
      },
      error: ({error}) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          detail: 'Произошла ошибка',
          summary: JSON.stringify(error),
        })
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.authService.changePassword(this.passwordForm.value as IChangePasswordRequest).subscribe({
      next: (response) => {
        this.passwordForm.reset();
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: response.message
        })
      },
      error: ({error}) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: error.message,
        })
      },
    });
  }
}
