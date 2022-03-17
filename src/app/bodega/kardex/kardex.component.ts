import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { cItemKardex, cKardex, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import jsPDF from 'jspdf';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { ViewOrdenModalComponent } from 'src/app/OrdenAdmin/view-orden-modal/view-orden-modal.component';
import { ViewCompraModelComponent } from '../view-compra-model/view-compra-model.component';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ViewTrabajoModelComponent } from '../orden-trabajo-planta/view-trabajo-model/view-trabajo-model.component';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styles: []
})
export class KardexComponent implements OnInit {
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
  public get productoBservice(): ProductoBService {
    return this._productoBservice;
  }
  public set productoBservice(value: ProductoBService) {
    this._productoBservice = value;
  }
  public get oneKardex(): cKardex {
    return this._oneKardex;
  }
  public set oneKardex(value: cKardex) {
    this._oneKardex = value;
  }


  fechaHoy = new cFecha();
  strFechaMarcar: string = "";
  controlMovimiento: number = 0; //0 nunca se ha realizado movimientos, 1 no hay movimientos en ese periodo, 2 si hay movimientos;
  listBodega: cVario[] = [];
  private _oneKardex: cKardex = new cKardex(this.fechaHoy.anio + "-" + this.fechaHoy.mes);

  faprint = faPrint;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<KardexComponent>, private dialog: MatDialog, private _productoBservice: ProductoBService, private toastr: ToastrService, private _conexcionService: ConexionService, private _variosService: VariosService) {
  }

  ngOnInit(): void {
    this.cargarBodega();
    if (this.dato.auxId != null) {
      this.cargarData();
      this._productoBservice.formData.listBodegaProducto.forEach(x => {
        this.oneKardex.cantidadDisponible = this.oneKardex.cantidadDisponible + x.disponibilidad;
        this.oneKardex.cantidadInicial = this.oneKardex.cantidadInicial + x.cantInicial;
      });
    }
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.listBodega = dato;
    });
  }

  cargarData() {
    this.oneKardex.listItems=[];
    this.strFechaMarcar = "";
    var strParametro = this._productoBservice.formData.planta + "@" + this.dato.auxId + "@" + this.oneKardex.tipoVista + "@" + this.oneKardex.fechaBusqueda + "@" + this._oneKardex.BodegaSelect;
    this._productoBservice.getKardexProducto(strParametro)
      .subscribe((dato: any) => {
        if (dato.exito == 1) {
          if (dato.message == "Ok") {
            this.controlMovimiento = 2;
            if (dato.data.preListItems.length != 0) {
              var auxPreKardex: cKardex = new cKardex();
              auxPreKardex.completarKardex(this.oneKardex.cantidadInicial, 0, dato.data.preListItems);
              this.oneKardex.completarKardex(auxPreKardex.listItems[auxPreKardex.listItems.length - 1].datoSaldo.cantidad, auxPreKardex.listItems[auxPreKardex.listItems.length - 1].datoSaldo.precioU, dato.data.listItems);
            } else {
              if(dato.data.listItems.length!=0){
                if (dato.data.listItems[0].tipoItem == "Compra")
                this.oneKardex.completarKardex(this.oneKardex.cantidadInicial, dato.data.listItems[0].precio, dato.data.listItems);
              else this.oneKardex.completarKardex(this.oneKardex.cantidadInicial, 0, dato.data.listItems);
              }
            }
            if (this.oneKardex.listItems.length == 0)
              this.controlMovimiento = 1;
            this.strFechaMarcar = "  al mes de " + this.fechaHoy.transformarStrMes(this.oneKardex.fechaBusqueda);
          } else this.controlMovimiento = 0;
        }
      },
        error => console.error(error));
  }

  onConvertPdfOne() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(13);
    doc.setFont("arial", "bold");
    doc.text("KARDEX PROMEDIO", 100, 15);

    y = 20;
    doc.line(5, y, 290, y);//up
    doc.line(5, y, 5, (y + 25));//left
    doc.line(290, y, 290, (y + 25));//right
    doc.line(5, (y + 25), 290, (y + 25));//down

    doc.text("Código: ", 10, (y + 7));
    doc.text("Nombre: ", 145, (y + 7));
    doc.text("Proveedor: ", 10, (y + 14));
    doc.text("Periodo: ", 10, (y + 21));
    doc.text("Fecha: ", 70, (y + 21));
    doc.text("Disponibilidad General Actual: ", 145, (y + 21));

    doc.setFont("arial", "normal");
    doc.setFontSize(12);
    doc.text(this._productoBservice.formData.codigo, 27, (y + 7));
    doc.text(this._productoBservice.formData.nombre, 167, (y + 7));
    doc.text(this._productoBservice.formData.proveedor, 37, (y + 14));
    doc.text(this.oneKardex.tipoVista, 30, (y + 21));
    doc.text(this.oneKardex.fechaBusqueda, 87, (y + 21));
    doc.text(this.oneKardex.cantidadDisponible.toString(), 210, (y + 21));

    y = y + 30;
    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, (y), 290, (y));//up
    doc.line(5, y, 5, (y + 20));//left
    doc.line(290, y, 290, (y + 20));//right
    doc.line(5, (y + 20), 290, (y + 20));//down

    doc.text("Index", 8, (y + 12));
    doc.line(20, y, 20, (y + 20));//left
    doc.line(20, (y + 10), 80, (y + 10));//middle
    doc.text("Documento", 40, (y + 7));
    doc.text("Fecha", 25, (y + 17));
    doc.line(40, y + 10, 40, (y + 20));//left
    doc.text("Guía", 45, (y + 17));
    doc.line(60, y + 10, 60, (y + 20));//left
    doc.text("Factura", 65, (y + 17));
    doc.line(80, y, 80, (y + 20));//left
    doc.text("Detalle", 115, (y + 12));
    doc.line(155, (y + 10), 290, (y + 10));//middle
    doc.line(155, y, 155, (y + 20));//left
    doc.text("Entradas", 170, (y + 7));
    doc.text("Cant.", 158, (y + 17));
    doc.line(170, y + 10, 170, (y + 20));//left
    doc.text("P.U", 175, (y + 17));
    doc.line(185, y + 10, 185, (y + 20));//left
    doc.text("P.T", 190, (y + 17));
    doc.line(200, y, 200, (y + 20));//left
    doc.text("Salidas", 215, (y + 7));
    doc.text("Cant.", 203, (y + 17));
    doc.line(215, y + 10, 215, (y + 20));//left
    doc.text("P.U", 220, (y + 17));
    doc.line(230, y + 10, 230, (y + 20));//left
    doc.text("P.T", 235, (y + 17));
    doc.line(245, y, 245, (y + 20));//left
    doc.text("Saldos", 260, (y + 7));
    doc.text("Cant.", 248, (y + 17));
    doc.line(260, y + 10, 260, (y + 20));//left
    doc.text("P.U", 265, (y + 17));
    doc.line(275, y + 10, 275, (y + 20));//left
    doc.text("P.T", 280, (y + 17));

    y = y + 20;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    var valorG: number = 0;
    var lineaDetalle;
    var auxLinea: number;
    for (var i = 0; i < this._oneKardex.listItems.length; i++) {
      lineaDetalle = doc.splitTextToSize(this._oneKardex.listItems[i].tipoItem + " a " + this._oneKardex.listItems[i].lugarTransaccion, (65));
      valorG = (3.5 * lineaDetalle.length) + 4;
      y = y + valorG;

      if (y > 205) {
        doc.text("Pág. #" + Npag, 280, 207);
        Npag++;
        doc.addPage();
        doc.text("Pág. #" + Npag, 280, 207);
        doc.setFontSize(10);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(5, (y), 290, (y));//up
        doc.line(5, y, 5, (y + 20));//left
        doc.line(290, y, 290, (y + 20));//right
        doc.line(5, (y + 20), 290, (y + 20));//down

        doc.text("Index", 8, (y + 12));
        doc.line(20, y, 20, (y + 20));//left
        doc.line(20, (y + 10), 80, (y + 10));//middle
        doc.text("Documento", 40, (y + 7));
        doc.text("Fecha", 25, (y + 17));
        doc.line(40, y + 10, 40, (y + 20));//left
        doc.text("Guía", 45, (y + 17));
        doc.line(60, y + 10, 60, (y + 20));//left
        doc.text("Factura", 65, (y + 17));
        doc.line(80, y, 80, (y + 20));//left
        doc.text("Detalle", 115, (y + 12));
        doc.line(155, (y + 10), 290, (y + 10));//middle
        doc.line(155, y, 155, (y + 20));//left
        doc.text("Entradas", 170, (y + 7));
        doc.text("Cant.", 158, (y + 17));
        doc.line(170, y + 10, 170, (y + 20));//left
        doc.text("P.U", 175, (y + 17));
        doc.line(185, y + 10, 185, (y + 20));//left
        doc.text("P.T", 190, (y + 17));
        doc.line(200, y, 200, (y + 20));//left
        doc.text("Salidas", 215, (y + 7));
        doc.text("Cant.", 203, (y + 17));
        doc.line(215, y + 10, 215, (y + 20));//left
        doc.text("P.U", 220, (y + 17));
        doc.line(230, y + 10, 230, (y + 20));//left
        doc.text("P.T", 235, (y + 17));
        doc.line(245, y, 245, (y + 20));//left
        doc.text("Saldos", 260, (y + 7));
        doc.text("Cant.", 248, (y + 17));
        doc.line(260, y + 10, 260, (y + 20));//left
        doc.text("P.U", 265, (y + 17));
        doc.line(275, y + 10, 275, (y + 20));//left
        doc.text("P.T", 280, (y + 17));
        y = y + 20 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(5, (y - valorG), 5, y);//left
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down +10y1y2
      doc.text(i.toString(), 11, (y - ((valorG - 3) / 2)));
      doc.line(20, (y - valorG), 20, y);//right
      doc.text(this._oneKardex.listItems[i].fecha, 23, (y - ((valorG - 3) / 2)));
      doc.line(40, (y - valorG), 40, y);//right
      doc.text(this._oneKardex.listItems[i].guia, 45, (y - ((valorG - 3) / 2)));
      doc.line(60, (y - valorG), 60, y);//right
      doc.text(this._oneKardex.listItems[i].factura, 65, (y - ((valorG - 3) / 2)));
      doc.line(80, (y - valorG), 80, y);//right
      auxLinea = Number((valorG - (3 * lineaDetalle.length + (3 * (lineaDetalle.length - 1)))) / 2.5) + (2 + lineaDetalle.length);
      doc.text(lineaDetalle, 85, (y - valorG + auxLinea));
      doc.line(155, (y - valorG), 155, y);//right
      doc.text(this._oneKardex.listItems[i].datoEntrada.cantidad.toString(), 160, (y - ((valorG - 3) / 2)));
      doc.line(170, (y - valorG), 170, y);//right
      doc.text(this._oneKardex.listItems[i].datoEntrada.precioU.toString(), 175, (y - ((valorG - 3) / 2)));
      doc.line(185, (y - valorG), 185, y);//right
      doc.text(this._oneKardex.listItems[i].datoEntrada.precioTotal.toString(), 190, (y - ((valorG - 3) / 2)));
      doc.line(200, (y - valorG), 200, y);//right
      doc.text(this._oneKardex.listItems[i].datoSalida.cantidad.toString(), 205, (y - ((valorG - 3) / 2)));
      doc.line(215, (y - valorG), 215, y);//right
      doc.text(this._oneKardex.listItems[i].datoSalida.precioU.toString(), 220, (y - ((valorG - 3) / 2)));
      doc.line(230, (y - valorG), 230, y);//right
      doc.text(this._oneKardex.listItems[i].datoSalida.precioTotal.toString(), 235, (y - ((valorG - 3) / 2)));
      doc.line(245, (y - valorG), 245, y);//right
      doc.text(this._oneKardex.listItems[i].datoSaldo.cantidad.toString(), 250, (y - ((valorG - 3) / 2)));
      doc.line(260, (y - valorG), 260, y);//right
      doc.text(this._oneKardex.listItems[i].datoSaldo.precioU.toString(), 265, (y - ((valorG - 3) / 2)));
      doc.line(275, (y - valorG), 275, y);//right
      doc.text(this._oneKardex.listItems[i].datoSaldo.precioTotal.toString(), 280, (y - ((valorG - 3) / 2)));
    }
    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("TOTALES", 75, (y + 7));
    doc.line(155, y, 155, (y + 10));//left

    doc.text(this._oneKardex.totalSumE.toString(), 158, (y + 7));
    doc.line(170, y + 10, 170, (y + 10));//left
    doc.text("---", 175, (y + 7));
    doc.line(185, y + 10, 185, (y + 10));//left
    doc.text(this._oneKardex.precioSumE.toString(), 190, (y + 7));
    doc.line(200, y, 200, (y + 10));//left
    doc.text(this._oneKardex.totalSumS.toString(), 203, (y + 7));
    doc.line(215, y + 10, 215, (y + 10));//left
    doc.text("---", 220, (y + 7));
    doc.line(230, y + 10, 230, (y + 10));//left
    doc.text(this._oneKardex.precioSumS.toString(), 235, (y + 7));
    doc.line(245, y, 245, (y + 10));//left
    doc.text((this._oneKardex.totalSumS-this._oneKardex.totalSumS).toString(), 248, (y + 7));
    doc.line(260, y + 10, 260, (y + 10));//left
    doc.text("Saldo", 263, (y + 7));
    doc.line(275, y + 10, 275, (y + 10));//left
    doc.text(this._oneKardex.totalBalance.toString(), 280, (y + 7));

    doc.save("Kardex_" + this.productoBservice.formData.codigo + "_" + this.oneKardex.fechaBusqueda + ".pdf");
  }

  onBuscarGF(dataIn: cItemKardex, tipo: number) {
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = false;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    if (tipo == 1 && dataIn.guia != '---' && (dataIn.tipoItem == "Salida" || dataIn.tipoItem == "Entrada" || dataIn.tipoItem == "Devolución")) {
      var auxId = dataIn.relacionGuiaId;
      dialoConfig.data = { auxId };
      this.dialog.open(ViewOrdenModalComponent, dialoConfig);
    }
    if (tipo == 2 && dataIn.factura != '---' && (dataIn.tipoItem == 'Compra' || dataIn.tipoItem == "Devolución")) {
      var auxId = dataIn.relacionFacturaId;
      dialoConfig.data = { auxId };
      this.dialog.open(ViewCompraModelComponent, dialoConfig);
    }
    if (tipo == 1 && dataIn.guia != '---' && dataIn.tipoItem == "Orden Trabajo") {
      var auxId = dataIn.relacionGuiaId;
      dialoConfig.data = { auxId };
      this.dialog.open(ViewTrabajoModelComponent, dialoConfig);
    }
  }

  onExit() {
    this.dialogRef.close();
  }
}
