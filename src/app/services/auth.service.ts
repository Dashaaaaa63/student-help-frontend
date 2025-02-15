import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {IUser} from "../models/user/IUser";
import {HttpClient} from "@angular/common/http";
import {ILoginRequest} from "../models/user/ILoginRequest";
import {Router} from "@angular/router";
import {IRegisterRequest} from "../models/user/IRegisterRequest";
import {RestService} from "./rest.service";
import {IChangePasswordRequest} from "../models/user/IChangePasswordRequest";
import {IChangePasswordResponse} from "../models/user/IChangePasswordResponse";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor(private http: HttpClient, private router: Router, private restService: RestService) {
    this.initializeAuthState();
  }


  login(credentials: ILoginRequest): Observable<void> {
    return this.restService.login(credentials).pipe(
      tap(({access_token}) => this.handleAuthResponse(access_token)),
      map(() => undefined)
    );
  }


  register(registerData: IRegisterRequest): Observable<void> {
    return this.restService.register(registerData).pipe(
      tap(({access_token}) => this.handleAuthResponse(access_token)),
      map(() => undefined)
    );
  }

  // Метод для обновления профиля
  updateProfile(profileData: Partial<IUser>): Observable<void> {
    return this.restService.updateUser(profileData).pipe(
      tap((updatedUser: Partial<IUser>) => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const updatedUserData: IUser = {
            ...currentUser,
            ...updatedUser,
            id: currentUser.id,
            createdAt: currentUser.createdAt,
            updatedAt: updatedUser.updatedAt || currentUser.updatedAt
          };
          this.currentUserSubject.next(updatedUserData);
        }
      }),
      map(() => undefined)
    );
  }

  // Метод для смены пароля
  changePassword(passwordData: IChangePasswordRequest): Observable<IChangePasswordResponse> {
    return this.restService.changePassword(passwordData);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/questions'])
  }


  private handleAuthResponse(token: string): void {
    localStorage.setItem('token', token);
    this.getUser();
  }

  private getUser(): void {
    this.restService.getUser().subscribe((user) => {
      this.currentUserSubject.next(user);
    })
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem('token');
    if (token) this.getUser();
  }
}
