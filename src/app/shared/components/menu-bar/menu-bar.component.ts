import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {AuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {MenuItem} from "primeng/api";
import {MenubarModule} from "primeng/menubar";
import {NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {AuthDialogComponent} from "../auth-dialog/auth-dialog.component";
import {DialogModule} from "primeng/dialog";
import {DialogService} from "primeng/dynamicdialog";
import {IUser} from "../../../models/user/IUser";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [
    DialogModule,
    MenubarModule,
    NgIf,
    Button,
  ],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss',
  providers: [DialogService]
})
export class MenuBarComponent implements OnInit, OnDestroy {
  isAuthenticated = signal(false);
  currentUser: IUser | null = null;


  menuItems: MenuItem[] = [
    {label: 'Вопросы', routerLink: '/questions', icon: 'pi pi-list'}
  ];

  private isAuthenticatedSubscription = new Subscription();
  private currentUserSubscription = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialogService: DialogService
  ) {
  }


  ngOnInit(): void {
    this.isAuthenticatedSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuth) => {
        this.isAuthenticated.set(isAuth);
      },
    });
    this.currentUserSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      }
    });
  }

  ngOnDestroy(): void {
    this.isAuthenticatedSubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
  }


  openAuthDialog(): void {
    this.dialogService.open(AuthDialogComponent, {
      header: 'Вход',
      width: '600px',
      contentStyle: {'max-height': '500px', overflow: 'auto'},
      baseZIndex: 10000,
    })
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/questions']);
  }
}
