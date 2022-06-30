import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faEyeSlash, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';
import { cConsultaMedic } from 'src/app/shared/bodega/ordenTrabajo';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cEnterpricePersonal, cFecha, cParemetosOrdenInterna, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewConsultaComponent } from '../view-consulta/view-consulta.component';
import { jsPDF } from "jspdf";
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { SortPipe } from 'src/app/pipes/sort.pipe';

@Component({
  selector: 'app-list-consulta-medic',
  templateUrl: './list-consulta-medic.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListConsultaMedicComponent implements OnInit {
  public get productosBService(): ProductoBService {
    return this._productosBService;
  }
  public set productosBService(value: ProductoBService) {
    this._productosBService = value;
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
  public get consultaMedicService(): ConsultaMedicService {
    return this._consultaMedicService;
  }
  public set consultaMedicService(value: ConsultaMedicService) {
    this._consultaMedicService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  spinnerOnOff: boolean = true;
  listBodega: cVario[] = [];
  parametrosBusqueda: cParemetosOrdenInterna = new cParemetosOrdenInterna();
  _iconDownLeft: boolean = false;
  selecBodegaFiltro: string = "ENFERMERIA GENERAL";
  ordenConsulta: string = "default";
  listConsultasMostrar$: Observable<cConsultaMedic[]>;
  listPacienteFiltros$: any;
  listProdFiltros$: any;
  dataOrdenesResult: cConsultaMedic[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(25);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash
  constructor(private _conexcionService: ConexionService, private _consultaMedicService: ConsultaMedicService, private _variosService: VariosService, private dialog: MatDialog, private _enterpriceService: ApiEnterpriceService, private _productosBService: ProductoBService, private consultaPipe: SortPipe) {
  }

  ngOnInit(): void {
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      dato.forEach(x => {
        if (x.categoria == "Puerto" && x.prioridadNivel == 1)
          this.listBodega.push(x);
      });
      if (this._conexcionService.UserR.rolAsignado == "verificador-medic")
        this.selecBodegaFiltro = this.listBodega.find(x => x.encargadoBodega == this.conexcionService.UserR.nombreU).nombre;
      this.parametrosBusqueda.anio = this.fechaHoy.anio.toString();
      this.parametrosBusqueda.strBodegaOrigen = this.selecBodegaFiltro;
      this.cargarData();
    });
  }

  cargarData() {//Datos de los ordenes traidos desde db
    this.spinnerOnOff = true;
    this.listConsultasMostrar$ = this._consultaMedicService.getListConsultasInter(this.selecBodegaFiltro).pipe(
      map((x: cConsultaMedic[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  getDataFiltro(data: cConsultaMedic[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenConsulta(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Index") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-I")
        this.ordenConsulta = "up-I";
      else this.ordenConsulta = "down-I";
    }
    if (tipo == "Bodega") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-B")
        this.ordenConsulta = "up-B";
      else this.ordenConsulta = "down-B";
    }
    if (tipo == "Paciente") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-P")
        this.ordenConsulta = "up-P";
      else this.ordenConsulta = "down-P";
    }
  }

  onModal(dataIn: cConsultaMedic) {
    this.consultaMedicService.formData = new cConsultaMedic(this._conexcionService.UserR.nombreU);
    this.consultaMedicService.formData.completarObject(dataIn);
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    const auxId = dataIn.idConsultaMedic;
    dialoConfig.data = { auxId };
    this.dialog.open(ViewConsultaComponent, dialoConfig);
  }

  onListProducto(value: string) {
    this.parametrosBusqueda.spinLoadingG = 2;
    this.parametrosBusqueda.showSearchSelectG = 2;
    this.parametrosBusqueda.productoCodigo = "null";
    if (value != "") {
      var params = value + "@ENFERMERIA@2@";
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR")
        params = params + this.parametrosBusqueda.strBodegaOrigen;
      else params = params + "null";
      this.listProdFiltros$ = this._productosBService.getProductosSearch(params).pipe(
        map((x: cProducto_B[]) => x),
        finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
      );
    } else {
      this.parametrosBusqueda.strProducto = "";
      this.parametrosBusqueda.spinLoadingG = 0;
      this.parametrosBusqueda.showSearchSelectG = 0;
    }
  }

  onChooseElemente(data: any) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data != "null") {
      this.parametrosBusqueda.productoCodigo = data.idProductoStock;
      this.parametrosBusqueda.strProducto = data.nombre;
    } else this.parametrosBusqueda.strProducto = "";
  }

  onListPasciente(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    if (value != "") {
      this.parametrosBusqueda.strPersona = value;
      var strParametro = "all@" + value;
      var auxBarcoSelect = "";
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR") {
        if (this.parametrosBusqueda.strBodegaOrigen != 'ENFERMERIA GENERAL') {
          strParametro = "Tripulantes@" + value;
          var auxBarco = this.parametrosBusqueda.strBodegaOrigen.split(' ');
          switch (auxBarco.length) {
            case 2:
              auxBarcoSelect = auxBarco[1];
              break;
            case 3:
              if (auxBarco[2] == "B")
                auxBarcoSelect = auxBarco[1];
              else auxBarcoSelect = auxBarco[2];
              break;
            case 4:
              auxBarcoSelect = auxBarco[2];
              break;
          }
        }
      }
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          if (auxBarcoSelect != "")
            return x.filter(y => y.barco.includes(auxBarcoSelect));
          else return x;
        }),
        finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
      );
    } else {
      this.parametrosBusqueda.strPersona = "";
      this.parametrosBusqueda.spinLoadingG = 0;
      this.parametrosBusqueda.showSearchSelectG = 0;
    }
  }

  onChoosePaciente(data: string) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data == "null") {
      this.parametrosBusqueda.strPersona = "";
      this.parametrosBusqueda.spinLoadingG = 0;
    } else this.parametrosBusqueda.strPersona = data;
  }

  onFiltrarConsultas() {
    this.spinnerOnOff = true;
    var strParametros: string = this.parametrosBusqueda.transformarParametroConsulta(this.fechaHoy.inDesde, this.fechaHoy.inHasta);
    console.table(strParametros)
    this.listConsultasMostrar$ = this.consultaMedicService.getFiltroConsultas(strParametros).pipe(
      map((x: cConsultaMedic[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
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
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenConsulta != "default")
        this.dataOrdenesResult = this.consultaPipe.transform(this.dataOrdenesResult, this.ordenConsulta, 'cConsultaMedic');

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Consultas", 120, 15);

      y = 20;
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 40));//left
      doc.line(290, y, 290, (y + 40));//right
      doc.line(5, (y + 40), 290, (y + 40));//down

      doc.setFontSize(13);
      doc.text("Parámetros de Búsqueda", 15, (y + 10));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      var strAux = "SIN ESPECIFICAR";
      doc.text("Fecha desde: " + this.fechaHoy.inDesde, 15, (y + 15));
      doc.text("Fecha hasta: " + this.fechaHoy.inHasta, 110, (y + 15));
      this.parametrosBusqueda.strPersona != '' ? strAux = this.parametrosBusqueda.strPersona : strAux = "SIN ESPECIFICAR";
      doc.text("Paciente: " + strAux, 205, (y + 15));
      this.parametrosBusqueda.strProducto != '' ? strAux = this.parametrosBusqueda.strProducto : strAux = "SIN ESPECIFICAR";
      doc.text("Medicamento: " + strAux, 15, (y + 20));
      doc.text("Bodega: " + this.parametrosBusqueda.strBodegaOrigen, 110, (y + 20));
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR" && this.parametrosBusqueda.strBodegaOrigen != "ENFERMERIA GENERL")
        doc.text("Marea: " + this.fechaHoy.inHasta, 205, (y + 20));
      doc.line(5, (y + 25), 290, (y + 25));//down
      y = y + 25;
      doc.setFontSize(12);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 5));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número productos encontrados: " + this.dataOrdenesResult.length, 10, (y + 10));
      doc.text("Resultados a mostrar: " + this.dataOrdenesResult.length + "/" + this.paginacion.selectPagination, 80, (y + 10));
      doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 150, (y + 10));
      doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 220, (y + 10));
      y = y + 15;

      doc.setFontSize(10);
      doc.setFont("arial", "bold")
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      doc.text("#", 12, (y + 7));
      doc.line(20, y, 20, (y + 10));//left
      doc.text("Fecha Registro", 25, (y + 7));
      doc.line(55, y, 55, (y + 10));//left
      doc.text("Paciente", 85, (y + 7));
      doc.line(130, y, 130, (y + 10));//left
      doc.text("Bodega", 145, (y + 7));
      doc.line(175, y, 175, (y + 10));//left
      doc.text("Marea", 182, (y + 7));
      doc.line(200, y, 200, (y + 10));//left
      doc.text("Medicamentos", 225, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorP: number = 0;
      var valorM: number = 0;
      var valorG: number = 0;
      var auxLinea: number;
      var lineaPaciente;
      var lineaMedicamento;
      var lineaMedicamentoG;
      var auxpalabra: string;

      for (var index = 0; index < this.dataOrdenesResult.length; index++) {
        lineaPaciente = doc.splitTextToSize(this.dataOrdenesResult[index].paciente, (65));
        lineaMedicamentoG = [];

        for (var i = 0; i < this.dataOrdenesResult[index].listReceta.length; i++) {
          auxpalabra = this.dataOrdenesResult[index].listReceta[i].cantidad + " " + this.dataOrdenesResult[index].listReceta[i].inventario.nombre;
          lineaMedicamento = doc.splitTextToSize(auxpalabra, (80));
          for (var il = 0; il < lineaMedicamento.length; il++) {
            lineaMedicamentoG.push(lineaMedicamento[il])
          }
        }

        valorP = (3 * lineaPaciente.length) + 4;
        valorM = (3 * lineaMedicamentoG.length) + 4;
        if (valorM >= valorP)
          valorG = valorM;
        else valorG = valorP;
        y = y + valorG;

        if (y > 280) {
          doc.text("Pág. #" + Npag, 280, 207);
          Npag++;
          doc.addPage();
          doc.text("Pág. #" + Npag, 280, 207);
          doc.setFontSize(10);
          doc.setFont("arial", "bold")
          y = 15;
          doc.line(5, (y), 290, (y));//up
          doc.line(5, y, 5, (y + 10));//left
          doc.line(290, y, 290, (y + 10));//right
          doc.line(5, (y + 10), 290, (y + 10));//down

          doc.text("#", 12, (y + 7));
          doc.line(20, y, 20, (y + 10));//left
          doc.text("Fecha Registro", 25, (y + 7));
          doc.line(55, y, 55, (y + 10));//left
          doc.text("Paciente", 85, (y + 7));
          doc.line(130, y, 130, (y + 10));//left
          doc.text("Bodega", 145, (y + 7));
          doc.line(175, y, 175, (y + 10));//left
          doc.text("Marea", 182, (y + 7));
          doc.line(200, y, 200, (y + 10));//left
          doc.text("Medicamentos", 225, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.text(this.dataOrdenesResult[index].numOrdenSecuencial.toString(), 12, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.dataOrdenesResult[index].fechaRegistro, 30, (y - ((valorG - 3) / 2)));
        doc.line(55, (y - valorG), 55, y);//right
        auxLinea = Number((valorG - (3 * lineaPaciente.length + (3 * (lineaPaciente.length - 1)))) / 2.5) + (2 + lineaPaciente.length);
        doc.text(lineaPaciente, 60, (y - valorG + auxLinea));
        doc.line(130, (y - valorG), 130, y);//right
        doc.text(this.dataOrdenesResult[index].bodegaOrigen, 135, (y - ((valorG - 3) / 2)));
        doc.line(175, (y - valorG), 175, y);//right
        doc.text(this.dataOrdenesResult[index].marea != "" ? '' + this.dataOrdenesResult[index].marea : '---', 182, (y - ((valorG - 3) / 2)));
        doc.line(200, (y - valorG), 200, y);//right
        auxLinea = Number((valorG - (3 * lineaMedicamentoG.length + (3 * (lineaMedicamentoG.length - 1)))) / 2.5) + (2 + lineaMedicamentoG.length);
        doc.text(lineaMedicamentoG, 205, (y - valorG + auxLinea));
      }
      doc.save("ListaConsulta" + this.fechaHoy.strFecha + ".pdf");
    }
  }
}
