import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cAccidenteMedic } from './ordenTrabajo';

@Injectable({
  providedIn: 'root'
})
export class AccidenteService {

  serverUrl = environment.baseUrlCCTVL + 'cctv_accidenteMedic';
  formData: cAccidenteMedic;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP + 'cctv_accidenteMedic';
    }
  }

  insertarAccidente(formData: cAccidenteMedic): Observable<cAccidenteMedic> {//accidente
    return this.http.post<cAccidenteMedic>(this.serverUrl, formData)
  }
}
