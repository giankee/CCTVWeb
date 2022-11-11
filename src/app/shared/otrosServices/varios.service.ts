import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cVario, cVistaSalida } from './varios';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cBodega } from '../bodega/ordenEC';

@Injectable({
  providedIn: 'root'
})
export class VariosService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_vario';
  serverUrl2 = environment.baseUrlCCTVL+'vcctv_salidaConProveedor';
  serverUrl3= environment.baseUrlCCTVL+"cctv_bodega";
  formData: cVario;
  formArrayB:cVario[];

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_vario';
      this.serverUrl2=environment.baseUrlCCTVP+'vcctv_salidaConProveedor';
      this.serverUrl3=environment.baseUrlCCTVP+'cctv_bodega';
    }
   }

  insertarVario(formData:cVario): Observable<cVario>{
    return this.http.post<cVario>(this.serverUrl,formData)
  }
  
  actualizarVario(formData: cVario): Observable<cVario> {
    return this.http.put<cVario>(this.serverUrl  + '/' + formData.idVarios.toString(),formData);
  }

  getVarios(): Observable<cVario[]> {
    return this.http.get<cVario[]>(this.serverUrl);
  }

  getVariosPrioridad(tipoOrden:string): Observable<cVario[]> {
    return this.http.get<cVario[]>(this.serverUrl+'/getVariosPrioridad/'+tipoOrden);
  }

  getLugarSearch(strParametros:string): Observable<cVario[]> {
    return this.http.get<cVario[]>(this.serverUrl+'/getLugarSearch/'+strParametros);
  }

  getSalidasLugarGSearch(strParametros:string): Observable<cVistaSalida[]> { // solo cliente
    return this.http.get<cVistaSalida[]>(this.serverUrl2+'/getSalidasLugarGSearch/'+strParametros);
  }

  getBodegasTipo(tipoBodega:string): Observable<cBodega[]> {
    return this.http.get<cBodega[]>(this.serverUrl3+'/getBodegas/'+tipoBodega);
  }

  insertarBodega(formData:cBodega): Observable<cBodega>{
    return this.http.post<cBodega>(this.serverUrl3,formData)
  }

  actualizarBodega(formData: cBodega): Observable<cBodega> {
    return this.http.put<cBodega>(this.serverUrl3  + '/' + formData.idBodega.toString(),formData);
  }
}
