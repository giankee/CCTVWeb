import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha } from 'src/app/shared/otrosServices/varios';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch, faAngleDown, faAngleLeft, faPrint, faArrowAltCircleLeft, faArrowAltCircleRight, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewCompraModelComponent } from '../view-compra-model/view-compra-model.component';
import jsPDF from 'jspdf';
import { SortPipe } from 'src/app/pipes/sort.pipe';

@Component({
  selector: 'app-list-compras',
  templateUrl: './list-compras.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListComprasComponent implements OnInit {
  public get ordenECService(): OrdenECService {
    return this._ordenECService;
  }
  public set ordenECService(value: OrdenECService) {
    this._ordenECService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  internetStatus: string = 'nline';
  spinnerOnOff: boolean = true;
  selectParam: string = "";
  _iconDownLeft: boolean = false;
  ordenGuia: string = "default";

  listOrdenesMostrar$: Observable<cOrdenEC[]>;
  dataOrdenesResult: cOrdenEC[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(25);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash
  constructor(private _conexcionService: ConexionService, private _ordenECService: OrdenECService, private dialog: MatDialog, private ordenarPipe: SortPipe) { }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarData();
  }

  cargarData() {//Datos de los ordenes traidos desde db
    var strParametro = "P MANACRIPEX";
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      strParametro = "OFICINAS";
    if (this._conexcionService.UserR.rolAsignado == 'enfermeria')
      strParametro = "ENFERMERIA";

    this.spinnerOnOff = true;
    this.listOrdenesMostrar$ = this._ordenECService.getListOrdenesCompra(strParametro).pipe(
      map((x: cOrdenEC[]) => {
        x.forEach(y => {
          y.fechaRegistroBodega = y.fechaRegistroBodega.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onListParam(value: string) {
    this.spinnerOnOff = true;
    var strParametro = "P MANACRIPEX@";
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      strParametro = "OFICINAS@";
    if (this._conexcionService.UserR.rolAsignado == 'enfermeria')
      strParametro = "ENFERMERIA@";
    strParametro = strParametro+this.fechaHoy.inDesde + "@" + this.fechaHoy.inHasta+"@"
    if (value != "") {
      const regex = /^[0-9]*$/;
      if (regex.test(value))
        strParametro = strParametro + value + "@null";
      else strParametro = strParametro + "null@" + value;
    } else strParametro = strParametro + "null@null";
    this.listOrdenesMostrar$ = this.ordenECService.getCompraSearch(strParametro).pipe(
      map((x: cOrdenEC[]) => {
        x.forEach(y => {
          y.fechaRegistroBodega = y.fechaRegistroBodega.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }
      ),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  getDataFiltro(data: cOrdenEC[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }

  onOrdenNombre(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Proveedor") {
      if (this.ordenGuia == "default" || this.ordenGuia == "down-P")
        this.ordenGuia = "up-P";
      else this.ordenGuia = "down-P";
    }
    if (tipo == "Factura") {
      if (this.ordenGuia == "default" || this.ordenGuia == "down-F")
        this.ordenGuia = "up-F";
      else this.ordenGuia = "down-F";
    }
    if (tipo == "Barco") {
      if (this.ordenGuia == "default" || this.ordenGuia == "down-B")
        this.ordenGuia = "up-B";
      else this.ordenGuia = "down-B";
    }
  }

  onModal(dataIn: cOrdenEC) {
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    const auxId = dataIn.idOrdenE_C;
    dialoConfig.data = { auxId };
    this.dialog.open(ViewCompraModelComponent, dialoConfig);
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
      doc.text("Lista de Compras", 75, 25);

      y = 30;
      doc.line(9, y, 199, y);//up
      doc.line(9, y, 9, (y + 20));//left
      doc.line(199, y, 199, (y + 25));//right
      doc.line(9, (y + 25), 199, (y + 25));//down
      doc.setFontSize(13);
      doc.text("Parámetros de Búsqueda", 15, (y + 10));
      doc.setFont("arial", "normal")
      doc.setFontSize(11);

      doc.text("Palabra Clave: " + this.selectParam, 20, (y + 15));
      doc.text("Fecha desde: " + this.fechaHoy.inDesde, 20, (y + 20));
      doc.text("Fecha hasta: " + this.fechaHoy.inHasta, 105, (y + 20));

      y = y + 20;
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
      doc.setFontSize(9);
      doc.setFont("arial", "bold")
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right
      doc.line(9, (y + 10), 199, (y + 10));//down

      doc.text("#", 13, (y + 7));
      doc.line(18, y, 18, (y + 10));//right
      doc.text("Factura", 20, (y + 7));
      doc.line(33, y, 33, (y + 10));//right
      doc.text("Fecha Registro", 35, (y + 7));
      doc.line(58, y, 58, (y + 10));//right
      doc.text("Proveedor", 60, (y + 7));
      doc.line(95, y, 95, (y + 10));//right
      doc.text("Descripción", 97, (y + 7));
      doc.line(148, y, 148, (y + 10));//right
      doc.text("Total Compra", 150, (y + 7));
      doc.line(172, y, 172, (y + 10));//right
      doc.text("Estado Proceso", 175, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorG: number = 0;
      var valorP: number = 0;
      var valorD: number = 0;
      var lineaDescripcionG;
      var lineaDescripcion;
      var lineaProveedor;
      var auxPrueba: number;
      var auxpalabra: string;


      for (var index = 0; index < this.dataOrdenesResult.length; index++) {

        lineaProveedor = doc.splitTextToSize(this.dataOrdenesResult[index].proveedor, (35));
        lineaDescripcionG = [];

        for (var i = 0; i < this.dataOrdenesResult[index].listPcomprasO.length; i++) {
          auxpalabra = this.dataOrdenesResult[index].listPcomprasO[i].cantidad + " " + this.dataOrdenesResult[index].listPcomprasO[i].producto.nombre;

          lineaDescripcion = doc.splitTextToSize(auxpalabra, (50));
          for (var il = 0; il < lineaDescripcion.length; il++) {
            lineaDescripcionG.push(lineaDescripcion[il])
          }
        }
        valorP = (3 * lineaProveedor.length) + 4;
        valorD = (3 * lineaDescripcionG.length) + 4;
        if (valorD >= valorP)
          valorG = valorD;
        else valorG = valorP;

        y = y + valorG;

        if (y > 280) {
          doc.addPage();
          doc.setFontSize(9);
          doc.setFont("arial", "bold")
          y = 30;
          doc.line(9, y, 199, y);//up
          doc.line(9, y, 9, (y + 10));//left
          doc.line(199, y, 199, (y + 10));//right
          doc.line(9, (y + 10), 199, (y + 10));//down

          doc.text("#", 13, (y + 7));
          doc.line(18, y, 18, (y + 10));//right
          doc.text("Factura", 20, (y + 7));
          doc.line(33, y, 33, (y + 10));//right
          doc.text("Fecha Registro", 35, (y + 7));
          doc.line(58, y, 58, (y + 10));//right
          doc.text("Proveedor", 60, (y + 7));
          doc.line(95, y, 95, (y + 10));//right
          doc.text("Descripción", 97, (y + 7));
          doc.line(148, y, 148, (y + 10));//right
          doc.text("Total Compra", 150, (y + 7));
          doc.line(172, y, 172, (y + 10));//right
          doc.text("Estado Proceso", 175, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(9, (y - valorG), 9, y);//left
        doc.line(199, (y - valorG), 199, y);//right

        doc.text((index + 1).toString(), 13, (y - ((valorG - 3) / 2)));
        doc.line(18, (y - valorG), 18, y);//right
        doc.text(this.dataOrdenesResult[index].factura.toString(), 20, (y - ((valorG - 3) / 2)));
        doc.line(33, (y - valorG), 33, y);//right
        doc.text(this.dataOrdenesResult[index].fechaRegistroBodega, 35, (y - ((valorG - 3) / 2)));
        doc.line(58, (y - valorG), 58, y);//right
        auxPrueba = Number((valorG - (3 * lineaProveedor.length + (3 * (lineaProveedor.length - 1)))) / 2.5) + (2 + lineaProveedor.length);//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaProveedor, 60, (y - valorG + auxPrueba));
        doc.line(95, (y - valorG), 95, y);//right
        auxPrueba = Number((valorG - (3 * lineaDescripcionG.length + (3 * (lineaDescripcionG.length - 1)))) / 2.5) + (2 + lineaDescripcionG.length);//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaDescripcionG, 97, (y - valorG + auxPrueba));
        doc.line(148, (y - valorG), 148, y);//right
        doc.text('$' + this.dataOrdenesResult[index].totalOrden.toString(), 150, (y - ((valorG - 3) / 2)));
        doc.line(172, (y - valorG), 172, y);//right
        doc.text(this.dataOrdenesResult[index].estadoProceso, 175, (y - ((valorG - 3) / 2)));
        doc.line(9, y, 199, y);//down +10y1y2
      }


      doc.save("ListaCompra" + this.fechaHoy.strFecha + ".pdf");
    }
  }
}
