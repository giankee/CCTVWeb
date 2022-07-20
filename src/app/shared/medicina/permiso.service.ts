import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cPermisoMedic } from './medicina';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_permisoMedic';
  formData: cPermisoMedic;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_permisoMedic';
    }
  }

  insertarPermiso(formData:cPermisoMedic): Observable<cPermisoMedic>{//en permiso
    return this.http.post<cPermisoMedic>(this.serverUrl,formData);
  }

  eliminarPermiso(permisoIdIn: number): Observable<cPermisoMedic> {
    return this.http.delete<cPermisoMedic>(this.serverUrl  + '/' + permisoIdIn);
  }
}
