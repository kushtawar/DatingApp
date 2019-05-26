import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                      //  console.error(error.statusText);
                      var errortext = "";
                    errortext = (error.error == null) ? error.statusText : error.statusText+":"+error.error;
                      /* if (error.error == null){
                        errortext = error.statusText;
                      }else{
                        errortext = error.statusText+error.error;
                      } */
                        return throwError(errortext);
                    }
                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        //console.log(applicationError);
                        return throwError(applicationError);
                    }
                    const serverError = error.error;
                    let modalStateErrors = '';
                    if (serverError.errors && typeof serverError.errors === 'object') {
                        for (const key in serverError.errors) {
                            if (serverError.errors[key]) {
                                modalStateErrors += serverError.errors[key] + '\n';
                            }
                        }
                        //console.error(modalStateErrors);
                    } else if (serverError && typeof serverError === 'object') {
                        for (const key in serverError) {
                            if (serverError[key]) {
                                modalStateErrors += serverError[key] + '\n';
                            }
                        }
                      // console.error(modalStateErrors);
                    }
                    return throwError(modalStateErrors || serverError || 'Server Error');
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
