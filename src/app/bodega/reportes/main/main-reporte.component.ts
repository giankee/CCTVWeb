import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { finalize, map } from 'rxjs/operators';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpriceProveedor, cFecha, cParmtoReporte } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-main-reporte',
  templateUrl: './main-reporte.component.html',
  styles: [],
})
export class MainReporteComponent implements OnInit {
  public get ordenECSercie(): OrdenECService {
    return this._ordenECSercie;
  }
  public set ordenECSercie(value: OrdenECService) {
    this._ordenECSercie = value;
  }
  public get productoBServie(): ProductoBService {
    return this._productoBServie;
  }
  public set productoBServie(value: ProductoBService) {
    this._productoBServie = value;
  }
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  fechaHoy = new cFecha();
  iconDownLeft: boolean = false;
  spinnerOnOff: number = 0;
  parametrosBusqueda: cParmtoReporte;

  listProdFiltros$: any;
  listProveedoresFiltros$: any;
  listResultados: any[] = [];

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;
  constructor(private _conexcionService: ConexionService, private _enterpriceServise: ApiEnterpriceService, private _productoBServie: ProductoBService, private _ordenECSercie: OrdenECService) {
    this.parametrosBusqueda = new cParmtoReporte("P MANACRIPEX");
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      this.parametrosBusqueda = new cParmtoReporte("OFICINAS");
  }

  ngOnInit(): void {
  }

  onChangeReport(){
    this.parametrosBusqueda.resetObj();
    this.listResultados=[];
    this.spinnerOnOff=0;
  }
  
  onGenerarR() {
    this.spinnerOnOff = 1;
    if (this.parametrosBusqueda.tipoR == "CaseA" || this.parametrosBusqueda.tipoR == "CaseB") {
      this._productoBServie.getVistaReporte(this.parametrosBusqueda.transformarParametroCasesAB()).subscribe((dato: any) => {
        this.listResultados = dato.data;
        this.spinnerOnOff = 2;
      },
        error => console.error(error));
    } else {
      if (this.parametrosBusqueda.tipoPeriodo != "null") {
        if (this.parametrosBusqueda.strProveedor != "--Sin Asignar--" || this.parametrosBusqueda.strRazonSocial != "null"){
          this._ordenECSercie.getVistaReporte(this.parametrosBusqueda.transformarParametroCasesCD(this.fechaHoy.inDesde)).subscribe((dato: any) => {
            this.listResultados = dato.data;
            this.spinnerOnOff = 2;
          },
            error => console.error(error));
        } else this.spinnerOnOff = 0;
      } else this.spinnerOnOff = 0;
    }
  }

  onBListProgProveedor(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    this.parametrosBusqueda.strProveedor = value;
    var params = "" + value;
    if (value == "")
      params = "DatoNull";
    this.listProveedoresFiltros$ = this._enterpriceServise.getProveedorSearch(params).pipe(
      map((x: cEnterpriceProveedor[]) => {
        return x;
      }),
      finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
    );
  }

  onChooseProveedor(data: any) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data != 'null') {
      this.parametrosBusqueda.strProveedor = data.proveedor;
    } else {
      this.parametrosBusqueda.strProveedor = "--Sin Asignar--";
    }
  }

  onListProductoB(value: string) {
    this.parametrosBusqueda.spinLoadingG = 2;
    this.parametrosBusqueda.showSearchSelectG = 2;
    this.parametrosBusqueda.strProducto = value;
    this.parametrosBusqueda.productoId = "null";
    if (this.parametrosBusqueda.strProveedor != '--Sin Asignar--') {
      var params = this.parametrosBusqueda.planta + "@" + this.parametrosBusqueda.strProveedor + "@null@";
      if (value == "")
        params = params + "datoNull@25";
      else params = params + value + "@25";
      this.listProdFiltros$ = this._productoBServie.getProductosProveedorSearch(params).pipe(
        map((x: cProducto_B[]) => x),
        finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
      );
    } else this.parametrosBusqueda.spinLoadingG = 0;
  }

  onChooseElemente(data: any) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data != "null") {
      this.parametrosBusqueda.strProducto = data.nombre;
      this.parametrosBusqueda.productoId = "" + data.idProductoStock;
    } else this.parametrosBusqueda.strProducto = "--Sin Asignar--";
  }
}
