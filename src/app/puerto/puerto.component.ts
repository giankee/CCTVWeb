import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { ConexionService } from '../shared/otrosServices/conexion.service';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { faCircle, faSignOutAlt, faSave, faQuestion, faSort, faSearch, faArrowAltCircleLeft, faArrowAltCircleRight, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { cEnterpriceEmpleados } from '../shared/otrosServices/varios';
import { OrdenESService } from '../shared/orden-es.service';
import { cOrdenEs, cArticulosO, cGaleriaArchivosOrdenES } from '../shared/ordenEs';
import { cPersonal } from '../shared/basicos';
import { ApiEnterpriceService } from '../shared/otrosServices/api-enterprice.service';
import Swal from 'sweetalert2';
import { cPaginacion } from '../shared/otrosServices/paginacion';

@Component({
  selector: 'app-puerto',
  templateUrl: './puerto.component.html',
  styleUrls: ['./puerto.component.css']
})
export class PuertoComponent implements OnInit {
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
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
  }

  public onlineEvent: Observable<Event>;
  public offlineEvent: Observable<Event>;
  public subscriptions: Subscription[] = [];

  filtroOrden = '';
  okAyuda: boolean = false;
  ordenNombre = "default";
  onCambiarPage: boolean = true;
  strES = "Salida";
  btnVerificacion: boolean = true;
  /**Para pagination Entrada*/
  paginacion = new cPaginacion(25);
  /**Fin paginatacion */

  listOrdenesMostrar: cOrdenEs[] = [];
  listChoferesIn: cEnterpriceEmpleados[] = [];
  resultBusquedaMostrar: cOrdenEs[] = [];
  spinnerOnOff: boolean = false;

  facircle = faCircle; fasignOut = faSignOutAlt; fasave = faSave; faquestion = faQuestion; sort = faSort; fasearch = faSearch; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faFileUpload = faFileUpload;
  constructor(private _userService: UserService, private router: Router, private _conexcionService: ConexionService, private _ordenESService: OrdenESService, private _enterpriceService: ApiEnterpriceService) { }

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
          rolAsignado: res.rolAsignado,
          nombreU: res.nombreU
        }
        this.cargarDataChoferes();
      },
      err => {
        console.log(err);
      },
    );
  }

  cargarData() {//Datos de los ordenes traidos desde db
    if (this._conexcionService.UserR.rolAsignado == "verificador-m"||this._conexcionService.UserR.rolAsignado == "bodega_verificador-m")
      this.strES = "Entrada";
    this._ordenESService.getListOrdenesESVerificacion(this.strES)
      .subscribe(dato => {
        this.listOrdenesMostrar = [];
        if (this._conexcionService.UserR.rolAsignado == "verificador-p")
          this.listOrdenesMostrar = dato.filter(x => x.destinoProcedencia != "OFICINAS" && x.destinoProcedencia != "P MANACRIPEX");
        if (this._conexcionService.UserR.rolAsignado == "verificador-m"||this._conexcionService.UserR.rolAsignado == "bodega_verificador-m")
          this.listOrdenesMostrar = dato.filter(x => x.planta == "P MANACRIPEX");
        if (this._conexcionService.UserR.rolAsignado == "gpv-o")
          this.listOrdenesMostrar = JSON.parse(JSON.stringify(dato));

        this.listOrdenesMostrar.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
          if (y.choferId != null) {
            y.persona = new cPersonal();
            var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
            if (aux != null)
              y.persona.resetChofer(aux.cedula, aux.empleado);
          }
          if (this._conexcionService.UserR.rolAsignado != "verificador-m"&& this._conexcionService.UserR.rolAsignado != "bodega_verificador-m") {
            y.listArticulosO.forEach(y1 => {
              y1.checkRevision = false;
              if (y1.estadoProducto == "Procesada" || y1.estadoProducto == "Pendiente Retorno")
                y1.checkRevision = true;
            });
          }
        });
        this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
        this.paginacion.updateIndex(0);
      },
        error => console.error(error)
      );
  }

  cargarDataChoferes() {//Datos del choferes traidos desde db
    this._enterpriceService.getPersonalEnter("Choferes")
      .subscribe(dato => {
        this.listChoferesIn = dato;
        this.cargarData();
      },
        error => console.error(error));
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
    this.paginacion.updateIndex(0);
  }
  
  getDataFiltro(n) {//Para q la filtracion de datos se automatica
    if(n!=undefined)
      this.paginacion.getNumberIndex(n);
  }

  onChangeBusqueda(op: number) {
    if (op == 1 && !this.btnVerificacion) {
      this.btnVerificacion = true;
      this.listOrdenesMostrar = [];
      this.cargarData();
    }
    if (op == 2 && this.btnVerificacion) {
      this.strES = "Salida";
      this.btnVerificacion = false;
      this._ordenESService.getGuiaPendienteRPlanta()
        .subscribe(dato => {
          this.listOrdenesMostrar = [];
          if (this._conexcionService.UserR.rolAsignado == "verificador-p")
            this.listOrdenesMostrar = dato.filter(x => x.destinoProcedencia != "OFICINAS" && x.destinoProcedencia != "P MANACRIPEX");
          if (this._conexcionService.UserR.rolAsignado == "verificador-m"||this._conexcionService.UserR.rolAsignado == "bodega_verificador-m")
            this.listOrdenesMostrar = dato.filter(x => x.planta == "P MANACRIPEX");
          if (this._conexcionService.UserR.rolAsignado == "gpv-o")
            this.listOrdenesMostrar = JSON.parse(JSON.stringify(dato));

          this.listOrdenesMostrar.forEach(y => {
            y.fechaRegistro = y.fechaRegistro.substring(0, 10);
            if (y.choferId != null) {
              y.persona = new cPersonal();
              var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
              if (aux != null)
                y.persona.resetChofer(aux.cedula, aux.empleado);
            }
            if (this._conexcionService.UserR.rolAsignado != "verificador-m"&&this._conexcionService.UserR.rolAsignado != "bodega_verificador-m") {
              y.listArticulosO.forEach(y1 => {
                y1.checkRevision = false;
                if (y1.estadoProducto == "Procesada" || y1.estadoProducto == "Pendiente Retorno")
                  y1.checkRevision = true;
              });
            }
          });
          this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
          this.paginacion.updateIndex(0);
        },
          error => console.error(error)
        );
    }
  }

  onOrdenNombre() {// cambia el orden por medio de un pipe
    if (this.ordenNombre == "default" || this.ordenNombre == "down")
      this.ordenNombre = "up";
    else this.ordenNombre = "down";
  }

  onsave(data: cOrdenEs) {
    if (data.listArticulosO.find(x => x.checkRevision) != undefined) {
      data.listArticulosO.forEach(x => {
        if (x.checkRevision && (x.responsableVerificador == "Verificador Pendiente" || x.responsableVerificador == null)) {
          x.estadoProducto = this.cambiarStatus(x.estadoProducto);
          x.responsableVerificador = this._conexcionService.UserR.nombreU;
        }
      });

      if (data.listArticulosO.find(x => x.estadoProducto == "Pendiente" || x.estadoProducto == "Pendiente Verificación" || (x.estadoProducto == "Procesada" && x.responsableVerificador == null)) == undefined) {
        if ((this._conexcionService.UserR.rolAsignado != "verificador-m"&&this._conexcionService.UserR.rolAsignado != "bodega_verificador-m") && data.estadoProceso == "Procesada Retorno V") {
          console.log("paso el punto desconocido");
          this.buscarGuiaGeneral(data.tipoOrden, data.destinoProcedencia, data.numGuiaRetorno, data.planta,JSON.parse(JSON.stringify(data.listArticulosO)) )
        }
        data.estadoProceso = this.cambiarStatus(data.estadoProceso);
      }

      this._ordenESService.formData = new cOrdenEs(data.planta, data.guardiaCargoUser);
      this._ordenESService.formData.completarObj(data);
      data.listArticulosO.forEach(x => {
        if (x.checkRevision) {
          this._ordenESService.formData.agregarOneArticulo(x);
          this._ordenESService.formData.listArticulosO[this._ordenESService.formData.listArticulosO.length - 1].producto = null;
        }
      });

      if (this._conexcionService.UserR.rolAsignado == "gpv-o") {
        var nombreVerificador: string;
        Swal.fire({
          title: 'Verificador de Puerto',
          text: "Ingresar el nombre de la persona que verificó la orden",
          input: 'text',
          icon: 'info',
          showCancelButton: true,
          cancelButtonColor: '#E53935',
          confirmButtonText: 'Continuar!',
          cancelButtonText: 'Solo Yo',
          customClass: {
            confirmButton: 'btn btn-info mr-2',
            cancelButton: 'btn btn-danger ml-2'
          },
          buttonsStyling: false,
          inputValidator: (value) => {
            if (!value) {
              return 'Ingrese un nombre'
            } else nombreVerificador = value.toUpperCase();
          }
        }).then((result) => {
          if (result.value) {
            for (var i = 0; i < this.ordenESService.formData.listArticulosO.length; i++) {
              if (this.ordenESService.formData.listArticulosO[i].responsableVerificador == this._conexcionService.UserR.nombreU) {
                this.ordenESService.formData.listArticulosO[i].responsableVerificador = this.ordenESService.formData.listArticulosO[i].responsableVerificador + " Y " + nombreVerificador;
              }
            }
          } this._ordenESService.actualizarOrdenES(this._ordenESService.formData).subscribe(
            (res: any) => {
              if (res.message == "Ok")
                this.cargarData();
            }
          );
        });
      } else {
        this._ordenESService.actualizarOrdenES(this._ordenESService.formData).subscribe(
          (res: any) => {
            if (res.message == "Ok")
              this.cargarData();
          }
        )
      }
    }
  }

  onImagenBotton(indice) {
    document.getElementById('newFiles' + indice).click();
  }

  onUpload(data: cOrdenEs, file: FileList) {
    var reader = new FileReader();
    var auxNombre = file[0].name.split(".");
    var auxNewArchivos: cGaleriaArchivosOrdenES = {
      ordenESId: data.idOrdenES,
      articuloOId: null,
      tipoArchivo: file[0].type,
      nombreArchivo: auxNombre[0],
      rutaArchivo: "",
      estado: 1
    }
    reader.readAsDataURL(file.item(0));
    reader.onload = (event: any) => {
      var auxGaleria: cGaleriaArchivosOrdenES[] = [];
      var strBase64 = event.target.result.split('base64,');
      auxNewArchivos.rutaArchivo = strBase64[1];
      auxGaleria.push(auxNewArchivos);
      this._ordenESService.insertarGaleriarOrden(auxGaleria).subscribe(
        (res: any) => {
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  cambiarStatus(strStatus: string) {
    if (strStatus == "Pendiente Verificación")
      strStatus = "Procesada";
    if (strStatus == "Pendiente")
      strStatus = "Pendiente Retorno";
    if (strStatus == "Procesada Retorno V")
      strStatus = "Procesada Retorno";
    return strStatus;
  }

  buscarGuiaGeneral(paramT, paramP, paramG, paramL, datoArrayArticulos:cArticulosO[]) {
    this._ordenESService.getBGuiaGeneral(paramT + "@" + paramP + "@Guía: " + paramG + "@" + paramL).subscribe((dato: any) => {
      if (dato.message == "Existe") {
        dato.orden.listArticulosO.forEach(element => {
          if (element.estadoProducto == "Pendiente Retorno") {
            if (element.productoId != null) {
              if (datoArrayArticulos.find(x => x.productoId == element.productoId) != undefined)
                element.estadoProducto = "Procesada";
            } else {
              if (datoArrayArticulos.find(x => x.inventarioId == element.inventarioId) != undefined)
                element.estadoProducto = "Procesada";
            }
          }
        });

        if (dato.orden.listArticulosO.find(x => x.estadoProducto == "Pendiente Retorno") == undefined)
          dato.orden.estadoProceso = "Procesada Retorno";
        var auxOrdenVerificado: cOrdenEs = new cOrdenEs(dato.orden.planta, dato.orden.guardiaCargoUser);
        auxOrdenVerificado.completarAll(dato.orden);
        auxOrdenVerificado.persona = null;
        auxOrdenVerificado.carro = null;

        this._ordenESService.actualizarOrdenES(auxOrdenVerificado).subscribe(
          (res: any) => {
          }
        );
      }
    },
      error => console.error(error)
    );
  }
}
