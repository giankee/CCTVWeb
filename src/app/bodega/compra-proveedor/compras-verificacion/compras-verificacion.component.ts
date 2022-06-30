import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faFlag, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cVario, cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-compras-verificacion',
  templateUrl: './compras-verificacion.component.html',
  styles: []
})
export class ComprasVerificacionComponent implements OnInit {
  public get ordenECService(): OrdenECService {
    return this._ordenECService;
  }
  public set ordenECService(value: OrdenECService) {
    this._ordenECService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  listBarcos: cVario[] = [];
  listOrdenesMostrar: cOrdenEC[] = [];
  spinnerOnOff: boolean = true;
  paginacion = new cPaginacion(25);

  /**Icon */
  fasave = faSave; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faflag = faFlag;

  constructor(private _conexcionService: ConexionService, private _variosService: VariosService, private router: Router, private _ordenECService: OrdenECService, private toastr: ToastrService,private whatsappService: WhatsappService) {
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      this.listBarcos = dato.filter(x => x.encargadoBodega == this._conexcionService.UserR.nombreU);
      this.restartListPendientes();
    });
  }


  ngOnInit(): void {
  }

  onSave(datoIn: cOrdenEC) {
    if (datoIn.listPcomprasO.find(x => x.marcar) != undefined) {
      datoIn.listPcomprasO.forEach(x => {
        if (x.marcar)
          x.estadoCompra = "Procesada";
      });
      if (datoIn.listPcomprasO.find(x => x.estadoCompra == "Pendiente") == undefined)
        datoIn.estadoProceso = "Procesada";
    }
    this.ordenECService.verificacionOrdenCompra(datoIn).subscribe(
      (res: any) => {
        if (res.message == "Ok") {
          this.toastr.success('Actualización de Inventario satisfactorio', 'Orden Verificada');
          if (res.auxmessage == "Procesada") {
            this.restartListPendientes(this.paginacion.pagActualIndex);
          } else {
            for (var i = 0; i < datoIn.listPcomprasO.length; i++) {
              if (datoIn.listPcomprasO[i].estadoCompra == "Procesada") {
                datoIn.listPcomprasO.splice(i, 1);
                i--;
              }
            }
          }
        }
      },
      err => {
        console.log(err);
      });
  }

  onReport(datoIn: cOrdenEC) {
    var strObservacion: string;
    Swal.fire({
      icon: "warning",
      title: "Estás seguro que quieres generar un reporte de inconsistencia?",
      text: "Ingrese la observación",
      input: 'text',
      showCancelButton: true,
      cancelButtonColor: '#E53935',
      confirmButtonText: "Continuar!",
      cancelButtonText: "Cancelar!",
      customClass: {
        confirmButton: 'btn btn-Primario mr-2',
        cancelButton: 'btn btn-Secundario ml-2',
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Ingrese una observación sobre el reporte'
        } else strObservacion = value.toUpperCase();
      }
    }).then((result) => {
      if (result.value) {
        this.generarReporte(datoIn, strObservacion);
      }
    })
  }

  restartListPendientes(valorPage?: number) {
    this.listOrdenesMostrar = [];
    for (var i = 0; i < this.listBarcos.length; i++) {
      var strParam = this.listBarcos[i].nombre;
      this.ordenECService.getVerificarMedicamento("ENFERMERIA@DISTRIBUIDORA FARMACEUTICA ECUATORIANA DIFARE S.A@" + strParam).subscribe(dato => {
        dato.forEach(x => {
          x.fechaRegistroBodega = x.fechaRegistroBodega.substring(0, 10);
          x.listPcomprasO.forEach(y => y.marcar = false);
          this.listOrdenesMostrar.push(x);
        });
        this.spinnerOnOff = false;
        this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
        if (valorPage != null)
          this.paginacion.updateIndex(valorPage);
        else this.paginacion.updateIndex(0);
      });
    }
  }

  generarReporte(datoIn:cOrdenEC, observacionIn) {//falta los nombressssss y numeros
    var auxBase = this.onConvertPdfOne(datoIn).split('base64,');
    var personas:string[][]=[["Juan","593-999786121"],["Miguel","0999786121"]];
    var auxWhatsapp: cWhatsapp;
    for(var i=0; i<personas.length;i++){
      auxWhatsapp = {
        phone: personas[i][1],
        message: "",
        title: datoIn.planta + "_" + datoIn.fechaRegistroBodega + "-" + datoIn.factura + ".pdf",
        media: auxBase[1],
        type: "application/pdf"
      };
      auxWhatsapp.message = ':bell: *Notificación Reporte de Inconsistencia*:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos '+ personas[i][0]
      + '\nSe le informa que se ha generado un reporte en la revisión de medicamentos para el barco *' + datoIn.listPcomprasO[0].destinoBodega + '*.'
      + '\nLos datos de la compra son:'
      + '\n'
      + '\n*Factura:* ' + datoIn.factura
      + '\n*Fecha de Registro* ' + datoIn.fechaRegistroBodega
      + '\n*Usuario:* ' + datoIn.guardiaCargoUser
      + '\n'
      + '\nLa observación es:'
      + '\n'+observacionIn
      + '\n----------------------------------';
      this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
        res => {
        },
        err => {
          console.log(err);
        }
      )
    }
  }

  onConvertPdfOne(datoIn:cOrdenEC) {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(18);
    doc.setFont("arial", "bold");
    doc.text("Inventario", 115, 15);

    doc.setFontSize(13);
    doc.text("Barco: " + datoIn.listPcomprasO[0].destinoBodega, 200, 25);
    y = 30;

    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, (y), 290, (y));//down
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("#", 10, (y + 7));
    doc.line(20, y, 20, (y + 10));//right
    doc.text("Código", 35, (y + 7));
    doc.line(70, y, 70, (y + 10));//right
    doc.text("Cantidad", 75, (y + 7));
    doc.line(95, y, 95, (y + 10));//right
    doc.text("Cont.Neto", 100, (y + 7));
    doc.line(120, y, 120, (y + 10));//right
    doc.text("Unidades G.", 125, (y + 7));
    doc.line(150, y, 150, (y + 10));//right
    doc.text("Descripción", 200, (y + 7));

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    var valorG: number = 10;

    for (var i = 0; i < datoIn.listPcomprasO.length; i++) {
      y = y + valorG;

      if (y > 200) {
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

        doc.text("#", 10, (y + 7));
        doc.line(20, y, 20, (y + 10));//right
        doc.text("Código", 35, (y + 7));
        doc.line(70, y, 70, (y + 10));//right
        doc.text("Cantidad", 75, (y + 7));
        doc.line(95, y, 95, (y + 10));//right
        doc.text("Cont.Neto", 100, (y + 7));
        doc.line(120, y, 120, (y + 10));//right
        doc.text("Unidades G.", 125, (y + 7));
        doc.line(150, y, 150, (y + 10));//right
        doc.text("Descripción", 200, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }

      doc.line(5, (y - valorG), 5, y);//left
      doc.text(i.toString(), 10, (y - ((valorG - 3) / 2)));
      doc.line(20, (y - valorG), 20, y);//right
      doc.text(datoIn.listPcomprasO[i].producto.codigo, 25, (y - ((valorG - 3) / 2)));
      doc.line(70, (y - valorG), 70, y);//right
      doc.text(datoIn.listPcomprasO[i].cantidad.toString(), 80, (y - ((valorG - 3) / 2)));
      doc.line(95, (y - valorG), 95, y);//right
      doc.text(datoIn.listPcomprasO[i].producto.contenidoNeto.toString(), 105, (y - ((valorG - 3) / 2)));
      doc.line(120, (y - valorG), 120, y);//right
      doc.text((datoIn.listPcomprasO[i].producto.contenidoNeto * datoIn.listPcomprasO[i].cantidad) + "", 130, (y - ((valorG - 3) / 2)));
      doc.line(150, (y - valorG), 150, y);//right
      doc.text(datoIn.listPcomprasO[i].producto.nombre, 155, (y - ((valorG - 3) / 2)));
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down
    }
    return (doc.output('datauristring'));
  }
}
