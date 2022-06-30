import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cPersonal } from './basicos';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_persona';
  formData: cPersonal;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_persona';
    }
   }

  insertarPersonal(formData:cPersonal): Observable<cPersonal>{
    return this.http.post<cPersonal>(this.serverUrl,formData)
  }
  
  actualizarPersonal(formData: cPersonal): Observable<cPersonal> {
    return this.http.put<cPersonal>(this.serverUrl  + '/' + formData.idPersona.toString(),formData);
  }

  getPersonalSearch(strParametros:string): Observable<cPersonal[]> {
    return this.http.get<cPersonal[]>(this.serverUrl+'/getPersonaSearch/'+strParametros);
  }
  getPersonaCedula(strParametros:string): Observable<cPersonal> {
    return this.http.get<cPersonal>(this.serverUrl+'/getPersonaCedula/'+strParametros);
  }

  getPersonales(): Observable<cPersonal[]> { //personal-list
    return this.http.get<cPersonal[]>(this.serverUrl);
  }
}
