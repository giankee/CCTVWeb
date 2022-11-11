import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faExchangeAlt, faEye, faEyeSlash, faPencilAlt, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cParemetosGeneral, cVario,cEnterpriceProveedor } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { ViewPedidoModalComponent } from '../view-pedido-modal/view-pedido-modal.component';
@Component({
  selector: 'app-list-pedidos',
  templateUrl: './list-pedidos.component.html',
  styles: []
})
export class ListPedidosComponent implements OnInit {
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
  public get ordenPedidoService(): OrdenPedidoService {
    return this._ordenPedidoService;
  }
  public set ordenPedidoService(value: OrdenPedidoService) {
    this._ordenPedidoService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get iconDownLeft(): boolean {
    return this._iconDownLeft;
  }
  public set iconDownLeft(value: boolean) {
    this._iconDownLeft = value;
  }

  spinnerOnOff: boolean = true;
  listBarcos: cVario[] = [];
  parametrosBusqueda: cParemetosGeneral = new cParemetosGeneral();
  _iconDownLeft: boolean = false;
  ordenPedido: string = "default";
  listPedidosMostrar$: Observable<cOrdenPedido[]>;
  listProveedoresFiltros$: any;
  listProdFiltros$: any;
  dataPedidoResult: cOrdenPedido[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(50);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch;faexchange=faExchangeAlt;fapencilAlt = faPencilAlt; 
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash

  constructor(private _conexcionService: ConexionService, private _ordenPedidoService: OrdenPedidoService, private _variosService: VariosService,private _enterpriceServise: ApiEnterpriceService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.parametrosBusqueda.strCampoB="SIN ASIGNAR";
    this.parametrosBusqueda.strCampoC="SIN ASIGNAR";
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      dato.forEach(x => {
        if (x.categoria == "Puerto" && x.prioridadNivel == 1)
          this.listBarcos.push(x);
      });
      this.cargarData();
    });
  }

  cargarData() {
    this.spinnerOnOff = true;
    this.listPedidosMostrar$= this.ordenPedidoService.getListPedido("All").pipe(
      map((x: cOrdenPedido[]) => {
        x.forEach(y => {
          y.fechaPedido = y.fechaPedido.substring(0, 10);
          let auxSecuencial= y.numSecuencial.split("-");
          y.strNumSecuencial=auxSecuencial[1];
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  getDataFiltro(data: cOrdenPedido[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined) {
      this.dataPedidoResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataPedidoResult.length);
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataPedidoResult.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenPedido(tipo: string) {
    if (tipo == "Tipo") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-T")
        this.ordenPedido = "up-T";
      else this.ordenPedido = "down-T";
    }
    if (tipo == "Proveedor") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-P")
        this.ordenPedido = "up-P";
      else this.ordenPedido = "down-P";
    }
    if (tipo == "Barco") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-B")
        this.ordenPedido = "up-B";
      else this.ordenPedido = "down-B";
    }
    if (tipo == "Secuencial") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-S")
        this.ordenPedido = "up-S";
      else this.ordenPedido = "down-S";
    }
  }

  onBListProgProveedor(value: string) {
    this.parametrosBusqueda.spinLoadingG = 'strA';
    this.parametrosBusqueda.showSearchSelectG = 'strA';
    this.parametrosBusqueda.strCampoA = value;
    if (value)
      this.listProveedoresFiltros$ = this._enterpriceServise.getProveedorSearch(value).pipe(
        map((x: cEnterpriceProveedor[]) => {
          return x;
        }),
        finalize(() => this.parametrosBusqueda.spinLoadingG = '0')
      );
    else {
      this.parametrosBusqueda.spinLoadingG = '0';
      this.listProveedoresFiltros$ = null;
    }
  }

  onChooseProveedor(data: cEnterpriceProveedor) {
    this.parametrosBusqueda.spinLoadingG = '0';
    this.parametrosBusqueda.showSearchSelectG = '0';
    this.parametrosBusqueda.strCampoA=data.proveedor;
  } 

  onFiltrarPedidos() {
    this.spinnerOnOff = true;
    var strParametosOut = this.parametrosBusqueda.fechaA + "@" + this.parametrosBusqueda.fechaB + "@"+this.parametrosBusqueda.strCampoB+"@"+this.parametrosBusqueda.strCampoC+"@";
    if (this.parametrosBusqueda.strCampoA != '')
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoA;
    else strParametosOut = strParametosOut + "SIN ASIGNAR";
    this.listPedidosMostrar$ = this.ordenPedidoService.getFiltroPedidos(strParametosOut).pipe(
      map((x: cOrdenPedido[]) => {
        x.forEach(y => {
          y.fechaPedido = y.fechaPedido.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onConvertPdfAll(){

  }

  onEdit(dataIn:cOrdenPedido){
    var auxId = dataIn.idOrdenPedido;
    this.ordenPedidoService.formData = new cOrdenPedido(dataIn.cargoUser);
    this.ordenPedidoService.formData.completarObject(dataIn);
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = false;
    dialoConfig.disableClose = true;
    dialoConfig.data = { auxId }
    this.dialog.open(ViewPedidoModalComponent, dialoConfig);
  }
}
