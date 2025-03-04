import { Routes } from '@angular/router';
import {authGuard} from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: 'questions',
    loadComponent: () => import('./pages/questions/questions/questions.component')
      .then(m => m.QuestionsComponent)
  },
  {
    path: 'questions/:id',
    loadComponent: () => import('./pages/questions/question-details/question-details.component')
      .then(m => m.QuestionDetailsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component')
      .then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'questions' }
];
