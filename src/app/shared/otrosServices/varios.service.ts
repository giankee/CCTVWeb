import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cEnterpriceArticulosDocumento, cVario, cVistaSalida } from './varios';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VariosService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_vario';
  serverUrl2 = environment.baseUrlCCTVL+'vcctv_salidaConProveedor';
  formData: cVario;
  formArrayB:cVario[];

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_vario';
      this.serverUrl2=environment.baseUrlCCTVP+'vcctv_salidaConProveedor';
    }
    if (URLactual.hostname == '192.168.2.115') {
      this.serverUrl2 = 'http://192.168.2.97:5005/api/vcctv_salidaConProveedor';
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
}
