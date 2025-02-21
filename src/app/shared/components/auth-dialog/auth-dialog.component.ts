import {Component, OnInit} from '@angular/core';
import {
  AbstractControl, FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {Button} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {IRegisterRequest} from "../../../models/user/IRegisterRequest";
import {ILoginRequest} from "../../../models/user/ILoginRequest";
import {PasswordModule} from "primeng/password";
import {MessagesModule} from "primeng/messages";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {MessageService} from "primeng/api";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    Button,
    NgIf
  ],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.scss',
  providers: [MessageService, DialogService, DynamicDialogConfig]
})
export class AuthDialogComponent implements OnInit {
  isRegisterMode = false;
  isLoading = false; // Состояние загрузки

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private auth: AuthService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.initForms()
    this.config.contentStyle = {'max-height': '640px', overflow: 'auto'};
  }

  initForms(): void {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.registerForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, this.passwordMatchValidator()])
    });
  }

  // Геттеры для контролов формы регистрации
  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get dialogHeader(): string {
    return this.isRegisterMode ? 'Регистрация' : 'Авторизация';
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.config.header = this.dialogHeader;
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!this.registerForm) return null;

      const password = this.password?.value;
      const confirmPassword = control.value;
      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordsMismatch: true }
    }
  }

  submit(): void {
    if (this.isRegisterMode) {
      if (this.registerForm.invalid) {
        return; // Если форма невалидна, ничего не делаем
      }
    } else {
      if (this.loginForm.invalid) {
        return; // Если форма невалидна, ничего не делаем
      }
    }

    this.isLoading = true; // Включаем лоадер

    if (this.isRegisterMode) {
      this.auth.register(this.registerForm.value as IRegisterRequest).subscribe({
        next: () => {
          this.isLoading = false; // Выключаем лоадер
          this.ref.close()
        },
        error: (error) => {
          this.isLoading = false; // Выключаем лоадер
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка регистрации',
            detail: error.error,
          })
        }
      });
    } else {
      this.auth.login(this.loginForm.value as ILoginRequest).subscribe({
        next: () => {
          this.isLoading = false; // Выключаем лоадер
          this.ref.close()
        },
        error: (error) => {
          this.isLoading = false; // Выключаем лоадер
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка регистрации',
            detail: error.error,
          })
        }
      });
    }
  }

  closeDialog(): void {
    this.ref.close();
  }
}
