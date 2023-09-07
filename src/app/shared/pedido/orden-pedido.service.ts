import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cOrdenPedido} from './pedido';

@Injectable({
  providedIn: 'root'
})
export class OrdenPedidoService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_ordenPedido';
  formData: cOrdenPedido;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_ordenPedido';
    }
  }

  insertarOrdenPedido(formData: cOrdenPedido): Observable<cOrdenPedido> {
    return this.http.post<cOrdenPedido>(this.serverUrl, formData)
  }

  getListPedido(strParametros:string): Observable<cOrdenPedido[]> {
    return this.http.get<cOrdenPedido[]>(this.serverUrl+'/getListPedidoEstado/'+strParametros);
  }

  verificacionOrdenPedido(formData: cOrdenPedido): Observable<cOrdenPedido> {
    return this.http.post<cOrdenPedido>(this.serverUrl+'/postVerificar', formData);
  }
  verificacionMultiOrdenPedido(formData: cOrdenPedido[]): Observable<cOrdenPedido[]> {
    return this.http.post<cOrdenPedido[]>(this.serverUrl+'/postMultiVerificar', formData);
  }

  getFiltroPedidos(strParametros):Observable<cOrdenPedido[]>{//list consulta
    return this.http.get<cOrdenPedido[]>(this.serverUrl  + '/getFiltroaPedidos/'+strParametros);
  }

  actualizarPedido(formData: cOrdenPedido): Observable<cOrdenPedido> {
    return this.http.put<cOrdenPedido>(this.serverUrl  + '/'+formData.idOrdenPedido ,formData);
  }

  achivarPedido(formData: cOrdenPedido): Observable<cOrdenPedido> {
    return this.http.put<cOrdenPedido>(this.serverUrl  + '/putArchivarPedido/'+formData.idOrdenPedido ,formData);
  }
}
