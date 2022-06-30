import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cParemetosOrdenInterna, cVario } from 'src/app/shared/otrosServices/varios';
import { faSort, faEye, faTimesCircle, faSearch, faAngleDown, faAngleLeft, faPrint, faArrowAltCircleLeft, faArrowAltCircleRight,faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewTrabajoModelComponent } from './view-trabajo-model/view-trabajo-model.component';

@Component({
  selector: 'app-orden-trabajo-planta',
  templateUrl: './orden-trabajo-planta.component.html',
  styles: [],
})
export class OrdenTrabajoPlantaComponent implements OnInit {
  public get productosBService(): ProductoBService {
    return this._productosBService;
  }
  public set productosBService(value: ProductoBService) {
    this._productosBService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get ordenInterService(): OrdenTrabajoService {
    return this._ordenInterService;
  }
  public set ordenInterService(value: OrdenTrabajoService) {
    this._ordenInterService = value;
  }
  public get iconDownLeft(): boolean {
    return this._iconDownLeft;
  }
  public set iconDownLeft(value: boolean) {
    this._iconDownLeft = value;
  }

  internetStatus: string = 'nline';
  spinnerOnOff: boolean = true;
  ordenTrabajo: string = "default";
  _iconDownLeft: boolean = false;
  listBodega: cVario[] = [];
  parametrosBusqueda: cParemetosOrdenInterna = new cParemetosOrdenInterna();

  listOrdenesMostrar$: Observable<cOrdenTrabajoI[]>;
  dataOrdenesResult: cOrdenTrabajoI[] = [];
  listProdFiltros$: any;

  listBodegasFiltro: string = "All";

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(25);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch; 
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;faeyeslash=faEyeSlash
  constructor(private _conexcionService: ConexionService, private _ordenInterService: OrdenTrabajoService,private _variosService: VariosService, private _productosBService: ProductoBService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    
    this.cargarBodega();
  }

  cargarData() {//Datos de los ordenes traidos desde db
    var strParametro = "P MANACRIPEX@Trabajo Interno@"+this.listBodegasFiltro;
    this.spinnerOnOff = true;
    this.listOrdenesMostrar$ = this._ordenInterService.getListOrdenesInter(strParametro).pipe(
      map((x: cOrdenTrabajoI[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.listBodega = dato;
      if(this.conexcionService.UserR.rolAsignado!="tinabg-m")
      this.listBodega.forEach(x=>{
        if(x.encargadoBodega==this.conexcionService.UserR.nombreU){
          if(this.listBodegasFiltro=="All"){
            this.parametrosBusqueda.strBodegaOrigen=x.nombre;
            this.listBodegasFiltro=x.nombre;
          }
          else this.listBodegasFiltro=this.listBodegasFiltro+'-'+x.nombre;
        }
      }) 
      this.cargarData();
    });
  }

  onListProducto(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    this.parametrosBusqueda.productoCodigo = "null";

    var params = "" + value;
    if (value == "")
      params = "DatoNull";
    params=params+"@P MANACRIPEX@2@"+this.parametrosBusqueda.strBodegaOrigen;
    this.listProdFiltros$ = this._productosBService.getProductosSearch(params).pipe(
      map((x: cProducto_B[]) => x),
      finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
    );
  }

  onChooseElemente(data: any) {
    if (data != "null") {
      this.parametrosBusqueda.productoCodigo = data.idProductoStock;
      this.parametrosBusqueda.strProducto = data.nombre;
    } else this.parametrosBusqueda.strProducto = "";
    this.parametrosBusqueda.showSearchSelectG = 0;
  }

  getDataFiltro(data: cOrdenTrabajoI[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }

  onOrdenTrabajos(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "index") {
      if (this.ordenTrabajo == "default" || this.ordenTrabajo == "down-I")
        this.ordenTrabajo = "up-I";
      else this.ordenTrabajo = "down-I";
    }
    if (tipo == "Bodega") {
      if (this.ordenTrabajo == "default" || this.ordenTrabajo == "down-B")
        this.ordenTrabajo = "up-B";
      else this.ordenTrabajo = "down-B";
    }
    if (tipo == "Estado") {
      if (this.ordenTrabajo == "default" || this.ordenTrabajo == "down-E")
        this.ordenTrabajo = "up-E";
      else this.ordenTrabajo = "down-E";
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  onFiltrarOrdenes() {
    this.spinnerOnOff = true;
    var strParametros: string = this.parametrosBusqueda.transformarParametro(this.fechaHoy.inDesde, this.fechaHoy.inHasta);
    this.listOrdenesMostrar$ = this._ordenInterService.getFiltroOrdenes(strParametros).pipe(
      map((x: cOrdenTrabajoI[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onModal(dataIn: cOrdenTrabajoI) {
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    const auxId = dataIn.idOrdenTraba;
    dialoConfig.data = { auxId };
    this.dialog.open(ViewTrabajoModelComponent, dialoConfig);
  }
}
