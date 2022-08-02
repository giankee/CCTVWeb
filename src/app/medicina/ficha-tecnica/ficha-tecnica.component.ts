import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faFileAlt, faPrint, faSave, faSearch, faStethoscope, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cPacienteInfoCompleta } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpricePersonal, cFecha } from 'src/app/shared/otrosServices/varios';
import { jsPDF } from "jspdf";


@Component({
  selector: 'app-ficha-tecnica',
  templateUrl: './ficha-tecnica.component.html',
  styleUrls: ['./ficha-tecnica.component.css']
})
export class FichaTecnicaComponent implements OnInit {
  public get pacienteService(): PacienteService {
    return this._pacienteService;
  }
  public set pacienteService(value: PacienteService) {
    this._pacienteService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }

  listPacienteFiltros$: any;
  dataOrdenesResult: cEnterpricePersonal[] = [];
  dataCopy: cEnterpricePersonal[] = [];
  datoPersona: cPacienteInfoCompleta = null;
  filtroPersona: string = "";
  filtroEmpresa: string = "SIN ASIGNAR";
  spinnerLoading: number = 0;
  openSide: string = "DatosG";
  strFases: string = "Principal";
  atencionIsOpened: boolean = false;
  formularioIsOpened: boolean = false;
  listPermisosIsOpened: boolean = false;
  listAccidnetesIsOpened: boolean = false;

  fasave = faSave; fasearch = faSearch; fastethoscope = faStethoscope; fafile = faFileAlt; fatimescircle = faTimesCircle; faprint = faPrint;
  constructor(private _enterpriceService: ApiEnterpriceService, private _pacienteService: PacienteService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.resetForm();
    this.onListPasciente('A');
  }

  resetForm() {
    this.datoPersona = new cPacienteInfoCompleta();
  }

  onListPasciente(value: string) {
    this.spinnerLoading = 1;
    var strParametro = "all@datoNull@" + this.filtroEmpresa;
    if (value != "") {
      strParametro = "all@" + value + "@" + this.filtroEmpresa;
    } else this.spinnerLoading = 0;

    this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
      map((x: cEnterpricePersonal[]) => {
        var fechaHoy = new cFecha();

        x.forEach(y => {
          y.fecha_Nacido = y.fecha_Nacido.substring(0, 10);
          y.edad = fechaHoy.sacarEdad(y.fecha_Nacido, fechaHoy.strFecha, 'number');
        });
        this.dataCopy = x;
        return x.slice(0, 14)

      }),
      finalize(() => this.spinnerLoading = 0)
    );
  }

  onChoosePaciente(dataIn: cEnterpricePersonal) {
    this.datoPersona = new cPacienteInfoCompleta();
    this._pacienteService.getPacienteCedula(dataIn.cedula).subscribe((dato: any) => {
      if (dato.exito == 1) {
        this.datoPersona.datosEnterprice.completarObj(dataIn);
        if (dato.message == "Ok")
          this.datoPersona.datosPaciente.completarObject(dato.data);
        else {
          this.datoPersona.datosPaciente.cedula = this.datoPersona.datosEnterprice.cedula;
          this.datoPersona.datosPaciente.nombreEmpleado = this.datoPersona.datosEnterprice.empleado;
          this.datoPersona.datosPaciente.tipoSangre = this.datoPersona.datosEnterprice.tipoSangre;
        }
      }
    });
  }

  getDataFiltro(data: cEnterpricePersonal[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataOrdenesResult.length) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
    }
  }

  onChangePage(opIn: string) {
    this.openSide = opIn;
    if (this.openSide == "Permisos")
      this.listPermisosIsOpened = true;
    else this.listPermisosIsOpened = false;
    if (this.openSide == "Accidentes")
      this.listAccidnetesIsOpened = true;
    else this.listAccidnetesIsOpened = false;
  }

  onSubmit(form: NgForm) {
    if (this.datoPersona.datosPaciente.cedula != "") {
      if (!this.datoPersona.datosPaciente.minusvalido) {
        this.datoPersona.datosPaciente.tipoMinusvalido = "SIN ASIGNAR";
        this.datoPersona.datosPaciente.porcentajeMinusvalido = 0;
      }
      if (!this.datoPersona.datosPaciente.ecnt)
        this.datoPersona.datosPaciente.tipoECNT = "SIN ASIGNAR";

      if (this.datoPersona.datosPaciente.idPacienteMedic == undefined)
        this._pacienteService.insertarDataPaciente(this.datoPersona.datosPaciente).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.datoPersona.datosPaciente.idPacienteMedic = res.data.idPacienteMedic;
              this.datoPersona.datosPaciente.antecedentes.idAntecedente = res.data.antecedentes.idAntecedente;
              this.datoPersona.datosPaciente.antecedentes.pacienteMedicId = res.data.antecedentes.pacienteMedicId;
              this.toastr.success('Actualización satisfactorio', 'Ficha Médica');
            }
            else this.toastr.error('Actualización de Ficha Médica', 'Error');
          }
        );
      else
        this._pacienteService.actualizarPaciente(this.datoPersona.datosPaciente).subscribe(
          (res: any) => {
            if (res.exito == 1)
              this.toastr.success('Actualización satisfactorio', 'Ficha Médica');
            else this.toastr.error('Actualización de Ficha Médica', 'Error');
          }
        );
    }
  }

  recibirRes(salir: boolean, tipo: string) {
    if (tipo == "atencion")
      this.atencionIsOpened = !salir;
    if (tipo == "formulario")
      this.formularioIsOpened = !salir;
    this.strFases = "Principal";
  }

  onStart(op: string) {
    if (this.datoPersona.datosPaciente.idPacienteMedic != undefined) {
      this.strFases = op;
      if (op == "Atencion")
        this.atencionIsOpened = true;
      else this.formularioIsOpened = true;
    }
  }

  onConvertPdfAll() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(18);
    doc.setFont("arial", "bold")
    doc.text("Lista de Trabajadores", 110, 15);
    y = 20;
    doc.line(5, y, 290, y);//up
    doc.line(5, y, 5, (y + 20));//left
    doc.line(290, y, 290, (y + 20));//right
    doc.line(5, (y + 20), 290, (y + 20));//down
    doc.setFontSize(13);
    doc.text("Parámetros de Búsqueda", 15, (y + 10));
    doc.setFont("arial", "normal");
    doc.setFontSize(11);
    doc.text("Número productos encontrados:" + this.dataCopy.length, 10, (y + 15));
    if (this.filtroPersona != "")
      doc.text("Palabra Clave: " + this.filtroPersona, 80, (y + 15));
    if (this.filtroEmpresa != "SIN ASIGNAR") {
      var auxEmpresa = "DANIEL BUEHS";
      if (this.filtroEmpresa == '1')
        auxEmpresa = "MANACRIPEX";
      if (this.filtroEmpresa == '3')
        auxEmpresa = "B&B TUNE";
      doc.text("Empresa: " + auxEmpresa, 150, (y + 15));
    }

    y = y + 20;

    doc.setFontSize(10);
    doc.setFont("arial", "bold")
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("Cédula", 14, (y + 7));
    doc.line(30, y, 30, (y + 10));//right
    doc.text("Nombre y Apellido", 45, (y + 7));
    doc.line(90, y, 90, (y + 10));//right
    doc.text("Fecha Nacimiento", 92, (y + 7));
    doc.line(120, y, 120, (y + 10));//right
    doc.text("Edad", 123, (y + 7));
    doc.line(135, y, 135, (y + 10));//right
    doc.text("Empresa", 145, (y + 7));
    doc.line(165, y, 165, (y + 10));//right
    doc.text("Cargo", 180, (y + 7));
    doc.line(210, y, 210, (y + 10));//right
    doc.text("Función", 225, (y + 7));
    doc.line(265, y, 265, (y + 10));//right
    doc.text("Teléfono", 270, (y + 7));

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");

    var valorN: number = 0;
    var valorC: number = 0;
    var valorF: number = 0;
    var valorG: number = 0;
    var auxLinea: number;
    var lineaNombre;
    var lineaCargo;
    var lineaFuncion;

    for (var i = 0; i < this.dataCopy.length; i++) {
      lineaNombre = doc.splitTextToSize(this.dataCopy[i].empleado, (55));
      lineaCargo = doc.splitTextToSize(this.dataCopy[i].departamento, (40));
      lineaFuncion = doc.splitTextToSize(this.dataCopy[i].funcion, (50));
      var lineaEmpresa = "MANACRIPEX";
      if (this.dataCopy[i].idEmpresa == 3)
        lineaEmpresa = "B&B TUNE";
      if (this.dataCopy[i].idEmpresa == 4)
        lineaEmpresa = "DANIEL BUEHS";

      valorN = (3.5 * lineaNombre.length) + 4;
      valorC = (3.5 * lineaCargo.length) + 4;
      valorF = (3.5 * lineaFuncion.length) + 4;

      if (valorN >= valorC && valorN >= valorF) {
        valorG = valorN;
      }
      if (valorC >= valorN && valorC >= valorF) {
        valorG = valorC;
      }
      if (valorF >= valorN && valorF >= valorC) {
        valorG = valorF;
      }
      y = y + valorG;

      if (y > 205) {
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

        doc.text("Cédula", 14, (y + 7));
        doc.line(30, y, 30, (y + 10));//right
        doc.text("Nombre y Apellido", 45, (y + 7));
        doc.line(90, y, 90, (y + 10));//right
        doc.text("Fecha Nacimiento", 92, (y + 7));
        doc.line(120, y, 120, (y + 10));//right
        doc.text("Edad", 123, (y + 7));
        doc.line(135, y, 135, (y + 10));//right
        doc.text("Empresa", 145, (y + 7));
        doc.line(165, y, 165, (y + 10));//right
        doc.text("Cargo", 180, (y + 7));
        doc.line(210, y, 210, (y + 10));//right
        doc.text("Función", 225, (y + 7));
        doc.line(265, y, 265, (y + 10));//right
        doc.text("Teléfono", 270, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(5, (y - valorG), 5, y);//left
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down +10y1y2

      doc.text(this.dataCopy[i].cedula, 10, (y - ((valorG - 3) / 2)));
      doc.line(30, (y - valorG), 30, y);//right
      auxLinea = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + (2 + lineaNombre.length);
      doc.text(lineaNombre, 33, (y - valorG + auxLinea));
      doc.line(90, (y - valorG), 90, y);//right
      doc.text(this.dataCopy[i].fecha_Nacido, 98, (y - ((valorG - 3) / 2)));
      doc.line(120, (y - valorG), 120, y);//right
      doc.text(this.dataCopy[i].edad, 128, (y - ((valorG - 3) / 2)));
      doc.line(135, (y - valorG), 135, y);//right
      doc.text(lineaEmpresa, 140, (y - ((valorG - 3) / 2)));
      doc.line(165, (y - valorG), 165, y);//right
      auxLinea = Number((valorG - (3 * lineaCargo.length + (3 * (lineaCargo.length - 1)))) / 2.5) + (2 + lineaCargo.length);
      doc.text(lineaCargo, 170, (y - valorG + auxLinea));
      doc.line(210, (y - valorG), 210, y);//right
      auxLinea = Number((valorG - (3 * lineaFuncion.length + (3 * (lineaFuncion.length - 1)))) / 2.5) + (2 + lineaFuncion.length);
      doc.text(lineaFuncion, 215, (y - valorG + auxLinea));
      doc.line(265, (y - valorG), 265, y);//right
      doc.text(this.dataCopy[i].telf_Movil, 270, (y - ((valorG - 3) / 2)));
    }
    doc.save("ListaPersonal.pdf");
  }
}
