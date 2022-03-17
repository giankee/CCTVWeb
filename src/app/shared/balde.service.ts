import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cBalde } from './basicos';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaldeService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_balde';
  formData: cBalde;
  private sharingBaldesPrivate:BehaviorSubject<cBalde[]>=new BehaviorSubject<cBalde[]>(null);

  get sharingObservableBalde(){
    return this.sharingBaldesPrivate.asObservable();
  }

  set sharingObservableData(data:cBalde[]){
    this.sharingBaldesPrivate.next(data);
  }
  
  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_balde';
    }
  }

  insertarBalde(formData: cBalde): Observable<cBalde> {
    return this.http.post<cBalde>(this.serverUrl, formData)
  }

  actualizarBalde(formData: cBalde): Observable<cBalde> {
    return this.http.put<cBalde>(this.serverUrl + '/' + formData.idBalde.toString(), formData);
  }

  getBaldes(): Observable<cBalde[]> {
    return this.http.get<cBalde[]>(this.serverUrl);
  }

  getBaldeo(baldeId: string): Observable<cBalde> {
    return this.http.get<cBalde>(this.serverUrl + '/' + baldeId);
  }

  getBaldesParams(strParametros): Observable<cBalde[]> {//para cliente lugares y para baldes 
    return this.http.get<cBalde[]>(this.serverUrl + '/getBaldesParams/' + strParametros);
  }

  getBaldeSearch(strParametros: string): Observable<cBalde[]> {//aun no
    return this.http.get<cBalde[]>(this.serverUrl + '/getBaldeSearch/' + strParametros);
  }
}
