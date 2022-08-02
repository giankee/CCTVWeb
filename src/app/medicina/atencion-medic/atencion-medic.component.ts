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

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  okBttnSubmit: boolean = true;
  listCie10Array = listCie10;
  permisoOpened: number = 0 //0 cerrarSinGuardar //1 abrir, //2 cerrarCompleta


  fasave = faSave; fatimescircle = faTimesCircle;
  constructor(private _atencionMedicService: AtencionService, private toastr: ToastrService, private _permisoMedicService: PermisoService) { }

  ngOnInit(): void {
    this._atencionMedicService.formData = new cAtencionMedic();
    this._atencionMedicService.formData.pacienteMedicId = this.idPacienteIn;
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
      this._atencionMedicService.formData.enfermedadCIE10 = data.code + ":" + data.description;
  }

  onSubmit(form: NgForm) {
    if (this._atencionMedicService.formData.spinnerLoading) {
      this._atencionMedicService.insertarAtencion(this._atencionMedicService.formData).subscribe(
        (res: any) => {
          if (res.exito == 1) {
            this.toastr.success('Registro de atención satisfactorio', 'Atención Médica');
            if(this.atencionMedicService.formData.prescripcion!="" ||this.atencionMedicService.formData.indicaciones!="")
              this.onConvertPdf();
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

  onConvertPdf() {
    var y: number;
    var doc = new jsPDF();
    y = 5;
    doc.line(5, y, 205, y);//up
    doc.line(5, y, 5, (y + 138));//left
    doc.line(105, y, 105, (y + 138));//mid
    doc.line(205, y, 205, (y + 138));//right
    doc.line(5, (y + 138), 205, (y + 138));//down
    doc.line(1, (148), 209, (148));//downCut

    doc.setFontSize(11);
    doc.setFont("arial", "bold")
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 23, (y + 7));
    doc.text("DRA. VERONICA CHUMO ESTRELLA", 123, (y + 7));
    doc.setFontSize(10);
    doc.text("Dra. Medicina y Cirugía General", 30, (y + 11));
    doc.text("Dra. Medicina y Cirugía General", 130, (y + 11));
    doc.text("Medicina Ocupacional", 40, (y + 15));
    doc.text("Medicina Ocupacional", 140, (y + 15));
    doc.text("Telef. 0983514650", 43, (y + 19));
    doc.text("Telef. 0983514650", 143, (y + 19));
    doc.setFont("arial", "normal")
    doc.setFontSize(10);
    y = 27;
    doc.text("NOMBRE DE", 10, (y + 5));
    doc.text("NOMBRE DE", 110, (y + 5));
    doc.text("PACIENTE", 12, (y + 9));
    doc.text("PACIENTE", 112, (y + 9));
    doc.text(this.pacienteNombre, 35, (y + 7));
    doc.text(this.pacienteNombre, 137, (y + 7));

    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 50, (y + 14));
    doc.text("FECHA: Manta,   " + this._atencionMedicService.formData.fechaAtencion, 150, (y + 14));

    doc.setFontSize(12);
    doc.setFont("arial", "bold");
    doc.text("Prescripción:", 10, (y + 18));
    doc.text("Indicaciones:", 110, (y + 18));
    doc.line(9, (y + 19), 35, (y + 19));//downCut
    doc.line(109, (y + 19), 135, (y + 19));//downCut

    doc.setFont("arial", "normal");
    y = y + 30;

    var lineaPrescripcion = doc.splitTextToSize(this.atencionMedicService.formData.prescripcion, (90));
    var lineaIndicacion = doc.splitTextToSize(this.atencionMedicService.formData.indicaciones, (90));
    doc.text(lineaPrescripcion, 10, (y));
    doc.text(lineaIndicacion, 110, (y));

    doc.setFontSize(11);
    y=137
    doc.line(20, (y), 90, (y));//downCut
    doc.line(120, (y), 190, (y));//downCut
    doc.text("FIRMA Y SELLO DEL MÉDICO", 28, (y + 4));
    doc.text("FIRMA Y SELLO DEL MÉDICO", 128, (y + 4));

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.pacienteNombre + ".pdf");
  }
}
