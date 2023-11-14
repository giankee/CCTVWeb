import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faFlag, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { cBodega, cCompraO, cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { cConsultaMedic, cRecetaMedic } from 'src/app/shared/bodega/ordenTrabajo';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';

@Component({
  selector: 'app-compras-verificacion',
  templateUrl: './compras-verificacion.component.html',
  styles: []
})
export class ComprasVerificacionComponent implements OnInit {
  public get consultaMedicService(): ConsultaMedicService {
    return this._consultaMedicService;
  }
  public set consultaMedicService(value: ConsultaMedicService) {
    this._consultaMedicService = value;
  }
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

  listBarcos: cBodega;
  listOrdenesMostrar: cOrdenEC[] = [];
  spinnerOnOff: boolean = true;
  paginacion = new cPaginacion(25);
  openReporte: boolean = false;

  /**Icon */
  fasave = faSave; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faflag = faFlag;

  constructor(private _conexcionService: ConexionService, private _variosService: VariosService, private _ordenECService: OrdenECService, private toastr: ToastrService, private whatsappService: WhatsappService, private _consultaMedicService: ConsultaMedicService) {
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato.find(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
      this.restartListPendientes();
    });
  }

  ngOnInit(): void {
  }

  onSave(datoIn: cOrdenEC) {
    if (datoIn.listPcomprasO.find(x => x.marcar) != undefined) {
      var auxListComprasO: cCompraO[] = [];
      datoIn.listPcomprasO.forEach(x => {
        if (x.marcar) {
          if (datoIn.estadoProceso == "Pendiente") {
            if (x.estadoCompra == "Pendiente")
              x.estadoCompra = "Pendiente Lote";
            else x.estadoCompra = "Procesada";
          } else x.estadoCompra = "Procesada";
          auxListComprasO.push(x);
        }
      });
      if (datoIn.listPcomprasO.find(x => x.estadoCompra == "Pendiente"||x.estadoCompra=="Pendiente Verificación") == undefined){
        if(datoIn.estadoProceso=="Pendiente")
          datoIn.estadoProceso="Pendiente Lote";
        else datoIn.estadoProceso = "Procesada";
      }
      datoIn.listPcomprasO = auxListComprasO;
      this.ordenECService.verificacionOrdenCompra(datoIn).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            if (this.openReporte) {
              this.openReporte = false;
            }
            this.toastr.success('Actualización de Inventario satisfactorio', 'Orden Verificada');
            this.restartListPendientes(this.paginacion.pagActualIndex);
          }
        },
        err => {
          console.log(err);
        });
    }
  }

  onReport(datoIn: cOrdenEC) {
    if (datoIn.listPcomprasO.find(x => x.marcar == false) != undefined) {
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
          this.openReporte = true;
          this.ordenECService.formData = new cOrdenEC();
          this.ordenECService.formData.completar(datoIn);
          this.crearOrdenFaltanteMedicamento(strObservacion);
        }
      });
    }
  }

  restartListPendientes(valorPage?: number) {
    this.listOrdenesMostrar = [];
    if (this._conexcionService.UserDataToken.role == "enfermeria")
      this.listBarcos.nombreBodega = "ENFERMERIA GENERAL";
    this.ordenECService.getVerificarMedicamento("ENFERMERIA@DISTRIBUIDORA FARMACEUTICA ECUATORIANA DIFARE S.A@" + this.listBarcos.nombreBodega).subscribe(dato => {
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

  generarReporte(observacionIn) {
    var auxBase = this.onConvertPdfOne().split('base64,');
    if (this.conexcionService.UserDataToken.whatsAppPhone == "593-999786121")
      var personas: string[][] = [[this.conexcionService.UserDataToken.name, this.conexcionService.UserDataToken.whatsAppPhone], ["Giancarlo Alvarez", "593-999786121"], ["Carlos Lopez", "593-999786121"], ["Veronica Chumo", "593-999786121"]];
    else var personas: string[][] = [[this.conexcionService.UserDataToken.name, this.conexcionService.UserDataToken.whatsAppPhone], ["Giancarlo Alvarez", "593-999786121"], ["Carlos Lopez", "593-999486327"], ["Veronica Chumo", "593-983514650"]];
    var auxWhatsapp: cWhatsapp;
    for (var i = 0; i < personas.length; i++) {
      auxWhatsapp = {
        phone: personas[i][1],
        message: "",
        caption: "",
        title: this.ordenECService.formData.planta + "_" + this.ordenECService.formData.fechaRegistroBodega + "-" + this.ordenECService.formData.factura + ".pdf",
        media: auxBase[1],
        type: "application/pdf"
      };
      auxWhatsapp.caption = ':bell: *Notificación Reporte de Inconsistencia*:exclamation: :bell:'
        + '\n'
        + '\n:wave: Saludos ' + personas[i][0]
        + '\nSe le informa que se ha generado un reporte en la revisión de medicamentos para el barco *' + this.ordenECService.formData.listPcomprasO[0].destinoBodega + '*.'
        + '\nLos datos de la compra son:'
        + '\n'
        + '\n*Factura:* ' + this.ordenECService.formData.factura
        + '\n*Marea:* ' + this.ordenECService.formData.marea
        + '\n*Fecha de Registro* ' + this.ordenECService.formData.fechaRegistroBodega
        + '\n*Usuario:* ' + this.ordenECService.formData.guardiaCargoUser
        + '\n'
        + '\nLa observación es:'
        + '\n' + observacionIn
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

  onConvertPdfOne() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(18);
    doc.setFont("arial", "bold");
    doc.text("Inventario Faltante", 110, 15);

    doc.setFontSize(13);
    doc.text("Barco: " + this.ordenECService.formData.listPcomprasO[0].destinoBodega + "        Marea#: " + this.ordenECService.formData.marea, 145, 25);
    y = 30;

    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, (y), 290, (y));//down
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("#", 10, (y + 7));
    doc.line(20, y, 20, (y + 10));//right
    doc.text("Código", 30, (y + 7));
    doc.line(50, y, 50, (y + 10));//right
    doc.text("Cantidad Comprada", 52, (y + 7));
    doc.line(85, y, 85, (y + 10));//right
    doc.text("Cont.Neto", 90, (y + 7));
    doc.line(110, y, 110, (y + 10));//right
    doc.text("Unidades Totales", 112, (y + 7));
    doc.line(145, y, 145, (y + 10));//right
    doc.text("Unidades Faltantes", 147, (y + 7));
    doc.line(180, y, 180, (y + 10));//right
    doc.text("Descripción", 230, (y + 7));

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    var valorG: number = 10;
    var indexBusqueda = -1;
    for (var i = 0; i < this.ordenECService.formData.listPcomprasO.length; i++) {
      indexBusqueda = -1;
      indexBusqueda = this.consultaMedicService.formData.listReceta.findIndex(x => x.inventarioId == this.ordenECService.formData.listPcomprasO[i].productoId);
      if (indexBusqueda != -1) {
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
          doc.text("Código", 30, (y + 7));
          doc.line(50, y, 50, (y + 10));//right
          doc.text("Cantidad Comprada", 52, (y + 7));
          doc.line(85, y, 85, (y + 10));//right
          doc.text("Cont.Neto", 90, (y + 7));
          doc.line(110, y, 110, (y + 10));//right
          doc.text("Unidades Totales", 112, (y + 7));
          doc.line(145, y, 145, (y + 10));//right
          doc.text("Unidades Faltantes", 147, (y + 7));
          doc.line(180, y, 180, (y + 10));//right
          doc.text("Descripción", 230, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        doc.line(5, (y - valorG), 5, y);//left
        doc.text((i + 1).toString(), 10, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[i].producto.codigo, 25, (y - ((valorG - 3) / 2)));
        doc.line(50, (y - valorG), 50, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[i].cantidad.toString(), 68, (y - ((valorG - 3) / 2)));
        doc.line(85, (y - valorG), 85, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[i].producto.contenidoNeto.toString(), 97, (y - ((valorG - 3) / 2)));
        doc.line(110, (y - valorG), 110, y);//right
        doc.text((this.ordenECService.formData.listPcomprasO[i].producto.contenidoNeto * this.ordenECService.formData.listPcomprasO[i].cantidad) + "", 125, (y - ((valorG - 3) / 2)));
        doc.line(145, (y - valorG), 145, y);//right
        doc.text((this.consultaMedicService.formData.listReceta[indexBusqueda].cantidad).toString(), 160, (y - ((valorG - 3) / 2)));
        doc.line(180, (y - valorG), 180, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[i].producto.nombre, 185, (y - ((valorG - 3) / 2)));
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down
      }
    }
    return (doc.output('datauristring'));
  }

  crearOrdenFaltanteMedicamento(observacionIn: string) {
    this.consultaMedicService.formData = new cConsultaMedic(this.conexcionService.UserDataToken.name, this.ordenECService.formData.listPcomprasO[0].destinoBodega);
    this.consultaMedicService.formData.paciente = "MANACRIPEX";
    this.consultaMedicService.formData.sintomas = observacionIn;
    this.consultaMedicService.formData.marea = this.ordenECService.formData.marea;
    var auxReceta: cRecetaMedic;
    for (var i = 0; i < this.ordenECService.formData.listPcomprasO.length; i++) {
      if (!this.ordenECService.formData.listPcomprasO[i].marcar) {
        auxReceta = new cRecetaMedic();
        auxReceta.inventarioId = this.ordenECService.formData.listPcomprasO[i].productoId;
        auxReceta.cantidad = this.ordenECService.formData.listPcomprasO[i].cantidad * this.ordenECService.formData.listPcomprasO[i].producto.contenidoNeto;
        auxReceta.inventario.rellenarObjeto(this.ordenECService.formData.listPcomprasO[i].producto);
        if (this.ordenECService.formData.listPcomprasO[i].loteMedic != "SIN ASIGNAR")
          auxReceta.loteId = this.ordenECService.formData.listPcomprasO[i].loteMedic;
        this.consultaMedicService.formData.agregarOneItem(auxReceta);
      }
    }
  }

  recibirRes(salir: string) {
    if (salir == '1') {
      this.ordenECService.formData.listPcomprasO.forEach(x => {
        x.marcar = true;
      });
      this.generarReporte(this.consultaMedicService.formData.sintomas);
      this.onSave(this.ordenECService.formData);
    } else
      this.openReporte = false;
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
    this.paginacion.updateIndex(0);
  }

}
