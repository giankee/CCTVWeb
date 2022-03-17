import { Component, OnInit } from '@angular/core';
import { ApiEnterpriceService } from '../shared/otrosServices/api-enterprice.service';
import { OrdenESService } from '../shared/orden-es.service';
import { ConexionService } from '../shared/otrosServices/conexion.service';
import { faQuestion, faSort, faSearch, faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faCircle, faSignOutAlt, faAngleDown, faAngleLeft,faPrint } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { cOrdenEs } from '../shared/ordenEs';
import { cEnterpriceEmpleados, cVario } from '../shared/otrosServices/varios';
import { cPersonal, cProducto } from '../shared/basicos';
import { PersonalService } from '../shared/personal.service';
import { ProductoService } from '../shared/producto.service';
import { VariosService } from '../shared/otrosServices/varios.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-visitantes',
  templateUrl: './visitantes.component.html',
  styleUrls: ['./visitantes.component.css']
})
export class VisitantesComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get productoService(): ProductoService {
    return this._productoService;
  }
  public set productoService(value: ProductoService) {
    this._productoService = value;
  }
  public get personalService(): PersonalService {
    return this._personalService;
  }
  public set personalService(value: PersonalService) {
    this._personalService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get ordenESService(): OrdenESService {
    return this._ordenESService;
  }
  public set ordenESService(value: OrdenESService) {
    this._ordenESService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  public get iconDownLeft(): boolean {
    return this._iconDownLeft;
  }
  public set iconDownLeft(value: boolean) {
    this._iconDownLeft = value;
  }

  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];

  internetStatus: string = 'nline';
  filtroOrden = '';
  okAyuda: boolean = false;

  listOrdenesMostrar: cOrdenEs[] = [];
  listPersonalIn: cPersonal[] = [];
  listChoferesIn: cEnterpriceEmpleados[] = [];
  listProductosIn: cProducto[] = [];
  listDestinosIn: cVario[] = [];
  listFiltroPersona: cPersonal[] = [];
  listEmpresaProveedor: string[] = [];
  listFiltroProducto: cProducto[] = [];
  listFiltroDestino: cVario[] = [];
  resultBusquedaMostrar: cOrdenEs[] = [];
  listOrdenesMostrarCopy: cOrdenEs[] = [];
  spinnerOnOff: boolean = false;
  _iconDownLeft: boolean = false;


  /**Para pagination Entrada*/
  startIndex: number = 0;
  endIndex: number = 5;
  selectPagination: number = 5;
  pagActualIndex: number = 0;
  siguienteBlock: boolean = false;
  anteriorBlock: boolean = true;
  pagTotal: any[] = [];
  /**Fin paginatacion */

  /**Parametros de busqueda */
  _selectTipoOrden: string = 'Default';
  _selectPersona: string = null;
  _selectProducto: string = null;
  _selectLugar: string = null;

  strFecha: string = "";
  inDesde: string = "";
  inHasta: string = "";

  faquestion = faQuestion; sort = faSort; faeye = faEye; fasearch = faSearch; facircle = faCircle; fasignOut = faSignOutAlt; faangledown = faAngleDown; faangleleft = faAngleLeft;faArLeft=faArrowAltCircleLeft; faArRight=faArrowAltCircleRight;faprint=faPrint;
  constructor(private _userService: UserService, private router: Router, private _conexcionService: ConexionService, private _ordenESService: OrdenESService, private _enterpriceService: ApiEnterpriceService, private _personalService: PersonalService, private _productoService: ProductoService, private _variosService: VariosService,private dialog: MatDialog) { }

  ngOnInit(): void {
    this.mIniciarConexion();
    if (this._userService.estaLogueado) {
      this.cargarDataUser();
    }
    else
      this.router.navigate(["/user-Login"]);
  }

  mIniciarConexion() {//Revisa si esta Online o Offline con sus respectivos mensajes
    this._conexcionService.formData = {
      connectionStatusMessage: "",
      connectionStatus: "nline"
    }

    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this._conexcionService.formData.connectionStatusMessage = 'Regreso la conexión';
      this._conexcionService.formData.connectionStatus = 'nline';
      this._conexcionService.pasarStatus(this._conexcionService.formData);
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this._conexcionService.formData.connectionStatusMessage = 'Conexión perdida! No estas conectado a Internet';
      this._conexcionService.formData.connectionStatus = 'ffline';
      this._conexcionService.pasarStatus(this._conexcionService.formData);
    }));
  }

  logOut() {
    this._userService.logout();
  }

  cargarDataUser() {
    this._userService.getUserData().subscribe(//Recupera la informacion Del Usuario y lo redirige a la pagina que le correspoda su rol
      (res: any) => {
        this._conexcionService.UserR = {
          UserName: res.userName,
          rolAsignado: res.rolAsignado
        }
      },
      err => {
        console.log(err);
      },
    );
  }
}
