import { Component, OnInit } from '@angular/core';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { OrdenESService } from 'src/app/shared/orden-es.service';
import { ToastrService } from 'ngx-toastr';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch, faAngleDown, faAngleLeft, faPrint, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { cOrdenEs } from 'src/app/shared/ordenEs';
import { PersonalService } from 'src/app/shared/personal.service';
import { cPersonal, cProducto } from 'src/app/shared/basicos';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceEmpleados, cFecha, cParemetos, cVario } from 'src/app/shared/otrosServices/varios';
import { ProductoService } from 'src/app/shared/producto.service';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewOrdenModalComponent } from '../view-orden-modal/view-orden-modal.component';
import { jsPDF } from "jspdf";
import { UserService } from 'src/app/shared/user.service';
import { EditOrdenComponent } from '../edit-orden/edit-orden.component';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SearchPipe } from 'src/app/pipes/search.pipe';

@Component({
  selector: 'app-list-ordenes',
  templateUrl: './list-ordenes.component.html',
  styles: [],
  providers: [SortPipe, SearchPipe]
})
export class ListOrdenesComponent implements OnInit {
  public get userService(): UserService {
    return this._userService;
  }
  public set userService(value: UserService) {
    this._userService = value;
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
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
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
  public get iconDownLeft(): boolean {
    return this._iconDownLeft;
  }
  public set iconDownLeft(value: boolean) {
    this._iconDownLeft = value;
  }

  internetStatus: string = 'nline';
  filtroOrden = "";
  okAyuda: boolean = false;

  listOrdenesMostrar$: Observable<cOrdenEs[]>;
  listChoferesIn: cEnterpriceEmpleados[] = [];
  listLugarPrioridadIn: cVario[] = [];
  dataOrdenesResult: cOrdenEs[] = [];

  ordenGuia: string = "default";
  spinnerOnOff: boolean = true;
  _iconDownLeft: boolean = false;


  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(25);
  /**Fin paginatacion */

  /**Actualizar listProgresivas */
  parametrosBusqueda: cParemetos = new cParemetos();
  listPersonalFiltros$: any;
  listVariosFiltros$: any;
  listProdFiltros$: any;

  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;
  constructor(private _conexcionService: ConexionService, private _userService: UserService, private _ordenESService: OrdenESService,
    private _personalService: PersonalService, private toastr: ToastrService, private _enterpriceService: ApiEnterpriceService, private dialog: MatDialog,
    private _productoService: ProductoService, private _variosService: VariosService, private ordenarPipe: SortPipe, private searchPipe: SearchPipe) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarDataChoferes();
    this._variosService.getVariosPrioridad("gpv-o")
      .subscribe(dato => {
        this.listLugarPrioridadIn = dato;
      },
        error => console.error(error));
  }

  cargarData() {//Datos de los ordenes traidos desde db
    this.spinnerOnOff = true;
    this.listOrdenesMostrar$ = this._ordenESService.getListOrdenesES().pipe(
      map((x: cOrdenEs[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
          if (y.choferId != null) {
            y.persona = new cPersonal();
            var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
            if (aux != null)
              y.persona.resetChofer(aux.cedula, aux.empleado);
          }
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
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

  onListPersonal(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    this.parametrosBusqueda.tipoPersona = "null";
    this.parametrosBusqueda.personaCodigo = "null";
    var params = "" + value;
    if (value == "")
      params = "DatoNull";
    this.listPersonalFiltros$ = this._personalService.getPersonalSearch(params).pipe(
      map((x: cPersonal[]) => {
        return x;
      }),
      finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
    );

  }

  onChoosePersonal(tipo: string, data?: any) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    this.parametrosBusqueda.tipoPersona = tipo;
    if (tipo != 'null')
      if (tipo == 'C') {
        this.parametrosBusqueda.strPersona = data.empleado;
        this.parametrosBusqueda.personaCodigo = data.idEmpleado;
      }
      else {
        this.parametrosBusqueda.strPersona = data.nombreP;
        this.parametrosBusqueda.personaCodigo = data.idPersona;
      }
    else this.parametrosBusqueda.strPersona = "";
  }

  onListLugares(value: string) {
    this.parametrosBusqueda.spinLoadingG = 2;
    this.parametrosBusqueda.showSearchSelectG = 2;
    this.parametrosBusqueda.strLugar = value;
    var params = "SE@" + value;
    if (value == "")
      params = "SE@DatoNull";
    this.listVariosFiltros$ = this._variosService.getLugarSearch(params).pipe(
      map((x: cVario[]) => {
        return x;
      }),
      finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
    );
  }

  onChooseLugar(data: any) {
    if (data != "null") {
      this.parametrosBusqueda.strLugar = data.nombre;
    }
    else this.parametrosBusqueda.strLugar = "";
    this.parametrosBusqueda.showSearchSelectG = 0;
  }

  onListProducto(value: string) {
    this.parametrosBusqueda.spinLoadingG = 3;
    this.parametrosBusqueda.showSearchSelectG = 3;
    this.parametrosBusqueda.tipoProducto = "null";
    this.parametrosBusqueda.productoCodigo = "null";

    var params = "" + value;
    if (value == "")
      params = "DatoNull";
    if (this._conexcionService.UserDataToken.role=="gpv-o")
      params=params+"@OFICINAS";
    else params=params+"@p MANACRIPEX";
    
    this.listProdFiltros$ = this._productoService.getProductosGSearch(params).pipe(
      map((x: cProducto[]) => x),
      finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
    );
  }

  onChooseElemente(data: any) {
    if (data != "null") {
      this.parametrosBusqueda.tipoProducto = data.fuente;
      this.parametrosBusqueda.productoCodigo = data.idProducto;
      this.parametrosBusqueda.strProducto = data.nombre;
    } else this.parametrosBusqueda.strProducto = "";
    this.parametrosBusqueda.showSearchSelectG = 0;
  }

  onListGuias(value: number) {
    this.parametrosBusqueda.spinLoadingG = 4;
    var params = "" + value;
    if (params == 'null')
      this.onFiltrarOrdenes();
    else {
      this.listOrdenesMostrar$ = this._ordenESService.getGuiaSearch("ES@" + params).pipe(
        map((x: cOrdenEs[]) => {
          x.forEach(y => {
            y.fechaRegistro = y.fechaRegistro.substring(0, 10);
            if (y.choferId != null) {
              y.persona = new cPersonal();
              var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
              if (aux != null)
                y.persona.resetChofer(aux.cedula, aux.empleado);
            }
          });
          this.paginacion.getNumberIndex(x.length);
          return x;
        }
        ),
        finalize(() => {
          this.parametrosBusqueda.spinLoadingG = 0;
        })
      );
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  getDataFiltro(data: cOrdenEs[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }

  onOrdenNombre(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Nombre") {
      if (this.ordenGuia == "default" || this.ordenGuia == "down-N")
        this.ordenGuia = "up-N";
      else this.ordenGuia = "down-N";
    }
    if (tipo == "Guia") {
      if (this.ordenGuia == "default" || this.ordenGuia == "down-G")
        this.ordenGuia = "up-G";
      else this.ordenGuia = "down-G";
    }
  }

  onFiltrarOrdenes() {
    this.spinnerOnOff = true;
    var strParametros: string = this.parametrosBusqueda.transformarParametro();
    this.listOrdenesMostrar$ = this._ordenESService.getFiltroOrdenes(strParametros).pipe(
      map((x: cOrdenEs[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
          if (y.choferId != null) {
            y.persona = new cPersonal();
            var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
            if (aux != null)
              y.persona.resetChofer(aux.cedula, aux.empleado);
          }
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onModal(dataIn: cOrdenEs, op: number) {
    var auxId = dataIn.idOrdenES;
    if (this.internetStatus == "nline") {
      const dialoConfig = new MatDialogConfig();
      dialoConfig.autoFocus = true;
      dialoConfig.disableClose = true;
      dialoConfig.data = { auxId }
      if (op == 1)
        this.dialog.open(ViewOrdenModalComponent, dialoConfig);
      if (op == 2) {
        const dialogRef = this.dialog.open(EditOrdenComponent, dialoConfig);
        dialogRef.afterClosed().subscribe((result: cOrdenEs) => {
          if (result != null) {
            this.listOrdenesMostrar$ = this.listOrdenesMostrar$.pipe(
              map((x: cOrdenEs[]) => x
              )
            );
          }
        });
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

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    return true;
  }

  onBuscarPareja(dato: cOrdenEs) {
    this.spinnerOnOff = true;
    var strParametros: string;

    if (dato.numGuiaRetorno != null) {
      strParametros = dato.numGuiaRetorno.toString();
    } else {
      var separarGuia = dato.numDocumentacion.split(': ');
      strParametros = separarGuia[1];
    }
    strParametros = strParametros + "@" + dato.destinoProcedencia;

    this.listOrdenesMostrar$ = this._ordenESService.getGuiasRProcesada(strParametros).pipe(
      map((x: cOrdenEs[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
          if (y.choferId != null) {
            y.persona = new cPersonal();
            var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == y.choferId)
            if (aux != null)
              y.persona.resetChofer(aux.cedula, aux.empleado);
          }
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onConvertPdfAll() {
    if (this.dataOrdenesResult.length > 0) {
      var y: number;
      var doc = new jsPDF();

      if (this.ordenGuia != "default") {
        this.dataOrdenesResult = this.ordenarPipe.transform(this.dataOrdenesResult, this.ordenGuia, 'cOrdenES');
        this.dataOrdenesResult = this.dataOrdenesResult.slice(this.paginacion.startIndex, this.paginacion.endIndex);
      } else this.dataOrdenesResult = JSON.parse(JSON.stringify(this.dataOrdenesResult.slice(this.paginacion.startIndex, this.paginacion.endIndex)));

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Ordenes", 75, 25);

      y = 30;
      doc.line(9, y, 199, y);//up
      doc.line(9, y, 9, (y + 35));//left
      doc.line(199, y, 199, (y + 35));//right
      doc.line(9, (y + 35), 199, (y + 35));//down
      doc.setFontSize(13);
      doc.text("Parámetros de Búsqueda", 15, (y + 10));
      doc.setFont("arial", "normal")
      doc.setFontSize(11);

      var auxTorden;
      switch (this.parametrosBusqueda.tipoO) {
        case "Default":
          auxTorden = "Ultimos Registros";
          break;
        case "Entrada":
          auxTorden = "Solo Entrada";
          break;
        case "Salida":
          auxTorden = "Solo Salida";
          break;
        case "EntradaSalida":
          auxTorden = "Entradas/Salidas";
          break;
        case "Sretorno":
          auxTorden = "Solo Retornos";
          break;
        case "PretornoG":
        case "PretornoS":
          case "PretornoE":
          auxTorden = "Pendientes de Retorno";
          this.dataOrdenesResult.forEach(function (orden) {
            orden.listArticulosO = orden.listArticulosO.filter(x => x.retorna && (x.estadoProducto == "Pendiente" || x.estadoProducto == "Pendiente Retorno"));
          });
          break;
        case "Pverificacion":
          auxTorden = "Pendientes de Verificación";
          break;
        case "Materia Prima":
          auxTorden = "Entrada de Proveedores";
          break;
        case "PR_fotos":
          auxTorden = "Procesadas Verificadas con Fotos";
          break;
        case "PR_snfotos":
          auxTorden = "Procesadas Verificadas sin fotos";
          break;
      }
      doc.text("Tipo de Orden: " + auxTorden, 20, (y + 15));
      doc.text("Fecha desde: " + this.parametrosBusqueda.fechaA, 20, (y + 20));
      doc.text("Fecha hasta: " + this.parametrosBusqueda.fechaB, 105, (y + 20));

      if (this, this.parametrosBusqueda.personaCodigo != "null") {
        doc.text("Persona: " + this.parametrosBusqueda.strPersona, 20, (y + 25));
      } else doc.text("Persona: " + "No Especificado", 20, (y + 25));

      if (this, this.parametrosBusqueda.productoCodigo != "null") {
        doc.text("Artículo: " + this.parametrosBusqueda.strProducto, 105, (y + 25));
      } else doc.text("Artículo: " + "No Especificado", 105, (y + 25));

      if (this, this.parametrosBusqueda.strLugar != "null") {
        doc.text("Lugar: " + this.parametrosBusqueda.strLugar, 20, (y + 30));
      } else doc.text("Lugar: " + "No Especificado", 20, (y + 30));

      doc.text("Palabra Clave: " + this.filtroOrden, 105, (y + 30));

      y = y + 30;
      doc.line(9, y, 9, (y + 25));//left
      doc.line(199, y, 199, (y + 25));//right
      doc.line(9, (y + 25), 199, (y + 25));//down
      doc.setFontSize(14);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 10));
      doc.setFontSize(12);
      doc.setFont("arial", "normal")
      doc.text("Número ordenes encontradas:" + this.dataOrdenesResult.length, 20, (y + 15));
      doc.text("Resultados a mostrar: " + (this.paginacion.selectPagination) + "/" + this.dataOrdenesResult.length, 105, (y + 15));
      doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 20, (y + 20));
      doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 105, (y + 20));

      y = y + 25;
      doc.setFontSize(10);
      doc.setFont("arial", "bold")
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right
      doc.line(9, (y + 10), 199, (y + 10));//down

      doc.text("#", 13, (y + 7));
      doc.line(18, y, 18, (y + 10));//right
      doc.text("Entrada/Salida", 20, (y + 7));
      doc.line(55, y, 55, (y + 10));//right
      doc.text("Documentación", 57, (y + 7));
      doc.line(83, y, 83, (y + 10));//right
      doc.text("Persona", 85, (y + 7));
      doc.line(108, y, 108, (y + 10));//right
      doc.text("Fecha Registro", 110, (y + 7));
      doc.line(135, y, 135, (y + 10));//right
      doc.text("Descripción", 137, (y + 7));
      doc.line(171, y, 171, (y + 10));//right
      doc.text("Estado Orden", 173, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorG: number = 0;
      var valorT: number = 0;
      var valorN: number = 0;
      var valorD: number = 0;
      var auxTexto: string;
      var lineaTipo;
      var lineaDescripcionG;
      var lineaDescripcion;
      var lineaNombre;
      var auxPrueba: number;
      var auxpalabra: string;

      for (var index = 0; index < this.dataOrdenesResult.length; index++) {
        if (this.dataOrdenesResult[index].tipoOrden == "Entrada")
          auxTexto = this.dataOrdenesResult[index].tipoOrden + " a " + this.dataOrdenesResult[index].planta + " desde " + this.dataOrdenesResult[index].destinoProcedencia;
        if (this.dataOrdenesResult[index].tipoOrden == "Salida")
          auxTexto = this.dataOrdenesResult[index].tipoOrden + " desde " + this.dataOrdenesResult[index].planta + " a " + this.dataOrdenesResult[index].destinoProcedencia;
        if (this.dataOrdenesResult[index].tipoOrden == "Materia Prima")
          auxTexto = this.dataOrdenesResult[index].tipoOrden + " por " + this.dataOrdenesResult[index].destinoProcedencia;
        lineaTipo = doc.splitTextToSize(auxTexto, (34));

        auxTexto = this.dataOrdenesResult[index].persona.nombreP;
        lineaNombre = doc.splitTextToSize(auxTexto, (23));

        lineaDescripcionG = [];

        for (var i = 0; i < this.dataOrdenesResult[index].listArticulosO.length; i++) {
          if (this.dataOrdenesResult[index].listArticulosO[i].productoId != null)
            auxpalabra = this.dataOrdenesResult[index].listArticulosO[i].cantidad + " " + this.dataOrdenesResult[index].listArticulosO[i].producto.nombre;
          else
            auxpalabra = this.dataOrdenesResult[index].listArticulosO[i].cantidad + " " + this.dataOrdenesResult[index].listArticulosO[i].inventario.nombre;

          if(this.dataOrdenesResult[index].listArticulosO[i].estadoProducto=="Pendiente"||this.dataOrdenesResult[index].listArticulosO[i].estadoProducto=="Pendiente Retorno"){
            auxpalabra= auxpalabra + " || (" + this.dataOrdenesResult[index].listArticulosO[i].cantidadPendiente+")";
            if(this.dataOrdenesResult[index].listArticulosO[i].cantidad!=this.dataOrdenesResult[index].listArticulosO[i].cantidadPendiente)
            auxpalabra=auxpalabra + " ("+ (this.dataOrdenesResult[index].listArticulosO[i].cantidad-this.dataOrdenesResult[index].listArticulosO[i].cantidadPendiente) + ")";
          }
          lineaDescripcion = doc.splitTextToSize(auxpalabra, (32));
          for (var il = 0; il < lineaDescripcion.length; il++) {
            lineaDescripcionG.push(lineaDescripcion[il])
          }
        }
        valorT = (3 * lineaTipo.length) + 4;
        valorN = (3 * lineaNombre.length) + 4;
        valorD = (3 * lineaDescripcionG.length) + 4;
        if (valorD >= valorT && valorD >= valorN) {
          valorG = valorD;
        }
        if (valorT >= valorD && valorT >= valorN) {
          valorG = valorT;
        }
        if (valorN >= valorD && valorN >= valorT) {
          valorG = valorN;
        }
        y = y + valorG;

        if (y > 280) {
          doc.addPage();
          doc.setFontSize(10);
          doc.setFont("arial", "bold")
          y = 30;
          doc.line(9, y, 199, y);//up
          doc.line(9, y, 9, (y + 10));//left
          doc.line(199, y, 199, (y + 10));//right
          doc.line(9, (y + 10), 199, (y + 10));//down

          doc.text("#", 13, (y + 7));
          doc.line(18, y, 18, (y + 10));//right
          doc.text("Entrada/Salida", 20, (y + 7));
          doc.line(55, y, 55, (y + 10));//right
          doc.text("Documentación", 57, (y + 7));
          doc.line(83, y, 83, (y + 10));//right
          doc.text("Persona", 85, (y + 7));
          doc.line(108, y, 108, (y + 10));//right
          doc.text("Fecha Registro", 110, (y + 7));
          doc.line(135, y, 135, (y + 10));//right
          doc.text("Descripción", 137, (y + 7));
          doc.line(171, y, 171, (y + 10));//right
          doc.text("Estado Proceso", 173, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(9, (y - valorG), 9, y);//left
        doc.line(199, (y - valorG), 199, y);//right

        doc.text((index + 1).toString(), 13, (y - ((valorG - 3) / 2)));
        doc.line(18, (y - valorG), 18, y);//right
        auxPrueba = Number((valorG - (3 * lineaTipo.length + (3 * (lineaTipo.length - 1)))) / 2.5) + (2 + lineaTipo.length);//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaTipo, 20, (y - valorG + auxPrueba));
        doc.line(55, (y - valorG), 55, y);//right
        doc.text(this.dataOrdenesResult[index].numDocumentacion, 57, (y - ((valorG - 3) / 2)));
        doc.line(83, (y - valorG), 83, y);//right
        auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + (2 + lineaNombre.length);//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaNombre, 85, (y - valorG + auxPrueba));
        doc.line(108, (y - valorG), 108, y);//right
        doc.text(this.dataOrdenesResult[index].fechaRegistro + "  " + this.dataOrdenesResult[index].horaRegistro, 110, (y - ((valorG - 3) / 2)));
        doc.line(135, (y - valorG), 135, y);//right
        auxPrueba = Number((valorG - (3 * lineaDescripcionG.length + (3 * (lineaDescripcionG.length - 1)))) / 2.5) + (2 + lineaDescripcionG.length);//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaDescripcionG, 137, (y - valorG + auxPrueba));
        doc.line(171, (y - valorG), 171, y);//right
        doc.text(this.dataOrdenesResult[index].estadoProceso, 173, (y - ((valorG - 3) / 2)));
        doc.line(9, y, 199, y);//down +10y1y2
      }

      doc.save("ListaOrdenes" + this.parametrosBusqueda.fechaH + ".pdf");
    }
  }
}
