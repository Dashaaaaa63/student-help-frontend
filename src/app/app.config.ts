import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {jwtInterceptor} from "./interceptors/jwt.interceptor";
import {httpErrorInterceptor} from "./interceptors/http-error.interceptor";
import {MessageService} from "primeng/api";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor, httpErrorInterceptor])
    ),
    provideAnimationsAsync(),
    MessageService
  ]
};
