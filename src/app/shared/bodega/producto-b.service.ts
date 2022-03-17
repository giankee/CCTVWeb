import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { cBodegaProducto, cProducto_B } from './ordenEC';

@Injectable({
  providedIn: 'root'
})
export class ProductoBService {
  serverUrl = environment.baseUrlCCTVL + 'cctv_producto_B';
  serverUrl2 = environment.baseUrlCCTVL + 'cctv_bodegaProducto';
  formData: cProducto_B;
  listProductosB: cProducto_B[];

  constructor(private http: HttpClient) {
    var URLactual = window.location;
    if(URLactual.hostname!='192.168.2.97'){
      this.serverUrl=environment.baseUrlCCTVP + 'cctv_producto_B';
      this.serverUrl2=environment.baseUrlCCTVP + 'cctv_bodegaProducto';
    }
   }


  /*getProductos(): Observable<cProducto_B[]> {//parece que no se usa
    return this.http.get<cProducto_B[]>(this.serverUrl);
  }*/

  getProductosPlanta(strParametros:string): Observable<cProducto_B[]> { //en inventario
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getProductosPlanta/'+strParametros);
  }

  getProductosPlantaProveedor(strParametros:string): Observable<cProducto_B[]> {//compra proveedor
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getProductosPlantaProveedor/'+strParametros);
  }

  getProductosProveedorSearch(strParametros:string): Observable<cProducto_B[]> {//compra proveedor
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getProductosProveedorSearch/'+strParametros);
  }

  getProductosSearch(strParametros:string): Observable<cProducto_B[]> { // cliente, trabajos internos, en el edit orden
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getProductosSearch/'+strParametros);
  }

  insertarProducto(formData:cProducto_B): Observable<cProducto_B>{//en inventario
    return this.http.post<cProducto_B>(this.serverUrl,formData)
  }

  actualizarProducto(formData: cProducto_B): Observable<cProducto_B> {//en inventari
    return this.http.put<cProducto_B>(this.serverUrl  + '/' + formData.idProductoStock,formData);
  } 

  getKardexProducto(strParametros:string): Observable<cProducto_B[]> { // kardex
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getKardexProducto/'+strParametros);
  }

  getBodegasByOneProducto(inventarioId:string): Observable<cBodegaProducto[]> {
    return this.http.get<cBodegaProducto[]>(this.serverUrl2+'/getBodegasByOneProducto/'+inventarioId);
  }

  insertarMultiplesProductosB(formData: cProducto_B[]): Observable<cProducto_B[]> { //cargar excel
    return this.http.post<cProducto_B[]>(this.serverUrl + '/postMultiples' , formData);
  }

  getVistaReporte(strParametros:string): Observable<cProducto_B[]> { // reporte
    return this.http.get<cProducto_B[]>(this.serverUrl+'/getVistaReporte/'+strParametros);
  }
}
