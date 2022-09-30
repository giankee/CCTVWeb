import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cReportGeneralMedic } from './medicina';

@Injectable({
  providedIn: 'root'
})
export class ReportMedicService {

  serverUrl = environment.baseUrlCCTVL;
  formData: cReportGeneralMedic;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if (URLactual.hostname != '192.168.2.97') {
      this.serverUrl = environment.baseUrlCCTVP;
    }
  }

  getReporteEnfermedades(strParametros): Observable<cReportGeneralMedic[]> {//report
    return this.http.get<cReportGeneralMedic[]>(this.serverUrl + 'cctv_atencionMedic/getReporteEnfermedades/' + strParametros);
  }

  getReporteAusentisismo(strParametros): Observable<cReportGeneralMedic[]> {//report
    return this.http.get<cReportGeneralMedic[]>(this.serverUrl + 'cctv_permisoMedic/getReporteAusentisismo/' + strParametros);
  }
}
