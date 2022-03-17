import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { cArticulosO, cGaleriaArchivosOrdenES, cOrdenEs } from './ordenEs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdenESService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_ordenES';
  serverUrl2 = environment.baseUrlCCTVL + 'cctv_galeriaArchivoOrden';
  serverUrl3 = environment.baseUrlCCTVL + 'cctv_articuloO';
  formData: cOrdenEs;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_ordenES';
      this.serverUrl2 = environment.baseUrlCCTVP + 'cctv_galeriaArchivoOrden';
      this.serverUrl3 = environment.baseUrlCCTVP + 'cctv_articuloO';
    }
   }

  insertarOrdenES(formData:cOrdenEs): Observable<cOrdenEs>{//cliente
    return this.http.post<cOrdenEs>(this.serverUrl,formData)
  }
  
  getOneOrdenA(ordenESid: number): Observable<cOrdenEs> {//admin
    return this.http.get<cOrdenEs>(this.serverUrl + '/getOrdenA/' + ordenESid);
  }

  getListOrdenesES(): Observable<cOrdenEs[]> {//admin
    return this.http.get<cOrdenEs[]>(this.serverUrl+'/getOrdenesES');
  }
  getListOrdenesBaldes(): Observable<cOrdenEs[]> {//admin
    return this.http.get<cOrdenEs[]>(this.serverUrl+'/getOrdenesBaldes');
  }

  getListOrdenesESVerificacion(strParametros): Observable<cOrdenEs[]> {//puerto
    return this.http.get<cOrdenEs[]>(this.serverUrl+'/getOrdenesESVerificacion/'+strParametros);
  }

  actualizarOrdenES(formData: cOrdenEs): Observable<cOrdenEs> {//puerto, y admin modal
    return this.http.put<cOrdenEs>(this.serverUrl  + '/'+formData.idOrdenES ,formData);
  }

  getFiltroOrdenes(strParametros):Observable<cOrdenEs[]>{//filtro admin
    return this.http.get<cOrdenEs[]>(this.serverUrl  + '/getFiltroOrden/'+strParametros);
  }

  getGuiasRProcesada(strParametros):Observable<cOrdenEs[]>{//en todas las vistas
    return this.http.get<cOrdenEs[]>(this.serverUrl  + '/getGuiasRProcesada/'+strParametros);
  }

  getBGuiaGeneral(strParametros):Observable<cOrdenEs>{//cliente, puerto
    return this.http.get<cOrdenEs>(this.serverUrl  + '/getBGuiaGeneral/'+strParametros);
  }

  getExistGuiaBalde(strParametros):Observable<cOrdenEs[]>{//cliente //parece q voy a unificar
    return this.http.get<cOrdenEs[]>(this.serverUrl  + '/getExistGuia/'+strParametros);
  }

  getGuiaPendienteRPlanta(): Observable<cOrdenEs[]> {//puerto solo para user verificador-m
    return this.http.get<cOrdenEs[]>(this.serverUrl+'/getGuiaPendienteRPlanta');
  }

  getGuiaSearch(strParametros:string): Observable<cOrdenEs[]> {
    return this.http.get<cOrdenEs[]>(this.serverUrl+'/getGuiaSearch/'+strParametros);
  }
  
  /*Pruebas*/
  insertarGaleriarOrden(formDataGaleria: cGaleriaArchivosOrdenES[]): Observable<cGaleriaArchivosOrdenES[]> {
    return this.http.post<cGaleriaArchivosOrdenES[]>(this.serverUrl2 ,formDataGaleria);
  }
  actualizarMultipleArtO(formDataArticulos: cArticulosO[]): Observable<cArticulosO[]> {
    return this.http.post<cArticulosO[]>(this.serverUrl3+'/postMultipleArtO' ,formDataArticulos);
  }
}
