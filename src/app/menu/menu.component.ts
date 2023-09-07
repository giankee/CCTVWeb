import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { ConexionService } from '../shared/otrosServices/conexion.service';
import { Observable, Subscription, fromEvent } from 'rxjs';

import {
  faBars, faCircle, faSignOutAlt, faBell, faTasks, faCar, faUserPlus, faTools, faUsers, faEnvelope, faExchangeAlt, faClipboardCheck,
  faShoppingCart, faBoxes, faDolly, faDollyFlatbed, faFileMedical, faMedkit, faBookMedical, faLaptopMedical, faCarCrash, faObjectGroup, faIdCardAlt, faPrescriptionBottleAlt, faHeartbeat, faClipboardList, faChartLine, faCartArrowDown, faWarehouse, faUserTag, faPills, faFaucet, faTint
} from '@fortawesome/free-solid-svg-icons';
import { cNotificacion } from '../shared/ordenEs';
import { NotificacionService } from '../shared/notificacion.service';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  public get notificacionService(): NotificacionService {
    return this._notificacionService;
  }
  public set notificacionService(value: NotificacionService) {
    this._notificacionService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get service(): UserService {
    return this._userService;
  }
  public set service(value: UserService) {
    this._userService = value;
  }
  public get tooglebtn(): boolean {
    return this._tooglebtn;
  }
  public set tooglebtn(value: boolean) {
    this._tooglebtn = value;
  }
  /**Icon */
  fabars = faBars; facircle = faCircle; fasignOut = faSignOutAlt; fabell = faBell; fatasks = faTasks; facar = faCar; fauserplus = faUserPlus;fausertag= faUserTag;
  fatools = faTools; fausers = faUsers; faenvelope = faEnvelope; faexchangeAlt = faExchangeAlt; faclipboardCheck = faClipboardCheck;facartarrow=faCartArrowDown;
  fashoppingCart = faShoppingCart; faboxes = faBoxes; fadolly = faDolly; fadollyflatbed = faDollyFlatbed; fasquareplus = faPlusSquare;fachartLine=faChartLine;
  fafilemedical = faFileMedical; fakitmedical = faMedkit; fabookmedical = faBookMedical; falaptopmedic = faLaptopMedical; facarcrash = faCarCrash;fagarage=faWarehouse
  faobjerctunicion = faObjectGroup; faidcardalt = faIdCardAlt; faprescription = faPrescriptionBottleAlt;faheartbeat=faHeartbeat; faclipboardList= faClipboardList;
  fapills=faPills;faucet=faFaucet;fawater=faTint;faexchange=faExchangeAlt;fawhatsapp=faWhatsapp;

  /**Parte Online/OffLine */
  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];

  /**Parte Navbar */
  _tooglebtn: boolean = true;
  listNotificacion: cNotificacion[] = [];
  constructor(private _userService: UserService, private router: Router, private _conexcionService: ConexionService, private _notificacionService: NotificacionService) { }

  ngOnInit(): void {
    this.mIniciarConexion();
    if (!this._userService.estaLogueado())
      this._userService.logout();
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
