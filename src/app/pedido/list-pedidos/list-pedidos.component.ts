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
import { jsPDF } from "jspdf";

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

  convertPdf(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold")
    doc.text("Orden de Pedido " + orden.numSecuencial, 40, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 20, (y + 10));
    doc.text("Fecha de Registro: " + orden.fechaPedido, 105, (y + 10));
    doc.text("Proveedor: " + orden.proveedor, 20, (y + 15));
    doc.text("Usuario Sistema: " + orden.cargoUser, 20, (y + 20));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 105, (y + 20));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 20, (y + 25));
    doc.setFont("arial", "normal");
    y = y + 35;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 80, (y + 7));
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
    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + orden.listArticulosPedido[0].destinoArea, 146, y + 5);
    doc.save("Pedido_" + orden.numSecuencial + ".pdf");
  }

  onEdit(dataIn:cOrdenPedido){
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
