import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cEnterpriceProveedor } from './varios';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_proveedor_B';
  serverUrl2 = environment.baseUrlCCTVL + 'vcctv_proveedorUnificada';
  formData: cEnterpriceProveedor;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_proveedor_B';
      this.serverUrl2 = environment.baseUrlCCTVP + 'vcctv_proveedorUnificada';
    }
  }

  getProveedorUnificadaSearch(strParametros:string): Observable<cEnterpriceProveedor[]> {
    return this.http.get<cEnterpriceProveedor[]>(this.serverUrl2+'/getProveedor2Search/'+strParametros);
  }

  actualizarDataProveedor(formData: cEnterpriceProveedor): Observable<cEnterpriceProveedor> {
    return this.http.post<cEnterpriceProveedor>(this.serverUrl, formData)
  }
}
