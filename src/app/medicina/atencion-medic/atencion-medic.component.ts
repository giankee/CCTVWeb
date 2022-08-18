import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { cAtencionMedic } from 'src/app/shared/medicina/medicina';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import listCie10 from 'src/assets/cie10code.json';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-atencion-medic',
  templateUrl: './atencion-medic.component.html',
  styles: [],
})
export class AtencionMedicComponent implements OnInit {
  public get permisoMedicService(): PermisoService {
    return this._permisoMedicService;
  }
  public set permisoMedicService(value: PermisoService) {
    this._permisoMedicService = value;
  }
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  @Input() isOpen: boolean;
  @Input() idPacienteIn: number;
  @Input() pacienteNombre: string;

  @Input() peso: number;
  @Input() altura: number;
  @Input() empresa: number;
  @Input() edad: string;

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  okBttnSubmit: boolean = true;
  listCie10Array = listCie10;
  permisoOpened: number = 0 //0 cerrarSinGuardar //1 abrir, //2 cerrarCompleta
  soloAnios: string;

  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _atencionMedicService: AtencionService, private toastr: ToastrService, private _permisoMedicService: PermisoService) { }

  ngOnInit(): void {
    this._atencionMedicService.formData = new cAtencionMedic();
    this._atencionMedicService.formData.pacienteMedicId = this.idPacienteIn;
    this._atencionMedicService.formData.peso = this.peso;
    this._atencionMedicService.formData.altura = this.altura;
    this.soloAnios = (this.edad.split("años"))[0];
  }

  onTerminar() {
    if (this.permisoOpened == 2) {
      this._permisoMedicService.eliminarPermiso(this.atencionMedicService.formData.permisoIdOpcional).subscribe(
        (res: any) => {
          this.cerrar.emit(true);
        }
      );
    } else this.cerrar.emit(true);
  }

  onListCIE(value: string) {
    this._atencionMedicService.formData.spinnerLoading = false;
    if (value != '') {
      this.atencionMedicService.formData.showSearchSelect = true;
      this._atencionMedicService.formData.enfermedadCIE10 = value;
    }
  }

  onChooseEnfermedad(data: any) {
    this.atencionMedicService.formData.spinnerLoading = true;
    this._atencionMedicService.formData.showSearchSelect = false;
    if (data != "Nuevo")
      this._atencionMedicService.formData.enfermedadCIE10 = data.code + ": " + data.description;
  }

  onSubmit(form: NgForm) {
    if (this._atencionMedicService.formData.spinnerLoading) {
      this._atencionMedicService.formData.presion = this.atencionMedicService.formData.presionA + "/" + this.atencionMedicService.formData.presionB;
      this._atencionMedicService.insertarAtencion(this._atencionMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro de atención satisfactorio', 'Atención Médica');
            if (this.atencionMedicService.formData.prescripcion != "NA" && this.atencionMedicService.formData.indicaciones != "NA")
              this.onConvertPdfReceta();
          } else this.toastr.error('Se ha producido un inconveniente', 'Error');
          this.cerrar.emit(true);
        }
      );
    }
  }

  onChangePermiso() {
    if (this.atencionMedicService.formData.reposo)
      this.permisoOpened = 1;
  }

  recibirRes(salir: string) {
    if (salir == '0') {
      this.permisoOpened = 0;
      this.atencionMedicService.formData.reposo = false;
    } else {
      var aux = salir.split("-");
      this.permisoOpened = Number(aux[0]);
      this.atencionMedicService.formData.permisoIdOpcional = Number(aux[1]);
    }
  }

  onConvertPdfAtencion() {
    var y: number;
    var doc = new jsPDF();
    var lineaAux;
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_" + this.empresa + ".png";
    if (this.empresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);
    if (this.empresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);
    if (this.empresa == 4)
      doc.addImage(auxImage, "PNG", 10, 10, 35, 25);

    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 285));//left
    doc.line(205, y, 205, (y + 285));//right
    doc.line(5, (y + 35), 205, (y + 35));//mid1
    doc.line(5, (y + 285), 205, (y + 285));//down

    doc.setFontSize(11);
    doc.setFont("arial", "bold");
    doc.text("ATENCIÓN MÉDICA", 86, (y + 10));
    doc.setFontSize(10);
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 74, (y + 15));
    doc.text("Dra. Medicina y Cirugía General", 82, (y + 19));
    doc.text("Medicina Ocupacional", 88, (y + 23));
    doc.text("Telef. 0983514650", 91, (y + 27));

    doc.text("FECHA: Manta,", 155, (y + 33));
    doc.setFont("arial", "normal");
    doc.text(this._atencionMedicService.formData.fechaAtencion, 182, (y + 33));

    y = 40;
    doc.line(10, (y + 25), 200, (y + 25));//mid1
    doc.line(105, y, 105, (y + 25));//mid
    doc.setFont("arial", "bold");
    doc.text("PACIENTE:", 10, (y + 5));
    doc.text("ENFERMEDAD:", 10, (y + 9));
    doc.text("TEMPERATURA:", 110, (y + 5));
    doc.text("PRESIÓN:", 160, (y + 5));
    doc.text("F. CARDIACA:", 110, (y + 9));
    doc.text("F. RESPIRATORIA:", 160, (y + 9));
    doc.text("PESO:", 110, (y + 13));
    doc.text("ALTURA:", 160, (y + 13));
    doc.text("SATURACIÓN OXIGENO:", 110, (y + 17));

    doc.setFont("arial", "normal");
    doc.text(this.pacienteNombre, 30, (y + 5));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.enfermedadCIE10 + ".", (90));
    doc.text(lineaAux, 10, (y + 13));
    doc.text(this._atencionMedicService.formData.temperatura+ " °C", 140, (y + 5));
    doc.text(this._atencionMedicService.formData.presion + " ", 178, (y + 5));
    doc.text(this._atencionMedicService.formData.fCardiaca.toString(), 137, (y + 9));
    doc.text(this._atencionMedicService.formData.fRespiratoria.toString(), 195, (y + 9));
    doc.text(this._atencionMedicService.formData.peso + "kg", 122, (y + 13));
    doc.text(this._atencionMedicService.formData.altura + "m", 177, (y + 13));
    doc.text(this._atencionMedicService.formData.sp02 + "%", 155, (y + 17));

    y = y + 22;
    doc.line(10, (y + 5), 100, (y + 5));//up1
    doc.line(110, (y + 5), 200, (y + 5));//up2
    doc.line(10, (y + 12), 100, (y + 12));//down1
    doc.line(110, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 75));//left
    doc.line(100, y + 5, 100, (y + 75));//right
    doc.line(110, y + 5, 110, (y + 75));//left
    doc.line(200, y + 5, 200, (y + 75));//right
    doc.line(10, (y + 75), 100, (y + 75));//down1
    doc.line(110, (y + 75), 200, (y + 75));//down2
    doc.setFont("arial", "bold");
    doc.text("Motivo de Atención", 40, (y + 10));
    doc.text("Enfermedades actuales", 140, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.motivoAtencion, (80));
    doc.text(lineaAux, 15, (y + 20));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.enfermedadesActuales, (80));
    doc.text(lineaAux, 115, (y + 20));
    y=y+75;
    doc.line(10, (y + 5), 100, (y + 5));//up1
    doc.line(110, (y + 5), 200, (y + 5));//up2
    doc.line(10, (y + 12), 100, (y + 12));//down1
    doc.line(110, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 75));//left
    doc.line(100, y + 5, 100, (y + 75));//right
    doc.line(110, y + 5, 110, (y + 75));//left
    doc.line(200, y + 5, 200, (y + 75));//right
    doc.line(10, (y + 75), 100, (y + 75));//down1
    doc.line(110, (y + 75), 200, (y + 75));//down2
    doc.setFont("arial", "bold");
    doc.text("Prescripción", 50, (y + 10));
    doc.text("Indicaciones", 145, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.prescripcion, (80));
    doc.text(lineaAux, 15, (y + 20));
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.indicaciones, (80));
    doc.text(lineaAux, 115, (y + 20));
    y=212;
    doc.line(10, (y + 5), 200, (y + 5));//up1
    doc.line(10, (y + 12), 200, (y + 12));//down2
    doc.line(10, y + 5, 10, (y + 40));//left
    doc.line(200, y + 5, 200, (y + 40));//right
    doc.line(10, (y + 40), 200, (y + 40));//down2
    doc.setFont("arial", "bold");
    doc.text("Observación", 95, (y + 10));
    doc.setFont("arial", "normal");
    lineaAux = doc.splitTextToSize(this.atencionMedicService.formData.observacion, (180));
    doc.text(lineaAux, 15, (y + 17));

    doc.setFont("arial", "bold");
    doc.setFontSize(11);
    y = 270;
    doc.line(65, (y), 145, (y));//downCut
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 70, (y + 4));

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.pacienteNombre + ".pdf");
  }

  onConvertPdfReceta() {
    var y: number;
    var doc = new jsPDF();

    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_OCUPACIONAL.png";
    doc.addImage(auxImage, "PNG", 8, 8, 28, 18);
    doc.addImage(auxImage, "PNG", 108, 8, 28, 18);

    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 138));//left
    doc.line(105, y, 105, (y + 138));//mid
    doc.line(205, y, 205, (y + 138));//right
    doc.line(5, (y + 138), 205, (y + 138));//down
    doc.line(1, (148), 209, (148));//downCut

    doc.setFontSize(11);
    doc.setFont("arial", "bold")
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 30, (y + 7));
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 130, (y + 7));
    doc.setFontSize(10);
    doc.text("Dra. Medicina y Cirugía General", 37, (y + 11));
    doc.text("Dra. Medicina y Cirugía General", 137, (y + 11));
    doc.text("Medicina Ocupacional", 45, (y + 15));
    doc.text("Medicina Ocupacional", 145, (y + 15));
    doc.text("Telef. 0983514650", 48, (y + 19));
    doc.text("Telef. 0983514650", 148, (y + 19));
    doc.setFont("arial", "normal")
    doc.setFontSize(10);
    y = 30;
    doc.text("NOMBRE DE", 10, (y + 5));
    doc.text("NOMBRE DE", 110, (y + 5));
    doc.text("PACIENTE", 12, (y + 9));
    doc.text("PACIENTE", 112, (y + 9));
    doc.text(this.pacienteNombre, 35, (y + 7));
    doc.text(this.pacienteNombre, 137, (y + 7));
    doc.text("EDAD: " + this.soloAnios, 10, (y + 14));
    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 50, (y + 14));
    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 150, (y + 14));

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("Prescripción:", 10, (y + 23));
    doc.text("Indicaciones:", 110, (y + 23));
    doc.line(9, (y + 24), 35, (y + 24));//downCut
    doc.line(109, (y + 24), 135, (y + 24));//downCut

    doc.setFont("arial", "normal");
    y = y + 35;

    var lineaPrescripcion = doc.splitTextToSize(this.atencionMedicService.formData.prescripcion, (90));
    var lineaIndicacion = doc.splitTextToSize(this.atencionMedicService.formData.indicaciones, (90));
    doc.text(lineaPrescripcion, 10, (y));
    doc.text(lineaIndicacion, 110, (y));

    doc.setFontSize(11);
    y = 137
    doc.line(20, (y), 90, (y));//downCut
    doc.line(120, (y), 190, (y));//downCut
    doc.text("FIRMA Y SELLO DEL MÉDICO", 28, (y + 4));
    doc.text("FIRMA Y SELLO DEL MÉDICO", 128, (y + 4));

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.pacienteNombre + ".pdf");
  }
}
