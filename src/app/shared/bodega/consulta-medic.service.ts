import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cConsultaMedic } from './ordenTrabajo';

@Injectable({
  providedIn: 'root'
})
export class ConsultaMedicService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_consultaMedic';
  formData: cConsultaMedic;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_consultaMedic';
    }
  }

  insertarConsumoInterno(formData: cConsultaMedic): Observable<cConsultaMedic> {//consultamedic insert
    return this.http.post<cConsultaMedic>(this.serverUrl, formData)
  }

  getListConsultasInter(strParametros): Observable<cConsultaMedic[]> {//consultamedic list
    return this.http.get<cConsultaMedic[]>(this.serverUrl + '/getConsultasInter/'+strParametros);
  }

  getFiltroConsultas(strParametros):Observable<cConsultaMedic[]>{//list consulta
    return this.http.get<cConsultaMedic[]>(this.serverUrl  + '/getFiltroConsultasInter/'+strParametros);
  }

  getOneConsulta(consultaId: number): Observable<cConsultaMedic> {//modl view
    return this.http.get<cConsultaMedic>(this.serverUrl + '/getOneConsulta/' + consultaId);
  }
}
