import { Component, OnInit } from '@angular/core';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpriceDocumento, cEnterpriceProveedor, cFecha } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-compras-no-realizadas',
  templateUrl: './compras-no-realizadas.component.html',
  styles: []
})
export class ComprasNoRealizadasComponent implements OnInit {
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }

  spinnerOnOff: number = 0;//0 off / 1 loading Espera / 2 loading completo
  spinnerLoading:boolean=false;
  showSearchSelect:boolean=false;
  selectProveedor:string="";
  selectRuc:string="";
  

  listProveedoresFiltros$: any;
  listComprasMostrar$: Observable<cEnterpriceDocumento[]>;
  dataOrdenesResult: cEnterpriceDocumento[] = [];

   /**Para pagination y fecha Entrada*/
   fechaHoy = new cFecha();
   /**Fin paginatacion */
   
  fasearch = faSearch; fatimes = faTimes;
  constructor(private _enterpriceServise: ApiEnterpriceService,private _conexcionService: ConexionService) { }

  ngOnInit(): void {
    if(this._conexcionService.UserR.rolAsignado=="enfermeria"){
      this.selectProveedor="DISTRIBUIDORA FARMACEUTICA ECUATORIANA DIFARE S.A";
      this.selectRuc="0990858322001";
    }
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
    if(this.selectProveedor!='')
    strParametros=this.selectRuc+strParametros;
    else strParametros="datoNull"+strParametros;
    this.listComprasMostrar$ = this._enterpriceServise.getComprasNoRealizadas(strParametros).pipe(
      map((x: cEnterpriceDocumento[]) => {
        x.forEach(y => {
          y.emi_Fecha = y.emi_Fecha.substring(0, 10);
        });
        return x;
      }),
      finalize(() =>  this.spinnerOnOff=2)
    );
  }

  getDataFiltro(data: cEnterpriceDocumento[]) {
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
    }
  }
}
