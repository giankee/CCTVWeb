import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cEnterpriceDocumento, cEnterpriceEmpleados, cEnterpriceProveedor } from './varios';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiEnterpriceService {
  serverUrl = environment.baseUrlCCTVL;
  formData: cEnterpriceEmpleados;
  formDocumento:cEnterpriceDocumento;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP;
    }
    if (URLactual.hostname == '192.168.2.115') {
      this.serverUrl = 'http://192.168.2.97:5005/api/';
    }
  }

  getPersonalEnter(tipo: string): Observable<cEnterpriceEmpleados[]> {
    return this.http.get<cEnterpriceEmpleados[]>(this.serverUrl + 'vec_personal' + '/getTipoFuncion/' + tipo);
  }

  getOnePersona(idChofer: string): Observable<cEnterpriceEmpleados> {
    return this.http.get<cEnterpriceEmpleados>(this.serverUrl + 'vec_personal' + '/' + idChofer);
  }

  getContactosEnter(): Observable<cEnterpriceEmpleados[]> {
    return this.http.get<cEnterpriceEmpleados[]>(this.serverUrl + 'vec_contactos');
  }
  
  getProveedorSearch(strParametros:string): Observable<cEnterpriceProveedor[]> {
    return this.http.get<cEnterpriceProveedor[]>(this.serverUrl+'vfe_proveedores/getProveedorSearch/'+strParametros);
  }

  getDocumento(strParametros): Observable<cEnterpriceDocumento> {
    return this.http.get<cEnterpriceDocumento>(this.serverUrl + 'vfe_documentos' + '/getCompraAutomatica/' + strParametros);
  }

  getOneDocumento(id:string): Observable<cEnterpriceDocumento> {
    return this.http.get<cEnterpriceDocumento>(this.serverUrl + 'vfe_documentos/' + id);
  }

  getComprasNoRealizadas(strParametros:string): Observable<cEnterpriceDocumento[]> {
    return this.http.get<cEnterpriceDocumento[]>(this.serverUrl+'vfe_documentos/getCompraNoProcesadas/'+strParametros);
  }
}
