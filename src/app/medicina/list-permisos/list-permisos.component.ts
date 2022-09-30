import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faPrint, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { cPermisoMedic } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cEnterpricePersonal, cFecha, cParemetosGeneral } from 'src/app/shared/otrosServices/varios';
import listCie10 from 'src/assets/cie10code.json';

import { jsPDF } from "jspdf";

@Component({
  selector: 'app-list-permisos',
  templateUrl: './list-permisos.component.html',
  styleUrls: ['./list-permisos.component.css'],
  providers: [SortPipe]
})
export class ListPermisosComponent implements OnInit {

  listPermisosMostrar$: Observable<cPermisoMedic[]>;
  listPacienteFiltros$: any;
  parametrosBusqueda: cParemetosGeneral = new cParemetosGeneral();
  spinnerOnOff: boolean = false;
  iconDownLeft: boolean = false;
  ordenPermiso: string = "default";
  listCie10Array = listCie10;
  dataPermisosResult: cPermisoMedic[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(50);
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArRight = faArrowAltCircleRight; faArLeft = faArrowAltCircleLeft;
  constructor(private pacienteService: PacienteService, private enterpriceService: ApiEnterpriceService, private consultaPipe: SortPipe, private permisoMedicService: PermisoService) { }

  ngOnInit(): void {
    this.cargarData();
    this.parametrosBusqueda.strCampoC = "SIN ASIGNAR";
  }

  cargarData() {
    this.spinnerOnOff = true;
    this.listPermisosMostrar$ = this.permisoMedicService.getListPermisos().pipe(
      map((x: cPermisoMedic[]) => {
        x.forEach(y => {
          y.fechaSalida = y.fechaSalida.substring(0, 10) + " - " + y.fechaSalida.substring(11, 16);
          y.fechaRegreso = y.fechaRegreso.substring(0, 10) + " - " + y.fechaRegreso.substring(11, 16);;
          this.pacienteService.getPacienteById("enterprice@"+y.pacienteMedic.empleadoId).subscribe((dato: any) => {
            if (dato.exito == 1) {
              if (dato.message == "Ok")
                if (y.pacienteMedicId == dato.data.idPacienteMedic) {
                  y.pacienteMedic.empleado = dato.data.empleado;
                  y.pacienteMedic.idEmpresa = dato.data.idEmpresa;
                }
            }
          });
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  getDataFiltro(data: cPermisoMedic[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataPermisosResult.length) {
      this.dataPermisosResult = data;
      this.paginacion.getNumberIndex(this.dataPermisosResult.length);
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataPermisosResult.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenPermiso(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Enfermedad") {
      if (this.ordenPermiso == "default" || this.ordenPermiso == "down-E")
        this.ordenPermiso = "up-E";
      else this.ordenPermiso = "down-E";
    }
    if (tipo == "Paciente") {
      if (this.ordenPermiso == "default" || this.ordenPermiso == "down-P")
        this.ordenPermiso = "up-P";
      else this.ordenPermiso = "down-P";
    }
    if (tipo == "tipoPermiso") {
      if (this.ordenPermiso == "default" || this.ordenPermiso == "down-T")
        this.ordenPermiso = "up-T";
      else this.ordenPermiso = "down-T";
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
    this.parametrosBusqueda.strCampoB = data.code + ": " + data.description;
    this.parametrosBusqueda.strCampoD = data.code;
  }

  onListPasciente(value: string) {
    this.parametrosBusqueda.spinLoadingG = 'strA';
    this.parametrosBusqueda.showSearchSelectG = 'strA';
    var strParametro = "all@" + value + "@SIN ASIGNAR";
    this.parametrosBusqueda.strCampoA = value;
    if (value != "") {
      this.listPacienteFiltros$ = this.enterpriceService.getPersonalEnter2(strParametro).pipe(
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
    this.parametrosBusqueda.numCampoA = dataIn.idEmpleado;
  }

  onFiltrarPermisos() {
    this.spinnerOnOff = true;
    var strParametosOut = this.parametrosBusqueda.fechaA + "@" + this.parametrosBusqueda.fechaB + "@";
    if (this.parametrosBusqueda.strCampoA != "" && this.parametrosBusqueda.numCampoA != undefined)
      strParametosOut = strParametosOut + this.parametrosBusqueda.numCampoA + "@";
    else strParametosOut = strParametosOut + "datoNull@";
    if (this.parametrosBusqueda.strCampoB != "" && this.parametrosBusqueda.strCampoD != "")
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoD + "@";
    else strParametosOut = strParametosOut + "datoNull@";
    if (this.parametrosBusqueda.strCampoC != "SIN ASIGNAR")
      strParametosOut = strParametosOut + this.parametrosBusqueda.strCampoC;
    else strParametosOut = strParametosOut + "datoNull";
    this.listPermisosMostrar$ = this.permisoMedicService.getFiltroPermisos(strParametosOut).pipe(
      map((x: cPermisoMedic[]) => {
        x.forEach(y => {
          y.fechaSalida = y.fechaSalida.substring(0, 10) + " - " + y.fechaSalida.substring(11, 16);
          y.fechaRegreso = y.fechaRegreso.substring(0, 10) + " - " + y.fechaRegreso.substring(11, 16);;
          this.pacienteService.getPacienteById("enterprice@"+y.pacienteMedic.empleadoId).subscribe((dato: any) => {
            if (dato.exito == 1) {
              if (dato.message == "Ok")
                y.pacienteMedic.empleado = dato.data.empleado;
            }
          });
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onConvertPdfAll() {
    if (this.dataPermisosResult.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenPermiso != "default")
        this.dataPermisosResult = this.consultaPipe.transform(this.dataPermisosResult, this.ordenPermiso, 'cPermisoMedic');

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Permisos", 120, 15);

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
      doc.text("Fecha hasta: " + this.parametrosBusqueda.fechaB, 75, (y + 15));
      doc.text("Tipo Permiso: " + this.parametrosBusqueda.strCampoC, 135, (y + 15));
      this.parametrosBusqueda.strCampoB != '' && this.parametrosBusqueda.strCampoD ? strAux = this.parametrosBusqueda.strCampoB : strAux = "SIN ESPECIFICAR";
      doc.text("Enfermedad: " + strAux, 15, (y + 20));
      this.parametrosBusqueda.strCampoA != "" && this.parametrosBusqueda.numCampoA != undefined ? strAux = this.parametrosBusqueda.strCampoA : strAux = "SIN ESPECIFICAR";
      doc.text("Paciente: " + strAux, 175, (y + 20));

      doc.line(5, (y + 25), 290, (y + 25));//down
      y = y + 25;
      doc.setFontSize(12);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 5));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número de atenciones encontrados: " + this.dataPermisosResult.length, 10, (y + 10));
      doc.text("Resultados a mostrar: " + this.dataPermisosResult.length + "/" + this.paginacion.selectPagination, 80, (y + 10));
      doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 150, (y + 10));
      doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 220, (y + 10));
      y = y + 15;

      doc.setFontSize(10);
      doc.setFont("arial", "bold")
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      doc.text("#", 9, (y + 7));
      doc.line(15, y, 15, (y + 10));//left
      doc.text("Paciente", 32, (y + 7));
      doc.line(70, y, 70, (y + 10));//left
      doc.text("Enfermedad CIE10", 82, (y + 7));
      doc.line(125, y, 125, (y + 10));//left
      doc.text("Tipo Permiso", 127, (y + 7));
      doc.line(150, y, 150, (y + 10));//left
      doc.text("Fecha Salida", 155, (y + 7));
      doc.line(180, y, 180, (y + 10));//left
      doc.text("Fecha Regreso", 185, (y + 7));
      doc.line(210, y, 210, (y + 10));//left
      doc.text("Observación", 225, (y + 7));
      doc.line(260, y, 260, (y + 10));//left
      doc.text("T. Días", 262, (y + 7));
      doc.line(275, y, 275, (y + 10));//left
      doc.text("T. Horas", 276, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorP: number = 0;
      var valorE: number = 0;
      var valorO: number = 0;
      var valorG: number = 0;
      var auxLinea: number;
      var lineaPaciente;
      var lineaEnfermedad;
      var lineaObservacion;

      for (var index = 0; index < this.dataPermisosResult.length; index++) {
        lineaPaciente = doc.splitTextToSize(this.dataPermisosResult[index].pacienteMedic.empleado, (50));
        lineaEnfermedad = doc.splitTextToSize(this.dataPermisosResult[index].enfermedadCIE10, (50));
        lineaObservacion = doc.splitTextToSize(this.dataPermisosResult[index].observacion, (45));

        valorP = (3 * lineaPaciente.length) + 4;
        valorE = (3 * lineaEnfermedad.length) + 4;
        valorO = (3 * lineaObservacion.length) + 4;
        if (valorP >= valorE && valorP >= valorO)
          valorG = valorP;
        if (valorE >= valorP && valorE >= valorO)
          valorG = valorE;
        if (valorO >= valorP && valorO >= valorE)
          valorG = valorO;
        y = y + valorG;

        if (y > 200) {
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

          doc.text("#", 9, (y + 7));
          doc.line(15, y, 15, (y + 10));//left
          doc.text("Paciente", 32, (y + 7));
          doc.line(70, y, 70, (y + 10));//left
          doc.text("Enfermedad CIE10", 82, (y + 7));
          doc.line(125, y, 125, (y + 10));//left
          doc.text("Tipo Permiso", 127, (y + 7));
          doc.line(150, y, 150, (y + 10));//left
          doc.text("Fecha Salida", 155, (y + 7));
          doc.line(180, y, 180, (y + 10));//left
          doc.text("Fecha Regreso", 185, (y + 7));
          doc.line(210, y, 210, (y + 10));//left
          doc.text("Observación", 225, (y + 7));
          doc.line(260, y, 260, (y + 10));//left
          doc.text("T. Días", 262, (y + 7));
          doc.line(275, y, 275, (y + 10));//left
          doc.text("T. Horas", 276, (y + 7));
          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.text((index + 1).toString(), 9, (y - ((valorG - 3) / 2)));
        doc.line(15, (y - valorG), 15, y);//right

        auxLinea = Number((valorG - (3 * lineaPaciente.length + (3 * (lineaPaciente.length - 1)))) / 2.5) + (2 + lineaPaciente.length);
        doc.text(lineaPaciente, 18, (y - valorG + auxLinea));
        doc.line(70, (y - valorG), 70, y);//right
        auxLinea = Number((valorG - (3 * lineaEnfermedad.length + (3 * (lineaEnfermedad.length - 1)))) / 2.5) + (2 + lineaEnfermedad.length);
        doc.text(lineaEnfermedad, 73, (y - valorG + auxLinea));
        doc.line(125, (y - valorG), 125, y);//right

        doc.text(this.dataPermisosResult[index].tipoPermiso, 130, (y - ((valorG - 3) / 2)));
        doc.line(150, (y - valorG), 150, y);//right
        doc.text(this.dataPermisosResult[index].fechaSalida, 154, (y - ((valorG - 3) / 2)));
        doc.line(180, (y - valorG), 180, y);//right
        doc.text(this.dataPermisosResult[index].fechaRegreso, 184, (y - ((valorG - 3) / 2)));
        doc.line(210, (y - valorG), 210, y);//right
        auxLinea = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + (2 + lineaObservacion.length);
        doc.text(lineaObservacion, 212, (y - valorG + auxLinea));
        doc.line(260, (y - valorG), 260, y);//right

        doc.text(this.dataPermisosResult[index].totalDias.toString(), 264, (y - ((valorG - 3) / 2)));
        doc.line(275, (y - valorG), 275, y);//right
        doc.text(this.dataPermisosResult[index].totalHoras.toString(), 279, (y - ((valorG - 3) / 2)));
      }
      doc.save("ListaPermisos" + ".pdf");
    }
  }

  onConvertPdf(dataIn: cPermisoMedic) {
    this.permisoMedicService.formData = new cPermisoMedic();
    this.permisoMedicService.formData.completarObject(dataIn);
    var y: number;
    var doc = new jsPDF();
    y = 5;
    var fechaHoy = new cFecha();
    var auxSepararInicio = this.permisoMedicService.formData.fechaSalida.split(" - ");
    var auxSepararRegreso = this.permisoMedicService.formData.fechaRegreso.split(" - ");
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_" + this.permisoMedicService.formData.pacienteMedic.idEmpresa + ".png";
    if (this.permisoMedicService.formData.pacienteMedic.idEmpresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);

    if (this.permisoMedicService.formData.pacienteMedic.idEmpresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);

    if (this.permisoMedicService.formData.pacienteMedic.idEmpresa == 4)
      doc.addImage(auxImage, "PNG", 10, 10, 35, 25);

    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 138));//left
    doc.line(205, y, 205, (y + 138));//right
    doc.line(5, (y + 138), 205, (y + 138));//down
    doc.line(1, (148), 209, (148));//downCut

    doc.setFontSize(12);
    doc.setFont("arial", "normal");
    doc.text("UNIDAD DE SALUD OCUPACIONAL", 70, (y + 8));
    doc.text("DEPARTAMENTO MÉDICO", 78, (y + 14));
    doc.text("MANTA - ECUADOR", 85, (y + 20));
    doc.setFont("arial", "bold");
    if (this.permisoMedicService.formData.totalDias == 0)
      doc.text("CERTIFICADO DE REPOSO POR HORAS", 65, (y + 33));
    else doc.text("CERTIFICADO DE REPOSO", 77, (y + 33));

    y = 50;
    doc.setFont("arial", "normal");
    doc.text("Certificó que el/la SR(A):", 10, y);
    doc.text("Debe guardar reposo médico, desde ", 10, (y + 7));

    if (this.permisoMedicService.formData.totalDias == 0) {
      doc.text("las:            hasta las:", 72, (y + 7));
    } else doc.text("el", 72, (y + 7));
    doc.text("Hasta:", 10, (y + 14));
    doc.text("Deberá acudir a consulta médica de la empresa:", 10, (y + 21));

    doc.setFont("arial", "bold");
    doc.text(this.permisoMedicService.formData.pacienteMedic.empleado + ".", 55, y);

    if (this.permisoMedicService.formData.totalDias == 0) {
      doc.text(auxSepararInicio[1] + "                 " + auxSepararRegreso[1], 79, (y + 7));
    } else {
      var auxMonth = fechaHoy.transformarStrMes(auxSepararInicio[0])
      var auxSepararInicioMas = auxSepararInicio[0].split("-");
      doc.text(auxSepararInicioMas[2] + " de " + auxMonth + " del " + auxSepararInicioMas[0], 77, (y + 7));
    }
    var auxMonth = fechaHoy.transformarStrMes(auxSepararRegreso[0])
    var auxSepararRegresoMas = auxSepararRegreso[0].split("-");
    doc.text(auxSepararRegresoMas[2] + " de " + auxMonth + " del " + auxSepararRegresoMas[0], 23, (y + 14));

    if (this.permisoMedicService.formData.regresaConsulta)
      doc.text("Si", 93, (y + 21));
    else doc.text("No", 93, (y + 21));

    y = y + 35;
    doc.setFont("arial", "normal");
    var lineaDiagnostico = doc.splitTextToSize("Diagnóstico: " + this.permisoMedicService.formData.enfermedadCIE10 + ".", (190));
    var lineaObservacion = doc.splitTextToSize("Observación: " + this.permisoMedicService.formData.observacion + ".", (190));
    var valorD = (3.5 * lineaDiagnostico.length) + 4;
    doc.text(lineaDiagnostico, 10, y);
    y = y + valorD;
    doc.text(lineaObservacion, 10, y);

    doc.text("Fecha de emisión:", 10, (139));
    doc.setFont("arial", "bold");
    doc.text(fechaHoy.strFecha, 43, (139));
    doc.line(70, (121), 140, (121));//downCut
    doc.text("FIRMA Y SELLO DEL MÉDICO", 74, (125));

    if (this.permisoMedicService.formData.totalDias > 0) {
      doc.setFont("arial", "normal");
      doc.setFontSize(8);
      var lineaAviso = doc.splitTextToSize("(*)Este permiso tiene validez por un máximo de tres (3) días contínuos. De ser necesario un permiso por más días el trabajador deberá tomar consulta en el IESS.", (190));
      doc.text(lineaAviso, 10, (132));
    }
    doc.save("PermisoMedico_" + this.permisoMedicService.formData.pacienteMedic.empleado + "_" + fechaHoy.strFecha + ".pdf");
  }
}
