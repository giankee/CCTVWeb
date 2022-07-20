import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faPrint, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { cAtencionMedic } from 'src/app/shared/medicina/medicina';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cEnterpricePersonal, cParemetosGeneral } from 'src/app/shared/otrosServices/varios';
import listCie10 from 'src/assets/cie10code.json';
import { jsPDF } from "jspdf";
import { SortPipe } from 'src/app/pipes/sort.pipe';

@Component({
  selector: 'app-list-atenciones',
  templateUrl: './list-atenciones.component.html',
  styleUrls: ['./list-atenciones.component.css'],
  providers: [SortPipe]
})
export class ListAtencionesComponent implements OnInit {
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  listAtencionesMostrar$: Observable<cAtencionMedic[]>;
  listPacienteFiltros$: any;
  parametrosBusqueda: cParemetosGeneral = new cParemetosGeneral();
  spinnerOnOff: boolean = false;
  iconDownLeft: boolean = false;
  ordenAtencion: string = "default";
  listCie10Array = listCie10;
  dataAtencionesResult: cAtencionMedic[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(25);
  //fechaHoy = new cFecha();
  /**Fin paginatacion */


  sort = faSort; faeye = faEye; fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArRight = faArrowAltCircleRight; faArLeft = faArrowAltCircleLeft;
  //fatimesCircle = faTimesCircle;  
  constructor(private _atencionMedicService: AtencionService, private _enterpriceService: ApiEnterpriceService, private consultaPipe: SortPipe) { }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData() {//Datos de los ordenes traidos desde db
    this.spinnerOnOff = true;
    this.listAtencionesMostrar$ = this.atencionMedicService.getListAtenciones().pipe(
      map((x: cAtencionMedic[]) => {
        x.forEach(y => {
          y.fechaAtencion = y.fechaAtencion.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onFiltrarAtenciones() {
    this.spinnerOnOff = true;
    var strParametosOut = this.parametrosBusqueda.fechaA + "@" + this.parametrosBusqueda.fechaB + "@";
    if (this.parametrosBusqueda.strCampoA != '' && this.parametrosBusqueda.strCampoC != "")
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoC + "@";
    else strParametosOut = strParametosOut + "datoNull@";
    if (this.parametrosBusqueda.strCampoB != "" && this.parametrosBusqueda.strCampoD != "")
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoD;
    else strParametosOut = strParametosOut + "datoNull";

    this.listAtencionesMostrar$ = this.atencionMedicService.getFiltroAtenciones(strParametosOut).pipe(
      map((x: cAtencionMedic[]) => {
        x.forEach(y => {
          y.fechaAtencion = y.fechaAtencion.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  getDataFiltro(data: cAtencionMedic[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataAtencionesResult.length) {
      this.dataAtencionesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataAtencionesResult.length);
    }
  }

  onListCIE(value: string) {
    this.parametrosBusqueda.spinLoadingG = '0';
    if (value != '') {
      this.parametrosBusqueda.showSearchSelectG = "strB";
      this.parametrosBusqueda.strCampoB = value;
    } else this.parametrosBusqueda.showSearchSelectG = "0";
  }

  onChooseEnfermedad(data: any) {
    this.parametrosBusqueda.spinLoadingG = "0";
    this.parametrosBusqueda.showSearchSelectG = "0";
    this.parametrosBusqueda.strCampoB = data.code + ":" + data.description;
    this.parametrosBusqueda.strCampoD = data.code;
  }

  onListPasciente(value: string) {
    this.parametrosBusqueda.spinLoadingG = 'strA';
    this.parametrosBusqueda.showSearchSelectG = 'strA';
    var strParametro = "all@" + value;
    this.parametrosBusqueda.strCampoA = value;
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          return x;
        }),
        finalize(() => this.parametrosBusqueda.spinLoadingG = '0')
      );
    } else {
      this.parametrosBusqueda.spinLoadingG = '0';
      this.parametrosBusqueda.showSearchSelectG = "0";
    }
  }

  onChoosePaciente(dataIn: cEnterpricePersonal) {
    this.parametrosBusqueda.spinLoadingG = '0';
    this.parametrosBusqueda.showSearchSelectG = '0';
    this.parametrosBusqueda.strCampoA = dataIn.empleado;
    this.parametrosBusqueda.strCampoC = dataIn.cedula;
  }

  onOrdenAtencion(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Enfermedad") {
      if (this.ordenAtencion == "default" || this.ordenAtencion == "down-E")
        this.ordenAtencion = "up-E";
      else this.ordenAtencion = "down-E";
    }
    if (tipo == "Paciente") {
      if (this.ordenAtencion == "default" || this.ordenAtencion == "down-P")
        this.ordenAtencion = "up-P";
      else this.ordenAtencion = "down-P";
    }
  }

  onConvertPdfAll() {
    if (this.dataAtencionesResult.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenAtencion != "default")
        this.dataAtencionesResult = this.consultaPipe.transform(this.dataAtencionesResult, this.ordenAtencion, 'cAtencionMedic');
      
      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Atenciones", 120, 15);

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
      doc.text("Fecha desde: " + this.parametrosBusqueda.fechaA, 15, (y + 15));
      doc.text("Fecha hasta: " + this.parametrosBusqueda.fechaB, 85, (y + 15));

      this.parametrosBusqueda.strCampoA != '' && this.parametrosBusqueda.strCampoC ? strAux = this.parametrosBusqueda.strCampoA : strAux = "SIN ESPECIFICAR";
      doc.text("Paciente: " + strAux, 180, (y + 15));
      this.parametrosBusqueda.strCampoB != '' && this.parametrosBusqueda.strCampoD ? strAux = this.parametrosBusqueda.strCampoB : strAux = "SIN ESPECIFICAR";
      doc.text("Enfermedad: " + strAux, 15, (y + 20));

      doc.line(5, (y + 25), 290, (y + 25));//down
      y = y + 25;
      doc.setFontSize(12);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 5));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número de atenciones encontrados: " + this.dataAtencionesResult.length, 10, (y + 10));
      doc.text("Resultados a mostrar: " + this.dataAtencionesResult.length + "/" + this.paginacion.selectPagination, 80, (y + 10));
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
      doc.text("Fecha Atención", 25, (y + 7));
      doc.line(55, y, 55, (y + 10));//left
      doc.text("Paciente", 80, (y + 7));
      doc.line(120, y, 120, (y + 10));//left
      doc.text("Enfermedad CIE10", 140, (y + 7));
      doc.line(195, y, 195, (y + 10));//left
      doc.text("Motivo de Atención", 215, (y + 7));
      doc.line(270, y, 270, (y + 10));//left
      doc.text("Reposo", 275, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorP: number = 0;
      var valorE: number = 0;
      var valorM: number = 0;
      var valorG: number = 0;
      var auxLinea: number;
      var lineaPaciente;
      var lineaEnfermedad;
      var lineaMotivo;

      for (var index = 0; index < this.dataAtencionesResult.length; index++) {
        lineaPaciente = doc.splitTextToSize(this.dataAtencionesResult[index].pacienteMedic.nombreEmpleado, (60));
        lineaEnfermedad = doc.splitTextToSize(this.dataAtencionesResult[index].enfermedadCIE10, (70));
        lineaMotivo = doc.splitTextToSize(this.dataAtencionesResult[index].motivoAtencion, (70));

        valorP = (3 * lineaPaciente.length) + 4;
        valorE = (3 * lineaEnfermedad.length) + 4;
        valorM = (3 * lineaMotivo.length) + 4;
        if (valorP >= valorE && valorP >= valorM)
          valorG = valorP;
        if (valorE >= valorP && valorE >= valorM)
          valorG = valorE;
        if (valorM >= valorP && valorM >= valorE)
          valorG = valorM;
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
          doc.text("Fecha Atención", 25, (y + 7));
          doc.line(55, y, 55, (y + 10));//left
          doc.text("Paciente", 80, (y + 7));
          doc.line(120, y, 120, (y + 10));//left
          doc.text("Enfermedad CIE10", 140, (y + 7));
          doc.line(195, y, 195, (y + 10));//left
          doc.text("Motivo de Atención", 215, (y + 7));
          doc.line(270, y, 270, (y + 10));//left
          doc.text("Reposo", 275, (y + 7));
          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.text((index + 1).toString(), 12, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.dataAtencionesResult[index].fechaAtencion, 30, (y - ((valorG - 3) / 2)));
        doc.line(55, (y - valorG), 55, y);//right
        auxLinea = Number((valorG - (3 * lineaPaciente.length + (3 * (lineaPaciente.length - 1)))) / 2.5) + (2 + lineaPaciente.length);
        doc.text(lineaPaciente, 60, (y - valorG + auxLinea));
        doc.line(120, (y - valorG), 120, y);//right
        auxLinea = Number((valorG - (3 * lineaEnfermedad.length + (3 * (lineaEnfermedad.length - 1)))) / 2.5) + (2 + lineaEnfermedad.length);
        doc.text(lineaEnfermedad, 125, (y - valorG + auxLinea));
        doc.line(195, (y - valorG), 195, y);//right
        auxLinea = Number((valorG - (3 * lineaMotivo.length + (3 * (lineaMotivo.length - 1)))) / 2.5) + (2 + lineaMotivo.length);
        doc.text(lineaMotivo, 200, (y - valorG + auxLinea));
        doc.line(270, (y - valorG), 270, y);//right
        if (this.dataAtencionesResult[index].reposo)
          doc.text("SI", 278, (y - ((valorG - 3) / 2)));
        else doc.text("NO", 278, (y - ((valorG - 3) / 2)));
      }
      doc.save("ListaAtenciones" + ".pdf");
    }
  }

  onModal(dato) {

  }
}
