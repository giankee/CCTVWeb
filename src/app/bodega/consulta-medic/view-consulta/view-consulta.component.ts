import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';
import { jsPDF } from "jspdf";
import { cConsultaMedic } from 'src/app/shared/bodega/ordenTrabajo';

@Component({
  selector: 'app-view-consulta',
  templateUrl: './view-consulta.component.html',
  styles: [],
})
export class ViewConsultaComponent implements OnInit {
  public get consultaMedicService(): ConsultaMedicService {
    return this._consultaMedicService;
  }
  public set consultaMedicService(value: ConsultaMedicService) {
    this._consultaMedicService = value;
  }

  faprint = faPrint;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewConsultaComponent>, private _consultaMedicService: ConsultaMedicService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      if (this.consultaMedicService.formData == null) {
        this.consultaMedicService.getOneConsulta(this.dato.auxId)
          .subscribe((datoOne: any) => {
            if (datoOne.exito == 1) {
              if (datoOne.message == "Ok") {
                this._consultaMedicService.formData = new cConsultaMedic("new");
                this._consultaMedicService.formData.completarObject(datoOne.data);
              }
              else this.onExit();
            } else this.onExit();
          },
            error => console.error(error));
      }
    } else this.onExit();
  }

  onExit() {
    this.dialogRef.close();
  }

  onConvertPdfOne(orden: cConsultaMedic) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("arial", "bold");
    doc.text("Consulta Médica #" + orden.numOrdenSecuencial, 85, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 40));//left
    doc.line(199, y, 199, (y + 40));//right
    doc.line(9, (y + 40), 199, (y + 40));//down
    doc.setFontSize(13);
    doc.text("Datos de la Consulta", 15, (y + 5));

    doc.setFontSize(11);

    doc.text("Bodega: ", 20, (y + 10));
    doc.text(orden.bodegaOrigen, 37, (y + 10));
    if (orden.bodegaOrigen != "ENFERMERIA GENERAL") {
      doc.text("Marea: ", 105, (y + 10));
      doc.text(orden.marea, 120, (y + 10));
    }
    doc.text("Paciente: ", 20, (y + 15));
    doc.text(orden.paciente, 37, (y + 15));
    doc.text("Fecha de Registro: ", 105, (y + 15));
    doc.text(orden.fechaRegistro, 140, (y + 15));
    doc.text("Entrega Medicamento: ", 20, (y + 20));
    doc.text(orden.personaResponsable, 60, (y + 20));
    doc.text("Usuario Sistema: ", 105, (y + 20));
    doc.text(orden.guardiaCargoUser, 135, (y + 20));
    doc.text("Sintomas: ", 20, (y + 25));
    doc.text(orden.sintomas, 20, (y + 30));

    doc.setFont("arial", "normal");
    y = y + 40;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 80, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down

    doc.text("Código", 20, (y + 7));
    doc.line(55, y, 55, (y + 10));//right
    doc.text("Cantidad", 60, (y + 7));
    doc.line(80, y, 80, (y + 10));//right
    doc.text("Descripción", 100, (y + 7));
    doc.line(145, y, 145, (y + 10));//right
    doc.text("Observación", 165, (y + 7));

    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 10;

    var valorG: number = 0;
    var valorD: number;
    var valorO: number;
    var lineaDescripcion;
    var lineaObservacion;
    var auxPrueba: number;

    for (var i = 0; i < orden.listReceta.length; i++) {
      lineaDescripcion = doc.splitTextToSize(orden.listReceta[i].inventario.nombre, (65));
      lineaObservacion = doc.splitTextToSize(orden.listReceta[i].observacion, (50));
      valorD = (3 * lineaDescripcion.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;

      if (valorD > valorO)
        valorG = valorD;
      else valorG = valorO;

      y = y + valorG;

      if (y > 265) {
        doc.addPage();
        doc.setFontSize(11);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(9, y, 199, y);//up
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down

        doc.text("Código", 20, (y + 7));
        doc.line(55, y, 55, (y + 10));//right
        doc.text("Cantidad", 60, (y + 7));
        doc.line(80, y, 80, (y + 10));//right
        doc.text("Descripción", 100, (y + 7));
        doc.line(145, y, 145, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      doc.text(orden.listReceta[i].inventario.codigo, 15, (y - ((valorG - 3) / 2)));
      doc.line(55, (y - valorG), 55, y);//right
      doc.text(orden.listReceta[i].cantidad.toString(), 65, (y - ((valorG - 3) / 2)));
      doc.line(80, (y - valorG), 80, y);//right

      auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.text(lineaDescripcion, 85, (y - valorG + auxPrueba));
      doc.line(145, (y - valorG), 145, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
      doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 270) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 275;
    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.personaResponsable, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + orden.paciente, 146, y + 5);

    doc.save("Consulta #" + orden.numOrdenSecuencial + "_" + orden.fechaRegistro + ".pdf");
  }
}
