import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { Observable} from 'rxjs';
import { tap} from "rxjs/operators";

@Injectable()
export class Interceptor implements HttpInterceptor {

    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (localStorage.getItem('token') != null) {
            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token'))
            });
            return next.handle(clonedReq).pipe(
                tap(
                    succ => {},
                    err => {
                        if (err.status == 401){
                            localStorage.removeItem('token');
                            this.router.navigate(["/user-Login"]);
                        }
                        else if(err.status == 403)
                            this.router.navigateByUrl('/denegado');
                    }
                )
            )
        }
        else
            return next.handle(req.clone());
    }  
}

