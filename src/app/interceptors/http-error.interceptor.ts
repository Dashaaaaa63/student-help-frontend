import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {catchError, Observable, throwError} from "rxjs";
import {MessageService} from "primeng/api";
import {inject} from "@angular/core";

export const httpErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        //Обработка только ошибки 429
        if (error.status === 429) {
          messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Слишком много запросов. Пожалуйста, подождите.',
            life: 5000,
          });
          return throwError(() => new Error('Too many requests'));
        }
        // Другие ошибки пропускаем дальше
        return throwError(() => error);
      }
      return throwError(() => error);
    }),
  );
};
