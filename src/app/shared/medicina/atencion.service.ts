import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cAtencionMedic } from './medicina';

@Injectable({
  providedIn: 'root'
})
export class AtencionService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_atencionMedic';
  formData: cAtencionMedic;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_atencionMedic';
    }
  }

  insertarAtencion(formData:cAtencionMedic): Observable<cAtencionMedic>{//en atencion
    return this.http.post<cAtencionMedic>(this.serverUrl,formData);
  }

  getListAtenciones(): Observable<cAtencionMedic[]> {// listatenciones
    return this.http.get<cAtencionMedic[]>(this.serverUrl);
  }

  getFiltroAtenciones(strParametros):Observable<cAtencionMedic[]>{//list consulta
    return this.http.get<cAtencionMedic[]>(this.serverUrl  + '/getFiltroAtenciones/'+strParametros);
  }
}
