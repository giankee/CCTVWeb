import { Component, OnInit } from '@angular/core';
import { cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { ToastrService } from 'ngx-toastr';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import { jsPDF } from "jspdf";
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { cBodega } from 'src/app/shared/bodega/ordenEC';
import { cFecha, cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';

@Component({
  selector: 'app-pedidos-aprobar',
  templateUrl: './pedidos-aprobar.component.html',
  styles: []
})
export class PedidosAprobarComponent implements OnInit {
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  fechaActual: cFecha=new cFecha();
  listOrdenesMostrar: cOrdenPedido[] = [];
  spinnerOnOff: boolean = true;
  listBarcos: cBodega[] = [];
  listAreas: cBodega[] = [];

  /**Icon */
  facheck = faCheck; fatimes = faTimes;
  constructor(private _conexcionService: ConexionService, private ordenPedidoService: OrdenPedidoService, private toastr: ToastrService, private variosService: VariosService, private whatsappService: WhatsappService) { }

  ngOnInit(): void {
    this.restartListPendientes();
    this.cargarData();
  }

  cargarData() {
    this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
    });
    this.variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
      this.listAreas = dato;
    });
  }

  restartListPendientes() {
    this.spinnerOnOff = true;
    this.listOrdenesMostrar = [];

    var parametros
    if (this.conexcionService.UserR.rolAsignado == "pedido-flota")
      parametros = "FLOTA@Pendiente Aprobación";
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta")
      parametros = "P MANACRIPEX@Pendiente Aprobación";

    this.ordenPedidoService.getListPedido(parametros).subscribe(dato => {
      dato.forEach(x => {
        x.fechaPedido = x.fechaPedido.substring(0, 10);
        let auxSecuencial = x.numSecuencial.split("-");
        x.strNumSecuencial = auxSecuencial[1];
        this.listOrdenesMostrar.push(x);
      });
      this.spinnerOnOff = false;
    });
  }

  convertPdf(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold");

    let auxSecuencial = orden.numSecuencial.split("-");
    var strDestino: string;
    doc.text("Orden de Pedido " + auxSecuencial[1], 75, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 20, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Fecha de Registro: " + orden.fechaPedido, 15, (y + 10));
    if (this.conexcionService.UserR.rolAsignado == "pedido-flota") {
      doc.text("Tipo de Pedido: " + orden.tipoPedido, 80, (y + 10));
      strDestino = "Barco: " + orden.area;
    } else {
      if (orden.area == "P MANACRIPEX")
        strDestino = "Área: " + orden.listArticulosPedido[0].destinoArea;
      else strDestino = "Barco: " + orden.area;
    }
    doc.text(strDestino, 140, (y + 10));
    doc.text("Empresa: " + orden.empresa, 15, (y + 15));
    doc.text("RUC: " + orden.strRuc, 105, (y + 15));
    doc.text("Proveedor: " + orden.proveedor, 15, (y + 20));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 25));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 105, (y + 25));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 30));
    doc.setFont("arial", "normal");
    y = y + 35;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 70, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down

    doc.text("Código", 25, (y + 7));
    doc.line(50, y, 50, (y + 10));//right
    doc.text("Descripción", 70, (y + 7));
    doc.line(110, y, 110, (y + 10));//right
    doc.text("Cantidad", 112, (y + 7));
    doc.line(130, y, 130, (y + 10));//right
    doc.text("Área", 137, (y + 7));
    doc.line(155, y, 155, (y + 10));//right
    doc.text("Observación", 165, (y + 7));

    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 10;

    var valorG: number = 0;
    var valorC: number;
    var valorN: number;
    var valorO: number;
    var lineaCodigo;
    var lineaNombre;
    var lineaObservacion;
    var auxPrueba: number;

    for (var i = 0; i < orden.listArticulosPedido.length; i++) {
      lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (35));
      lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
      lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (40));
      valorC = (3 * lineaCodigo.length) + 4;
      valorN = (3 * lineaNombre.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;

      if (valorC >= valorN && valorC >= valorO)
        valorG = valorC;
      if (valorN >= valorC && valorN >= valorO)
        valorG = valorN;
      if (valorO >= valorC && valorO >= valorN)
        valorG = valorO;

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

        doc.text("Código", 25, (y + 7));
        doc.line(50, y, 50, (y + 10));//right
        doc.text("Descripción", 70, (y + 7));
        doc.line(110, y, 110, (y + 10));//right
        doc.text("Cantidad", 112, (y + 7));
        doc.line(130, y, 130, (y + 10));//right
        doc.text("Área", 137, (y + 7));
        doc.line(155, y, 155, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
      doc.text(lineaCodigo, 15, (y - valorG + auxPrueba));
      doc.line(50, (y - valorG), 50, y);//right
      auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
      doc.text(lineaNombre, 55, (y - valorG + auxPrueba));
      doc.line(110, (y - valorG), 110, y);//right
      doc.text(orden.listArticulosPedido[i].cantidad.toString(), 120, (y - ((valorG - 3) / 2)));
      doc.line(130, (y - valorG), 130, y);//right
      doc.text(orden.listArticulosPedido[i].destinoArea, 135, (y - ((valorG - 3) / 2)));
      doc.line(155, (y - valorG), 155, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
      doc.text(lineaObservacion, 15, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 265) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 265;
    var personaSubArea;
    if (orden.area == "P MANACRIPEX") {
      personaSubArea = this.listAreas.find(x => x.nombreBodega == orden.listArticulosPedido[0].destinoArea).encargadoBodega;
    } else personaSubArea = this.listBarcos.find(x => x.nombreBodega == orden.area).listAreas.find(y => y.nombreArea == orden.listArticulosPedido[0].destinoArea).encargadoArea;
    if(personaSubArea==null)
    personaSubArea="Encargado "+orden.listArticulosPedido[0].destinoArea;

    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + personaSubArea, 146, y + 5);
    return (doc.output('datauristring'));
  }

  onSave(datoIn: cOrdenPedido, tipoIn: number) {
   var auxOrden:cOrdenPedido= new cOrdenPedido(datoIn.cargoUser,datoIn.planta);
    auxOrden.completarObject(datoIn);
    if (tipoIn == 1)
      auxOrden.estadoProceso = "Pendiente Verificación";
    else auxOrden.estadoProceso = "Rechazada";
    auxOrden.responsableAprobacion= this.conexcionService.UserR.nombreU;
    auxOrden.fechaAprobacion= this.fechaActual.strFecha+"T"+this.fechaActual.strHoraA;
    auxOrden.sacarRuc();
    this.ordenPedidoService.actualizarPedido(auxOrden).subscribe(
      (res: any) => {
        if (res.message == "Ok") {
          this.restartListPendientes();
          if (tipoIn == 1) {
            this.toastr.success('Actualización satisfactoria', 'Orden Aprobada');
            this.sendMessageGroupNotification(auxOrden);
          }else this.toastr.success('Actualización satisfactoria', 'Orden Rechazada');
        }
      }
    )
  }

  sendMessageGroupNotification(orden: cOrdenPedido) {
    var auxBase = this.convertPdf(orden).split('base64,');
    
    var auxWhatsapp: cWhatsapp = {
      chatname: "",
      message: "",
      title: "Pedido_" + orden.numSecuencial + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    var encabezado: string;
    var asunto: string;
    var lineaAux: string;
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta") {
      auxWhatsapp.chatname = "PEDIDOS MANACRIPEX";

      encabezado = ':bell: *Notificación Pedido ' + orden.empresa + '* :bell:';
      if (orden.area == "P MANACRIPEX") {
        asunto = "pedido a *" + orden.proveedor + "* para el área *" + orden.listArticulosPedido[0].destinoArea + "*";
        lineaAux = '\n*Área:* ' + orden.listArticulosPedido[0].destinoArea;
      } else {
        asunto = "pedido a *" + orden.proveedor + "* para el área *" + orden.area + "*";
        lineaAux = '\n*Barco:* ' + orden.area + ' :anchor:';
      }
    } else {
      auxWhatsapp.chatname = "PEDIDOS FLOTA";
      encabezado = ':bell: *Notificación Pedido ' + orden.tipoPedido + '* :bell:';
      asunto = "pedido a *" + orden.proveedor + "* para el barco *" + orden.area + "*";
      lineaAux = '\n*Barco:* ' + orden.area + ' :anchor:';
    }

    var auxNumSecuencial = orden.numSecuencial.split('-');


    auxWhatsapp.message = encabezado
      + '\n'
      + '\n:wave: Saludos Compañeros:'
      + '\nSe les informa que se ha generado un ' + asunto
      + '\nLos datos del pedido son:'
      + '\n'
      + '\n*#' + auxNumSecuencial[1] + '*'
      + lineaAux
      + '\n*Fecha:* ' + orden.fechaPedido
      + '\n*Encargado del Pedido* ' + orden.cargoUser
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
