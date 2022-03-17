import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { cUsuario } from './user-info';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  serverUrl = environment.baseUrlCCTVL + 'account';
  serverUrl2 =environment.baseUrlCCTVL + 'perfilUsuario';
  formData: cUsuario;

  constructor(private http: HttpClient, private router: Router) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'account';
      this.serverUrl2 =environment.baseUrlCCTVP + 'perfilUsuario';
    }
   }

  //Listo
  insertarRegistro(formData: cUsuario){
    return this.http.post(this.serverUrl + '/Registro',formData)
  }

  //Listo
  login(formData: cUsuario) {
    return this.http.post(this.serverUrl + '/Login', formData);
  }

  changePass(formData: cUsuario) {
    return this.http.put(this.serverUrl + '/ChangePassword/',formData);
  }

  updatePass(formData: cUsuario) {
    return this.http.put(this.serverUrl + '/UpdateUserData/',formData);
  }

  getUserData() {
    return this.http.get(this.serverUrl2);
  }

  //Listo
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    this.router.navigate(["/user-Login"]);
  }

  estaLogueado(): boolean {

    var exp = localStorage.getItem("tokenExpiration");

    if (!exp) {
      // el token no existe
      return false;
    }
    var now = new Date().getTime();
    var dateExp = new Date(exp);

    if (now >= dateExp.getTime()) {
      // ya expiró el token
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      return false;
    } else {
      return true;
    }
  }

  roleMatch(allowedRoles): boolean {
    var isMatch = false;
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    allowedRoles.forEach(element => {
      if (userRole == element) {
        isMatch = true;
        return false;
      }
    });
    return isMatch;
  }
}
