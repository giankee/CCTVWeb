import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceDocumento } from 'src/app/shared/otrosServices/varios';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-compra-model',
  templateUrl: './view-compra-model.component.html',
  styles: []
})
export class ViewCompraModelComponent implements OnInit {
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }
  public get ordenECService(): OrdenECService {
    return this._ordenECService;
  }
  public set ordenECService(value: OrdenECService) {
    this._ordenECService = value;
  }

  faprint = faPrint;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewCompraModelComponent>, private _ordenECService: OrdenECService, private _enterpriceServise: ApiEnterpriceService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      this._ordenECService.formData = new cOrdenEC();
      this._enterpriceServise.formDocumento = new cEnterpriceDocumento();
      this.cargarData();
    }
  }

  cargarData() {
    this._ordenECService.getOneOrden(this.dato.auxId)
      .subscribe((datoOne: any) => {
        if (datoOne.exito == 1) {
          if (datoOne.message == "Ok") {
            this._ordenECService.formData.completar(datoOne.data);
            this._enterpriceServise.getOneDocumento(this._ordenECService.formData.idCompraAutomatica.toString())
              .subscribe((datoDocumento: any) => {
                this._enterpriceServise.formDocumento.completar(datoDocumento);
              },
                error => console.error(error));
          } else this.onExit();
        } else this.onExit();
      },
        error => console.error(error));
  }

  onConvertPdfOne() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(18);
    doc.setFont("arial", "bold");
    doc.text("Factura de Compra", 115, 15);

    doc.setFontSize(13);
    doc.text("Factura: ", 210, 25);
    y = 30;
    doc.line(5, y, 290, y);//up
    doc.line(5, y, 5, (y + 25));//left
    doc.line(290, y, 290, (y + 25));//right
    doc.line(5, (y + 25), 290, (y + 25));//down

    doc.text("Proveedor: ", 10, (y + 7));
    doc.text("RUC: ", 10, (y + 14));
    doc.text("Contribuyente Espcial Nro: ", 10, (y + 21));

    doc.text("Nro. Autorización: ", 10, y + 32);

    doc.setFont("arial", "normal");
    doc.setFontSize(12);
    doc.text(this._enterpriceServise.formDocumento.documento, 230, 25);
    doc.text(this._ordenECService.formData.proveedor, 35, (y + 7));
    doc.text(this._enterpriceServise.formDocumento.crp_Proveedor, 23, (y + 14));
    doc.text(this._enterpriceServise.formDocumento.nro_contespecial, 67, (y + 21));

    doc.text(this._enterpriceServise.formDocumento.claveacceso, 50, y + 32);

    y = y + 35;
    doc.setFontSize(13);
    doc.setFont("arial", "bold");
    doc.line(5, y, 290, y);//up
    doc.line(5, y, 5, (y + 20));//left
    doc.line(290, y, 290, (y + 20));//right
    doc.line(5, (y + 20), 290, (y + 20));//down

    doc.text("Razón Social / Nombres y Apellidos:", 10, (y + 7));
    doc.text("Identificación: ", 10, (y + 14));
    doc.text("Fecha de Emisión:", 100, (y + 14));
    if (this.ordenECService.formData.planta == "ENFERMERIA") {
      doc.text("Barco:", 190, (y + 14));
      doc.setFont("arial", "normal");
      doc.setFontSize(12);
      doc.text(this.ordenECService.formData.listPcomprasO[0].destinoBodega, 205, (y + 14));
    }

    doc.setFont("arial", "normal");
    doc.setFontSize(12);
    doc.text(this._enterpriceServise.formDocumento.rS_Cliente, 85, (y + 7));
    doc.text(this._enterpriceServise.formDocumento.crp_Cliente, 42, (y + 14));
    doc.text(this._enterpriceServise.formDocumento.emi_Fecha, 140, (y + 14));


    y = y + 25;

    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, (y), 290, (y));//down
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("Código", 20, (y + 7));
    doc.line(45, y, 45, (y + 10));//right
    doc.text("Cantidad", 48, (y + 7));
    doc.line(65, y, 65, (y + 10));//right
    doc.text("Cont.Neto/General", 66, (y + 7));
    doc.line(95, y, 95, (y + 10));//right
    doc.text("Descripción", 120, (y + 7));
    doc.line(190, y, 190, (y + 10));//right
    doc.text("Precio U", 195, (y + 7));
    doc.line(215, y, 215, (y + 10));//right
    doc.text("Precio Neto", 220, (y + 7));
    doc.line(240, y, 240, (y + 10));//right
    doc.text("Descuento", 245, (y + 7));
    doc.line(265, y, 265, (y + 10));//right
    doc.text("Total", 272, (y + 7));

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    var valorG: number = 0;
    var lineaDescripcion;
    var auxPrueba: number;

    for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
      lineaDescripcion = doc.splitTextToSize(this._ordenECService.formData.listPcomprasO[i].producto.nombre, (95));
      valorG = (3 * lineaDescripcion.length) + 4;
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

        doc.text("Código", 20, (y + 7));
        doc.line(45, y, 45, (y + 10));//right
        doc.text("Cantidad", 48, (y + 7));
        doc.line(65, y, 65, (y + 10));//right
        doc.text("Cont.Neto/General", 66, (y + 7));
        doc.line(95, y, 95, (y + 10));//right
        doc.text("Descripción", 120, (y + 7));
        doc.line(190, y, 190, (y + 10));//right
        doc.text("Precio U", 195, (y + 7));
        doc.line(215, y, 215, (y + 10));//right
        doc.text("Precio Neto", 220, (y + 7));
        doc.line(240, y, 240, (y + 10));//right
        doc.text("Descuento", 245, (y + 7));
        doc.line(265, y, 265, (y + 10));//right
        doc.text("Total", 272, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }

      auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2.5) + 3;

      doc.line(5, (y - valorG), 5, y);//left
      doc.text(this._ordenECService.formData.listPcomprasO[i].producto.codigo, 10, (y - ((valorG - 3) / 2)));
      doc.line(45, (y - valorG), 45, y);//right
      doc.text(this._ordenECService.formData.listPcomprasO[i].cantidad.toString(), 55, (y - ((valorG - 3) / 2)));
      doc.line(65, (y - valorG), 65, y);//right
      if (this._ordenECService.formData.listPcomprasO[i].producto.tipoUnidad == "UNIDAD")
        doc.text(this._ordenECService.formData.listPcomprasO[i].cantidad.toString(), 80, (y - ((valorG - 3) / 2)));
      if (this._ordenECService.formData.listPcomprasO[i].producto.tipoUnidad == "CONTENIDO NETO")
        doc.text(this._ordenECService.formData.listPcomprasO[i].producto.contenidoNeto.toString() + " / " + (this._ordenECService.formData.listPcomprasO[i].producto.contenidoNeto * this._ordenECService.formData.listPcomprasO[i].cantidad), 75, (y - ((valorG - 3) / 2)));
      if (this._ordenECService.formData.listPcomprasO[i].producto.tipoUnidad == "EQUIVALENCIA")
        doc.text((this._ordenECService.formData.listPcomprasO[i].cantidad / this._ordenECService.formData.listPcomprasO[i].producto.contenidoNeto).toString(), 80, (y - ((valorG - 3) / 2)));
      doc.line(95, (y - valorG), 95, y);//right
      doc.text(lineaDescripcion, 100, (y - valorG + auxPrueba));
      doc.line(190, (y - valorG), 190, y);//right
      doc.text('$' + this._ordenECService.formData.listPcomprasO[i].precio.toString(), 200, (y - ((valorG - 3) / 2)));
      doc.line(215, (y - valorG), 215, y);//right

      var auxPrecioNeto = "---";
      if (this._ordenECService.formData.listPcomprasO[i].producto.precioNeto != 0)
        auxPrecioNeto = "$" + this._ordenECService.formData.listPcomprasO[i].producto.precioNeto;
      doc.text(auxPrecioNeto, 225, (y - ((valorG - 3) / 2)));
      doc.line(240, (y - valorG), 240, y);//right

      doc.text('$' + this._ordenECService.formData.listPcomprasO[i].descuento.toString(), 250, (y - ((valorG - 3) / 2)));
      doc.line(265, (y - valorG), 265, y);//right
      doc.setFont("arial", "bold");
      doc.text('$' + this._ordenECService.formData.listPcomprasO[i].totalInd.toString(), 275, (y - ((valorG - 3) / 2)));
      doc.setFont("arial", "normal");
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down
    }

    if ((y + 50) >= 200) {
      doc.text("Pág. #" + Npag, 280, 207);
      Npag++;
      doc.addPage();
      doc.text("Pág. #" + Npag, 280, 207);
      y = 15;
      doc.line(5, y, 290, y);//up
    }
    doc.setFontSize(10);
    doc.line(5, y, 5, (y + 50));//left
    doc.line(215, y, 215, (y + 50));//right
    doc.line(250, y, 250, (y + 50));//right
    doc.line(290, y, 290, (y + 50));//right

    doc.setFont("arial", "bold");
    doc.text("Sub Total", 225, (y + 7));
    doc.text('$' + this._ordenECService.formData.subTotalLibre.toString(), 265, (y + 7));
    doc.line(215, (y + 10), 290, (y + 10));//down
    doc.setFont("arial", "normal");
    doc.text("Tarifa 12%", 225, (y + 17));
    doc.text('$' + this._ordenECService.formData.auxTarifa12.toString(), 265, (y + 17));
    doc.line(215, (y + 20), 290, (y + 20));//down
    doc.text("Tarifa 0%", 225, (y + 27));
    doc.text('$' + this._ordenECService.formData.auxTarifa0.toString(), 265, (y + 27));
    doc.line(215, (y + 30), 290, (y + 30));//down
    doc.setFont("arial", "bold");
    doc.text("IVA 12%", 225, (y + 37));
    doc.text('$' + this._ordenECService.formData.totalImpuestos.toString(), 265, (y + 37));
    doc.line(215, (y + 40), 290, (y + 40));//down
    doc.text("TOTAL", 225, (y + 47));
    doc.text('$' + this._ordenECService.formData.totalOrden.toString(), 265, (y + 47));
    doc.line(5, (y + 50), 290, (y + 50));//down

    if (this.ordenECService.formData.planta == "ENFERMERIA") {
      doc.text("Pág. #" + Npag, 280, 207);
      Npag++;
      doc.addPage();
      doc.text("Pág. #" + Npag, 280, 207);
      doc.setFontSize(11);
      doc.setFont("arial", "bold")
      y = 15;
      doc.line(5, (y), 290, (y));//up
      doc.line(5, y, 5, (y + 20));//left
      doc.line(290, y, 290, (y + 20));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      doc.text("Lista de medicamento compradas en la marea: " + this.ordenECService.formData.marea + " del barco: " + this.ordenECService.formData.listPcomprasO[0].destinoBodega, 15, (y + 7));
      doc.line(5, (y + 20), 290, (y + 20));//down
      doc.text("#", 12, (y + 17));
      doc.line(20, (y + 10), 20, (y + 20));//left
      doc.text("Medicamento", 35, (y + 17));
      doc.line(200, (y + 10), 200, (y + 20));//left
      doc.text("Lote", 215, (y + 17));
      doc.line(240, (y + 10), 240, (y + 20));//left
      doc.text("Fecha de Caducidad", 247, (y + 17));
      doc.setFontSize(9);
      doc.setFont("arial", "normal")
      y = y + 20;

      for (var index = 0; index < this.ordenECService.formData.listPcomprasO.length; index++) {
        y = y + 7;

        if (y > 200) {
          Npag++;
          doc.addPage();
          doc.text("Pág. #" + Npag, 280, 207);
          doc.setFontSize(11);
          doc.setFont("arial", "bold")
          y = 15;
          doc.line(5, (y), 290, (y));//up
          doc.line(5, y, 5, (y + 20));//left
          doc.line(290, y, 290, (y + 20));//right
          doc.line(5, (y + 10), 290, (y + 10));//down

          doc.text("Lista de medicamento compradas en la marea: " + this.ordenECService.formData.marea + " del barco: " + this.ordenECService.formData.listPcomprasO[0].destinoBodega, 15, (y + 7));
          doc.line(5, (y + 20), 290, (y + 20));//down
          doc.text("#", 12, (y + 17));
          doc.line(20, (y + 10), 20, (y + 20));//left
          doc.text("Medicamento", 35, (y + 17));
          doc.line(200, (y + 10), 200, (y + 20));//left
          doc.text("Lote", 215, (y + 17));
          doc.line(240, (y + 10), 240, (y + 20));//left
          doc.text("Fecha de Caducidad", 247, (y + 17));

          doc.setFontSize(9);
          doc.setFont("arial", "normal")
          y = y + 27;
        }

        doc.line(5, (y - 7), 5, y);//left
        doc.line(290, (y - 7), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.text((index + 1).toString(), 11, (y - 2));
        doc.line(20, (y - 7), 20, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[index].producto.nombre, 25, (y - 2));
        doc.line(200, (y - 7), 200, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[index].loteMedic!=null?this.ordenECService.formData.listPcomprasO[index].loteMedic: "---" , this.ordenECService.formData.listPcomprasO[index].loteMedic!=null?205:218, (y - 2));
        doc.line(240, (y - 7), 240, y);//right
        doc.text(this.ordenECService.formData.listPcomprasO[index].loteMedic!=null?this.ordenECService.formData.listPcomprasO[index].fechaVencimientoMedic: "---" , this.ordenECService.formData.listPcomprasO[index].loteMedic!=null?245:262, (y - 2));
      }
    }

    doc.save("Compra_" + this.ordenECService.formData.factura + "_" + this._ordenECService.formData.fechaRegistroBodega + ".pdf");
  }

  onExit() {
    this.dialogRef.close();
  }
}
