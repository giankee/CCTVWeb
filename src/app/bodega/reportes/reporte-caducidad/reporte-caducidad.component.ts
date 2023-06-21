import { Component, OnInit } from '@angular/core';
import { faPrint, faSearch } from '@fortawesome/free-solid-svg-icons';
import { cBodega, cJustificacionMedicina } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-reporte-caducidad',
  templateUrl: './reporte-caducidad.component.html',
  styles: [],
})
export class ReporteCaducidadComponent implements OnInit {

  spinnerOnOff: number = 0;
  listBarcos: cBodega[] = [];
  selecBodegaFiltro: string = "SIN ASIGNAR";
  selecTipoFiltro: string = "Caducado";
  listJustificacion: cJustificacionMedicina[] = [];

  faprint = faPrint; fasearch = faSearch;
  constructor(private productoBService: ProductoBService, private variosService: VariosService) {
    this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
    });
  }

  ngOnInit(): void {
  }

  onBuscarCaducidad() {
    if (this.selecBodegaFiltro != "SIN ASIGNAR") {
      this.spinnerOnOff = 1;
      this.productoBService.getProductosCaducadosMedic(this.selecBodegaFiltro + "@" + this.selecTipoFiltro)
        .subscribe((dato: any) => {
          this.spinnerOnOff = 2;
          this.listJustificacion = [];
          if (dato.message == "Ok"){
            this.listJustificacion = dato.data;
            this.listJustificacion.forEach(x=>{
              if(x.isCaducado){
                x.caducado.fecha=x.caducado.fecha.substr(0,7 );
              }
            })
          }
            
        },
          error => console.error(error));
    }
  }

  onConvertPDFAll() {
    if (this.selecBodegaFiltro != "SIN ASIGNAR" && this.spinnerOnOff == 2) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      doc.setFontSize(18);
      doc.setFont("arial", "bold")
      doc.text("Lista de Medicamentos " + this.selecTipoFiltro + " del " + this.selecBodegaFiltro, 75, 15);
      y = 25;

      doc.setFontSize(10);
      doc.setFont("arial", "bold")
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 15));//left
      doc.line(290, y, 290, (y + 15));//right
      doc.line(5, (y + 15), 290, (y + 15));//down

      doc.text("Index", 7, (y + 10));
      doc.line(20, y, 20, (y + 15));//right
      doc.text("Nombre", 55, (y + 10));
      doc.line(110, y, 110, (y + 15));//right
      
      doc.text(this.selecTipoFiltro=="Caducar"?"Por "+ this.selecTipoFiltro: this.selecTipoFiltro, 130, (y + 5));
      doc.line(110, (y + 7), 200, (y + 7));//down
      doc.line(200, y, 200, (y + 15));//right
      doc.text("Última Compra", 220, (y + 5));
      doc.line(200, (y + 7), 290, (y + 7));//down

      doc.text("Lote", 120, (y + 12));
      doc.line(140, y + 7, 140, (y + 15));//right
      doc.text("Cantidad", 150, (y + 12));
      doc.line(170, y + 7, 170, (y + 15));//right
      doc.text("Fecha", 180, (y + 12));
      
      doc.text("Marea", 210, (y + 12));
      doc.line(230, y + 7, 230, (y + 15));//right
      doc.text("Cantidad", 240, (y + 12));
      doc.line(260, y + 7, 260, (y + 15));//right
      doc.text("Fecha", 270, (y + 12));

      y = y + 15;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");
      if (this.listJustificacion.length > 0) {
        for (var i = 0; i < this.listJustificacion.length; i++) {
          y = y + 8;
          if (y > 200) {
            doc.text("Pág. #" + Npag, 280, 207);
            Npag++;
            doc.addPage();
            doc.text("Pág. #" + Npag, 280, 207);
            doc.setFontSize(10);
            doc.setFont("arial", "bold")
            y = 15;
            doc.line(5, (y), 290, (y));//up
            doc.line(5, y, 5, (y + 15));//left
            doc.line(290, y, 290, (y + 15));//right
            doc.line(5, (y + 15), 290, (y + 15));//down

            doc.text("Index", 7, (y + 10));
            doc.line(20, y, 20, (y + 15));//right
            doc.text("Nombre", 55, (y + 10));
            doc.line(110, y, 110, (y + 15));//right
            
            doc.text(this.selecTipoFiltro, 130, (y + 5));
            doc.line(110, (y + 7), 200, (y + 7));//down
            doc.line(200, y, 200, (y + 15));//right
            doc.text("Última Compra", 220, (y + 5));
            doc.line(200, (y + 7), 290, (y + 7));//down
      
            doc.text("Lote", 120, (y + 12));
            doc.line(140, y + 7, 140, (y + 15));//right
            doc.text("Cantidad", 150, (y + 12));
            doc.line(170, y + 7, 170, (y + 15));//right
            doc.text("Fecha", 180, (y + 12));
            
            doc.text("Marea", 210, (y + 12));
            doc.line(230, y + 7, 230, (y + 15));//right
            doc.text("Cantidad", 240, (y + 12));
            doc.line(260, y + 7, 260, (y + 15));//right
            doc.text("Fecha", 270, (y + 12));

            y = 38;
            doc.setFontSize(8);
            doc.setFont("arial", "normal");
          }
          doc.line(5, (y - 8), 5, y);//left
          doc.line(290, (y - 8), 290, y);//right
          doc.line(5, y, 290, y);//down +10y1y2
          doc.text((i + 1).toString(), 11, (y - 3));
          doc.line(20, (y - 8), 20, y);//right
          doc.text(this.listJustificacion[i].inventarioNombre, 23, (y - 3));
          doc.line(110, (y - 8), 110, y);//right
         
          doc.text(this.listJustificacion[i].caducado.marea, 115, (y - 3));
          doc.line(140, (y - 8), 140, y);//right
          doc.text(this.listJustificacion[i].caducado.cantidad.toString(), 155, (y - 3));
          doc.line(170, (y - 8), 170, y);//right
          doc.text(this.listJustificacion[i].caducado.fecha.substring(0, 10), 180, (y - 3));
          doc.line(200, (y - 8), 200, y);//right

          if(this.listJustificacion[i].isCompras){
            doc.text(this.listJustificacion[i].compras.marea, 210, (y - 3));
            doc.line(230, (y - 8), 230, y);//right
            doc.text(this.listJustificacion[i].compras.cantidad.toString(), 245, (y - 3));
            doc.line(260, (y - 8), 260, y);//right
            doc.text(this.listJustificacion[i].compras.fecha.substring(0, 10), 270, (y - 3));
          }else doc.text("No Hay Compras", 235, (y - 3));
        }
      }
      else {
        y = y + 10;
        doc.line(5, (y - 10), 5, y);//left
        doc.line(290, (y - 10), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.setFontSize(10);
        doc.setFont("arial", "italic");

        doc.text("No existen medicamentos " + this.selecTipoFiltro, 120, (y - 4));
      }
      doc.save("ListaMedicamento_" + this.selecTipoFiltro +"_"+this.selecBodegaFiltro+ ".pdf");
    }
  }
}
