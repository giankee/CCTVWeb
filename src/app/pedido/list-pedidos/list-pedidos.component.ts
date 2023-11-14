import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faExchangeAlt, faEye, faEyeSlash, faPencilAlt, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cParemetosGeneral, cVario, cEnterpriceProveedor } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { cFacturasPedido, cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { ViewPedidoModalComponent } from '../view-pedido-modal/view-pedido-modal.component';
import { jsPDF } from "jspdf";
import { cBodega } from 'src/app/shared/bodega/ordenEC';
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
  listBarcos: cBodega[] = [];
  listAreas: cBodega[] = [];
  listVehiculos: cBodega[] = [];
  parametrosBusqueda: cParemetosGeneral = new cParemetosGeneral();
  _iconDownLeft: boolean = false;
  ordenPedido: string = "default";
  listPedidosMostrar$: Observable<cOrdenPedido[]>;
  listProveedoresFiltros$: any;
  listProdFiltros$: any;
  dataPedidoResult: cOrdenPedido[] = [];
  filtroPedido = '';

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(50);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch; faexchange = faExchangeAlt; fapencilAlt = faPencilAlt;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash

  constructor(private _conexcionService: ConexionService, private toastr: ToastrService, private _ordenPedidoService: OrdenPedidoService, private _variosService: VariosService, private proveedorService: ProveedorService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.parametrosBusqueda.strCampoB = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoC = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoD = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoE = "SIN ASIGNAR";

    switch (this.conexcionService.UserDataToken.role) {
      case 'pedido-flota':
        this.parametrosBusqueda.strCampoF = "FLOTA";
        break;
      case 'pedido-planta':
        this.parametrosBusqueda.strCampoF = "P MANACRIPEX";
        break;
      case 'verificador-bodeguero-h':
        this.parametrosBusqueda.strCampoF = "OMA";
        break;
      default: this.parametrosBusqueda.strCampoF = "SUPER";
    }
    if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h") {
      this._variosService.getBodegasTipo("PUERTO-OFICINAS").subscribe(dato => {
        this.listVehiculos = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
        this.cargarData();
      });
    } else {
      this._variosService.getBodegasTipo("VEHICULO").subscribe(dato => {
        this.listVehiculos = dato;
      });
      this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
        this.listBarcos = dato;
        this.cargarData();
      });
      if (this.conexcionService.UserDataToken.role == "pedido-planta") {
        this._variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
          this.listAreas = dato;
        });
      }
    }
  }

  cargarData() {
    this.spinnerOnOff = true;
    var parametro = "SUPER@All";
    if (this.conexcionService.UserDataToken.role == "pedido-planta")
      parametro = "P MANACRIPEX@All";
    if (this.conexcionService.UserDataToken.role == "pedido-flota")
      parametro = "FLOTA@All";
    if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h")
      parametro = "OMA@All";
    this.listPedidosMostrar$ = this.ordenPedidoService.getListPedido(parametro).pipe(
      map((x: cOrdenPedido[]) => {
        x.forEach(y => {
          var fecha = y.fechaPedido.split('T');
          y.fechaPedido = fecha[0] + " " + fecha[1];

          fecha = y.fechaAprobacion.split('T');
          y.fechaAprobacion = fecha[0] + " " + fecha[1];

          fecha = y.fechaArchivada.split('T');
          y.fechaArchivada = fecha[0] + " " + fecha[1];

          let auxSecuencial = y.numSecuencial.split("-");
          y.strNumSecuencial = auxSecuencial[1];
          y.boolProveedor = false;
          this.proveedorService.getProveedorUnificadaSearch(y.proveedor).subscribe(
            res => {
              if (res.length > 0) {
                if (res[0].proveedor == y.proveedor) {
                  y.boolProveedor = true;
                }
              }
            }
          );
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
    if (tipo == "Empresa") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-E")
        this.ordenPedido = "up-E";
      else this.ordenPedido = "down-E";
    }
    if (tipo == "Fecha") {
      if (this.ordenPedido == "default" || this.ordenPedido == "down-F")
        this.ordenPedido = "up-F";
      else this.ordenPedido = "down-F";
    }
  }

  onBListProgProveedor(value: string) {
    this.parametrosBusqueda.spinLoadingG = 'strA';
    this.parametrosBusqueda.showSearchSelectG = 'strA';
    this.parametrosBusqueda.strCampoA = value;
    if (value)
      this.listProveedoresFiltros$ = this.proveedorService.getProveedorUnificadaSearch(value).pipe(
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
    this.parametrosBusqueda.strCampoA = data.proveedor;
  }

  onFiltrarPedidos() {
    this.spinnerOnOff = true;
    var strParametosOut = this.parametrosBusqueda.fechaA + "@" + this.parametrosBusqueda.fechaB + "@" + this.parametrosBusqueda.strCampoF + "@" + this.parametrosBusqueda.strCampoB + "@" + this.parametrosBusqueda.strCampoC + "@" + this.parametrosBusqueda.strCampoD + "@";
    if (this.parametrosBusqueda.strCampoA != '')
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoA + "@";
    else strParametosOut = strParametosOut + "SIN ASIGNAR@";

    switch (this.parametrosBusqueda.strCampoE) {
      case "Pendiente Verificación V":
        strParametosOut += "Pendiente Verificación@True";
        break;
      case "Procesada V":
        strParametosOut += "Procesada@True";
        break;
      default:
        strParametosOut += this.parametrosBusqueda.strCampoE + "@False";
        break
    }
    this.listPedidosMostrar$ = this.ordenPedidoService.getFiltroPedidos(strParametosOut).pipe(
      map((x: cOrdenPedido[]) => {
        x.forEach(y => {
          var fecha = y.fechaPedido.split('T');
          y.fechaPedido = fecha[0] + " " + fecha[1];

          fecha = y.fechaAprobacion.split('T');
          y.fechaAprobacion = fecha[0] + " " + fecha[1];

          let auxSecuencial = y.numSecuencial.split("-");
          y.strNumSecuencial = auxSecuencial[1];

          y.boolProveedor = false;
          this.proveedorService.getProveedorUnificadaSearch(y.proveedor).subscribe(
            res => {
              if (res.length > 0) {
                if (res[0].proveedor == y.proveedor) {
                  y.boolProveedor = true;
                }
              }
            }
          );
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onConvertPdf(datoIn: cOrdenPedido) {
    var auxOrden: cOrdenPedido = new cOrdenPedido(datoIn.cargoUser, datoIn.planta);
    auxOrden.completarObject(datoIn);
    auxOrden.sacarRuc();

    if (this.conexcionService.UserDataToken.role == "pedido-super")
      this.convertPdf1(auxOrden);
    else this.convertPdf2(auxOrden);
  }

  convertPdf1(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;
    var firmas: boolean = true;

    if (orden.estadoProceso == "Pendiente Aprobación")
      firmas = false;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    let auxSecuencial = orden.numSecuencial.split("-");
    var strDestino: string;
    doc.text("Orden de Pedido: " + auxSecuencial[1], 75, 10);

    y = 12;

    doc.setFontSize(11);
    doc.text("Datos de la orden", 18, (y + 3));
    doc.setFont("arial", "normal");
    doc.setFontSize(10);

    doc.text("Fecha de Registro: ", 15, (y + 7));
    doc.setFont("arial", "bold");
    doc.text("                                " + orden.fechaPedido, 15, (y + 7));
    doc.setFont("arial", "normal");

    doc.text("Empresa: " + orden.empresa, 80, (y + 7));
    doc.text("RUC: " + orden.strRuc, 140, (y + 7));
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 15, (y + 11));
    if (orden.area == "P MANACRIPEX") {
      doc.text("Área:", 80, (y + 11));
      strDestino = orden.listArticulosPedido[0].destinoArea;
    }
    else {
      doc.text("Lugar:", 80, (y + 11));
      strDestino = orden.area + " - Sub-Área:" + orden.listArticulosPedido[0].destinoArea;
    }
    doc.setFont("arial", "bold");
    doc.text("            " + strDestino, 80, (y + 11));
    doc.setFont("arial", "normal");

    doc.text("Proveedor: " + orden.proveedor, 15, (y + 15));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 19));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 80, (y + 19));
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada")
      doc.text("Fecha Aprobación: " + orden.fechaAprobacion, 140, (y + 19));
    if (orden.estadoProceso == "Rechazada")
      doc.text("Fecha Rechazada: " + orden.fechaAprobacion, 140, (y + 19));

    var auxFacturas: string = "";
    if (orden.listFacturasPedido.length > 0) {
      orden.listFacturasPedido.forEach(x => {
        if (auxFacturas == "")
          auxFacturas = x.factura.toString();
        else auxFacturas = auxFacturas + " - " + x.factura.toString();
      });
    }
    doc.text("Facturas adjuntas: " + (auxFacturas != '' ? auxFacturas : "---"), 15, (y + 23));
    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 27));

    var auxH = y + 32;
    if (auxlinea.length > 1)
      auxH = auxH + 3 + ((3 * auxlinea.length) + 2);
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (auxH));//left
    doc.line(199, y, 199, auxH);//right
    doc.line(9, auxH, 199, auxH);//down


    doc.setFont("arial", "normal");
    y = auxH;

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("Lista de Materiales", 85, (y + 5));
    doc.setFontSize(11);
    y = y + 7;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 6));//left
    doc.line(199, y, 199, (y + 6));//right
    doc.line(9, (y + 6), 199, (y + 6));//down

    doc.text("#", 12, (y + 4));
    doc.line(18, y, 18, (y + 6));//right
    doc.text("Código", 30, (y + 4));
    doc.line(65, y, 65, (y + 6));//right
    doc.text("Descripción", 80, (y + 4));
    doc.line(125, y, 125, (y + 6));//right
    doc.text("Cantidad", 127, (y + 4));
    doc.line(145, y, 145, (y + 6));//right
    doc.text("Observación", 165, (y + 4));

    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 6;

    var valorG: number = 0;
    var valorC: number;
    var valorN: number;
    var valorO: number;
    var lineaCodigo;
    var lineaNombre;
    var lineaObservacion;
    var auxPrueba: number;
    for (var i = 0; i < orden.listArticulosPedido.length; i++) {

      if (orden.listArticulosPedido[i].estadoArticuloPedido != "No Procesada") {
        lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (45));
        lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
        lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (55));
        valorC = (3 * lineaCodigo.length) + 2;
        valorN = (3 * lineaNombre.length) + 2;
        valorO = (3 * lineaObservacion.length) + 2;

        if (valorC >= valorN && valorC >= valorO)
          valorG = valorC;
        if (valorN >= valorC && valorN >= valorO)
          valorG = valorN;
        if (valorO >= valorC && valorO >= valorN)
          valorG = valorO;

        y = y + valorG;

        if (y > 265) {
          doc.addPage();
          doc.setFontSize(11);
          doc.setFont("arial", "bold")
          y = 10;
          doc.line(9, y, 199, y);//up
          doc.line(9, y, 9, (y + 6));//left
          doc.line(199, y, 199, (y + 6));//right
          doc.line(9, (y + 6), 199, (y + 6));//down

          doc.text("#", 12, (y + 4));
          doc.line(18, y, 18, (y + 6));//right
          doc.text("Código", 30, (y + 4));
          doc.line(65, y, 65, (y + 6));//right
          doc.text("Descripción", 80, (y + 4));
          doc.line(125, y, 125, (y + 6));//right
          doc.text("Cantidad", 127, (y + 4));
          doc.line(145, y, 145, (y + 6));//right
          doc.text("Observación", 165, (y + 4));

          y = y + 10 + valorG;

          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        if (y > 115)
          firmas = false;

        doc.line(9, (y - valorG), 9, y);//left
        doc.text((i+1).toString(), 12, (y - ((valorG - 2) / 2)));
        doc.line(18, (y - valorG), 18, y);//left
        auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
        doc.text(lineaCodigo, 20, (y - valorG + auxPrueba));
        doc.line(65, (y - valorG), 65, y);//right
        auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
        doc.text(lineaNombre, 70, (y - valorG + auxPrueba));
        doc.line(125, (y - valorG), 125, y);//right
        doc.text(orden.listArticulosPedido[i].cantidad.toString(), 132, (y - ((valorG - 2) / 2)));
        doc.line(145, (y - valorG), 145, y);//right
        auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
        if (orden.listArticulosPedido[i].aviso) {
          doc.setTextColor(255, 0, 0);
          doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
          doc.setTextColor(0, 0, 0);
        } else doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
        doc.line(199, (y - valorG), 199, y);//right
        doc.line(9, y, 199, y);//down
      }
    }

    if (firmas) {
      y = 130;
      doc.line(1, (y + 14), 209, (y + 14));//downCut
    } else {
      y = 265;
    }

    doc.setFont("arial", "bold");
    doc.setFontSize(11);
    doc.line(35, (y + 1), 85, (y + 1));//downCut
    doc.text("Verificado por", 48, (y + 5));

    doc.line(115, (y + 1), 165, (y + 1));//downCut
    doc.text("Aprobado por", 128, (y + 5));

    doc.setFont("arial", "normal");
    doc.setFontSize(9);
    doc.text(orden.responsableAprobacion, 125, (y));

    doc.save("Pedido_" + orden.numSecuencial + ".pdf");
  }

  onRevision(orden: cOrdenPedido, recursividad: boolean) {
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Anulada") {
      var srtFacturas: string = "";
      var fechaHoy: cFecha = new cFecha();
      var auxOrden: cOrdenPedido = new cOrdenPedido(orden.cargoUser, orden.planta);
      auxOrden.completarObject(orden);
      auxOrden.fechaArchivada = fechaHoy.strFecha + " " + fechaHoy.strHoraA;
      auxOrden.responsableArchivada = this.conexcionService.UserDataToken.name;
      if (auxOrden.archivada || recursividad) {
        if (auxOrden.listFacturasPedido.length > 0)
          auxOrden.listFacturasPedido.forEach(x => {
            x.estado = 0;
            if (srtFacturas == "")
              srtFacturas = x.factura.toString();
            else srtFacturas = srtFacturas + "-" + x.factura;
          });
        Swal.fire({
          icon: "warning",
          title: "Estás seguro que quieres archivar esté pedido?",
          text: "Ingrese las facturas separadas por un guión medio -",
          input: 'text',
          inputValue: srtFacturas,
          showCancelButton: true,
          cancelButtonColor: '#E53935',
          confirmButtonText: "Continuar!",
          cancelButtonText: "Cancelar!",
          customClass: {
            confirmButton: 'btn btn-Primario mr-2',
            cancelButton: 'btn btn-Secundario ml-2',
          },
          inputValidator: (value) => {
            if (!value) {
              return 'Ingrese mínimo una factura';
            } else {
              srtFacturas = value.toUpperCase();
              if (!this.contieneNumeros(srtFacturas))
                return "no cumple con el formato deseado.";
            }
          }
        }).then((result) => {
          if (result.value) {
            if (result.value.includes("-")) {
              var auxFacturas = result.value.split("-");
              auxFacturas.forEach(x => {
                if ((auxOrden.listFacturasPedido.find(y => y.factura.toString() == x) == undefined))
                  auxOrden.agregarOneFactura(new cFacturasPedido(auxOrden.idOrdenPedido, Number(x)));
                else auxOrden.listFacturasPedido.find(y => y.factura.toString() == x).estado = 1;
              });
            } else auxOrden.agregarOneFactura(new cFacturasPedido(auxOrden.idOrdenPedido, Number(result.value)));
            auxOrden.corregirFechas();
            this.edicionArchivada(auxOrden);
            orden.listFacturasPedido = auxOrden.listFacturasPedido;
          } else {
            if (recursividad)
              orden.archivada = true
            else orden.archivada = false;
          }
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Estás seguro que quieres borrar las facturas adjuntas?",
          showCancelButton: true,
          cancelButtonColor: '#E53935',
          confirmButtonText: "Continuar!",
          cancelButtonText: "Cancelar!",
          customClass: {
            confirmButton: 'btn btn-Primario mr-2',
            cancelButton: 'btn btn-Secundario ml-2',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            auxOrden.listFacturasPedido = [];
            auxOrden.corregirFechas();
            this.edicionArchivada(auxOrden);
          } else {
            orden.archivada = true;
            this.onRevision(orden, true);
          }
        });
      }
    }
  }

  convertPdf2(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold");

    let auxSecuencial = orden.numSecuencial.split("-");
    var strDestino: string;
    doc.text("Orden de Pedido: " + auxSecuencial[1], 75, 20);

    y = 25;

    doc.setFontSize(13);
    doc.text("Datos de la orden", 20, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Fecha de Registro: " + orden.fechaPedido, 15, (y + 10));
    doc.text("Empresa: " + orden.empresa, 80, (y + 10));
    doc.text("RUC: " + orden.strRuc, 140, (y + 10));
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 15, (y + 15));
    if (orden.area == "P MANACRIPEX")
      strDestino = "Área: " + orden.listArticulosPedido[0].destinoArea;
    else strDestino = "Lugar: " + orden.area + " - Sub-Área: " + orden.listArticulosPedido[0].destinoArea;
    doc.text(strDestino, 80, (y + 15));
    doc.text("Proveedor: " + orden.proveedor, 15, (y + 20));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 25));
    doc.text("Tipo Pedido: " + orden.tipoPedido, 105, (y + 25));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 15, (y + 30));
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada")
      doc.text("Fecha Aprobación: " + orden.fechaAprobacion, 105, (y + 30));
    if (orden.estadoProceso == "Rechazada")
      doc.text("Fecha Rechazada: " + orden.fechaAprobacion, 105, (y + 30));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 35));
    doc.setFont("arial", "normal");


    var auxH = y + 40;
    if (auxlinea.length > 1)
      auxH = auxH + 3 + ((3 * auxlinea.length) + 2);
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (auxH));//left
    doc.line(199, y, 199, auxH);//right
    doc.line(9, auxH, 199, auxH);//down

    y = auxH;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 90, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down

    doc.text("#", 12, (y + 7));
    doc.line(18, y, 18, (y + 10));//right
    doc.text("Código", 30, (y + 7));
    doc.line(65, y, 65, (y + 10));//right
    doc.text("Descripción", 80, (y + 7));
    doc.line(125, y, 125, (y + 10));//right
    doc.text("Cantidad", 127, (y + 7));
    doc.line(145, y, 145, (y + 10));//right
    doc.text("Observación", 165, (y + 7));


    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 10;

    var valorG: number = 0;
    var valorC: number;
    var valorN: number;
    var valorO: number;
    var lineaCodigo;
    var lineaNombre;
    var lineaObservacion;
    var auxPrueba: number;

    for (var i = 0; i < orden.listArticulosPedido.length; i++) {
      lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (42));
      lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
      lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (55));
      valorC = (3 * lineaCodigo.length) + 4;
      valorN = (3 * lineaNombre.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;

      if (valorC >= valorN && valorC >= valorO)
        valorG = valorC;
      if (valorN >= valorC && valorN >= valorO)
        valorG = valorN;
      if (valorO >= valorC && valorO >= valorN)
        valorG = valorO;

      y = y + valorG;

      if (y > 265) {
        doc.addPage();
        doc.setFontSize(11);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(9, y, 199, y);//up
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down

        doc.text("#", 12, (y + 7));
        doc.line(18, y, 18, (y + 10));//right
        doc.text("Código", 30, (y + 7));
        doc.line(65, y, 65, (y + 10));//right
        doc.text("Descripción", 80, (y + 7));
        doc.line(125, y, 125, (y + 10));//right
        doc.text("Cantidad", 127, (y + 7));
        doc.line(145, y, 145, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      doc.text((i + 1).toString(), 12, (y - ((valorG - 3) / 2)));
      doc.line(18, (y - valorG), 18, y);//left
      auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
      doc.text(lineaCodigo, 20, (y - valorG + auxPrueba));
      doc.line(65, (y - valorG), 65, y);//right
      auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
      doc.text(lineaNombre, 68, (y - valorG + auxPrueba));
      doc.line(125, (y - valorG), 125, y);//right
      doc.text(orden.listArticulosPedido[i].cantidad.toString(), 135, (y - ((valorG - 3) / 2)));
      doc.line(145, (y - valorG), 145, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
      if (orden.listArticulosPedido[i].aviso) {
        doc.setTextColor(255, 0, 0);
        doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
        doc.setTextColor(0, 0, 0);
      } else doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 265) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 265;

    var personaSubArea: cBodega = null;
    var strPersonaSubArea: string = "Encargado " + orden.listArticulosPedido[0].destinoArea;;
    if (orden.area == "P MANACRIPEX") {
      personaSubArea = this.listAreas.find(x => x.nombreBodega == orden.area);
      if (personaSubArea != null && personaSubArea.listEncargados != null && personaSubArea.listEncargados.length > 0)
        strPersonaSubArea = personaSubArea.listEncargados[0].encargado;
    } else {
      if (orden.area != "P OFICINAS") {
        personaSubArea = this.listVehiculos.find(x => x.nombreBodega == orden.area);
        if (personaSubArea != null)
          personaSubArea = this.listBarcos.find(x => x.nombreBodega == orden.area);
        if (personaSubArea != null) {
          if (personaSubArea.tipoBodega == "VEHICULO") {
            if (personaSubArea.listEncargados != null && personaSubArea.listEncargados.length > 0)
              strPersonaSubArea = personaSubArea.listEncargados[0].encargado;
          } else {
            if (personaSubArea.listAreas != null && personaSubArea.listAreas.length > 0) {
              let indiceL = personaSubArea.listAreas.findIndex(x => x.nombreArea == orden.listArticulosPedido[0].destinoArea);
              if (indiceL != -1)
                strPersonaSubArea = personaSubArea.listAreas[indiceL].encargadoArea;
            }
          }
        }
      }
    }

    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + strPersonaSubArea, 146, y + 5);
    doc.save("Pedido_" + orden.numSecuencial + ".pdf");
  }

  onEdit(dataIn: cOrdenPedido) {
    var auxId = dataIn.idOrdenPedido;
    this.ordenPedidoService.formData = new cOrdenPedido(dataIn.cargoUser, dataIn.planta);
    this.ordenPedidoService.formData.completarObject(dataIn);
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = false;
    dialoConfig.disableClose = true;
    dialoConfig.data = { auxId }
    const dialogRef = this.dialog.open(ViewPedidoModalComponent, dialoConfig);

    dialogRef.afterClosed().subscribe(
      () => {
        this.cargarData()
      }
    );
  }

  contieneNumeros(cadena: string) {
    return /^(?:\d+|-)+$/.test(cadena);
  }

  edicionArchivada(orden: cOrdenPedido) {
    this.ordenPedidoService.achivarPedido(orden).subscribe(
      (res: any) => {
        if (res.message == "Ok")
          this.toastr.success('Factura Archivada', 'Actualizada');
      }
    )
  }
}
