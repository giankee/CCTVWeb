import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { AtencionService } from 'src/app/shared/medicina/atencion.service';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-view-atencion-modal',
  templateUrl: './view-atencion-modal.component.html',
  styles: [],
})
export class ViewAtencionModalComponent implements OnInit {
  public get atencionMedicService(): AtencionService {
    return this._atencionMedicService;
  }
  public set atencionMedicService(value: AtencionService) {
    this._atencionMedicService = value;
  }

  faprint = faPrint;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewAtencionModalComponent>, private _atencionMedicService: AtencionService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      if (this.dato.auxId != this.atencionMedicService.formData.idAtencionMedic)
        this.dialogRef.close();
    }
  }

  onExit() {
    this.dialogRef.close();
  }

  onConvertPdfOne(){
    var y: number;
    var doc = new jsPDF();
    var lineaAux;
    var auxImage = new Image();
    auxImage.src = "/assets/img/LOGO_" + this.atencionMedicService.formData.pacienteMedic.idEmpresa + ".png";
    if (this.atencionMedicService.formData.pacienteMedic.idEmpresa == 1)
      doc.addImage(auxImage, "PNG", 9, 10, 35, 25);
    if (this.atencionMedicService.formData.pacienteMedic.idEmpresa == 3)
      doc.addImage(auxImage, "PNG", 10, 10, 33, 23);
    if (this.atencionMedicService.formData.pacienteMedic.idEmpresa == 4)
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
    doc.text(this.atencionMedicService.formData.pacienteMedic.empleado, 30, (y + 5));
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

    doc.save("ConsultaMedica_" + this.atencionMedicService.formData.fechaAtencion + "_" + this.atencionMedicService.formData.pacienteMedic.empleado + ".pdf");
  }
}
