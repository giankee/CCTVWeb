import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-view-trabajo-model',
  templateUrl: './view-trabajo-model.component.html',
  styles: [],
})
export class ViewTrabajoModelComponent implements OnInit {
  public get ordenTrabajoInternoService(): OrdenTrabajoService {
    return this._ordenTrabajoInternoService;
  }
  public set ordenTrabajoInternoService(value: OrdenTrabajoService) {
    this._ordenTrabajoInternoService = value;
  }

  faprint = faPrint;

  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewTrabajoModelComponent>, private _ordenTrabajoInternoService: OrdenTrabajoService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      this._ordenTrabajoInternoService.formData = new cOrdenTrabajoI("new");
      this.cargarData();
    }
  }

  cargarData() {
    this._ordenTrabajoInternoService.getOneOrdenTrabajoI(this.dato.auxId)
      .subscribe((datoOne: any) => {
        if (datoOne.exito == 1) {
          if (datoOne.message == "Ok") {
            this._ordenTrabajoInternoService.formData.completarObject(datoOne.data);
          }
          else this.onExit();
        } else this.onExit();
      },
        error => console.error(error));
  }

  onExit() {
    this.dialogRef.close();
  }

  onConvertPdfOne(orden: cOrdenTrabajoI) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold");
    doc.text("Orden de " + orden.tipoOrden + " #" + orden.numOrdenSecuencial, 70, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 45));//left
    doc.line(199, y, 199, (y + 45));//right
    doc.line(9, (y + 45), 199, (y + 45));//down
    doc.setFontSize(13);
    if (orden.tipoOrden == "Trabajo Interno")
      doc.text("Datos de la orden", 15, (y + 5));
    else doc.text("Datos del traspaso", 15, (y + 5));

    doc.setFontSize(11);

    doc.text("Planta: ", 20, (y + 10));
    doc.text("Fecha Registro: ", 105, (y + 10));

    doc.text("Bodega de Salida: " , 20, (y + 15));
    if (orden.tipoOrden == "Trabajo Interno") {
      doc.text("Área de Destino: ", 105, (y + 15));
      doc.text("Responsable de la solicitud: ", 105, (y + 20));
      doc.text("Estado de la Orden: ", 105, (y + 25));
      doc.text("Justificación: ", 20, (y + 30));
    } else {
      doc.text("Bodega de Destino: ", 105, (y + 15));
      doc.text("Responsable de la Transferencia: ", 105, (y + 20));

      doc.text("Estado transferencia: ", 105, (y + 25));
    }
    doc.text("Responsable de bodega Saliente: ", 20, (y + 20));
    doc.text("Usuario Sistema: ", 20, (y + 25));



    doc.setFont("arial", "normal");
    doc.text(orden.planta, 32, (y + 10));
    doc.text(orden.fechaRegistro, 132, (y + 10));
    doc.text(orden.bodega + (orden.marea!=null?'   '+orden.marea: ''), 53, (y + 15));
    doc.text(orden.destinoLugar, 137, (y + 15));
    doc.text(orden.bodeguero, 75, (y + 20));
    doc.text(orden.personaResponsable, 163, (y + 20));
    doc.text(orden.guardiaCargoUser, 50, (y + 25));
    doc.text(orden.estadoProceso, 143, (y + 25));
    doc.text(orden.observacion, 30, (y + 35));
    y = y + 45;

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

    for (var i = 0; i < orden.listMaterialesO.length; i++) {
      lineaDescripcion = doc.splitTextToSize(orden.listMaterialesO[i].inventario.nombre, (65));
      lineaObservacion = doc.splitTextToSize(orden.listMaterialesO[i].observacion, (50));
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
      doc.text(orden.listMaterialesO[i].inventario.codigo, 15, (y - ((valorG - 3) / 2)));
      doc.line(55, (y - valorG), 55, y);//right
      doc.text(orden.listMaterialesO[i].cantidad.toString(), 70, (y - ((valorG - 3) / 2)));
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
    doc.text("Firma " + orden.bodeguero, 25, y + 5);

    if (orden.tipoOrden == "Trabajo Interno") {
      doc.line(81, y, 126, y);//Firma2
      doc.text("Firma de Área", 87, y + 5);
    }
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + orden.personaResponsable, 146, y + 5);
    doc.save("Orden#" + orden.numOrdenSecuencial + "_" + orden.fechaRegistro + ".pdf");
  }
}
