import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cCarro } from './basicos';

@Injectable({
  providedIn: 'root'
})
export class CarroService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_carro';
  formData: cCarro;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_carro';
    }
   }

  insertarCarro(formData:cCarro): Observable<cCarro>{
    return this.http.post<cCarro>(this.serverUrl,formData)
  }
  
  actualizarCarro(formData: cCarro): Observable<cCarro> {
    return this.http.put<cCarro>(this.serverUrl  + '/' + formData.idCarro.toString(),formData);
  }

  getCarros(): Observable<cCarro[]> {
    return this.http.get<cCarro[]>(this.serverUrl);
  }

  getCarro(carroId: string): Observable<cCarro>{
    return this.http.get<cCarro>(this.serverUrl + '/' + carroId);
  }
}
