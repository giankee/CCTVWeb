import { Component, Input, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faEye, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import { cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFiltroTablaCompra } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-reporte-compra',
  templateUrl: './reporte-compra.component.html',
  styles: [],
})
export class ReporteCompraComponent implements OnInit {
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }

  @Input() listComprasIn: cOrdenEC[];
  @Input() tipoR: string;

  ordenBy: string = "default";
  filtroTablaCompra: cFiltroTablaCompra = new cFiltroTablaCompra();
  dataCompraResult: cOrdenEC[] = [];
  paginacion = new cPaginacion(50);

  sumTotal: number = 0;

  /**Icon */
  sort = faSort; faeye = faEye; faprint = faPrint; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; fasearch = faSearch;
  constructor(private _enterpriceServise: ApiEnterpriceService) { }

  ngOnInit(): void {
    this.sumTotal = 0;
    this.listComprasIn.forEach(x => {
      x.fechaRegistroBodega = x.fechaRegistroBodega.substring(0, 10);
      this._enterpriceServise.getOneDocumento(x.idCompraAutomatica.toString())
        .subscribe((datoDocumento: any) => {
          x.fechaAutorizacion = datoDocumento.emi_Fecha.substring(0, 10);
          x.razonSocialCompra = datoDocumento.rS_Cliente;
        },
          error => console.error(error));
      if (this.tipoR == "CaseC") {
        if (x.listPcomprasO.length == 1) {
          x.listPcomprasO.forEach(x1 => {
            x.subTotalLibre = x1.totalInd;
            x.totalImpuestos = 0;
            if (x1.cargaIva12)
              x.totalImpuestos = Number((x1.totalInd * 0.12).toFixed(2));
            if (x1.cargaIva15)
              x.totalImpuestos = Number((x1.totalInd * 0.15).toFixed(2));
            x.totalOrden = x.subTotalLibre + x.totalImpuestos;
          });
        }
      }
      this.sumTotal = Number((this.sumTotal + x.totalOrden).toFixed(2));
    });
    this.paginacion.getNumberIndex(this.listComprasIn.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenListBy(op: number) {// cambia el orden por medio de un pipe
    switch (op) {
      case 1:
        if (this.ordenBy == "up-P")
          this.ordenBy = "down-P";
        else this.ordenBy = "up-P";
        break;
      default: this.ordenBy = "default";
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listComprasIn.length);
    this.paginacion.updateIndex(0);
  }

  getDataFiltro(data: cOrdenEC[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataCompraResult.length) {
      this.dataCompraResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataCompraResult.length);
    }
  }

  onConvertPdfAll() {
    if (this.dataCompraResult.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Reporte", 110, 15);
      y = 20;
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 25));//left
      doc.line(290, y, 290, (y + 25));//right
      doc.line(5, (y + 25), 290, (y + 25));//down
      doc.setFontSize(13);
      doc.text("Parámetros de Búsqueda", 15, (y + 10));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número productos encontrados:" + this.listComprasIn.length, 10, (y + 15));
      if (this.filtroTablaCompra.filtroCompra != "")
        doc.text("Palabra Clave: " + this.filtroTablaCompra.filtroCompra, 10, (y + 20));

      y = y + 25;
      doc.setFontSize(9);
      doc.setFont("arial", "bold")
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      //total 11 columnas
      var colAux = 30;
      var colProveedor: number = 105;
      var colRazon: number = 50;
      var colDescripcion: number = 105;

      doc.text("#", 9, (y + 7));
      doc.line(14, y, 14, (y + 10));//right
      doc.text("Factura", 17, (y + 7));
      doc.line(30, y, 30, (y + 10));//right
      if (this.filtroTablaCompra.checkGuiaRemision) {
        doc.text("Guía", 34, (y + 7));
        doc.line(45, y, 45, (y + 10));//right
        colAux = 45;
        colProveedor = colProveedor - 10;
        colDescripcion = colDescripcion - 5;
      }
      doc.text("Fecha Registro", colAux + 2, (y + 7));
      doc.line(colAux + 25, y, colAux + 25, (y + 10));//right
      colAux = colAux + 25;
      if (this.filtroTablaCompra.checkFechaAutorizacion) {
        colProveedor = colProveedor - 15;
        colDescripcion = colDescripcion - 15;
      }
      if (this.filtroTablaCompra.checkRazonSocialCliente) {
        colProveedor = colProveedor - 25;
        colDescripcion = colDescripcion - 25;
      }
      if (this.filtroTablaCompra.checkSubLibre) {
        colProveedor = colProveedor - 5;
        colDescripcion = colDescripcion - 5;
        if (this.filtroTablaCompra.checkRazonSocialCliente)
          colRazon = colRazon - 5;
        else {
          colProveedor = colProveedor - 2.5;
          colDescripcion = colDescripcion - 2.5;
        }
      }
      if (this.filtroTablaCompra.checkTotalImpuesto) {
        colProveedor = colProveedor - 5;
        colDescripcion = colDescripcion - 5;
        if (this.filtroTablaCompra.checkRazonSocialCliente)
          colRazon = colRazon - 5;
        else {
          colProveedor = colProveedor - 2.5;
          colDescripcion = colDescripcion - 2.5;
        }
      }
      doc.text("Proveedor", colAux + 5, (y + 7));
      doc.line(colAux + colProveedor, y, colAux + colProveedor, (y + 10));//right
      colAux = colAux + colProveedor;
      if (this.filtroTablaCompra.checkFechaAutorizacion) {
        doc.text("Fecha Autorización", colAux + 2, (y + 7));
        doc.line(colAux + 30, y, colAux + 30, (y + 10));//right
        colAux = colAux + 30;
      }
      if (this.filtroTablaCompra.checkRazonSocialCliente) {
        doc.text("Razón Social", colAux + 5, (y + 7));
        doc.line(colAux + colRazon, y, colAux + colRazon, (y + 10));//right
        colAux = colAux + colRazon;
      }
      doc.text("Descripción", colAux + 5, (y + 7));
      doc.line(colAux + colDescripcion, y, colAux + colDescripcion, (y + 10));//right
      colAux = colAux + colDescripcion;
      if (this.filtroTablaCompra.checkSubLibre) {
        doc.text("SubTotal", colAux + 2, (y + 7));
        doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
        colAux = colAux + 15;
      }
      if (this.filtroTablaCompra.checkTotalImpuesto) {
        doc.text("Iva 12%", colAux + 2, (y + 7));
        doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
        colAux = colAux + 15;
      }
      doc.text("Total Compra", colAux + 2, (y + 7));


      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorG: number = 0;
      var valorProveedor: number = 0;
      var valorDescripcion: number = 0;
      var valorRazon: number = 0;

      var lineaDescripcionG;
      var lineaDescripcion;
      var lineaProveedor;
      var lineaRazon;
      var auxPrueba: number;
      var auxpalabra: string;


      for (var index = 0; index < this.listComprasIn.length; index++) {
        lineaProveedor = doc.splitTextToSize(this.listComprasIn[index].proveedor, (colProveedor - 5));
        if (this.filtroTablaCompra.checkRazonSocialCliente)
          lineaRazon = doc.splitTextToSize(this.listComprasIn[index].razonSocialCompra, (colRazon - 5));

        lineaDescripcionG = [];

        for (var i = 0; i < this.listComprasIn[index].listPcomprasO.length; i++) {
          auxpalabra = this.listComprasIn[index].listPcomprasO[i].cantidad + " " + this.listComprasIn[index].listPcomprasO[i].producto.nombre;

          lineaDescripcion = doc.splitTextToSize(auxpalabra, (colDescripcion - 5));
          for (var il = 0; il < lineaDescripcion.length; il++) {
            lineaDescripcionG.push(lineaDescripcion[il])
          }
        }
        valorProveedor = (3.5 * lineaProveedor.length) + 4;
        valorDescripcion = (3.5 * lineaDescripcionG.length) + 4;

        if (this.filtroTablaCompra.checkRazonSocialCliente)
          valorRazon = (3 * lineaRazon.length) + 4;

        if (valorProveedor >= valorDescripcion && valorProveedor >= valorRazon) {
          valorG = valorProveedor;
        }
        if (valorDescripcion >= valorProveedor && valorDescripcion >= valorRazon) {
          valorG = valorDescripcion;
        }
        if (valorRazon >= valorProveedor && valorRazon >= valorDescripcion) {
          valorG = valorRazon;
        }
        y = y + valorG;

        if (y > 200) {
          doc.text("Pág. #" + Npag, 280, 207);
          Npag++;
          doc.addPage();
          doc.text("Pág. #" + Npag, 280, 207);
          doc.setFontSize(9);
          doc.setFont("arial", "bold")
          y = 15;
          colAux=30;
          doc.line(5, (y), 290, (y));//up
          doc.line(5, y, 5, (y + 10));//left
          doc.line(290, y, 290, (y + 10));//right
          doc.line(5, (y + 10), 290, (y + 10));//down

          doc.text("#", 9, (y + 7));
          doc.line(14, y, 14, (y + 10));//right
          doc.text("Factura", 17, (y + 7));
          doc.line(30, y, 30, (y + 10));//right
          
          if (this.filtroTablaCompra.checkGuiaRemision) {
            doc.text("Guía", 34, (y + 7));
            doc.line(45, y, 45, (y + 10));//right
            colAux = 45;
          }
          doc.text("Fecha Registro", colAux + 2, (y + 7));
          doc.line(colAux + 25, y, colAux + 25, (y + 10));//right
          colAux = colAux + 25;
          doc.text("Proveedor", colAux + 5, (y + 7));
          doc.line(colAux + colProveedor, y, colAux + colProveedor, (y + 10));//right
          colAux = colAux + colProveedor;
          if (this.filtroTablaCompra.checkFechaAutorizacion) {
            doc.text("Fecha Autorización", colAux + 2, (y + 7));
            doc.line(colAux + 30, y, colAux + 30, (y + 10));//right
            colAux = colAux + 30;
          }
          if (this.filtroTablaCompra.checkRazonSocialCliente) {
            doc.text("Razón Social", colAux + 5, (y + 7));
            doc.line(colAux + colRazon, y, colAux + colRazon, (y + 10));//right
            colAux = colAux + colRazon;
          }
          doc.text("Descripción", colAux + 5, (y + 7));
          doc.line(colAux + colDescripcion, y, colAux + colDescripcion, (y + 10));//right
          colAux = colAux + colDescripcion;
          if (this.filtroTablaCompra.checkSubLibre) {
            doc.text("SubTotal", colAux + 2, (y + 7));
            doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
            colAux = colAux + 15;
          }
          if (this.filtroTablaCompra.checkTotalImpuesto) {
            doc.text("Iva 12%", colAux + 2, (y + 7));
            doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
            colAux = colAux + 15;
          }
          doc.text("Total Compra", colAux + 2, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2

        doc.text((index + 1).toString(), 9, (y - ((valorG - 3) / 2)));
        doc.line(14, (y - valorG), 14, y);//right
        doc.text(this.listComprasIn[index].factura.toString(), 17, (y - ((valorG - 3) / 2)));
        doc.line(30, (y - valorG), 30, y);//right
        colAux = 30;
        if (this.filtroTablaCompra.checkGuiaRemision) {
          if (this.listComprasIn[index].guiaRemision != 0)
            doc.text(this.listComprasIn[index].guiaRemision.toString(), 34, (y - ((valorG - 3) / 2)));
          else doc.text("---", 34, (y - ((valorG - 3) / 2)));
          doc.line(45, (y - valorG), 45, y);//right
          colAux = 45;
        }
        doc.text(this.listComprasIn[index].fechaRegistroBodega.toString(), colAux + 3, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 25, (y - valorG), colAux + 25, y);//right
        colAux = colAux + 25;
        auxPrueba = Number((valorG - (3 * lineaProveedor.length + (3 * (lineaProveedor.length - 1)))) / 2.5) + (2 + lineaProveedor.length);
        doc.text(lineaProveedor, colAux + 2, (y - valorG + auxPrueba));
        doc.line(colAux + colProveedor, (y - valorG), colAux + colProveedor, y);//right
        colAux = colAux + colProveedor;
        if (this.filtroTablaCompra.checkFechaAutorizacion) {
          doc.text(this.listComprasIn[index].fechaAutorizacion.toString(), colAux + 5, (y - ((valorG - 3) / 2)));
          doc.line(colAux + 30, (y - valorG), colAux + 30, y);//right
          colAux = colAux + 30;
        }
        if (this.filtroTablaCompra.checkRazonSocialCliente) {
          auxPrueba = Number((valorG - (3 * lineaRazon.length + (3 * (lineaRazon.length - 1)))) / 2.5) + (2 + lineaRazon.length);
          doc.text(lineaRazon, colAux + 2, (y - valorG + auxPrueba));
          doc.line(colAux + colRazon, (y - valorG), colAux + colRazon, y);//right
          colAux = colAux + colRazon;
        }
        auxPrueba = Number((valorG - (3 * lineaDescripcionG.length + (3 * (lineaDescripcionG.length - 1)))) / 2.5) + (2 + lineaDescripcionG.length);
        doc.text(lineaDescripcionG, colAux + 2, (y - valorG + auxPrueba));
        doc.line(colAux + colDescripcion, (y - valorG), colAux + colDescripcion, y);//right
        colAux = colAux + colDescripcion;
        if (this.filtroTablaCompra.checkSubLibre) {
          doc.text("$" + this.listComprasIn[index].subTotalLibre.toString(), colAux + 2, (y - ((valorG - 3) / 2)));
          doc.line(colAux + 15, (y - valorG), colAux + 15, y);//right
          colAux = colAux + 15;
        }
        if (this.filtroTablaCompra.checkTotalImpuesto) {
          doc.text("$" + this.listComprasIn[index].totalImpuestos.toString(), colAux + 2, (y - ((valorG - 3) / 2)));
          doc.line(colAux + 15, (y - valorG), colAux + 15, y);//right
          colAux = colAux + 15;
        }
        doc.text("$" + this.listComprasIn[index].totalOrden.toString(), colAux + 5, (y - ((valorG - 3) / 2)));
      }
      doc.line(5, y, 5, y+10);//left
      doc.line(290, y, 290, y+10);//right
      doc.line(5, y+10, 290, y+10);//down +10y1y2
      
      doc.setFontSize(9);
      doc.setFont("arial", "bold")
      doc.text("TOTAL COMPRAS:", 100, (y + 7));
      doc.text('$'+this.sumTotal.toString(), 130, (y + 7));
      doc.save("ReporteListaCompra.pdf");
    }
  }
}
