import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cOrdenEC } from './bodega/ordenEC';

@Injectable({
  providedIn: 'root'
})
export class OrdenECService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_ordenE_C';
  formData: cOrdenEC;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_ordenE_C';
    }
  }

  getListOrdenesCompra(strParametros): Observable<cOrdenEC[]> {//gestionCompra
    return this.http.get<cOrdenEC[]>(this.serverUrl + '/getOrdenesPlantaEC/'+strParametros);
  }
  insertarOrdenCompra(formData: cOrdenEC): Observable<cOrdenEC> {//compraProveedor
    return this.http.post<cOrdenEC>(this.serverUrl, formData)
  }
  getOneOrden(ordenECid: number): Observable<cOrdenEC> {//gestionCompra
    return this.http.get<cOrdenEC>(this.serverUrl + '/getOrdenEC/' + ordenECid);
  }
  getCompraSearch(strParametros:string): Observable<cOrdenEC[]> {//gestionCompra
    return this.http.get<cOrdenEC[]>(this.serverUrl+'/getCompraSearch/'+strParametros);
  }
  getVerificarCompraTemporal(strParametros:string): Observable<cOrdenEC> {//gestionCompra
    return this.http.get<cOrdenEC>(this.serverUrl+'/getVerificarCompraTemporal/'+strParametros);
  }
  
  actualizarOrdenES(formData: cOrdenEC): Observable<cOrdenEC> {//gestionCompra
    return this.http.put<cOrdenEC>(this.serverUrl + '/' + formData.idOrdenE_C, formData);
  }

  getCompraDevolucion(strParametros:string): Observable<cOrdenEC[]> {//devolucion
    return this.http.get<cOrdenEC[]>(this.serverUrl+'/getCompraDevolucion/'+strParametros);
  }
  devolucionOrdenCompra(formData: cOrdenEC): Observable<cOrdenEC> {//devolucion
    return this.http.post<cOrdenEC>(this.serverUrl+'/postDevolucion', formData);
  }

  getVistaReporte(strParametros:string): Observable<cOrdenEC[]> { // reporte
    return this.http.get<cOrdenEC[]>('http://192.168.2.97:5005/api/cctv_ordenE_C/getVistaReporte/'+strParametros);
  }
}
