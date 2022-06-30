import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { ConexionService } from '../shared/otrosServices/conexion.service';
import { Router } from '@angular/router';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { faCircle, faSignOutAlt, faOutdent, faIndent, faSave, faHandPointLeft, faHandPointRight, faTimes, faPlus, faUserTag, faBoxes, faBars, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { OrdenESService } from '../shared/orden-es.service';
import { PersonalService } from '../shared/personal.service';
import { CarroService } from '../shared/carro.service';
import { cArticulosO, cOrdenEs, cTinasO } from '../shared/ordenEs';
import { ProductoService } from '../shared/producto.service';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { ToastrService } from 'ngx-toastr';
import { VariosService } from '../shared/otrosServices/varios.service';
import { cVario, cEnterpriceEmpleados, cWhatsapp, cFecha, cVistaSalida } from '../shared/otrosServices/varios';
import { ApiEnterpriceService } from '../shared/otrosServices/api-enterprice.service';
import { cPersonal, cCarro, cProducto, cBalde } from '../shared/basicos';
import { NotificacionService } from '../shared/notificacion.service';
import { WhatsappService } from '../shared/otrosServices/whatsapp.service';
import { BaldeService } from '../shared/balde.service';
import { cPaginacion } from '../shared/otrosServices/paginacion';
import { finalize, map } from 'rxjs/operators';
import { ProductoBService } from '../shared/bodega/producto-b.service';
import { cProducto_B } from '../shared/bodega/ordenEC';


@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get baldesService(): BaldeService {
    return this._baldesService;
  }
  public set baldesService(value: BaldeService) {
    this._baldesService = value;
  }
  public get whatsappService(): WhatsappService {
    return this._whatsappService;
  }
  public set whatsappService(value: WhatsappService) {
    this._whatsappService = value;
  }
  public get notificacionService(): NotificacionService {
    return this._notificacionService;
  }
  public set notificacionService(value: NotificacionService) {
    this._notificacionService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
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
  public get carroService(): CarroService {
    return this._carroService;
  }
  public set carroService(value: CarroService) {
    this._carroService = value;
  }
  public get personalService(): PersonalService {
    return this._personalService;
  }
  public set personalService(value: PersonalService) {
    this._personalService = value;
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
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
  }
  public get multiBalde(): string[] {
    return this._multiBalde;
  }
  public set multiBalde(value: string[]) {
    this._multiBalde = value;
  }
  public get numTotalBaldes(): number {
    return this._numTotalBaldes;
  }
  public set numTotalBaldes(value: number) {
    this._numTotalBaldes = value;
  }
  /**Parte Online/OffLine */
  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];

  paginacion = new cPaginacion(7);

  strFases: string = "Inicio";
  buscarGuiaR: boolean = false;
  buscarGuiaVE: boolean = false;
  fechaHoy = new cFecha();

  /**Actualizar listProgresivas */
  listPersonalFiltros$: any;
  listVariosFiltros$: any;
  listProdFiltros$: any;
  spinLoadingG: number = 0;//0 offf, 1 es personal, 2 varios
  showSearchSelectG: number = 0;//0 offf, 1 es personal, 2 varios
  /**Old */
  listChoferesIn: cEnterpriceEmpleados[] = [];//No se reinicia
  listCarrosIn: cCarro[] = [];//Se debe actualizar opcional
  listCarrosChofer: cCarro[] = [];//Se debe actualizar opcional
  listFiltroCarrosC: cCarro[] = [];//No se reinicia
  listLugarPrioridadIn: cVario[] = [];//Se debe reinciar
  disableBtnPersonal: boolean;//Solito se reincia
  disableBtnCarro: boolean;//Solito se reincia

  private _multiBalde: string[];//solito se reinicia

  controlCampos: boolean[];

  /**Control Productos */
  newListProductosIn: cProducto[] = [];

  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;
  okContinuar: boolean = true;
  /**Control Balde */
  listBaldesPrestados: cBalde[] = [];
  newListGrupoTinas: any[] = [];
  private _numTotalBaldes: number;
  diasPrestamo: number = null;

  /**Proveedor */
  proveedorIsOpened: boolean = false;
  devolucionIsOpened: boolean = false;
  facircle = faCircle; fasignOut = faSignOutAlt; faoutdent = faOutdent; faindent = faIndent;
  fasave = faSave; faHandLeft = faHandPointLeft; faHandRight = faHandPointRight; fatimes = faTimes;
  faplus = faPlus; fausertag = faUserTag; faboxes = faBoxes; fabars = faBars; fatimescircle = faTimesCircle;

  constructor(private _userService: UserService, private router: Router, private _conexcionService: ConexionService, private _ordenESService: OrdenESService, private _personalService: PersonalService, private _carroService: CarroService, private _productoService: ProductoService, private _productoBService: ProductoBService, private _variosService: VariosService, private _baldesService: BaldeService, private _notificacionService: NotificacionService, private toastr: ToastrService, private _enterpriceService: ApiEnterpriceService, private _whatsappService: WhatsappService) {
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

  ngOnInit(): void {
    if (this._userService.estaLogueado) {
      this.cargarDataUser();
      this.cargarDataCarro();
      this.cargarDataChoferes();
    }
    else this.router.navigate(["/user-Login"]);
  }

  cargarDataUser() {
    this._userService.getUserData().subscribe(//Recupera la informacion Del Usuario y lo redirige a la pagina que le correspoda su rol
      (res: any) => {
        this._conexcionService.UserR = {
          UserName: res.userName,
          rolAsignado: res.rolAsignado,
          nombreU: res.nombreU,
          PhoneNumber: res.phoneNumber
        }
        this.resetForm();
        this._variosService.getVariosPrioridad(res.rolAsignado)//parece q no lo usare
          .subscribe(dato => {
            this.listLugarPrioridadIn = dato;
          },
            error => console.error(error));
      },
      err => {
        console.log(err);
      },
    );
  }

  onListPersonal(value: string) {
    this.spinLoadingG = 1;
    this.showSearchSelectG = 1;
    this.resetFormCarro();
    this.ordenESService.formData.persona.resetPersonal();
    this.ordenESService.formData.personaId = null;
    this.ordenESService.formData.choferId = null;
    if (this._ordenESService.formData.tipoOrden == "Balde")
      this.ordenESService.formData.persona.tipoPersona = "Transportista";
    this.ordenESService.formData.persona.nombreP = value;
    this.ordenESService.formData.carro.propietario = value;
    this.disableBtnPersonal = false;
    var params = "" + value;
    if (!value)
      params = "DatoNull";
    this.listPersonalFiltros$ = this._personalService.getPersonalSearch(params).pipe(
      map((x: cPersonal[]) => {
        return x;
      }),
      finalize(() => {
        this.spinLoadingG = 0;
        this.onComprobarCampos(0);
      })
    );

  }

  onChoosePersonal(data: any, tipo: string) {
    this.disableBtnPersonal = true;
    if (tipo == 'Chofer') {
      this._ordenESService.formData.persona.nombreP = data.empleado;
      this._ordenESService.formData.persona.tipoPersona = data.grupo;
      this._ordenESService.formData.persona.idPersona = data.idEmpleado;
      this._ordenESService.formData.persona.cedula = data.cedula;
      this._ordenESService.formData.checkCarro = true;
      this._ordenESService.formData.choferId = data.idEmpleado;
      if (this.listCarrosIn.filter(x => x.propietario == this._ordenESService.formData.persona.nombreP) != undefined)
        this.listCarrosChofer = JSON.parse(JSON.stringify(this.listCarrosIn.filter(x => x.propietario == this._ordenESService.formData.persona.nombreP)));
    }
    else {
      this._ordenESService.formData.persona.completarPersonal(data);
      this._ordenESService.formData.personaId = data.idPersona;
      if (this.listCarrosIn.find(x => x.propietario == this._ordenESService.formData.persona.nombreP) != undefined)
        this._ordenESService.formData.carro.completarCarro(this.listCarrosIn.find(x => x.propietario == this._ordenESService.formData.persona.nombreP));
    }
    this.showSearchSelectG = 0;
    this._ordenESService.formData.carro.propietario = this._ordenESService.formData.persona.nombreP;
  }

  onListLugares(value: string) {
    this.spinLoadingG = 2;
    this.showSearchSelectG = 2;
    this._ordenESService.formData.destinoProcedencia = value;
    var params = value;
    if (!value)
      params = "DatoNull";
    if (this._ordenESService.formData.tipoOrden == "Salida") {
      if (this._conexcionService.UserR.rolAsignado == "gpv-o")
        params = params + "@Salida OFICINAS";
      else params = params + "@" + this.ordenESService.formData.tipoOrden;
    } else params = params + "@" + this.ordenESService.formData.tipoOrden;
    this.listVariosFiltros$ = this._variosService.getSalidasLugarGSearch(params).pipe(
      map((x: cVistaSalida[]) => {
        return x;
      }),
      finalize(() => {
        this.spinLoadingG = 0;
        this.onComprobarCampos(9);
      })
    );
  }

  onChooseLugar(data: any) {
    this._ordenESService.formData.destinoProcedencia = data.nombreLugar;
    this.showSearchSelectG = 0;
    /* if (this._ordenESService.formData.tipoOrden == "Balde" && data.diasPrestamo != null)
       this.diasPrestamo = data.diasPrestamo;
     else this.diasPrestamo = null;*/
  }

  onListProducto(index: number, op: number, value: string) {
    if (value != null) {
      this.ordenESService.formData.listArticulosO[index].spinnerLoading = true;
      this._ordenESService.formData.listArticulosO.forEach(x => x.showSearchSelect = 0);
      this._ordenESService.formData.listArticulosO[index].showSearchSelect = op;
      this._ordenESService.formData.listArticulosO[index].productoId = undefined;
      this._ordenESService.formData.listArticulosO[index].inventarioId = undefined;
      this.ordenESService.formData.listArticulosO[index].producto.idProducto = undefined;
      this.ordenESService.formData.listArticulosO[index].inventario.idProductoStock = undefined;
      this._ordenESService.formData.listArticulosO[index].inventario.disBttnInput = 0;
      if (op == 2) {
        if (this._ordenESService.formData.listArticulosO[index].checkInventario)
          this._ordenESService.formData.listArticulosO[index].inventario.nombre = value.toUpperCase();
        else this._ordenESService.formData.listArticulosO[index].producto.nombre = value.toUpperCase();
      }

      else this._ordenESService.formData.listArticulosO[index].inventario.codigo = value.toUpperCase();
      var strParametro = value;

      if (value != "")
        if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
          strParametro = strParametro + "@" + this._ordenESService.formData.planta + "@" + op + "@null";
          this.listProdFiltros$ = this._productoBService.getProductosSearch(strParametro).pipe(
            map((x: cProducto_B[]) => x),
            finalize(() => this._ordenESService.formData.listArticulosO[index].spinnerLoading = false)
          );
        } else {
          this.listProdFiltros$ = this._productoService.getProductosSearch(strParametro).pipe(
            map((x: cProducto[]) => x),
            finalize(() => this._ordenESService.formData.listArticulosO[index].spinnerLoading = false)
          );
        }
    }
  }

  onChooseElemente(index, op: number, data: any) {
    this._ordenESService.formData.listArticulosO[index].showSearchSelect = 0;
    if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
      this._ordenESService.formData.listArticulosO[index].inventario.rellenarObjeto(data);
      this._ordenESService.formData.listArticulosO[index].inventarioId = data.idProductoStock;
      this._ordenESService.formData.listArticulosO[index].inventario.disBttnInput = op;
    } else {
      this._ordenESService.formData.listArticulosO[index].producto.completarObj(data);
      this._ordenESService.formData.listArticulosO[index].productoId = data.idProducto;
      this._ordenESService.formData.listArticulosO[index].producto.disBttnInput = op;
    }
  }

  onComprobarCedula() {//Comprueba si es que al ingresar una cedula nueva esta no exista anteriormente
    if (this._ordenESService.formData.persona.cedula != null && this._ordenESService.formData.persona.cedula.length == 10) {
      this.showSearchSelectG = 0;
      this.personalService.getPersonaCedula(this._ordenESService.formData.persona.cedula).subscribe(persona => {
        if (persona != null) {
          this._ordenESService.formData.persona.completarPersonal(persona);
          this._ordenESService.formData.personaId = this._ordenESService.formData.persona.idPersona;
        }
        if (this.listCarrosIn.find(x => x.propietario == this._ordenESService.formData.persona.nombreP) != undefined)
          this._ordenESService.formData.carro.completarCarro(this.listCarrosIn.find(x => x.propietario == this._ordenESService.formData.persona.nombreP));
      });
    }
    this.onComprobarCampos(1);
  }

  //Listo
  cargarDataCarro() {//Datos del carro traidos desde db
    this._carroService.getCarros().subscribe(dato => {
      this.listCarrosIn = dato;
      this.listFiltroCarrosC = [];
      for (var i = 0; i < this.listCarrosIn.length; i++) {
        if (this.listCarrosIn[i].propietario == "Manacripex" || this.listCarrosIn[i].propietario == "B&B" || this.listCarrosIn[i].propietario == "Freshfish") {
          this.listFiltroCarrosC.push(JSON.parse(JSON.stringify(this.listCarrosIn[i])));
        }
      }
    },
      error => console.error(error));
  }

  cargarDataChoferes() {//Datos del choferes traidos desde db
    this._enterpriceService.getPersonalEnter("Choferes")
      .subscribe(dato => {
        this.listChoferesIn = dato;
      },
        error => console.error(error));
  }

  //Edit
  onStart(op: string) {
    switch (op) {
      case "Compras Proveedor":
        this.strFases = "Proveedor";
        this.proveedorIsOpened = true;
        break;
      case "Devolucion Compra":
        this.strFases = "Devolucion";
        this.devolucionIsOpened = true;
        break;
      case "Balde":
        this.strFases = "PersonaCarro";
        this._ordenESService.formData.tipoOrden = op;
        this.ordenESService.formData.checkCarro = true;
        this.ordenESService.formData.responsableES = "MARCELO CASTRO";
        this.ordenESService.formData.listTinasO = [];
        break;
      default:
        this.strFases = "PersonaCarro";
        this._ordenESService.formData.tipoOrden = op;
        this.ordenESService.formData.listArticulosO = [];
        this.ordenESService.formData.agregarOneArticulo(new cArticulosO());
        this.newListProductosIn = [];
        this.paginacion.getNumberIndex(this.ordenESService.formData.listArticulosO.length);
        this.paginacion.updateIndex(0);
        break;
    }
  }

  //Edit
  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
    }
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o') {
      this._ordenESService.formData = new cOrdenEs("OFICINAS", this._conexcionService.UserR.nombreU);
      this._ordenESService.formData.responsableES = this._conexcionService.UserR.nombreU;
    } else {
      this._ordenESService.formData = new cOrdenEs("P MANACRIPEX", this._conexcionService.UserR.nombreU);
      this._ordenESService.formData.responsableES = "MIGUEL MENDOZA";
    }
    /**New */
    this.showSearchSelectG = 0;
    this.spinLoadingG = 0;

    /**Old */
    this.okAddNewBotton = true;
    this.okBttnSubmit = true;
    this.buscarGuiaR = false;
    this.buscarGuiaVE = false;
    this.okContinuar = true;
    this.proveedorIsOpened = false;
    this.strFases = "Inicio";
    this._multiBalde = [];
    this._numTotalBaldes = 0;
    this.newListGrupoTinas = [];
    //selecPersona, cedula, nombre, controlCarro(si es check y el otro vacio), hora, select doc, num doc, controlGuiaR(check y num guia r),responsable,selecLugar(el select y nombre)
    this.controlCampos = [false, false, false, false, false, false, false, false, false, false];
  }

  //Listo
  resetFormCarro() {//Para que los valores en el html esten vacios
    this.disableBtnCarro = true;
    this._ordenESService.formData.checkCarro = false;
    this.listCarrosChofer = [];
    this._ordenESService.formData.carro.resetCarro();
  }

  onAntSig(opAntSig: string) {//debe Arreglarse a futuro
    if (this.strFases == 'PersonaCarro') {
      if (opAntSig == 'sig') {
        if (this.onComprobarCampos()) {
          if (this._ordenESService.formData.tipoOrden == "Balde") {
            this.listBaldesPrestados = [];
            this._multiBalde = [];
            if (this._ordenESService.formData.tipoDocumentacion == "Entrada")
              this.buscarBaldesPrestados("MANACRIPEX", this._ordenESService.formData.destinoProcedencia);
            else this.onNewTinas();
            this.buscarExistGuiaBalde(this._ordenESService.formData.tipoOrden + " " + this._ordenESService.formData.tipoDocumentacion, this._ordenESService.formData.numDocumentacion, this._ordenESService.formData.destinoProcedencia);

          } else this.buscarGuiaGeneral();
        }
      } else {
        this.strFases = "Inicio";
        this.resetForm();
      }
    } else this.strFases = "PersonaCarro";
  }

  //Tengo que cambiar
  onComprobarCampos(pos?: number) {
    let pasar: boolean = true;
    var i = 0;
    var hasta = 9;
    if (pos != undefined) {
      i = pos;
      hasta = pos;
    }
    for (i; i <= hasta; i++) {
      switch (i) {
        case 0://selecPersona
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.persona.nombreP == "" && this._ordenESService.formData.tipoOrden != "Balde")
            this.controlCampos[i] = true;
          break;
        case 1://cedula 
          this.controlCampos[i] = false;
          if ((this._ordenESService.formData.persona.cedula == "" || this._ordenESService.formData.persona.cedula.length != 10) && this._ordenESService.formData.tipoOrden != "Balde")
            this.controlCampos[i] = true;
          break;
        case 3://carro
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.checkCarro || this._ordenESService.formData.tipoOrden == "Balde") {
            if (this._ordenESService.formData.persona.tipoPersona == 'Choferes' && this._ordenESService.formData.carro.idCarro == null)
              this.controlCampos[i] = true;
            if (this._ordenESService.formData.persona.tipoPersona != 'Choferes' || (this._ordenESService.formData.persona.tipoPersona == 'Choferes' && this._ordenESService.formData.carro.idCarro == 0)) {
              let algo: any = document.getElementsByName('numMatricula');
              if (this._ordenESService.formData.carro.numMatricula == "" || !algo[0].validity.valid)
                this.controlCampos[i] = true;
            }
          }
          break;
        case 4://hora
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.horaRegistro == "")
            this.controlCampos[i] = true;
          break;
        case 5://Tipo de documento
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.tipoDocumentacion == null && this._ordenESService.formData.tipoOrden != "Salida")
            this.controlCampos[i] = true;
          break;
        case 6://numGuia
          this.controlCampos[i] = false;
          if ((this._ordenESService.formData.tipoDocumentacion != "Ninguna" && this._ordenESService.formData.tipoDocumentacion != "Entrada") && this._ordenESService.formData.numDocumentacion == null)
            this.controlCampos[i] = true;
          else {
            if (this._ordenESService.formData.tipoDocumentacion == "Ninguna")
              this._ordenESService.formData.numDocumentacion = null;
          }
          break;
        case 7://Guia Retorno
          this.buscarGuiaR = false;
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.checkGuiaR && this._ordenESService.formData.numGuiaRetorno == null && (this._ordenESService.formData.tipoOrden == "Entrada" || this._ordenESService.formData.tipoOrden == "Salida"))
            this.controlCampos[i] = true;
          else {
            if (this._ordenESService.formData.checkGuiaR && this._ordenESService.formData.numGuiaRetorno != null)
              this.buscarGuiaR = true;
            else this._ordenESService.formData.numGuiaRetorno = null;
          }
          if (this._ordenESService.formData.checkGuiaR) {
            this._ordenESService.formData.fechaRegistro = this.fechaHoy.strFecha;
          }
          break;
        case 8://Responsable
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.responsableES == "")
            this.controlCampos[i] = true;
          break;
        case 9://Lugar
          this.controlCampos[i] = false;
          if (this._ordenESService.formData.destinoProcedencia == null || this._ordenESService.formData.destinoProcedencia == "")
            this.controlCampos[i] = true
          break;
      }
    }
    if (this.controlCampos.find(x => x == true))
      pasar = false;
    this.okContinuar = pasar;
    return pasar;
  }

  comprobarNewArticulos() {
    var newProductos: cProducto[] = [];
    if (this.buscarGuiaR || (this._ordenESService.formData.tipoOrden == "Salida")) {
      if ((this.buscarGuiaR && !this.buscarGuiaVE) && (this.ordenESService.formData.listArticulosO.find(x => x.cantidad != 0 && x.retorna && x.checkRevision == true) == undefined))
        this.okContinuar = false;
    }
    this.ordenESService.formData.listArticulosO.forEach(x => {
      if (x.productoId == undefined && x.inventarioId == undefined)
        newProductos.push(JSON.parse(JSON.stringify(x.producto)));
    });
    if (newProductos.length > 1) {
      newProductos.sort((a, b) => b.nombre.localeCompare(a.nombre));
      for (var i = 0; i < newProductos.length - 1; i++)
        for (var j = i + 1; j < newProductos.length; j++) {
          if (newProductos[i].nombre == newProductos[j].nombre) {
            newProductos.splice(j, 1);
            j--;
          }
        }
    }
    return newProductos;
  }

  onNewProductos() {
    if (this.comprobarNewP() && !this.buscarGuiaVE) {
      this.ordenESService.formData.agregarOneArticulo(new cArticulosO());
      this.paginacion.getNumberIndex(this.ordenESService.formData.listArticulosO.length);
      this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
    }
  }

  onNewTinas() {
    if (this.comprobarNewT()) {
      var aux = {
        propietario: "MANACRIPEX",
        contenido: null,
        actividad: false,
        baldes: "",
        error: false,
        baldesRepetidos: "",
      }
      if (this._ordenESService.formData.tipoDocumentacion == "Salida")
        aux.contenido = "LLENO";
      this.newListGrupoTinas.push(aux);
    }
  }

  comprobarNewP() {
    var flag = true;
    this._ordenESService.formData.listArticulosO.forEach(x => {
      if (x.cantidad <= 0 && (!x.checkRevision || x.retorna))
        flag = false;
      if (x.checkRevision && x.retorna && x.cantidad > x.cantidadPendiente)
        flag = false;

      if (x.checkInventario || x.inventarioId != null) {
        if (x.inventario.codigo == "" || x.inventario.nombre == "" || x.inventarioId == null || x.inventario.SelectBodega == "SIN ASIGNAR")
          flag = false;
        if (!this.buscarGuiaVE)
          if (this._ordenESService.formData.tipoOrden == "Salida" && x.cantidad > x.inventario.listBodegaProducto.find(y => y.nombreBodega == x.inventario.SelectBodega).disponibilidad)
            flag = false;
      } else {
        if (x.producto.nombre == "")
          flag = false;
      }
      if (!flag)
        x.cantidad = 0;
    });
    this.okAddNewBotton = flag;
    if (this.buscarGuiaR) {
      if (this._ordenESService.formData.listArticulosO.find(x => x.retorna == true && x.cantidad > 0) == undefined)
        flag = false;
    }
    this.okContinuar = flag;
    return (flag);
  }

  comprobarNewT() {
    var flag = true;
    if (this.newListGrupoTinas.find(x => x.propietario == null || x.contenido == null || x.baldes == "") != undefined)
      flag = false;
    this.okAddNewBotton = flag;
    return (flag);
  }

  onRemoveNewP(indice) {
    var auxLA: cArticulosO[] = [];
    if (this.ordenESService.formData.listArticulosO.length > 1) {
      this.ordenESService.formData.listArticulosO.splice(indice, 1);
      auxLA = JSON.parse(JSON.stringify(this.ordenESService.formData.listArticulosO));
      this.ordenESService.formData.listArticulosO = [];
      this.ordenESService.formData.listArticulosO = JSON.parse(JSON.stringify(auxLA));
    }
    this.comprobarNewP();
  }

  onRemoveNewT(indice) {
    var aux: any[] = [];
    if (this.newListGrupoTinas.length > 1) {
      this.newListGrupoTinas.splice(indice, 1);
      aux = JSON.parse(JSON.stringify(this.newListGrupoTinas));
      this.newListGrupoTinas = [];
      this.newListGrupoTinas = JSON.parse(JSON.stringify(aux));
    }
    this.comprobarNewT();
  }

  onSubmit(form: NgForm) {
    if (this._conexcionService.formData.connectionStatus == "nline") {
      this.okBttnSubmit = false;
      if (this.strFases == "Articulos") {
        if (this.comprobarNewP()) {
          var auxNewP: cProducto[] = this.comprobarNewArticulos();
          if (this._ordenESService.formData.tipoOrden == "Salida") {
            this._ordenESService.formData.numDocumentacion = "Guía: " + this._ordenESService.formData.numDocumentacion;
          } else {
            if (this._ordenESService.formData.tipoDocumentacion == "Ninguna")
              this._ordenESService.formData.numDocumentacion = "Ninguna";
            else this._ordenESService.formData.numDocumentacion = this._ordenESService.formData.tipoDocumentacion + ": " + this._ordenESService.formData.numDocumentacion;
          }
          if (auxNewP.length > 0) {
            this._productoService.insertarMultiplesProductos(auxNewP).subscribe(
              (res: any) => {
                this.ordenESService.formData.listArticulosO.forEach(x1 => {
                  if (x1.inventarioId == undefined && x1.productoId == undefined)
                    x1.productoId = res.cctv_producto.find(x2 => x2.nombre == x1.producto.nombre).idProducto;
                })
                this.comunSubmit(form);
              }
            )
          } else this.comunSubmit(form);
        } else this.okBttnSubmit = true;
      }
      if (this.strFases == "Balde") {
        if (this.comprobarNewT()) {
          this._ordenESService.formData.tipoOrden = this._ordenESService.formData.tipoOrden + " " + this._ordenESService.formData.tipoDocumentacion;
          this._ordenESService.formData.numDocumentacion = "Guía: " + this._ordenESService.formData.numDocumentacion;

          if (this._ordenESService.formData.tipoDocumentacion == "Entrada" && this.listBaldesPrestados.length > 0) {
            if (this._multiBalde.length > 0) {
              var auxTinaO = new cTinasO(this._ordenESService.formData.tipoDocumentacion);
              var auxBalde: cBalde;
              for (var l = 0; l < this._multiBalde.length; l++) {
                auxBalde = this.listBaldesPrestados[this.listBaldesPrestados.findIndex(x => x.numBalde.toString() == this._multiBalde[l])];
                auxTinaO.baldeId = auxBalde.idBalde;
                auxTinaO.balde.idBalde = auxBalde.idBalde;
                auxTinaO.balde.numBalde = auxBalde.numBalde;
                this._ordenESService.formData.listTinasO.push(JSON.parse(JSON.stringify(auxTinaO)));
              }
            }
          }
          this.comunSubmit(form);
        } else this.okBttnSubmit = true;
      }
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info'
        },
        buttonsStyling: false
      })
    }
  }

  comunSubmit(form: NgForm) {
    if (this._ordenESService.formData.checkCarro) {
      if (this.ordenESService.formData.carro.idCarro != null) {
        this.ordenESService.formData.carroId = Number(this.ordenESService.formData.carro.idCarro);
        if (this._ordenESService.formData.choferId != null) {
          this._ordenESService.formData.carro.completarCarro(this.listFiltroCarrosC.find(x => x.idCarro == this.ordenESService.formData.carroId));
        }
      }
      if (this.strFases == "Balde") {
        this._ordenESService.formData.carro.propietario = "Transportista";
        this._ordenESService.formData.persona = null;
      }
    } else this.ordenESService.formData.carro = null;

    if (this.strFases == "Balde") {
      var arrayBaldesSplitI: any[] = [];

      if (this._ordenESService.formData.tipoDocumentacion == "Entrada")
        for (var i = 0; i < this.newListGrupoTinas.length; i++) {
          var auxTinaO = new cTinasO(this._ordenESService.formData.tipoDocumentacion, this.newListGrupoTinas[i].contenido);
          arrayBaldesSplitI = [];
          arrayBaldesSplitI = this.newListGrupoTinas[i].baldes.split("-");
          for (var j = 0; j < arrayBaldesSplitI.length; j++) {
            auxTinaO.balde.numBalde = arrayBaldesSplitI[j];
            this._ordenESService.formData.listTinasO.push(JSON.parse(JSON.stringify(auxTinaO)));
          }
        }
      else {
        for (var i = 0; i < this.newListGrupoTinas.length; i++) {
          var auxTinaO = new cTinasO(this._ordenESService.formData.tipoDocumentacion);

          arrayBaldesSplitI = this.newListGrupoTinas[i].baldes.split("-");
          if (this.newListGrupoTinas[i].actividad) {//volteado
            auxTinaO.tipoTransaccion = "Volteado";
            auxTinaO.ubicacionParcial = "P MANACRIPEX";
            auxTinaO.estadoTina = "Procesada";
            auxTinaO.balde.ubicacionActual = "P MANACRIPEX";
            auxTinaO.balde.estadoBalde = "Volteado";
            auxTinaO.balde.fechaPDevolucion = null;
          } else {
            auxTinaO.tipoTransaccion = "Prestado";
            auxTinaO.ubicacionParcial = this._ordenESService.formData.destinoProcedencia;
            auxTinaO.estadoTina = "Pendiente Retorno";
            auxTinaO.balde.ubicacionActual = this._ordenESService.formData.destinoProcedencia;
            auxTinaO.balde.estadoBalde = "Prestado";
            if (this.diasPrestamo != null) {
              auxTinaO.balde.setFechaDevolucion(this.diasPrestamo);
            } else auxTinaO.balde.fechaPDevolucion = null;
            this._ordenESService.formData.estadoProceso = "Pendiente Retorno";
          }
          for (var j = 0; j < arrayBaldesSplitI.length; j++) {
            auxTinaO.balde.numBalde = arrayBaldesSplitI[j];
            this._ordenESService.formData.listTinasO.push(JSON.parse(JSON.stringify(auxTinaO)));
          }
        }
      }
    }
    if (this.strFases == "Articulos") {
      if (this._ordenESService.formData.listArticulosO.find(x => x.retorna && x.checkRevision) != undefined) {
        this._ordenESService.formData.estadoProceso = "Procesada Retorno V";
        this._ordenESService.formData.listArticulosO.forEach(x => {
          x.estadoProducto = "Pendiente Verificación";
        });
      } else {
        if (this._ordenESService.formData.tipoOrden == "Salida" && this.listLugarPrioridadIn.find(x => x.nombre == this._ordenESService.formData.destinoProcedencia && (x.categoria == 'Puerto' || x.categoria == 'Planta')) != undefined)
          this._ordenESService.formData.estadoProceso = "Pendiente Verificación";
        if (this._ordenESService.formData.listArticulosO.find(x => x.retorna) != undefined) {//de una vez para saber que tipo de estado tendra la orden
          if (this.ordenESService.formData.estadoProceso == "Procesada")
            this.ordenESService.formData.estadoProceso = "Pendiente Retorno";
          if (this.ordenESService.formData.estadoProceso == "Pendiente Verificación")
            this.ordenESService.formData.estadoProceso = "Pendiente";
        }
      }
      for (var j = 0; j < this.ordenESService.formData.listArticulosO.length; j++) {
        if (this.ordenESService.formData.listArticulosO[j].checkRevision && !this.ordenESService.formData.listArticulosO[j].retorna) {
          this.ordenESService.formData.listArticulosO.splice(j, 1);
          j--;
        } else {
          if (this.ordenESService.formData.listArticulosO[j].retorna && !this.ordenESService.formData.listArticulosO[j].checkRevision) {
            this.ordenESService.formData.listArticulosO[j].estadoProducto = "Pendiente Retorno";
            this.ordenESService.formData.listArticulosO[j].cantidadPendiente = this.ordenESService.formData.listArticulosO[j].cantidad;
          }
          if (this.ordenESService.formData.listArticulosO[j].retorna && this.ordenESService.formData.listArticulosO[j].checkRevision) {
            this.ordenESService.formData.listArticulosO[j].estadoProducto = "Procesada";
            this.ordenESService.formData.listArticulosO[j].cantidadPendiente = this.ordenESService.formData.listArticulosO[j].cantidadPendiente - this.ordenESService.formData.listArticulosO[j].cantidad;
          }
          if (this.ordenESService.formData.estadoProceso == "Pendiente" || this.ordenESService.formData.estadoProceso == "Pendiente Verificación") {
            this.ordenESService.formData.listArticulosO[j].responsableVerificador = "Verificador Pendiente";
            this.ordenESService.formData.listArticulosO[j].estadoProducto = this.ordenESService.formData.estadoProceso;
            if (this.ordenESService.formData.estadoProceso == "Pendiente" && !this.ordenESService.formData.listArticulosO[j].retorna)
              this.ordenESService.formData.listArticulosO[j].estadoProducto = "Pendiente Verificación";
          }

          if (this._ordenESService.formData.listArticulosO[j].inventarioId != null)
            this._ordenESService.formData.listArticulosO[j].producto = null;
          else this._ordenESService.formData.listArticulosO[j].inventario = null;

          if (this._ordenESService.formData.listArticulosO[j].checkInventario && this.ordenESService.formData.planta == "OFICINAS") {
            this._ordenESService.formData.listArticulosO[j].observacion = this._ordenESService.formData.listArticulosO[j].observacion + "@INV-Bg:" + this._ordenESService.formData.listArticulosO[j].inventario.SelectBodega;
          }
        }
      }
    }
    //if (1 == (1 - 1))
    this._ordenESService.insertarOrdenES(this.ordenESService.formData).subscribe(
      (res: any) => {
        this.okBttnSubmit = true;
        if (res.exito == 1) {
          this.toastr.success('Registro satisfactorio', 'Orden Registrada');
          if (res.data.estadoProceso != "Procesada" && (this.ordenESService.formData.tipoOrden == "Entrada" || this.ordenESService.formData.tipoOrden == "Salida")) {
            this.ordenESService.formData.idOrdenES = res.data.idOrdenES;
            this.ordenESService.formData.estadoProceso = res.data.estadoProceso;
            if (!this.buscarGuiaVE)
              this.sendMessageGroupNotification(JSON.parse(JSON.stringify(this.ordenESService.formData)), res.message, res.auxmessage);
          }
          if (res.data.estadoProceso != "Procesada" && (this.ordenESService.formData.tipoOrden == "Balde Entrada" || this.ordenESService.formData.tipoOrden == "Balde Salida")) {
            this.ordenESService.formData.idOrdenES = res.idOrdenES;
            this.ordenESService.formData.estadoProceso = res.data.estadoProceso;
            this.sendMessageGroupNotification(res.data, res.message, res.auxmessage);
          }
          if (this.ordenESService.formData.tipoOrden == "Entrada" || this.ordenESService.formData.tipoOrden == "Salida") {//Control de errores
            if ((this._conexcionService.UserR.rolAsignado != "gpv-o" && (this.ordenESService.formData.destinoProcedencia == "P MANACRIPEX" || this.ordenESService.formData.destinoProcedencia == "PLANTA MANACRIPEX" || this.ordenESService.formData.destinoProcedencia == "MANACRIPEX"))
              || (this._conexcionService.UserR.rolAsignado == "gpv-o" && this.ordenESService.formData.destinoProcedencia == this.ordenESService.formData.planta)) {
              this.sendMessage(this.ordenESService.formData);
            }
          }
          if (this.ordenESService.formData.carroId == null && this.ordenESService.formData.checkCarro && (this.ordenESService.formData.tipoOrden != "Balde Entrada" && this.ordenESService.formData.tipoOrden != "Balde Salida")) {
            this.cargarDataCarro();
          }
          this.resetForm(form);
        } else this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
      });
  }

  buscarExistGuiaBalde(paramO, paramG, paramL) {
    var strParametros = paramO + "@Guía: " + paramG + "@" + paramL;
    this._ordenESService.getExistGuiaBalde(strParametros).subscribe((dato: any) => {
      if (dato.message == "Not Found")
        this.strFases = "Balde";
      else {
        var textoBase = "La Guía: " + paramG + ", se encuentra registrada el " + dato.busqueda.fechaRegistro.substring(0, 10) + " por el usuario: " + dato.busqueda.guardiaCargoUser;
        Swal.fire({
          title: 'Está seguro?',
          text: "Desea continuar, " + textoBase,
          icon: 'warning',
          showCancelButton: true,
          cancelButtonColor: '#E53935',
          confirmButtonText: 'Continuar!',
          cancelButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-info mr-2',
            cancelButton: 'btn btn-danger ml-2'
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            this.strFases = "Balde";
          }
        })
      }
    },
      error => console.error(error)
    );
  }

  buscarGuiaGeneral() {
    var strParametros = this._ordenESService.formData.tipoOrden + "@" + this._ordenESService.formData.planta + "@Guía: " + this._ordenESService.formData.numDocumentacion + "@" + this._ordenESService.formData.destinoProcedencia;
    if (this._ordenESService.formData.numGuiaRetorno != null)
      strParametros = strParametros + "@" + this._ordenESService.formData.numGuiaRetorno;
    else strParametros = strParametros + "@null";
    this._ordenESService.getBGuiaGeneral(strParametros).subscribe((dato: any) => {
      if (dato.message == "Not Found") {
        if (this.buscarGuiaR) {
          this.toastr.warning("No se ha encontrado la Guía: " + this._ordenESService.formData.numGuiaRetorno + ", o no coincide con los datos proporsionados", 'Referencia Fallida');
          this._ordenESService.formData.numGuiaRetorno = null;
        }
        else {
          if (this._ordenESService.formData.tipoOrden == "Balde")
            this.strFases = "Balde";
          else this.strFases = "Articulos";
        }
      } else {
        this.buscarGuiaVE = false;
        switch (dato.message) {
          case "Existe":
            dato.data.fechaRegistro = dato.data.fechaRegistro.substring(0, 10);
            let textoBase = "La Guía: " + this.ordenESService.formData.numDocumentacion + ", se encuentra registrada el " + dato.data.fechaRegistro.substring(0, 10) + " por el usuario: " + dato.data.guardiaCargoUser;
            Swal.fire({
              title: 'Está seguro?',
              text: "Desea continuar, " + textoBase,
              icon: 'warning',
              showCancelButton: true,
              cancelButtonColor: '#E53935',
              confirmButtonText: 'Continuar!',
              cancelButtonText: 'Cancelar',
              customClass: {
                confirmButton: 'btn btn-info mr-2',
                cancelButton: 'btn btn-danger ml-2',
              }
            }).then((result) => {
              if (result.value) {
                if (dato.data.choferId != null) {
                  dato.data.persona = new cPersonal();
                  var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == dato.data.choferId)
                  if (aux != null)
                    dato.data.persona.resetChofer(aux.cedula, aux.empleado);
                }
                this.sendMediaMessage(dato.data);
                if (this._ordenESService.formData.tipoOrden == "Balde")
                  this.strFases = "Balde";
                else this.strFases = "Articulos";
              }
            })
            break;
          case "NPR":
            this.toastr.info("La Guía: " + this.ordenESService.formData.numGuiaRetorno + ", ya se encuentra Procesada Correctamente con anterioridad", 'Guía Procesada');
            break;
          case "SalidaRegistrada":
            this.toastr.info("La Guía: " + this.ordenESService.formData.numDocumentacion + ", ya se encuentra ingresada en " + this.ordenESService.formData.destinoProcedencia, 'Guía Registrada');
            break;
          case "EntradaV":
            this.buscarGuiaVE = true;
            this.ordenESService.formData.listArticulosO = [];
            for (var i = 0; i < dato.data.listArticulosO.length; i++) {
              this.ordenESService.formData.agregarOneArticulo(dato.data.listArticulosO[i]);
              var indexN = this._ordenESService.formData.listArticulosO.length - 1;
              this._ordenESService.formData.listArticulosO[indexN].observacion = "";
              this._ordenESService.formData.listArticulosO[indexN].responsableVerificador = null;
              if (this._ordenESService.formData.listArticulosO[indexN].estadoProducto == "Pendiente")
                this._ordenESService.formData.listArticulosO[indexN].estadoProducto = "Pendiente Retorno";
              if (this._ordenESService.formData.listArticulosO[indexN].estadoProducto == "Pendiente Verificación")
                this._ordenESService.formData.listArticulosO[indexN].estadoProducto = "Procesada";
            }
            this.paginacion.getNumberIndex(this.ordenESService.formData.listArticulosO.length);
            this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
            this.strFases = "Articulos";
            break;
          case "GuiaR":
            this.ordenESService.formData.listArticulosO = [];
            for (var i = 0; i < dato.data.length; i++) {
              for (var j = 0; j < dato.data[i].listArticulosO.length; j++) {
                this.ordenESService.formData.agregarOneArticulo(dato.data[i].listArticulosO[j], 1);
              }
            }
            this.paginacion.getNumberIndex(this._ordenESService.formData.listArticulosO.length);
            this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
            this.strFases = "Articulos";
            break;
          case "GuiaRE":
            this.buscarGuiaVE = true;
            this.ordenESService.formData.listArticulosO = [];
            for (var i = 0; i < dato.data.length; i++) {
              for (var j = 0; j < dato.data[i].listArticulosO.length; j++) {
                this.ordenESService.formData.agregarOneArticulo(dato.data[i].listArticulosO[j], 1);
              }
            }
            for (var i = 0; i < dato.auxData.listArticulosO.length; i++) {
              var indexEncontrada: number;
              if (dato.auxData.listArticulosO[i].inventarioId != null)
                indexEncontrada = this._ordenESService.formData.listArticulosO.findIndex(x => x.inventarioId == dato.auxData.listArticulosO[i].inventarioId);
              else indexEncontrada = this._ordenESService.formData.listArticulosO.findIndex(x => x.productoId == dato.auxData.listArticulosO[i].productoId);
              if (indexEncontrada != -1) {//no esta entrando debido a q al momento de salir no se pone la de pendiente de Verificación y en la base solo me trae los que tienen pendiente de revición
                console.log("la cant es: " + dato.auxData.listArticulosO[i].cantidad)
                this._ordenESService.formData.listArticulosO[indexEncontrada].cantidad = dato.auxData.listArticulosO[i].cantidad;
                this._ordenESService.formData.listArticulosO[indexEncontrada].retorna = true;
              } else {
                this.ordenESService.formData.agregarOneArticulo(dato.auxData.listArticulosO[i]);
                var indexN = this._ordenESService.formData.listArticulosO.length - 1;
                this._ordenESService.formData.listArticulosO[indexN].observacion = "";
                this._ordenESService.formData.listArticulosO[indexN].responsableVerificador = null;
                if (this._ordenESService.formData.listArticulosO[indexN].estadoProducto == "Pendiente")
                  this._ordenESService.formData.listArticulosO[indexN].estadoProducto = "Pendiente Retorno";
                if (this._ordenESService.formData.listArticulosO[indexN].estadoProducto == "Pendiente Verificación")
                  this._ordenESService.formData.listArticulosO[indexN].estadoProducto = "Procesada";
              }
            }
            this.paginacion.getNumberIndex(this.ordenESService.formData.listArticulosO.length);
            this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
            this.strFases = "Articulos";
            break;
        }
      }
    },
      error => console.error(error)
    );
  }

  buscarBaldesPrestados(paramP, paramL) {
    var strParametros = paramP + "@true@" + paramL;
    this._baldesService.getBaldesParams(strParametros).subscribe((datos: any) => {
      if (datos.message != "Not Found")
        this.listBaldesPrestados = datos;
      else this.onNewTinas();
    },
      error => console.error(error)
    );
  }

  onComprobarVBaldes(form: NgForm, indiceNewb?: number) {//creo q aqui debo ahcer un comprobar
    this._numTotalBaldes = this._multiBalde.length;
    var arrayBaldesSplitI: any[] = [];
    var arrayBaldesSplitJ: any[] = [];

    if (indiceNewb != undefined) {
      this.newListGrupoTinas[indiceNewb].error = false;
      if (form.controls["in" + indiceNewb + "baldes"].status == "INVALID")
        this.newListGrupoTinas[indiceNewb].error = true;
    }

    for (var i = 0; i < this.newListGrupoTinas.length; i++) {
      this.newListGrupoTinas[i].baldesRepetidos = "";
      arrayBaldesSplitI = this.newListGrupoTinas[i].baldes.split("-");
      this._numTotalBaldes = arrayBaldesSplitI.length + this._numTotalBaldes;

      if (this._ordenESService.formData.tipoDocumentacion == "Entrada" && this.listBaldesPrestados.length > 0 && this.multiBalde.length > 0) {
        for (var k = 0; k < this._multiBalde.length; k++) {
          if (arrayBaldesSplitI.find(x => x == this._multiBalde[k]) != undefined) {
            this.newListGrupoTinas[i].baldesRepetidos = this.newListGrupoTinas[i].baldesRepetidos + "-" + this._multiBalde[k];
            form.control.controls["in" + i + "baldes"].setErrors({ 'repeat': true });
          }
        }
      }
      for (var j = 0; j < this.newListGrupoTinas.length; j++) {
        arrayBaldesSplitJ = this.newListGrupoTinas[j].baldes.split("-");
        for (var k = 0; k < arrayBaldesSplitJ.length; k++) {
          if (i != j) {
            if (arrayBaldesSplitI.find(x => x == arrayBaldesSplitJ[k] && this.newListGrupoTinas[j].propietario == this.newListGrupoTinas[i].propietario) != undefined) {
              this.newListGrupoTinas[i].baldesRepetidos = this.newListGrupoTinas[i].baldesRepetidos + "-" + arrayBaldesSplitJ[k];
              form.control.controls["in" + i + "baldes"].setErrors({ 'repeat': true });
            }
          } else {
            if (arrayBaldesSplitI.filter(x => x == arrayBaldesSplitJ[k]).length > 1) {
              form.control.controls["in" + i + "baldes"].setErrors({ 'repeat': true });
            }
          }
        }
      }
    }
    this.comprobarNewT();
  }

  recibirRes(salir: boolean, tipo: string) {
    if (tipo == "proveedor")
      this.proveedorIsOpened = !salir;
    if (tipo == "devolucion")
      this.devolucionIsOpened = !salir;
    this.strFases = "Inicio";
  }
  //Listo
  convertPdf(orden: cOrdenEs) {
    var y: number;
    var auxCol1 = 25;
    var auxCol2 = 0;
    var auxCol3 = 0;
    var auxCol4 = 0;

    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold")
    doc.text("Orden de " + orden.tipoOrden, 80, 25);

    y = 30;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 45));//left
    doc.line(199, y, 199, (y + 45));//right
    doc.line(9, (y + 45), 199, (y + 45));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 10));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);

    if (orden.tipoOrden == "Salida" || orden.tipoOrden == "Balde Salida") {
      doc.text("Salida de: " + orden.planta, 20, (y + 15));
      doc.text("Fecha Saliente: " + orden.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Destino: " + orden.destinoProcedencia, 20, (y + 25));
    }
    if (orden.tipoOrden == "Entrada" || orden.tipoOrden == "Balde Entrada") {
      doc.text("Entrada a: " + orden.planta, 20, (y + 15));
      doc.text("Fecha de Ingreso: " + orden.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Procedencia: " + orden.destinoProcedencia, 20, (y + 25));
    }
    doc.text("Documentación " + orden.numDocumentacion, 105, (y + 15));
    doc.text("Hora de Registro: " + orden.horaRegistro, 105, (y + 20));
    if (orden.tipoOrden != "Balde Entrada" && orden.tipoOrden != "Balde Salida")
      doc.text("Responsable de orden: " + orden.responsableES, 20, (y + 30));
    else doc.text("Responsable de la Transferencia: " + orden.responsableES, 20, (y + 30));
    doc.text("Usuario Sistema: " + orden.guardiaCargoUser, 20, (y + 35));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 20, (y + 40));

    y = y + 45;
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down

    if (orden.tipoOrden != "Balde Entrada" && orden.tipoOrden != "Balde Salida") {
      doc.setFontSize(13);
      doc.setFont("arial", "bold")
      doc.text("Datos de la persona", 15, (y + 10));
      doc.setFontSize(11);
      doc.setFont("arial", "normal")
      doc.text("Cédula: " + orden.persona.cedula, 20, (y + 15));
      doc.text("Nombre: " + orden.persona.nombreP, 20, (y + 20));
      if (orden.persona.tipoPersona != "Desconocido")
        doc.text("Tipo de persona: " + orden.persona.tipoPersona, 20, (y + 25));
      if (orden.persona.empresa != "Desconocido")
        doc.text("Empresa: " + orden.persona.empresa, 20, (y + 30));

      if (orden.carroId != null) {
        doc.setFontSize(13);
        doc.setFont("arial", "bold")
        doc.text("Datos del vehículo", 105, (y + 10));
        doc.setFont("arial", "normal")
        doc.setFontSize(11);
        doc.text("Número de placa: " + orden.carro.numMatricula, 105, (y + 15));
        if (orden.choferId != null)
          doc.text("Propietario: " + orden.carro.propietario, 105, (y + 20));
        else
          doc.text("Tpo de Vehículo: Privado", 105, (y + 20));
        if (orden.carro.marca != "Desconocido" && orden.carro.colorCarro != "Desconocido") {
          doc.text("Marca: " + orden.carro.marca, 105, (y + 25));
          doc.text("Color: " + orden.carro.colorCarro, 105, (y + 30));
        }
      }
      y = y + 35;
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right
      doc.line(9, (y + 10), 199, (y + 10));//down
      doc.setFontSize(13);
      doc.setFont("arial", "bold");
      doc.text("Lista de Productos", 80, (y + 7));
      doc.setFontSize(11);
      doc.setFont("arial", "normal");

      y = y + 10;
      doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right

      doc.text("#", 13, (y + 7));
      doc.line(20, y, 20, (y + 10));//right

      auxCol2 = 62 + auxCol1;
      auxCol3 = 50 + auxCol2;
      auxCol4 = 25 + auxCol3;
      doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
      doc.text("Retorna", auxCol3, (y + 7));
      doc.text("Producto", auxCol1, (y + 7));
      doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
      doc.text("Observación", auxCol2, (y + 7));
      doc.line(auxCol4 - 5, y, auxCol4 - 5, (y + 10));//right
      doc.text("Estado", auxCol4, (y + 7));

      doc.setFontSize(9);
      y = y + 10;

      var valorG: number = 0;
      var valorO: number = 0;
      var lineaDescripcion;
      var lineaObservacion;
      var auxPrueba: number;
      var auxPrueba2: number;

      for (var i = 0; i < orden.listArticulosO.length; i++) {
        if (orden.listArticulosO[i].inventarioId != null)
          lineaDescripcion = doc.splitTextToSize(orden.listArticulosO[i].inventario.nombre, (auxCol2 - auxCol1 - 5));
        else lineaDescripcion = doc.splitTextToSize(orden.listArticulosO[i].producto.nombre, (auxCol2 - auxCol1 - 5));
        lineaObservacion = doc.splitTextToSize(orden.listArticulosO[i].observacion, (auxCol3 - auxCol2 - 5));
        valorG = (3 * lineaDescripcion.length) + 4;
        valorO = (3 * lineaObservacion.length) + 4;
        if (valorO > valorG)
          valorG = valorO;
        y = y + valorG;

        if (y > 280) {
          doc.addPage();
          doc.setFontSize(11);
          y = 30;

          doc.line(9, y, 199, y);//down +10y1y2
          doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
          doc.line(9, y, 9, (y + 10));//left
          doc.line(199, y, 199, (y + 10));//right
          doc.text("#", 13, (y + 7));
          doc.line(20, y, 20, (y + 10));//right
          doc.text("Producto", auxCol1, (y + 7));
          doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
          doc.text("Observación", auxCol2, (y + 7));
          doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
          doc.text("Retorna", auxCol3, (y + 7));
          doc.line(auxCol4 - 5, y, auxCol4 - 5, (y + 10));//right
          doc.text("Estado", auxCol4, (y + 7));
          y = y + 10 + valorG;
          doc.setFontSize(9);
        }
        auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2) + 3;//mega formula para centrar el texto en el espacio establecido
        auxPrueba2 = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2) + 3;//mega formula para centrar el texto en el espacio establecido
        doc.line(9, (y - valorG), 9, y);//left
        doc.text(orden.listArticulosO[i].cantidad.toString(), 13, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(lineaDescripcion, auxCol1, (y - valorG + auxPrueba));
        doc.line(auxCol2 - 5, (y - valorG), auxCol2 - 5, y);//right
        doc.text(lineaObservacion, auxCol2, (y - valorG + auxPrueba2));
        doc.line(auxCol4 - 5, (y - valorG), auxCol4 - 5, y);//right
        doc.text(orden.listArticulosO[i].estadoProducto, auxCol4, (y - ((valorG - 3) / 2)));
        doc.line(199, (y - valorG), 199, y);//right
        doc.line(auxCol3 - 5, (y - valorG), auxCol3 - 5, y);//right
        if (orden.listArticulosO[i].retorna)
          doc.text("SI", auxCol3 + 5, (y - ((valorG - 3) / 2)));
        else doc.text("NO", auxCol3 + 5, (y - ((valorG - 3) / 2)));
        doc.line(9, y, 199, y);//down +10y1y2
      }
    } else {
      doc.setFontSize(13);
      doc.setFont("arial", "bold")
      doc.text("Reporte Tinas", 15, (y + 10));
      doc.text("Datos del vehículo", 105, (y + 10));
      doc.setFont("arial", "normal")
      doc.setFontSize(11);

      doc.text("Número total de tinas: " + orden.listTinasO.length, 20, (y + 15));
      doc.text("Tinas para Revisión: " + orden.listTinasO.filter(x => x.estadoTina == "Pendiente" || x.estadoTina == "Revisión").length, 20, (y + 20));
      if (orden.tipoOrden == "Balde Salida") {
        doc.text("Tinas Prestadas: " + orden.listTinasO.filter(x => x.tipoTransaccion == "Prestado").length, 20, (y + 25));
        doc.text("Tinas Volteadas: " + orden.listTinasO.filter(x => x.tipoTransaccion == "Volteado").length, 20, (y + 30));
      }
      doc.text("Número de placa: " + orden.carro.numMatricula, 105, (y + 15));
      doc.text("Tpo de Vehículo: Privado", 105, (y + 20));
      if (orden.carro.marca != "Desconocido" && orden.carro.colorCarro != "Desconocido") {
        doc.text("Marca: " + orden.carro.marca, 105, (y + 25));
        doc.text("Color: " + orden.carro.colorCarro, 105, (y + 30));
      }

      y = y + 35;
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right
      doc.line(9, (y + 10), 199, (y + 10));//down
      doc.setFontSize(13);
      doc.setFont("arial", "bold");
      doc.text("Lista de Baldes", 80, (y + 7));
      doc.setFontSize(11);
      doc.setFont("arial", "normal");

      y = y + 10;
      doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right

      auxCol1 = 55;
      auxCol2 = 45 + auxCol1;
      auxCol3 = 50 + auxCol2;

      doc.text("# Número Balde", 13, (y + 7));
      doc.line(auxCol1 - 5, y, auxCol1 - 5, (y + 10));//right
      doc.text("Tipo Transacción", auxCol1, (y + 7));
      doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
      doc.text("Ubicación", auxCol2, (y + 7));
      doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
      doc.text("Estado", auxCol3, (y + 7));

      doc.setFontSize(10);

      y = y + 10;

      for (var i = 0; i < orden.listTinasO.length; i++) {
        valorG = 7;
        y = y + valorG;

        if (y > 280) {
          doc.addPage();
          doc.setFontSize(11);
          y = 30;

          doc.line(9, y, 199, y);//down +10y1y2
          doc.line(9, (y + 10), 199, (y + 10));//down +10y1y2
          doc.line(9, y, 9, (y + 10));//left
          doc.line(199, y, 199, (y + 10));//right
          doc.text("# Número Balde", 13, (y + 7));
          doc.line(auxCol1 - 5, y, auxCol1 - 5, (y + 10));//right
          doc.text("Tipo Transacción", auxCol1, (y + 7));
          doc.line(auxCol2 - 5, y, auxCol2 - 5, (y + 10));//right
          doc.text("Ubicación", auxCol2, (y + 7));
          doc.line(auxCol3 - 5, y, auxCol3 - 5, (y + 10));//right
          doc.text("Estado", auxCol3, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(10);
        }

        doc.line(9, (y - valorG), 9, y);//left
        doc.text(orden.listTinasO[i].balde.numBalde.toString(), 25, y - 2.5);
        doc.line(auxCol1 - 5, (y - valorG), auxCol1 - 5, y);//right
        doc.text(orden.listTinasO[i].tipoTransaccion, auxCol1, y - 2.5);
        doc.line(auxCol2 - 5, (y - valorG), auxCol2 - 5, y);//right
        doc.text(orden.listTinasO[i].ubicacionParcial, auxCol2, y - 2.5);
        doc.line(auxCol3 - 5, (y - valorG), auxCol3 - 5, y);//right
        doc.text(orden.listTinasO[i].estadoTina, auxCol3, y - 2.5);
        doc.line(199, (y - valorG), 199, y);//right
        doc.line(9, y, 199, y);//down +10y1y2
      }
    }
    return (doc.output('datauristring'));
  }

  /*onImagenSeleccioanda(file: FileList, strCap?: string) {
    strCap = "prueba";
    var reader = new FileReader();
    var auxWhatsapp: cWhatsapp;
    var auxNombre = file[0].name.split(".");
    var self = this;
    reader.readAsDataURL(file[0]);
    auxWhatsapp = {
      phone: "+(593)988964391",
      title: auxNombre[0],
      caption: "prueba con el caption 2 now",
      media: "",
      message: "prueba :smile: 2 con texxto",
      type: file[0].type
    }
    //auxWhatsapp.phone="593999786121";
    auxWhatsapp.phone="593984958499";
    reader.addEventListener("load", function (event: any) {
      var rutaCompleta = event.target.result.toString();
      var auxparte = rutaCompleta.split("base64,");
      auxWhatsapp.media = auxparte[1];
      console.table(auxWhatsapp);
      self._whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
        res => {
          self.toastr.warning('Mensaje', 'Correcto');
        },
        err => {
          console.log(err);
        }
      )
    });
  }*/
  /*onImagenSeleccioandaG(file: FileList, strCap?: string) {
    var reader = new FileReader();
    var auxWhatsapp: cWhatsapp;
    var auxNombre = file[0].name.split(".");
    var self = this;
    reader.readAsDataURL(file[0]);
    auxWhatsapp = {
      chatname: "Prueba ES",
      title: auxNombre[0],
      caption: "El caption para imagen",
      media: "",
      message: "El mensaje para cualquer documento",
      type: file[0].type
    }
    reader.addEventListener("load", function (event: any) {
      var rutaCompleta = event.target.result.toString();
      var auxparte = rutaCompleta.split("base64,");
      auxWhatsapp.media = auxparte[1];
      self._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
        res => {
          self.toastr.warning('Mensaje', 'Correcto');
        },
        err => {
          console.log(err);
        }
      )
    });
  }*/
  /*logoutWhatsapp(){
    var aux: cWhatsapp;
    aux = {
      password: "12345A",
      message: ""
    }
    this._whatsappService.logoutWhatsapp(aux).subscribe(
      res => {
        console.table(res);
        this.toastr.warning('Mensaje', 'Correcto');
      },
      err => {
        console.log(err);
      }
    )
  }*/
  /*buscarGroupchat() {
    var aux: cWhatsapp;
    aux = {
      phone: "593984958499",
    }
    this._whatsappService.buscarContact(aux).subscribe(
      res => {
        console.table(res);
        this.toastr.warning('Mensaje', 'Correcto');
      },
      err => {
        console.log(err);
      }
    )
  }*/
  /*viewAllContacts() {
     this._whatsappService.viewAllContacts().subscribe(
       res => {
         console.table(res);
       },
       err => {
         console.log(err);
       }
     )
   }*/
  /*onSendMultipleMessage(file: FileList) {
    var auxPhones:string[]=["+(593)988964391","593999786121","593984958499"];
    var reader = new FileReader();
    var auxWhatsapp: cWhatsapp;
    var auxNombre = file[0].name.split(".");
    var self = this;
    reader.readAsDataURL(file[0]);
    auxWhatsapp = {
      phones:auxPhones,
      title: auxNombre[0],
      caption: "prueba 1 con el caption",
      media: "",
      message: "prueba 1 :smile: con texto",
      type: file[0].type
    }
    reader.addEventListener("load", function (event: any) {
      var rutaCompleta = event.target.result.toString();
      var auxparte = rutaCompleta.split("base64,");
      auxWhatsapp.media = auxparte[1];
      console.table(auxWhatsapp);
      self._whatsappService.sendMultipleMessageWhat(auxWhatsapp).subscribe(
        res => {
          console.table(res);
          self.toastr.warning('Mensaje', 'Correcto');
        },
        err => {
          console.log(err);
        }
      )
    });
  }*/

  //Listo
  sendMessage(ordenES: cOrdenEs) {
    var aux: cWhatsapp;
    aux = {
      phone: "593960044851",
      message: ':bell: *Notificación Dato Inconsistente*:exclamation: :bell:'
        + '\n'
        + '\n:wave: Saludos Compañero:'
        + '\nSe le informa que se ha registrado una orden de *' + ordenES.tipoOrden + '* con lugar *' + ordenES.destinoProcedencia + '*,'
        + ' estar pendiente y realizar los cambios respectivos.'
        + '\nLos datos de la Orden Inconsistente son:'
        + '\n'
        + '\n*' + ordenES.numDocumentacion + '*'
        + '\n*Fecha:* ' + ordenES.fechaRegistro + ' ' + ordenES.horaRegistro
        + '\n*Usuario Guardia:* ' + ordenES.guardiaCargoUser
        + '\n----------------------------------'
    }
    if (this._conexcionService.UserR.UserName == "daniel3" || this._conexcionService.UserR.UserName == "mariazabalu")
      aux.phone = "593999786121";
    if (this._conexcionService.UserR.rolAsignado == "gpv-o" && this._conexcionService.UserR.PhoneNumber != null)
      aux.phone = this._conexcionService.UserR.PhoneNumber;
    this.whatsappService.sendMessageWhat(aux).subscribe(
      res => {

      },
      err => {
        console.log(err);
      }
    )
  }

  sendMediaMessage(orden: cOrdenEs) {
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp;
    auxWhatsapp = {
      phone: "593960044851",
      message: "",
      title: orden.tipoOrden + "_" + orden.fechaRegistro + "-" + orden.numDocumentacion + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    auxWhatsapp.message = ':bell: *Notificación Dato Duplicado *:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos Compañero:'
      + '\nSe le informa que se ha registrado una nueva orden de *' + orden.tipoOrden + '*'
      + ' que coincide con una orden previamente ingresada la fecha .*' + orden.fechaRegistro + '*'
      + '\nLos datos de la Orden Previamente ingresada es:'
      + '\n'
      + '\n*' + orden.numDocumentacion + '*'
      + '\n*Despachada por:* ' + orden.planta
      + '\n*Lugar:* ' + orden.destinoProcedencia
      + '\n*Usuario Guardia:* ' + orden.guardiaCargoUser
      + '\n----------------------------------';

    if (this._conexcionService.UserR.UserName == "daniel3")
      auxWhatsapp.phone = "593999786121";
    if (this._conexcionService.UserR.rolAsignado == "gpv-o")
      auxWhatsapp.phone = this._conexcionService.UserR.PhoneNumber;
    this._whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
      res => {
        if (res.status != "error")
          this.toastr.success('Mensaje enviado Correctamente', 'Notificación enviada');
      },
      err => {
        console.log(err);
      }
    )
  }

  sendMessageGroupNotification(orden: cOrdenEs, retornaCompleto?: string, baldesIncorrectos?: string) {
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp = {
      chatname: "",
      message: "",
      title: orden.tipoOrden + "_" + orden.fechaRegistro + "-" + orden.numDocumentacion + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }

    var encabezado: string;
    var asunto: string = orden.tipoOrden;

    if (orden.tipoOrden == "Entrada" || orden.tipoOrden == "Salida") {
      if (orden.estadoProceso == 'Pendiente' || orden.estadoProceso == 'Pendiente Verificación' || orden.estadoProceso == 'Pendiente Retorno') {
        encabezado = ':bell: *Notificación ' + orden.tipoOrden + ' ' + orden.planta + '* :bell:';
        asunto = "salida de *" + orden.planta + "* con destino a *";
        if (orden.tipoOrden == "Entrada")
          asunto = "entrada a *" + orden.planta + "* proveniente de *";
        if (orden.estadoProceso == "Pendiente" || orden.estadoProceso == "Pendiente Verificación") {
          if (this._conexcionService.UserR.UserName == "daniel3" || this._conexcionService.UserR.UserName == "MARIAZABALU")
            auxWhatsapp.chatname = "Prueba Muelle";
          else auxWhatsapp.chatname = "Despachos MCP-MUELLE";

          auxWhatsapp.message = encabezado
            + '\n'
            + '\n:wave: Saludos Compañeros:'
            + '\nSe les informa que se ha generado una salida hacia :anchor: *' + orden.destinoProcedencia + '*'
            + '\nLos datos de la Orden de salida son:'
            + '\n'
            + '\n*' + orden.numDocumentacion + '*'
            + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
            + '\n*Encargado del Transporte :truck::* ' + orden.persona.nombreP
            + '\n----------------------------------'
            + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
            + '\n----------------------------------';
          if (baldesIncorrectos != "Seguir") {
            if (orden.destinoProcedencia != "P MANACRIPEX" && orden.destinoProcedencia != "OFICINAS")
              this._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
                res => {
                  if (res.status == "error")
                    this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
                  else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
                },
                err => {
                  console.log(err);
                }
              );
          } else {
            auxWhatsapp.phone ='593-939335731';
            this._whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
              res => {
                if (res.status != "error")
                  this.toastr.success('Mensaje enviado Correctamente', 'Notificación enviada');
              },
              err => {
                console.log(err);
              }
            )
          }
        }
        if (orden.estadoProceso == "Pendiente" || orden.estadoProceso == "Pendiente Retorno") {
          if (this._conexcionService.UserR.UserName == "daniel3" || this._conexcionService.UserR.UserName == "MARIAZABALU")
            auxWhatsapp.chatname = "Prueba ES";
          else auxWhatsapp.chatname = "MCPx Seguimiento ES";
          auxWhatsapp.message = encabezado
            + '\n'
            + '\n:wave: Saludos Compañeros:'
            + '\nSe informa que se ha generado una ' + asunto + orden.destinoProcedencia + '*,'
            + ' estar pendientes a su respectivo retorno'
            + '\nLos datos de la Orden son:'
            + '\n'
            + '\n*' + orden.numDocumentacion + '*'
            + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
            + '\n*Encargado del Transporte :truck::* ' + orden.persona.nombreP
            + '\n*Usuario Guardia:* ' + orden.guardiaCargoUser
            + '\n----------------------------------'
            + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
            + '\n----------------------------------';
          this._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
            res => {
              if (res.status == "error")
                this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
              else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
            },
            err => {
              console.log(err);
            }
          )
        }
      }
      if (orden.estadoProceso == "Procesada Retorno V") {
        var asunto2 = ", seguir estando pendientes/atentos ya que aun faltan retornar ciertos artículos.";
        if (retornaCompleto != "AR") {
          var auxRC = retornaCompleto.split("R-");
          asunto2 = "\nLa " + auxRC[1] + " se encuentra *Procesada* :white_check_mark: terminando así el seguimiento de la orden."
        }
        if (this._conexcionService.UserR.UserName == "daniel3" || this._conexcionService.UserR.UserName == "MARIAZABALU")
          auxWhatsapp.chatname = "Prueba ES";
        else auxWhatsapp.chatname = "MCPx Seguimiento ES";

        encabezado = ':bell: *Notificación de ' + orden.tipoOrden + ' de Retorno ' + orden.planta + '* :bell:';
        asunto = "salida de *" + orden.planta + "* con destino a *";
        if (orden.tipoOrden == "Entrada")
          asunto = "entrada a *" + orden.planta + "* proveniente de *";

        auxWhatsapp.message = encabezado
          + '\n'
          + '\n:wave: Saludos Compañeros:'
          + '\nSe informa que se ha generado un retorno de ' + asunto + orden.destinoProcedencia + '*'
          + asunto2
          + '\nLos datos de la Orden son:'
          + '\n'
          + '\n*' + orden.numDocumentacion + '*'
          + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
          + '\n*Encargado del Transporte :truck::* ' + orden.persona.nombreP
          + '\n----------------------------------'
          + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
          + '\n----------------------------------';

        this._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
          res => {
            if (res.status == "error")
              this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
            else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
          },
          err => {
            console.log(err);
          }
        );

        if (orden.tipoOrden == "Salida" && (this.listLugarPrioridadIn.find(x => x.nombre == orden.destinoProcedencia && (x.categoria == 'Puerto')) != undefined)) {
          orden.estadoProceso = "Pendiente Verificación";
          this.sendMessageGroupNotification(orden);
        }
      }
    } else {
      if (orden.estadoProceso == "Pendiente Retorno" || orden.estadoProceso == "Pendiente") {
        encabezado = ':bell: *Notificación Salida Baldes' + ' Planta MANACRIPEX* :bell:';
        asunto = "salida de *P MANACRIPEX* con destino a *";

        if (this._conexcionService.UserR.UserName == "daniel3")
          auxWhatsapp.chatname = "Prueba ES"
        else auxWhatsapp.chatname = "MCPx Tinas Seguimiento";

        auxWhatsapp.message = encabezado
          + '\n'
          + '\n:wave: Saludos Compañeros:'
          + '\nSe informa que se ha generado una ' + asunto + orden.destinoProcedencia + '*,'
          + ' estar pendientes a su respectivo retorno'
          + '\nLos datos de la Orden son:'
          + '\n'
          + '\n*' + orden.numDocumentacion + '*'
          + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
          + '\n*Placa Transporte :truck::* ' + orden.carro.numMatricula
          + '\n*Usuario Guardia:* ' + orden.guardiaCargoUser
          + '\n----------------------------------'
          + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
          + '\n----------------------------------';

        this._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
          res => {
            if (res.status == "error")
              this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
            else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
          },
          err => {
            console.log(err);
          }
        );
      }
      if (orden.estadoProceso == "Revisión" || orden.estadoProceso == "Pendiente") {
        encabezado = ':bell: *Notificación Entrada Baldes* :bell:';
        asunto = "entrada proveniente de *";
        if (orden.tipoOrden == "Balde Salida") {
          encabezado = ':bell: *Notificación Salida Baldes* :bell:';
          asunto = "salida con destino a *";
        }

        if (this._conexcionService.UserR.UserName == "daniel3")
          auxWhatsapp.chatname = "Prueba ES"
        else auxWhatsapp.chatname = "MCPx Tinas Seguimiento";

        auxWhatsapp.message = encabezado
          + '\n'
          + '\n:wave: Saludos Compañeros:'
          + '\nSe informa que se ha generado una ' + asunto + orden.destinoProcedencia + '*,'
          + ' la orden registra incongruencia en ciertos baldes, por favor revisar dichas tinas.'
          + '\nLos datos de la Orden son:'
          + '\n'
          + '\n*' + orden.numDocumentacion + '*'
          + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
          + '\n*Placa Transporte :truck::* ' + orden.carro.numMatricula
          + '\n*Usuario Guardia:* ' + orden.guardiaCargoUser
          + '\n*Baldes con errores:* ' + baldesIncorrectos
          + '\n----------------------------------'
          + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
          + '\n----------------------------------';

        this._whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
          res => {
            if (res.status == "error")
              this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
            else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
          },
          err => {
            console.log(err);
          }
        );
      }
    }
  }
}
