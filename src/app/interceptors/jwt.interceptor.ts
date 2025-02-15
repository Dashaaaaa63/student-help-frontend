import { HttpInterceptorFn } from '@angular/common/http';
import {delay, of, switchMap} from "rxjs";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}`}
    })
  }

  // TODO код ниже чисто для тестов лоудеров, в проде убрать
  // Генерация случайной задержки от 1 до 3 секунд
  // const delayDuration = Math.floor(Math.random() * 2000) + 1000; // от 1000 до 3000 мс
  //
  // return of(null).pipe(
  //   delay(delayDuration),
  //   switchMap(() => next(req)),
  // );

  return next(req);
};
