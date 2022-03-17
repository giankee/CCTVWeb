import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cNotificacion } from './ordenEs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_notificacion';
  formData: cNotificacion;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_notificacion';
    }
   }

  /* insertarNotificacion(formData:cNotificacion): Observable<cNotificacion>{
    return this.http.post<cNotificacion>(this.serverUrl,formData)
  }

  insertarMultiplesNotificacion(formData: cNotificacion[]): Observable<cNotificacion> {
    return this.http.post<cNotificacion>(this.serverUrl , formData);
  } */

  /*getNotificaciones(): Observable<cNotificacion[]> {
    return this.http.get<cNotificacion[]>(this.serverUrl);
  }*/
  getNotifi(strParametros):Observable<cNotificacion[]>{
    return this.http.get<cNotificacion[]>(this.serverUrl  + '/getNotifi/'+strParametros);
  }
  actualizarNotificacion(formData: cNotificacion): Observable<cNotificacion> {
    return this.http.put<cNotificacion>(this.serverUrl + '/' + formData.idNotificacion.toString(), formData);
  }
}
