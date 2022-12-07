import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cPacienteInfoCompleta, cPacienteMedic, cPermisoMedic } from 'src/app/shared/medicina/medicina';
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
  @Input() enfermedadCIE10In: string = "";

  @Output() cerrar: EventEmitter<string> = new EventEmitter<string>();

  fechaHoy = new cFecha();
  listCie10Array = listCie10;
  listPacienteFiltros$: any;
  blockFechaHasta: boolean = true;
  sacarHoraJornada: boolean = false;
  fechasDistintas: boolean = false;
  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _permisoMedicService: PermisoService, private toastr: ToastrService, private _pacienteService: PacienteService, private _enterpriceService: ApiEnterpriceService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm() {
    this.pacienteService.datoPersona = new cPacienteInfoCompleta();
    this.permisoMedicService.formData = new cPermisoMedic();
    if (this.isOpen == 1) {
      this.permisoMedicService.formData.pacienteMedicId = this.idPacienteIn;
      this.permisoMedicService.formData.enfermedadCIE10 = this.enfermedadCIE10In;
      this.sacarDatosPaciente(this.idPacienteIn, "cctv");
    }
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
    this.pacienteService.datoPersona.datosEnterprice.empleado = value;
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
    this.blockFechaHasta = false;
    this.pacienteService.datoPersona = new cPacienteInfoCompleta();

    this.permisoMedicService.formData.spinnerLoading = 3;
    this.permisoMedicService.formData.showSearchSelect = 0;
    this.pacienteService.datoPersona.datosEnterprice.completarObj(dataIn);
    this.sacarDatosPaciente(dataIn.idEmpleado, "enterprice");
  }

  onSubmit(form: NgForm) {
    if (this.isOpen == 0) {
      if ((this._permisoMedicService.formData.spinnerLoading == 3 || this._permisoMedicService.formData.spinnerLoading == 4) && this.permisoMedicService.formData.tipoPermiso != "SIN ASIGNAR") {
        if (this._permisoMedicService.formData.pacienteMedicId == undefined) {
          this._pacienteService.insertarDataPaciente(this._pacienteService.datoPersona.datosPaciente).subscribe(
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
          this.pacienteService.datoPersona.datosEnterprice.empleado = null;
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
    auxImage.src = "/assets/img/LOGO_" + this.pacienteService.datoPersona.datosEnterprice.idEmpresa + ".png";
    if (this.pacienteService.datoPersona.datosEnterprice.idEmpresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);

    if (this.pacienteService.datoPersona.datosEnterprice.idEmpresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);

    if (this.pacienteService.datoPersona.datosEnterprice.idEmpresa == 4)
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
    if (!this.fechasDistintas)
      doc.text("CERTIFICADO DE REPOSO POR HORAS", 65, (y + 33));
    else doc.text("CERTIFICADO DE REPOSO", 77, (y + 33));

    y = 50;
    doc.setFont("arial", "normal");
    doc.text("Certificó que el/la SR(A):", 10, y);
    doc.text("Debe guardar reposo médico, desde ", 10, (y + 7));

    if (!this.fechasDistintas) {
      doc.text("las:            hasta las:", 72, (y + 7));
    } else {
      doc.text("las", 72, (y + 7));
      doc.text("Hasta las:", 10, (y + 14));
    }
    doc.text("Deberá acudir a consulta médica de la empresa:", 10, (y + 21));

    doc.setFont("arial", "bold");
    doc.text(this.pacienteService.datoPersona.datosEnterprice.empleado + ".", 55, y);

    var auxMonth = fechaHoy.transformarStrMes(auxSepararRegreso[0])
    var auxSepararRegresoMas = auxSepararRegreso[0].split("-");

    if (!this.fechasDistintas) {
      doc.text(auxSepararInicio[1], 79, (y + 7));
      doc.text(auxSepararRegreso[1] + " del " + auxSepararRegresoMas[2] + " de " + auxMonth + " del " + auxSepararRegresoMas[0], 107, (y + 7));
    } else {
      var auxMonth = fechaHoy.transformarStrMes(auxSepararInicio[0])
      var auxSepararInicioMas = auxSepararInicio[0].split("-");
      doc.text(auxSepararInicio[1] + " del " + auxSepararInicioMas[2] + " de " + auxMonth + " del " + auxSepararInicioMas[0], 77, (y + 7));
      doc.text(auxSepararRegreso[1] + " del " + auxSepararRegresoMas[2] + " de " + auxMonth + " del " + auxSepararRegresoMas[0], 28, (y + 14));
    }

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
    doc.save("PermisoMedico_" + this.pacienteService.datoPersona.datosEnterprice.empleado + "_" + fechaHoy.strFecha + ".pdf");
  }

  sacarDatosPaciente(personaId: number, tipoIn: string) {
    this._pacienteService.getPacienteById(tipoIn + "@" + personaId).subscribe((dato: any) => {
      if (dato.exito == 1) {
        if (dato.message == "Ok") {
          this.permisoMedicService.formData.pacienteMedicId = dato.data.idPacienteMedic;
          this.pacienteService.datoPersona.datosEnterprice.cedula = dato.data.cedula;
          this.pacienteService.datoPersona.datosEnterprice.empleado = dato.data.empleado;
          this.pacienteService.datoPersona.datosEnterprice.idEmpresa = dato.data.idEmpresa;
          this.pacienteService.datoPersona.datosEnterprice.recesoS = dato.data.recesoS;
          this.pacienteService.datoPersona.datosEnterprice.recesoE = dato.data.recesoE;
          this.pacienteService.datoPersona.datosEnterprice.horaS = dato.data.horaS;
        }
        else {
          this.pacienteService.datoPersona.datosPaciente = new cPacienteMedic();
          this.pacienteService.datoPersona.datosPaciente.empleadoId = this.pacienteService.datoPersona.datosEnterprice.idEmpleado;
          this.pacienteService.datoPersona.datosPaciente.tipoSangre = this.pacienteService.datoPersona.datosEnterprice.tipoSangre;
        }
        this.blockFechaHasta = false;
      }
    });
  }

  onComprobarTime() {
    let fechaHoy: cFecha = new cFecha();
    this.permisoMedicService.formData.totalHoras = "00:00";
    this.permisoMedicService.formData.auxHoraParcial = "00:00";
    var separarFechaHoraS = this.permisoMedicService.formData.fechaSalida.split("T");
    var separarFechaHoraE = this.permisoMedicService.formData.fechaRegreso.split("T");
    var horaS = separarFechaHoraS[1].split(":");
    var horaE = separarFechaHoraE[1].split(":");
    this.permisoMedicService.formData.totalDias = fechaHoy.compararFechasDias(separarFechaHoraS[0], separarFechaHoraE[0], this.permisoMedicService.formData.incluirSabados);
    var auxMinDebe = 0;
    var auxTotalHoras = 0;
    if (this._pacienteService.datoPersona.datosEnterprice.horaS != null && this._pacienteService.datoPersona.datosEnterprice.horaS != '') {
      var horaRecesoS = this.pacienteService.datoPersona.datosEnterprice.recesoS.split(":");
      var horaRecesoE = this.pacienteService.datoPersona.datosEnterprice.recesoE.split(":");
      var horaSalidaSeparar = this.pacienteService.datoPersona.datosEnterprice.horaS.split(":");
      if (this.permisoMedicService.formData.totalDias == 0) {
        this.fechasDistintas = false;
        if ((Number(horaS[0]) >= Number(horaE[0])))
          horaE[0] = (Number(horaS[0]) + 1).toString();
      }
      if (Number(horaS[0]) < 8) {
        horaS[0] = "08";
        horaS[1] = "00";
      }
      if (Number(horaE[0]) < 8) {
        horaE[0] = "08";
        horaE[1] = "00";
      }
      if (Number(horaS[0]) >= Number(horaSalidaSeparar[0])) {
        horaS[0] = horaSalidaSeparar[0];
        horaS[1] = "00";
      }
      if (Number(horaE[0]) >= Number(horaSalidaSeparar[0])) {
        horaE[0] = horaSalidaSeparar[0];
        horaE[1] = "00";
      }
      if (Number(horaS[0]) >= Number(horaRecesoS[0]) && Number(horaS[0]) < Number(horaRecesoE[0])) {
        horaS[0] = horaRecesoE[0];
        horaS[1] = "00";
      }
      if (Number(horaE[0]) >= Number(horaRecesoS[0]) && Number(horaE[0]) <= Number(horaRecesoE[0])) {
        if (Number(horaE[0]) == Number(horaRecesoE[0])) {
          if (Number(horaE[1]) == 0) {
            horaE[0] = horaRecesoS[0];
            horaE[1] = "00";
          }
        } else {
          horaE[0] = horaRecesoS[0];
          horaE[1] = "00";
        }

      }
      this.permisoMedicService.formData.fechaSalida = separarFechaHoraS[0] + "T" + horaS[0] + ":" + horaS[1];
      this.permisoMedicService.formData.fechaRegreso = separarFechaHoraE[0] + "T" + horaE[0] + ":" + horaE[1];


      var auxHoraComparar = Number(horaSalidaSeparar[0]);
      var auxHoraCompararH = 0;
      if (this.permisoMedicService.formData.totalDias == 0) {
        auxHoraComparar = Number(horaE[0]);
        auxHoraCompararH = Number(horaE[1]);
      }
      for (var i = Number(horaS[0]); i <= auxHoraComparar; i++) {
        if ((i != Number(horaS[0]) && i != auxHoraComparar) && (i < Number(horaRecesoS[0]) || i >= Number(horaRecesoE[0]))) {
          auxTotalHoras++;
        }
        if (i == Number(horaS[0])) {
          if (Number(horaS[1]) != 0) {
            auxMinDebe = auxMinDebe + (60 - Number(horaS[1]));
            if (auxMinDebe < 0)
              auxMinDebe = auxMinDebe * -1;
          }
          else auxTotalHoras++;
        }
        if (i == auxHoraComparar) {
          if (auxHoraCompararH != 0) {
            auxMinDebe = auxMinDebe + (auxHoraCompararH);
            if (auxMinDebe < 0) {
              auxMinDebe = auxMinDebe * -1;
            }
          }
          if (auxMinDebe != 0) {
            if (auxMinDebe >= 60) {
              auxMinDebe = 60 - auxMinDebe;
              auxTotalHoras++;
              if (auxMinDebe < 0) {
                auxMinDebe = auxMinDebe * -1;
              }
            }
          }
        }
      }
      if (this.permisoMedicService.formData.totalDias != 0) {
        this.fechasDistintas = true;
        if (Number(horaSalidaSeparar[0] != horaE[0])) {
          this.permisoMedicService.formData.totalDias--;
          for (var i = 8; i <= Number(horaE[0]); i++) {
            if (i != Number(horaE[0]) && (i < Number(horaRecesoS[0]) || i >= Number(horaRecesoE[0])))
              auxTotalHoras++;
            if (i == Number(horaE[0])) {
              if (Number(horaE[1]) != 0) {
                auxMinDebe = auxMinDebe + (Number(horaE[1]));
                if (auxMinDebe < 0)
                  auxMinDebe = auxMinDebe * -1;
              }
              if (auxMinDebe != 0) {
                if (auxMinDebe >= 60) {
                  auxMinDebe = 60 - auxMinDebe;
                  auxTotalHoras++;
                  if (auxMinDebe < 0)
                    auxMinDebe = auxMinDebe * -1;
                }
              }
            }
          }
        }
      }
      if (auxTotalHoras >= 8) {
        auxTotalHoras = auxTotalHoras - 8;
        this.permisoMedicService.formData.totalDias++;
      }
      if (auxMinDebe < 10) {
        this.permisoMedicService.formData.auxHoraParcial = auxTotalHoras + ":0" + auxMinDebe;
        this.permisoMedicService.formData.totalHoras = (this.permisoMedicService.formData.totalDias * 8) + auxTotalHoras + ":0" + auxMinDebe;
      }
      else {
        this.permisoMedicService.formData.auxHoraParcial = auxTotalHoras + ":" + auxMinDebe;
        this.permisoMedicService.formData.totalHoras = (this.permisoMedicService.formData.totalDias * 8) + auxTotalHoras + ":" + auxMinDebe;
      }
    } else {
      var auxHoraComparar = Number(horaE[0]);
      var auxHoraCompararH = Number(horaE[1]);

      if (this.permisoMedicService.formData.totalDias != 0) {
        this.fechasDistintas = true;
        this.sacarHoraJornada = true;
        var horaJornada = this.permisoMedicService.formData.horaFinJornada.split(":");
        auxHoraComparar = Number(horaJornada[0]);
        auxHoraCompararH = Number(horaJornada[1]);
      } else {
        this.sacarHoraJornada = false;
        this.fechasDistintas = false;
      }
      for (var i = Number(horaS[0]); i <= auxHoraComparar; i++) {
        if (auxTotalHoras < 8) {
          if ((i != Number(horaS[0]) && i != auxHoraComparar))
            auxTotalHoras++;
          if (i == Number(horaS[0])) {
            if (Number(horaS[1]) != 0) {
              auxMinDebe = auxMinDebe + (60 - Number(horaS[1]));
              if (auxMinDebe < 0)
                auxMinDebe = auxMinDebe * -1;
            }
            else auxTotalHoras++;
          }
          if (i == auxHoraComparar) {
            if (auxHoraCompararH != 0) {
              auxMinDebe = auxMinDebe + (auxHoraCompararH);
              if (auxMinDebe < 0) {
                auxMinDebe = auxMinDebe * -1;
              }
            }
            if (auxMinDebe != 0) {
              if (auxMinDebe >= 60) {
                auxMinDebe = 60 - auxMinDebe;
                auxTotalHoras++;
                if (auxMinDebe < 0) {
                  auxMinDebe = auxMinDebe * -1;
                }
              }
            }
          }
        }
      }
      if (this.sacarHoraJornada) {
        if (auxHoraComparar < Number(horaE[0])) {
          horaE[0] = auxHoraComparar.toString();
          horaE[1] = auxHoraCompararH.toString();
          this.permisoMedicService.formData.fechaRegreso = separarFechaHoraE[0] + "T" + horaE[0] + ":" + horaE[1];
        }
        var horasDifSalida = auxHoraComparar - Number(horaE[0]);
        var minDifSalida = 60 - Number(horaE[1]);
        if (minDifSalida == 60)
          minDifSalida = 0;
        if (horasDifSalida != 0) {
          this.permisoMedicService.formData.totalDias--;
          auxTotalHoras = auxTotalHoras + (8 - horasDifSalida);
        }
        auxMinDebe = auxMinDebe + minDifSalida;
        if (auxMinDebe >= 60) {
          auxMinDebe = 60 - auxMinDebe;
          auxTotalHoras++;
        }
        if (auxTotalHoras >= 8) {
          auxTotalHoras = auxTotalHoras - 8;
          this.permisoMedicService.formData.totalDias++;
        }
      }
      if (auxMinDebe < 10) {
        this.permisoMedicService.formData.auxHoraParcial = auxTotalHoras + ":0" + auxMinDebe;
        this.permisoMedicService.formData.totalHoras = (this.permisoMedicService.formData.totalDias * 8) + auxTotalHoras + ":0" + auxMinDebe;
      }
      else {
        this.permisoMedicService.formData.auxHoraParcial = auxTotalHoras + ":" + auxMinDebe;
        this.permisoMedicService.formData.totalHoras = (this.permisoMedicService.formData.totalDias * 8) + auxTotalHoras + ":" + auxMinDebe;
      }
    }
  }
}
