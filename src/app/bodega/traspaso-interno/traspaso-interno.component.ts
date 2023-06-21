import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cVario, cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { faOutdent, faPlus, faSave, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cMaterialesO, cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { finalize, map } from 'rxjs/operators';
import { cBodega, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';

@Component({
  selector: 'app-traspaso-interno',
  templateUrl: './traspaso-interno.component.html',
  styles: [],
})
export class TraspasoInternoComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get ordenTrabajoService(): OrdenTrabajoService {
    return this._ordenTrabajoService;
  }
  public set ordenTrabajoService(value: OrdenTrabajoService) {
    this._ordenTrabajoService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }

  @Input()
  isOpen: boolean = false;

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  fechaHoy = new cFecha();
  paginacion = new cPaginacion(5);

  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;
  listBodegaOrigen: cBodega[] = [];
  listBodegaDestino: cBodega[] = [];
  listProdFiltros$: any;

  faoutdent = faOutdent; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes; fasave = faSave;
  constructor(private _conexcionService: ConexionService, private _productoBService: ProductoBService, private toastr: ToastrService, private _ordenTrabajoService: OrdenTrabajoService, private _variosService: VariosService, private whatsappService: WhatsappService) {
  }

  ngOnInit(): void {
    this.cargarBodega();
    if (!this.isOpen) 
      this.reset();
    else this._ordenTrabajoService.formData.agregarOneMaterial();
    this.paginacion.getNumberIndex(1);
    this.paginacion.updateIndex(0);
  }

  reset(){
    if (this._conexcionService.UserR.rolAsignado == "enfermeria") {
      this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserR.nombreU, "ENFERMERIA");
    } else {
      if (this._conexcionService.UserR.rolAsignado == "gpv-o") {
        this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserR.nombreU, "OFICINAS");
        this._ordenTrabajoService.formData.bodega = "Bodega Helicoptero";
        this.ordenTrabajoService.formData.bodeguero=this.conexcionService.UserR.nombreU;
      }
      else {
        this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserR.nombreU, "P MANACRIPEX");
        if (this._conexcionService.UserR.rolAsignado == "bodega_verificador-m")
          this._ordenTrabajoService.formData.bodega = "GENERAL";
        if (this.conexcionService.UserR.nombreU == "FERNANDA MORALES"){
          this._ordenTrabajoService.formData.bodega = "MECANICA NAVAL";
          this.ordenTrabajoService.formData.bodeguero="FERNANDA MORALES";
        }
      }
    }
    this.okBttnSubmit=true;
    this.ordenTrabajoService.formData.tipoOrden = "Traspaso Bodega";
    this.ordenTrabajoService.formData.destinoLugar="SIN ASIGNAR";
    this._ordenTrabajoService.formData.agregarOneMaterial();
  }

  cargarBodega() {
    if (this.conexcionService.UserR.rolAsignado == "enfermeria") {
      this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
        this.listBodegaOrigen = dato;
      });
    } else {
      if (this.conexcionService.UserR.rolAsignado == "gpv-o") {
        this._variosService.getBodegasTipo("OFICINAS").subscribe(dato => {
          this.listBodegaOrigen = JSON.parse(JSON.stringify(dato));
          this.listBodegaDestino = JSON.parse(JSON.stringify(this.listBodegaOrigen));
          this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
            for (var i = 0; i < dato.length; i++) {
              this.listBodegaDestino.push(dato[i]);
            }
          });
        });
      } else {
        this._variosService.getBodegasTipo("P MANACRIPEX").subscribe(dato => {
          this.listBodegaDestino = dato;
          if (this.conexcionService.UserR.rolAsignado != 'tinabg-m') {
            this.listBodegaOrigen = this.listBodegaDestino.filter(x => x.encargadoBodega == this.conexcionService.UserR.nombreU);
            if (this.conexcionService.UserR.nombreU == "FERNANDA MORALES") {
              this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
                for (var i = 0; i < dato.length; i++) {
                  this.listBodegaDestino.push(dato[i]);
                }
              });
            }
          }else this.listBodegaOrigen = this.listBodegaDestino;
        });
      }
    }
  }

  comprobarNewM() {
    var flag = true;
    if (this.ordenTrabajoService.formData.listMaterialesO.length > 0)
      this.ordenTrabajoService.formData.listMaterialesO.forEach(x => {
        if (x.cantidad <= 0)
          flag = false;
        if (x.loteId == "SIN ASIGNAR" && x.cantidad > x.inventario.listBodegaProducto[0].disponibilidad)
          flag = false;
        if (x.inventario.listBodegaProducto[0].listAreas.length > 0) {
          if (x.loteId != "SIN ASIGNAR" && x.cantidad > x.inventario.listBodegaProducto[0].listAreas.find(y => y.nombreSub == x.loteId).disponibilidad)
            flag = false;
        }
      });
    this.okAddNewBotton = flag;
    return (flag);
  }

  onNewMaterial() {
    if (this.comprobarNewM()) {
      this._ordenTrabajoService.formData.agregarOneMaterial();
      this.paginacion.getNumberIndex(this._ordenTrabajoService.formData.listMaterialesO.length);
      this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
    }
  }

  onRemoveNewM(indice) {
    var auxLA: cMaterialesO[] = [];
    if (this._ordenTrabajoService.formData.listMaterialesO.length > 1) {
      this._ordenTrabajoService.formData.listMaterialesO.splice(indice, 1);
      auxLA = JSON.parse(JSON.stringify(this._ordenTrabajoService.formData.listMaterialesO));
      this._ordenTrabajoService.formData.listMaterialesO = [];
      this._ordenTrabajoService.formData.listMaterialesO = JSON.parse(JSON.stringify(auxLA));
    }
    this.comprobarNewM();
  }

  onListProducto(index: number, op: number, value: string) {
    this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = true;
    this._ordenTrabajoService.formData.listMaterialesO.forEach(x => x.showSearchSelect = 0);
    this._ordenTrabajoService.formData.listMaterialesO[index].showSearchSelect = op;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.resetProducto();
    if (op == 2)
      this._ordenTrabajoService.formData.listMaterialesO[index].inventario.nombre = value.toUpperCase();
    else this._ordenTrabajoService.formData.listMaterialesO[index].inventario.codigo = value.toUpperCase();

    var strParametro = value;
    if (value != "") {
      strParametro = strParametro + "@" + this._ordenTrabajoService.formData.planta + "@" + op + "@" + this.ordenTrabajoService.formData.bodega;
      this.listProdFiltros$ = this._productoBService.getProductosSearch(strParametro).pipe(
        map((x: cProducto_B[]) => {
          return x.filter(y => y.listBodegaProducto.length > 0);
        }),
        finalize(() => this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = false)
      );
    } else this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = false;
  }

  onChooseElemente(index, op: number, data: any) {
    this._ordenTrabajoService.formData.listMaterialesO[index].showSearchSelect = 0;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.rellenarObjeto(data);
    this._ordenTrabajoService.formData.listMaterialesO[index].inventarioId = this.ordenTrabajoService.formData.listMaterialesO[index].inventario.idProductoStock;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.disBttnInput = op;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.listBodegaProducto[0].sumStockBodegas();
  }

  onSubmit(form: NgForm) {
    if (this._conexcionService.formData.connectionStatus == "nline") {
      this.okBttnSubmit = false;
      if (this.comprobarNewM()) {
        if (this.conexcionService.UserR.rolAsignado == "enfermeria")
          this.ordenTrabajoService.formData.marea = this.ordenTrabajoService.formData.marea + "-" + this.fechaHoy.anio;
        else this.ordenTrabajoService.formData.marea = null;
        this._ordenTrabajoService.traspasoBodega(this._ordenTrabajoService.formData).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.toastr.success('Registro satisfactorio', 'Traspaso Exitoso');
              this.ordenTrabajoService.formData.numOrdenSecuencial = res.data.numOrdenSecuencial;
              if (this.ordenTrabajoService.formData.destinoLugar != "ENFERMERIA GENERAL") {
                if (this.listBodegaOrigen.find(x => x.nombreBodega == this._ordenTrabajoService.formData.bodega).encargadoBodega != this.listBodegaDestino.find(x => x.nombreBodega == this.ordenTrabajoService.formData.destinoLugar).encargadoBodega) {
                  this.sendMediaMessage(this.ordenTrabajoService.formData, this.listBodegaDestino.find(x => x.nombreBodega == this.ordenTrabajoService.formData.destinoLugar).telefonoEncargado)
                } else this.onConvertPdfOne(this.ordenTrabajoService.formData);
              }
            } else {
              this.okBttnSubmit = false;
              this.toastr.warning('Registro Fallido', 'Intentelo mas tarde')
            };
            if (this.isOpen) {
              this.ordenTrabajoService.formData.resetObject();
              this.cerrar.emit(true);
            }else this.reset();
          });
          
          
      } else this.okBttnSubmit = true;
    } else {
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info'
        },
        buttonsStyling: false
      })
    }
  }

  onConvertPdfOne(orden: cOrdenTrabajoI) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold");
    doc.text("Orden de " + orden.tipoOrden + " #" + orden.numOrdenSecuencial, 70, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down
    doc.setFontSize(13);
    if (orden.tipoOrden == "Trabajo Interno")
      doc.text("Datos de la orden", 15, (y + 5));
    else doc.text("Datos del traspaso", 15, (y + 5));

    doc.setFontSize(11);

    doc.text("Planta: ", 20, (y + 10));
    doc.text("Fecha Registro: ", 105, (y + 10));

    doc.text("Bodega de Salida: ", 20, (y + 15));
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
    doc.text(orden.bodega, 53, (y + 15));
    doc.text(orden.destinoLugar, 137, (y + 15));
    doc.text(orden.bodeguero, 75, (y + 20));
    doc.text(orden.personaResponsable, 163, (y + 20));
    doc.text(orden.guardiaCargoUser, 50, (y + 25));
    doc.text(orden.estadoProceso, 143, (y + 25));
    y = y + 35;

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
      doc.text(orden.listMaterialesO[i].cantidad.toString(), 60, (y - ((valorG - 3) / 2)));
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
    return (doc.output('datauristring'));
  }

  sendMediaMessage(traspaso: cOrdenTrabajoI, telefonoIn: string) {
    var auxBase = this.onConvertPdfOne(traspaso).split('base64,');
    var auxWhatsapp: cWhatsapp;
    auxWhatsapp = {
      phone: telefonoIn,
      message: "",
      title: "Traspaso_" + traspaso.fechaRegistro + "_" + traspaso.numOrdenSecuencial + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    auxWhatsapp.message = ':bell: *Notificación de Traspaso*:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos Compañero:'
      + '\nSe le informa que se ha registrado un trasposo de material de la bodega *' + traspaso.bodega + '* para la bodega *' + traspaso.destinoLugar + '*.'
      + '\nLos datos de la compra son:'
      + '\n'
      + '\n*Secuencial:* ' + traspaso.numOrdenSecuencial
      + '\n*Fecha de Registro* ' + traspaso.fechaRegistro
      + '\n*Usuario:* ' + traspaso.guardiaCargoUser
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
