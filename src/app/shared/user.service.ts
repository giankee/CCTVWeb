import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { cDataToken, cLoginU, cRegisterU } from './user-info';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ConexionService } from './otrosServices/conexion.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  serverUrl = environment.baseUrlCCTVL + 'account';
  serverUrl2 = environment.baseUrlCCTVL + 'perfilUsuario';
  formData: cRegisterU;
  loginForm: cLoginU;

  constructor(private http: HttpClient, private router: Router,private conexcionService: ConexionService) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'account';
      this.serverUrl2 = environment.baseUrlCCTVP + 'perfilUsuario';
    }
  }

  //Listo
  register(formDataR: cRegisterU) {
    return this.http.post(this.serverUrl + '/Registro', formDataR)
  }

  //Listo
  login(formDataL: cLoginU) {
    return this.http.post(this.serverUrl + '/Login', formDataL);
  }

  changePass(strUsername: string) {
    return this.http.put(this.serverUrl + '/ChangePassword/', strUsername);
  }

  updatePass(formDataR: cRegisterU) {
    return this.http.put(this.serverUrl + '/UpdateUserData/', formDataR);
  }

  //Listo
  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/user-Login"]);
  }

  estaLogueado():boolean{
    const token = localStorage.getItem('token');
    if (!token)
      return false;
    this.conexcionService.UserDataToken=new cDataToken(token);
    const currentTimestamp = Math.floor(Date.now() / 1000); 
    if(this.conexcionService.UserDataToken.exp> currentTimestamp){
      return true;
    }else this.logout();
    return false;
  }

  roleMatch(allowedRoles: string[]): boolean {
    const token = localStorage.getItem('token');
    if (!token)
      return false;
    const payLoad = JSON.parse(window.atob(token.split('.')[1]));
    const userRole: string | string[] = payLoad.role;
    var isMatch = false;
    
    if (typeof userRole === 'string') {
      if (allowedRoles.includes(userRole)) {
        isMatch = true;
      }
    }else if (Array.isArray(userRole)) {
      for (const role of userRole) {
        if (allowedRoles.includes(role)) {
          isMatch = true;
          break;
        }
      }
    }
    return isMatch;
  }
}
