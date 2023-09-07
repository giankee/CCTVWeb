import { Component, OnInit } from '@angular/core';
import { cWhatsapp } from '../shared/otrosServices/varios';
import { ToastrService } from 'ngx-toastr';
import { WhatsappService } from '../shared/otrosServices/whatsapp.service';
import { cOrdenEs } from '../shared/ordenEs';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-whatsapp-test',
  templateUrl: './whatsapp-test.component.html',
  styles: []
})
export class WhatsappTestComponent implements OnInit {

  constructor(private toastr: ToastrService, private whatsappService: WhatsappService) { }

  ngOnInit(): void {
  }

  convertPdf(orden: cOrdenEs) {
    var y: number;
    var auxCol1 = 25;
    var auxCol2 = 0;
    var auxCol3 = 0;
    var auxCol4 = 0;

    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold")
    doc.text("Orden de " + orden.tipoOrden, 80, 25);

    y = 30;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 45));//left
    doc.line(199, y, 199, (y + 45));//right
    doc.line(9, (y + 45), 199, (y + 45));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 10));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);

    if (orden.tipoOrden == "Salida" || orden.tipoOrden == "Balde Salida") {
      doc.text("Salida de: " + orden.planta, 20, (y + 15));
      doc.text("Fecha Saliente: " + orden.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Destino: " + orden.destinoProcedencia, 20, (y + 25));
    }
    if (orden.tipoOrden == "Entrada" || orden.tipoOrden == "Balde Entrada") {
      doc.text("Entrada a: " + orden.planta, 20, (y + 15));
      doc.text("Fecha de Ingreso: " + orden.fechaRegistro, 20, (y + 20));
      doc.text("Lugar de Procedencia: " + orden.destinoProcedencia, 20, (y + 25));
    }
    doc.text("Documentación " + orden.numDocumentacion, 105, (y + 15));
    doc.text("Hora de Registro: " + orden.horaRegistro, 105, (y + 20));
    if (orden.tipoOrden != "Balde Entrada" && orden.tipoOrden != "Balde Salida")
      doc.text("Responsable de orden: " + orden.responsableES, 20, (y + 30));
    else doc.text("Responsable de la Transferencia: " + orden.responsableES, 20, (y + 30));
    doc.text("Usuario Sistema: " + orden.guardiaCargoUser, 20, (y + 35));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 20, (y + 40));

    y = y + 45;
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down
    return (doc.output('datauristring'));
  }

  onClickMessage() {
    var aux: cWhatsapp;
    aux = {
      phone: "593988964391",
      message: ':bell: *Notificación Prueba*:exclamation: :bell:'
        + '\n'
        + '\n:wave: Saludos Compañero:'
        + '\n*Usuario:* Prueba Giancarlo'
        + '\n----------------------------------'
    }

    this.whatsappService.sendMessageWhat(aux).subscribe(
      res => {
        console.table(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  onClickMessageMedia() {
    var orden: cOrdenEs = new cOrdenEs("P MANACRIPEX", "PRUEBA")
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp;
    auxWhatsapp = {
      phone: "593988964391",
      message: "",
      caption:"",
      title: orden.tipoOrden + "_" + orden.fechaRegistro + "-" + orden.numDocumentacion + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    auxWhatsapp.caption = ':bell: *Notificación Dato Duplicado *:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos Compañero:'
      + '\nSe le informa que se ha registrado una nueva orden de *' + orden.tipoOrden + '*'
      + ' que coincide con una orden previamente ingresada la fecha .*' + orden.fechaRegistro + '*'
      + '\nLos datos de la Orden Previamente ingresada es:'
      + '\n'
      + '\n*' + orden.numDocumentacion + '*'
      + '\n*Despachada por:* ' + orden.planta
      + '\n*Lugar:* ' + orden.destinoProcedencia
      + '\n*Usuario Guardia:* ' + orden.guardiaCargoUser
      + '\n----------------------------------';

    this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
      res => {
        if (res.status != "error")
          this.toastr.success('Mensaje enviado Correctamente', 'Notificación enviada');
      },
      err => {
        console.log(err);
      }
    )
  }

  onClickGroupMessageMedia() {
    var orden: cOrdenEs = new cOrdenEs("P MANACRIPEX", "PRUEBA")
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp = {
      chatname: "Prueba ES",
      message: "",
      caption:"",
      title: orden.tipoOrden + "_" + orden.fechaRegistro + "-" + orden.numDocumentacion + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }

    var encabezado: string = ':bell: *Notificación ' + orden.tipoOrden + ' ' + orden.planta + '* :bell:';
    auxWhatsapp.caption = encabezado
      + '\n'
      + '\n:wave: Saludos Compañeros:'
      + '\nSe les informa que se ha generado una salida hacia :anchor: *' + orden.destinoProcedencia + '*'
      + '\nLos datos de la Orden de salida son:'
      + '\n'
      + '\n*' + orden.numDocumentacion + '*'
      + '\n*Fecha:* ' + orden.fechaRegistro + ' ' + orden.horaRegistro
      + '\n*Encargado del Transporte :truck::* ' + orden.persona.nombreP
      + '\n----------------------------------'
      + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
      + '\n----------------------------------';

      this.whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
        res => {
          if (res.status == "error")
            this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
          else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
        },
        err => {
          console.log(err);
        }
      );




  }
}
