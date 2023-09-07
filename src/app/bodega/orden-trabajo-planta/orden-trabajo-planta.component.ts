import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cParemetosOrdenInterna, cVario } from 'src/app/shared/otrosServices/varios';
import { faSort, faEye, faTimesCircle, faSearch, faAngleDown, faAngleLeft, faPrint, faArrowAltCircleLeft, faArrowAltCircleRight, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { cBodega, cBodegaArea, cProducto_B } from 'src/app/shared/bodega/ordenEC';
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
  listBodega: cBodega[] = [];
  listAreas: cBodega[] = [];
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
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash
  constructor(private _conexcionService: ConexionService, private _ordenInterService: OrdenTrabajoService, private _variosService: VariosService, private _productosBService: ProductoBService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarBodega();
  }

  cargarData() {//Datos de los ordenes traidos desde db
    var strParametro;
    switch (this.conexcionService.UserDataToken.role) {
      case 'enfermeria':
        strParametro = "ENFERMERIA@Traspaso Bodega@" + this.listBodegasFiltro;
        break;
      case 'verificador-bodeguero-b':
        strParametro = "BARCOS@Trabajo Interno@" + this.listBodegasFiltro;
        break;
      case 'tinabg-m':
      case 'bodega_verificador-m':
      case 'verificador-bodeguero':
        strParametro = "P MANACRIPEX@Trabajo Interno@" + this.listBodegasFiltro;
        break;
      case 'gpv-o':
        strParametro = "OFICINAS@Traspaso Bodega@" + this.listBodegasFiltro;
        break;
      case 'verificador-bodeguero-h':
        this.parametrosBusqueda.tipoO="All";
        strParametro = "OFICINAS@All@" + this.listBodegasFiltro;
        break;
    }
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
    if (this.conexcionService.UserDataToken.role == "enfermeria" || this.conexcionService.UserDataToken.role == "gpv-o" || this.conexcionService.UserDataToken.role == "verificador-bodeguero-h") {
      this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
        this.listBodega = dato;
        if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h")
          this.listBodega = this.listBodega.filter(x => x.nombreBodega.includes("HELICOPTERO"));
        if (this.conexcionService.UserDataToken.role != "enfermeria") {
          this._variosService.getBodegasTipo("OFICINAS").subscribe((dato: any) => {
            dato.forEach(x => {
              if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h") {
                if (x.encargadoBodega.includes(this._conexcionService.UserDataToken.name)) {
                  this.listBodega.push(x);
                  this.parametrosBusqueda.strBodegaOrigen = x.nombreBodega;
                }
              } else this.listBodega.push(x);
            });
          });
        }

        this.cargarData();
      });
    } else {
      if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-b") {
        this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
          this.listBodega = dato.filter(x => (x.listAreas.find(y => y.encargadoArea == this.conexcionService.UserDataToken.name)));
          if (this.listBodega.length > 0)
            this.listBodegasFiltro = this.listBodega[0].nombreBodega;
          this.cargarData();
        });
      } else {
        this._variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
          this.listAreas = dato;
        });
        this._variosService.getBodegasTipo("P MANACRIPEX").subscribe(dato => {
          this.listBodega = dato;
          if (this.conexcionService.UserDataToken.role != "tinabg-m") {
            this.listBodega = this.listBodega.filter(x => x.encargadoBodega.includes(this.conexcionService.UserDataToken.name));
            this.listBodega.forEach(x => {
              if (this.listBodegasFiltro == "All")
                this.listBodegasFiltro = x.nombreBodega;
              else this.listBodegasFiltro = this.listBodegasFiltro + "-" + x.nombreBodega;
            });
            if (this.conexcionService.UserDataToken.role == "verificador-bodeguero" && this.listBodega.length >= 1) {
              this.parametrosBusqueda.strBodegaOrigen = this.listBodega[0].nombreBodega;
              if (this.conexcionService.UserDataToken.name == "FERNANDA MORALES") {
                this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
                  for (var i = 0; i < dato.length; i++) {
                    this.listBodega.push(dato[i]);
                  }
                });
              }
            }
          }
          this.cargarData();
        });
      }
    }
  }

  onListProducto(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    this.parametrosBusqueda.productoCodigo = "null";

    var params = "" + value;
    if (value == "")
      params = "DatoNull";

    if (this.conexcionService.UserDataToken.role == "enfermeria")
      params = params + "@ENFERMERIA@2@" + this.parametrosBusqueda.strBodegaOrigen;
    if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h") {
      if (this.parametrosBusqueda.strBodegaOrigen.includes("HELICOPTERO"))
        params = params + "@BARCOS@2@" + this.parametrosBusqueda.strBodegaOrigen;
      else params = params + "@OFICINAS@2@" + this.parametrosBusqueda.strBodegaOrigen;
    }
    if (this.conexcionService.UserDataToken.role != "enfermeria" && this.conexcionService.UserDataToken.role != "verificador-bodeguero-h")
      params = params + "@P MANACRIPEX@2@" + this.parametrosBusqueda.strBodegaOrigen;
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
    if (tipo == "Marea") {
      if (this.ordenTrabajo == "default" || this.ordenTrabajo == "down-M")
        this.ordenTrabajo = "up-M";
      else this.ordenTrabajo = "down-M";
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  onFiltrarOrdenes() {
    this.spinnerOnOff = true;
    var strParametros: string;
    switch (this.conexcionService.UserDataToken.role) {
      case 'enfermeria':
        this.parametrosBusqueda.planta = "ENFERMERIA";
        this.parametrosBusqueda.tipoO = "Traspaso Bodega";
        break;
      case 'verificador-bodeguero-b':
        this.parametrosBusqueda.planta = "BARCOS";
        this.parametrosBusqueda.tipoO = "Trabajo Interno";
        break;
      case 'tinabg-m':
      case 'bodega_verificador-m':
      case 'verificador-bodeguero':
        this.parametrosBusqueda.planta = "P MANACRIPEX";
        this.parametrosBusqueda.tipoO = "Trabajo Interno";
        break;
      case 'verificador-bodeguero-h':
        if (this.parametrosBusqueda.strBodegaOrigen.includes("HELICOPTERO")) {
          this.parametrosBusqueda.planta = "BARCOS";
        } else this.parametrosBusqueda.planta = "OFICINAS";
        this.parametrosBusqueda.tipoO = this.parametrosBusqueda.tipoO;
        break;
    }
    if (this._conexcionService.UserDataToken.role == 'gpv-o' || (this.conexcionService.UserDataToken.role == 'verificador-bodeguero' && this.conexcionService.UserDataToken.name == "FERNANDA MORALES")) {
      this.parametrosBusqueda.tipoO = "All";
      if ((this.listBodega.find(x => x.nombreBodega == this.parametrosBusqueda.strBodegaOrigen)).tipoBodega == "PUERTO")
        this.parametrosBusqueda.planta = "BARCOS";
      else this.parametrosBusqueda.planta = this.listBodega.find(x => x.nombreBodega == this.parametrosBusqueda.strBodegaOrigen).tipoBodega;
    }
    strParametros = this.parametrosBusqueda.transformarParametro(this.fechaHoy.inDesde, this.fechaHoy.inHasta);
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
