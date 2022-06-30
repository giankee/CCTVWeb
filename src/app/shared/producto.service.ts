import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { cProducto } from './basicos';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_producto';
  formData: cProducto;

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_producto';
    }
   }

  insertarProducto(formData:cProducto): Observable<cProducto>{
    return this.http.post<cProducto>(this.serverUrl,formData)
  }

  insertarMultiplesProductos(formData: cProducto[]): Observable<cProducto[]> {
    return this.http.post<cProducto[]>(this.serverUrl + '/postMultiples' , formData);
  }
  
  actualizarProducto(formData: cProducto): Observable<cProducto> {
    return this.http.put<cProducto>(this.serverUrl  + '/' + formData.idProducto.toString(),formData);
  }

  getProductos(): Observable<cProducto[]> {
    return this.http.get<cProducto[]>(this.serverUrl);
  }

  getProductosSearch(strParametros:string): Observable<cProducto[]> { // cliente
    return this.http.get<cProducto[]>(this.serverUrl+'/getProductosSearch/'+strParametros);
  }

  getProductosGSearch(strParametros:string): Observable<cProducto[]> { // ordenList
    return this.http.get<cProducto[]>(environment.baseUrlCCTVL +'vcctv_productos'+'/getProductosGSearch/'+strParametros);
  }

  getBuscarEliminar(ProductoId: string): Observable<cProducto>{
    return this.http.get<cProducto>(this.serverUrl + '/getBuscarEliminar/' + ProductoId);
  }
}
