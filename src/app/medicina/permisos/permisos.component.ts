import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cPacienteMedic, cPermisoMedic } from 'src/app/shared/medicina/medicina';
import { PacienteService } from 'src/app/shared/medicina/paciente.service';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpricePersonal, cFecha } from 'src/app/shared/otrosServices/varios';
import listCie10 from 'src/assets/cie10code.json';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-permisos',
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent implements OnInit {
  public get permisoMedicService(): PermisoService {
    return this._permisoMedicService;
  }
  public set permisoMedicService(value: PermisoService) {
    this._permisoMedicService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get pacienteService(): PacienteService {
    return this._pacienteService;
  }
  public set pacienteService(value: PacienteService) {
    this._pacienteService = value;
  }


  @Input() isOpen: number = 0;
  @Input() idPacienteIn: number = undefined;
  @Input() pacienteNombre: string = "";
  @Input() enfermedadCIE10In: string = "";
  @Input() empresa: number;

  @Output()
  cerrar: EventEmitter<string> = new EventEmitter<string>();

  fechaHoy = new cFecha();
  listCie10Array = listCie10;
  listPacienteFiltros$: any;

  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _permisoMedicService: PermisoService, private toastr: ToastrService, private _pacienteService: PacienteService, private _enterpriceService: ApiEnterpriceService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm() {
    this.permisoMedicService.formData = new cPermisoMedic();
    if (this.isOpen == 1) {
      this.permisoMedicService.formData.pacienteMedicId = this.idPacienteIn;
      this.permisoMedicService.formData.enfermedadCIE10 = this.enfermedadCIE10In;
    } else {
      this._pacienteService.formData = new cPacienteMedic();
      this.pacienteNombre = "";
      this.empresa = undefined;
    };
  }

  onTerminar(op: number, reposoIdIn?: number) {
    var strOp = op + "";
    if (reposoIdIn != null)
      strOp = strOp + "-" + reposoIdIn;
    this.cerrar.emit(strOp);
  }

  onListCIE(value: string) {
    if (value != '') {
      this.permisoMedicService.formData.spinnerLoading = 2;
      this.permisoMedicService.formData.showSearchSelect = 2;
      this.permisoMedicService.formData.enfermedadCIE10 = value;
    } else this.permisoMedicService.formData.spinnerLoading = 0;
  }

  onChooseEnfermedad(data: any) {
    this.permisoMedicService.formData.spinnerLoading = 4;
    this.permisoMedicService.formData.showSearchSelect = 0;
    if (data != "Nuevo")
      this.permisoMedicService.formData.enfermedadCIE10 = data.code + ": " + data.description;
  }

  onListPasciente(value: string) {
    this.permisoMedicService.formData.spinnerLoading = 1;
    this.permisoMedicService.formData.showSearchSelect = 1;
    var strParametro = "all@" + value + "@SIN ASIGNAR";
    this.pacienteNombre = value;
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          return x;
        }),
        finalize(() => this.permisoMedicService.formData.spinnerLoading = 0)
      );
    } else this.permisoMedicService.formData.spinnerLoading = 0;
  }

  onChoosePaciente(dataIn: cEnterpricePersonal) {
    this.permisoMedicService.formData.spinnerLoading = 3;
    this.permisoMedicService.formData.showSearchSelect = 0;
    this.pacienteNombre = dataIn.empleado;
    this.empresa = dataIn.idEmpresa;
    this._pacienteService.getPacienteById(dataIn.idEmpleado).subscribe((dato: any) => {
      if (dato.exito == 1) {
        if (dato.message == "Ok")
          this.permisoMedicService.formData.pacienteMedicId = dato.data.idPacienteMedic;
        else {
          this._pacienteService.formData = new cPacienteMedic();
          this._pacienteService.formData.cedula = dataIn.cedula;
          this._pacienteService.formData.empleadoId = dataIn.idEmpleado;
          this._pacienteService.formData.empleado = dataIn.empleado;
          this._pacienteService.formData.tipoSangre = dataIn.tipoSangre;
        }
      }
    });
  }

  onSubmit(form: NgForm) {
    if (this.isOpen == 0) {
      if ((this._permisoMedicService.formData.spinnerLoading == 3 || this._permisoMedicService.formData.spinnerLoading == 4) && this.permisoMedicService.formData.tipoPermiso != "SIN ASIGNAR") {
        if (this._permisoMedicService.formData.pacienteMedicId == undefined) {
          this._pacienteService.insertarDataPaciente(this._pacienteService.formData).subscribe(
            (res: any) => {
              if (res.exito == 1) {
                this.permisoMedicService.formData.pacienteMedicId = res.data.idPacienteMedic;
                this.guardarPermiso();
              }
              else this.toastr.error('Se ha producido un inconveniente', 'Error');
            }
          );
        } else this.guardarPermiso();
      }
      else {
        if (this._permisoMedicService.formData.showSearchSelect == 1)
          this.pacienteNombre = null;
        else this.permisoMedicService.formData.enfermedadCIE10 = null;
      }
    } else {
      if (this.permisoMedicService.formData.tipoPermiso != "SIN ASIGNAR")
        this.guardarPermiso();
    }
  }

  guardarPermiso() {
    this._permisoMedicService.insertarPermiso(this._permisoMedicService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          this.onConvertPdf();
          this.toastr.success('Registro de permiso satisfactorio', 'Permiso Médico');
          if (this.isOpen == 0)
            this.resetForm();
          else this.onTerminar(2, res.data.idPermisoMedic);
        } else this.toastr.error('Se ha producido un inconveniente', 'Error');
      }
    );
  }

  onConvertPdf() {
    var y: number;
    var doc = new jsPDF();
    y = 5;
    var fechaHoy = new cFecha();
    var auxSepararInicio = this.permisoMedicService.formData.fechaSalida.split("T");
    var auxSepararRegreso = this.permisoMedicService.formData.fechaRegreso.split("T");
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_" + this.empresa + ".png";
    if (this.empresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);

    if (this.empresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);

    if (this.empresa == 4)
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
    doc.text(this.pacienteNombre + ".", 55, y);
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
    doc.save("PermisoMedico_" + this.pacienteNombre + "_" + fechaHoy.strFecha + ".pdf");
  }
}
