import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cOrdenTrabajoI } from './ordenTrabajo';

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_ordenTrabInter';
  formData: cOrdenTrabajoI;
  listCompartidaO_TrabajoSub = new BehaviorSubject<cOrdenTrabajoI[]>([]);
  listCompartidaTrabajo$: Observable<any[]> = this.listCompartidaO_TrabajoSub.asObservable();
  listCompartidaO_TraspasoSub = new BehaviorSubject<cOrdenTrabajoI[]>([]);
  listCompartidaTraspaso$: Observable<any[]> = this.listCompartidaO_TraspasoSub.asObservable();

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_ordenTrabInter';
    }
  }

  insertarOrdenInterna(formData: cOrdenTrabajoI): Observable<cOrdenTrabajoI> {//compraProveedor
    return this.http.post<cOrdenTrabajoI>(this.serverUrl, formData)
  }

  getListOrdenesInter(strParametros): Observable<cOrdenTrabajoI[]> {//ordentrabajoplanta
    return this.http.get<cOrdenTrabajoI[]>(this.serverUrl + '/getOrdenesInter/' + strParametros);
  }

  getFiltroOrdenes(strParametros): Observable<cOrdenTrabajoI[]> {//filtro admin
    return this.http.get<cOrdenTrabajoI[]>(this.serverUrl + '/getFiltroOrdenInter/' + strParametros);
  }

  traspasoBodega(formData: cOrdenTrabajoI): Observable<cOrdenTrabajoI> {//traspaso
    return this.http.post<cOrdenTrabajoI>(this.serverUrl + '/postTraspasoB/', formData)
  }

  getOneOrdenTrabajoI(ordenTrabajoIid: number): Observable<cOrdenTrabajoI> {//modl view
    return this.http.get<cOrdenTrabajoI>(this.serverUrl + '/getOneOrdenTrabajoI/' + ordenTrabajoIid);
  }

  getListOrdenEstado(strParametros: string): Observable<cOrdenTrabajoI[]> {//solo para hangar
    return this.http.get<cOrdenTrabajoI[]>(this.serverUrl + '/getListOrdenEstado/' + strParametros);
  }

  putCerrarAprobarConsumo(formData: cOrdenTrabajoI): Observable<cOrdenTrabajoI> {//verificacion
    return this.http.put<cOrdenTrabajoI>(this.serverUrl + '/putCerrarAprobarConsumo/' + formData.idOrdenTraba, formData)
  }
  putOrdenConsumo(formData: cOrdenTrabajoI): Observable<cOrdenTrabajoI> {//viewEditar
    return this.http.put<cOrdenTrabajoI>(this.serverUrl + '/putOrdenConsumo/' + formData.idOrdenTraba, formData)
  }

  setListaCompartida(listIn: cOrdenTrabajoI[], tipoIn: number) {
    tipoIn==1?this.listCompartidaO_TrabajoSub.next(listIn):this.listCompartidaO_TraspasoSub.next(listIn);
  }
}
