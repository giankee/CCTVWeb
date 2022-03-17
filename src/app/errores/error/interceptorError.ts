import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from "@angular/core";
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, retry } from "rxjs/operators";

@Injectable()
export class InterceptorError implements HttpInterceptor {

    constructor(private router: Router,public injector: Injector) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
         return next.handle(req)
         .pipe(
           retry(1),
           catchError((error: HttpErrorResponse) => {
            const router = this.injector.get(Router);     
             let errorMessage = '';
             if (error.error instanceof ErrorEvent) {
               // client-side error
               errorMessage = `Error ClientSide: ${error.error.message}`;
               router.navigate(['error']);
             } else {
               // server-side error
               if(error.status!=0){
               errorMessage = `Backend retorna el siguiente status: ${error.status}\n`;
               router.navigate(['error']);
              }
               else errorMessage = `Falla de conexión`;
             }
             
             return throwError(errorMessage);
           })
         )
    }  
}

