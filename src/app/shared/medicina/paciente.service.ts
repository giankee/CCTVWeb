import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cPacienteInfoCompleta, cPacienteMedic } from './medicina';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  serverUrl = environment.baseUrlCCTVL;
  formData: cPacienteMedic;
  datoPersona:cPacienteInfoCompleta;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP;
    }
  }

  getPacienteById(strParametros:string): Observable<cPacienteMedic> { //ficha medica, permiso
    return this.http.get<cPacienteMedic>(this.serverUrl+'vcctv_pacienteUnificada/getPacienteById/'+strParametros);
  }

  insertarDataPaciente(formData:cPacienteMedic): Observable<cPacienteMedic>{// ficha medica
    return this.http.post<cPacienteMedic>(this.serverUrl + 'cctv_pacienteMedic',formData);
  }

  actualizarPaciente(formData: cPacienteMedic): Observable<cPacienteMedic> {// ficha Medica
    return this.http.put<cPacienteMedic>(this.serverUrl + 'cctv_pacienteMedic/' + formData.idPacienteMedic,formData);
  } 

}
