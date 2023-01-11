import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faExchangeAlt, faEye, faEyeSlash, faPencilAlt, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cParemetosGeneral, cVario, cEnterpriceProveedor } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { ViewPedidoModalComponent } from '../view-pedido-modal/view-pedido-modal.component';
import { jsPDF } from "jspdf";
import { cBodega } from 'src/app/shared/bodega/ordenEC';
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';

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

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(50);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch; faexchange = faExchangeAlt; fapencilAlt = faPencilAlt;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash

  constructor(private _conexcionService: ConexionService, private _ordenPedidoService: OrdenPedidoService, private _variosService: VariosService, private proveedorService: ProveedorService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.parametrosBusqueda.strCampoB = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoC = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoD = "SIN ASIGNAR";
    this.parametrosBusqueda.strCampoE = "SIN ASIGNAR";

    this._variosService.getBodegasTipo("VEHICULO").subscribe(dato => {
      this.listVehiculos = dato;
    });
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
      this.cargarData();
    });

    if (this.conexcionService.UserR.rolAsignado == "pedido-planta") {
      this._variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
        this.listAreas = dato;
      });
    }
  }

  cargarData() {
    this.spinnerOnOff = true;
    var parametro = "SUPER@All";
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta")
      parametro = "P MANACRIPEX@All";
    if (this.conexcionService.UserR.rolAsignado == "pedido-flota")
      parametro = "FLOTA@All";
    this.listPedidosMostrar$ = this.ordenPedidoService.getListPedido(parametro).pipe(
      map((x: cOrdenPedido[]) => {
        x.forEach(y => {
          y.fechaPedido = y.fechaPedido.substring(0, 10);
          let auxSecuencial = y.numSecuencial.split("-");
          y.strNumSecuencial = auxSecuencial[1];
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
  }

  onBListProgProveedor(value: string) {
    this.parametrosBusqueda.spinLoadingG = 'strA';
    this.parametrosBusqueda.showSearchSelectG = 'strA';
    this.parametrosBusqueda.strCampoA = value;
    if (value)
      this.listProveedoresFiltros$ = this.proveedorService.getProveedorSearch(value).pipe(
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
    var strParametosOut = this.parametrosBusqueda.fechaA + "@" + this.parametrosBusqueda.fechaB + "@";
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta")
      strParametosOut = strParametosOut + "P MANACRIPEX@";
    if (this.conexcionService.UserR.rolAsignado == "pedido-flota")
      strParametosOut = strParametosOut + "FLOTA@";
    if (this.conexcionService.UserR.rolAsignado == "pedido-super")
      strParametosOut = strParametosOut + "SUPER@";

    strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoB + "@" + this.parametrosBusqueda.strCampoC + "@" + this.parametrosBusqueda.strCampoD + "@";
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
          y.fechaPedido = y.fechaPedido.substring(0, 10);
          let auxSecuencial = y.numSecuencial.split("-");
          y.strNumSecuencial = auxSecuencial[1];
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

    if (this.conexcionService.UserR.rolAsignado == "pedido-super")
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
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 32));//left
    doc.line(199, y, 199, (y + 32));//right
    doc.line(9, (y + 32), 199, (y + 32));//down
    doc.setFontSize(11);
    doc.text("Datos de la orden", 18, (y + 3));
    doc.setFont("arial", "normal")
    doc.setFontSize(10);
    doc.text("Fecha de Registro: " + orden.fechaPedido, 15, (y + 7));

    doc.text("Empresa: " + orden.empresa, 80, (y + 7));
    doc.text("RUC: " + orden.strRuc, 140, (y + 7));
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 15, (y + 11));
    if (orden.area == "P MANACRIPEX")
      strDestino = "Área:" + orden.listArticulosPedido[0].destinoArea;
    else strDestino = "Lugar: " + orden.area + " - Sub-Área:" + orden.listArticulosPedido[0].destinoArea;
    doc.text(strDestino, 80, (y + 11));
    doc.text("Proveedor: " + orden.proveedor, 15, (y + 15));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 19));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 15, (y + 23));
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada")
      doc.text("Fecha Aprobación: " + orden.fechaAprobacion, 105, (y + 23));
    if (orden.estadoProceso == "Rechazada")
      doc.text("Fecha Rechazada: " + orden.fechaAprobacion, 105, (y + 23));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 27));
    doc.setFont("arial", "normal");
    y = y + 32;

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("Lista de Materiales", 85, (y + 5));
    doc.setFontSize(11);
    y = y + 7;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 6));//left
    doc.line(199, y, 199, (y + 6));//right
    doc.line(9, (y + 6), 199, (y + 6));//down

    doc.text("Código", 25, (y + 4));
    doc.line(50, y, 50, (y + 6));//right
    doc.text("Descripción", 70, (y + 4));
    doc.line(110, y, 110, (y + 6));//right
    doc.text("Cantidad", 112, (y + 4));
    doc.line(130, y, 130, (y + 6));//right
    doc.text("Área", 137, (y + 4));
    doc.line(155, y, 155, (y + 6));//right
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
        lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (35));
        lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
        lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (40));
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

          doc.text("Código", 25, (y + 4));
          doc.line(50, y, 50, (y + 6));//right
          doc.text("Descripción", 70, (y + 4));
          doc.line(110, y, 110, (y + 6));//right
          doc.text("Cantidad", 112, (y + 4));
          doc.line(130, y, 130, (y + 6));//right
          doc.text("Área", 137, (y + 4));
          doc.line(155, y, 155, (y + 6));//right
          doc.text("Observación", 165, (y + 4));

          y = y + 10 + valorG;

          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        if (y > 115)
          firmas = false;

        doc.line(9, (y - valorG), 9, y);//left
        auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
        doc.text(lineaCodigo, 15, (y - valorG + auxPrueba));
        doc.line(50, (y - valorG), 50, y);//right
        auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
        doc.text(lineaNombre, 55, (y - valorG + auxPrueba));
        doc.line(110, (y - valorG), 110, y);//right
        doc.text(orden.listArticulosPedido[i].cantidad.toString(), 120, (y - ((valorG - 2) / 2)));
        doc.line(130, (y - valorG), 130, y);//right
        doc.text(orden.listArticulosPedido[i].destinoArea, 135, (y - ((valorG - 2) / 2)));
        doc.line(155, (y - valorG), 155, y);//right
        auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
        doc.text(lineaObservacion, 15, (y - valorG + auxPrueba));
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

  onRevision(orden: cOrdenPedido) {
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada") {
      var auxOrden: cOrdenPedido = new cOrdenPedido(orden.cargoUser, orden.planta);
      auxOrden.completarObject(orden);

      this.ordenPedidoService.actualizarPedido(auxOrden).subscribe(
        (res: any) => {
        }
      )
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
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 40));//left
    doc.line(199, y, 199, (y + 40));//right
    doc.line(9, (y + 40), 199, (y + 40));//down
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
    doc.text("Estado de la Orden: " + orden.estadoProceso, 15, (y + 30));
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada")
      doc.text("Fecha Aprobación: " + orden.fechaAprobacion, 105, (y + 30));
    if (orden.estadoProceso == "Rechazada")
      doc.text("Fecha Rechazada: " + orden.fechaAprobacion, 105, (y + 30));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 35));
    doc.setFont("arial", "normal");
    y = y + 40;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 90, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down

    doc.text("Código", 25, (y + 7));
    doc.line(50, y, 50, (y + 10));//right
    doc.text("Descripción", 70, (y + 7));
    doc.line(110, y, 110, (y + 10));//right
    doc.text("Cantidad", 112, (y + 7));
    doc.line(130, y, 130, (y + 10));//right
    doc.text("Área", 137, (y + 7));
    doc.line(155, y, 155, (y + 10));//right
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
      lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (35));
      lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
      lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (40));
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

        doc.text("Código", 25, (y + 7));
        doc.line(50, y, 50, (y + 10));//right
        doc.text("Descripción", 70, (y + 7));
        doc.line(110, y, 110, (y + 10));//right
        doc.text("Cantidad", 112, (y + 7));
        doc.line(130, y, 130, (y + 10));//right
        doc.text("Área", 137, (y + 7));
        doc.line(155, y, 155, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
      doc.text(lineaCodigo, 15, (y - valorG + auxPrueba));
      doc.line(50, (y - valorG), 50, y);//right
      auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
      doc.text(lineaNombre, 55, (y - valorG + auxPrueba));
      doc.line(110, (y - valorG), 110, y);//right
      doc.text(orden.listArticulosPedido[i].cantidad.toString(), 120, (y - ((valorG - 3) / 2)));
      doc.line(130, (y - valorG), 130, y);//right
      doc.text(orden.listArticulosPedido[i].destinoArea, 135, (y - ((valorG - 3) / 2)));
      doc.line(155, (y - valorG), 155, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
      doc.text(lineaObservacion, 15, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 265) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 265;
    var personaSubArea = null;
    if (orden.area == "P MANACRIPEX") {
      personaSubArea = this.listAreas.find(x => x.nombreBodega == orden.listArticulosPedido[0].destinoArea).encargadoBodega;
    } else {
      var auxArea: cBodega = this.listBarcos.find(x => x.nombreBodega == orden.area);
      if (auxArea == undefined) {
        auxArea = this.listVehiculos.find(x => x.nombreBodega == orden.area);
      }
      if (auxArea != undefined) {
        personaSubArea = auxArea.listAreas.find(y => y.nombreArea == orden.listArticulosPedido[0].destinoArea).encargadoArea;
      }
    }
    if (personaSubArea == null)
      personaSubArea = "Encargado " + orden.listArticulosPedido[0].destinoArea;

    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + personaSubArea, 146, y + 5);
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
    this.dialog.open(ViewPedidoModalComponent, dialoConfig);
  }
}
