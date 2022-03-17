import { Component, OnInit } from '@angular/core';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cEnterpriceDocumento, cEnterpriceProveedor, cFecha } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-compras-no-realizadas',
  templateUrl: './compras-no-realizadas.component.html',
  styles: []
})
export class ComprasNoRealizadasComponent implements OnInit {
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }

  spinnerOnOff: number = 0;//0 off / 1 loading Espera / 2 loading completo
  spinnerLoading:boolean=false;
  showSearchSelect:boolean=false;
  selectProveedor:string="Sin Asignar";
  selectRuc:string="";
  

  listProveedoresFiltros$: any;
  listComprasMostrar$: Observable<cEnterpriceDocumento[]>;
  dataOrdenesResult: cEnterpriceDocumento[] = [];

   /**Para pagination y fecha Entrada*/
   paginacion = new cPaginacion(25);
   fechaHoy = new cFecha();
   /**Fin paginatacion */
   
  fasearch = faSearch; fatimes = faTimes;
  constructor(private _enterpriceServise: ApiEnterpriceService) { }

  ngOnInit(): void {
  }

  onBListProgProveedor(value: string) {
    this.spinnerLoading = true;
    this.showSearchSelect = true;
    this.selectProveedor=value;
    if (value)
      this.listProveedoresFiltros$ = this._enterpriceServise.getProveedorSearch(value).pipe(
        map((x: cEnterpriceProveedor[]) => {
          return x;
        }),
        finalize(() => this.spinnerLoading = false)
      );
    else {
      this.spinnerLoading = false
      this.listProveedoresFiltros$ = null;
    }
  }

  onChooseProveedor(data: cEnterpriceProveedor) {
    this.showSearchSelect = false;
    this.selectProveedor= data.proveedor;
    this.selectRuc=data.cedrucpas;
  }

  onBuscarFacturas(){
    this.spinnerOnOff=1;
    var strParametros= "@"+this.fechaHoy.inDesde+"@"+this.fechaHoy.inHasta;
    if(this.selectProveedor!=null)
    strParametros=this.selectRuc+strParametros;
    else strParametros="datoNull"+strParametros;
    this.listComprasMostrar$ = this._enterpriceServise.getComprasNoRealizadas(strParametros).pipe(
      map((x: cEnterpriceDocumento[]) => {
        x.forEach(y => {
          y.emi_Fecha = y.emi_Fecha.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() =>  this.spinnerOnOff=2)
    );
  }

  getDataFiltro(data: cEnterpriceDocumento[]) {
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }
}