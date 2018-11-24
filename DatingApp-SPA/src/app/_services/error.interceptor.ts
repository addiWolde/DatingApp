import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
         return next.handle(req).pipe(
             catchError(error => {
                 if (error instanceof HttpErrorResponse) {
                     if (error.status === 401) {
                         return throwError(error.statusText);
                     }
                     const applicationError = error.headers.get('Application-Error');
                     if (applicationError) {
                         console.log(applicationError);
                         return throwError(applicationError);
                     }

                     const serverErrror = error.error;
                     let modalStateError = '';
                     if (serverErrror && typeof serverErrror === 'object') {
                         for (const key in serverErrror) {
                             if (serverErrror[key]) {
                                 modalStateError += serverErrror[key] + '\n';
                             }
                         }
                     }
                     return throwError(modalStateError || serverErrror || 'Server Error');
                 }
             })
         );
    }

}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
