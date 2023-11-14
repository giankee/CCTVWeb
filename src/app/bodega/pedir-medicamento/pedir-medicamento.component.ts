import { Component, OnInit } from '@angular/core';
import { faPrint, faSearch } from '@fortawesome/free-solid-svg-icons';
import { cBodega, cJustificacionMedicina, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { jsPDF } from "jspdf";
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';

@Component({
  selector: 'app-pedir-medicamento',
  templateUrl: './pedir-medicamento.component.html',
  styles: [],
})
export class PedirMedicamentoComponent implements OnInit {
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
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }

  spinnerOnOff: number = 0;
  listBarcos: cBodega[] = [];
  selecBodegaFiltro: string = "SIN ASIGNAR";
  selecTipoFiltro: string = "Faltantes";
  listProductosIn: cProducto_B[] = [];
  dataProductosResult: cProducto_B[] = [];
  listJustificacion: cJustificacionMedicina[] = [];
  fechaHoy = new cFecha();

  faprint = faPrint; fasearch = faSearch;
  constructor(private _productoBService: ProductoBService, private _variosService: VariosService, private _conexcionService: ConexionService) {
    this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
      if (this.conexcionService.UserDataToken.role != "enfermeria")
        this.selecBodegaFiltro=dato.find(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name)).nombreBodega;
    });
  }

  ngOnInit(): void {
  }

  onBuscarDiferencias() {
    if (this.selecBodegaFiltro != "SIN ASIGNAR") {
      this.spinnerOnOff = 1;
      this._productoBService.getProductosFaltantesMedic(this.selecBodegaFiltro + "@" + this.selecTipoFiltro)
        .subscribe(dato => {
          this.listProductosIn = [];
          this.listProductosIn = dato;
          this.spinnerOnOff = 2;
          this.listJustificacion=[];
          dato.forEach(x => {
            var parametrosIn = this.selecBodegaFiltro + "@" + x.idProductoStock;
            this._productoBService.getProductosJustificacionMedic(parametrosIn)
              .subscribe((dato2: any) => {
                if (dato2.data != null){
                  this.listJustificacion.push(dato2.data);
                }
              },
                error => console.error(error));
          })
        },
          error => console.error(error));
    }
  }

  getDataFiltro(data: cProducto_B[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataProductosResult.length) {
      this.dataProductosResult = JSON.parse(JSON.stringify(data));
    }
  }

  onConvertPDFAll() {
    if (this.conexcionService.UserDataToken.role == "enfermeria") {
      if (this.listJustificacion.length != 0)
        this.onConvertPdfAllSuper();
      else this.onConvertPdfAllCliente();
    } else this.onConvertPdfAllCliente();
  }

  onConvertPdfAllCliente() {
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
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      doc.text("Index", 15, (y + 7));
      doc.line(35, y, 35, (y + 10));//right
      doc.text("Nombre", 75, (y + 7));
      doc.line(115, y, 115, (y + 10));//right
      doc.text("Tipo Unidad", 125, (y + 7));
      doc.line(155, y, 155, (y + 10));//right
      doc.text("Cant. Unitaria Mínima", 160, (y + 7));
      doc.line(200, y, 200, (y + 10));//right
      doc.text("Unidades Disponibles", 205, (y + 7));
      doc.line(240, y, 240, (y + 10));//right
      doc.text("Diferencia", 255, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");
      if (this.listProductosIn.length > 0)
        for (var i = 0; i < this.listProductosIn.length; i++) {

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
            doc.line(5, y, 5, (y + 10));//left
            doc.line(290, y, 290, (y + 10));//right
            doc.line(5, (y + 10), 290, (y + 10));//down

            doc.text("Index", 15, (y + 7));
            doc.line(35, y, 35, (y + 10));//right
            doc.text("Nombre", 75, (y + 7));
            doc.line(115, y, 115, (y + 10));//right
            doc.text("Tipo Unidad", 125, (y + 7));
            doc.line(155, y, 155, (y + 10));//right
            doc.text("Cant. Unitaria Mínima", 160, (y + 7));
            doc.line(200, y, 200, (y + 10));//right
            doc.text("Unidades Disponibles", 205, (y + 7));
            doc.line(240, y, 240, (y + 10));//right
            doc.text("Diferencia", 255, (y + 7));

            y = y + 18;
            doc.setFontSize(8);
            doc.setFont("arial", "normal");
          }

          doc.line(5, (y - 8), 5, y);//left
          doc.line(290, (y - 8), 290, y);//right
          doc.line(5, y, 290, y);//down +10y1y2
          doc.text((i + 1).toString(), 19, (y - 3));
          doc.line(35, (y - 8), 35, y);//right
          doc.text(this.listProductosIn[i].nombre, 40, (y - 3));
          doc.line(115, (y - 8), 115, y);//right
          doc.text(this.listProductosIn[i].tipoUnidad, 120, (y - 3));
          doc.line(155, (y - 8), 155, y);//right
          doc.text(this.listProductosIn[i].listBodegaProducto[0].cantMinima.toString(), 175, (y - 3));
          doc.line(200, (y - 8), 200, y);//right
          doc.text(this.listProductosIn[i].sumStock.toString(), 220, (y - 3));
          doc.line(240, (y - 8), 240, y);//right
          if (this.selecTipoFiltro == "Faltantes")
            doc.text((this.listProductosIn[i].listBodegaProducto[0].cantMinima - this.listProductosIn[i].sumStock).toString(), 260, (y - 3));
          else doc.text((this.listProductosIn[i].sumStock - this.listProductosIn[i].listBodegaProducto[0].cantMinima).toString(), 260, (y - 3));
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
      doc.save("ListaMedicamento_" + this.fechaHoy.strFecha + ".pdf");
    }
  }

  onConvertPdfAllSuper() {
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
      doc.line(105, y, 105, (y + 15));//right
      doc.text("Und Mínima", 108, (y + 10));
      doc.line(130, y, 130, (y + 15));//right
      doc.text("Und Disponibles", 133, (y + 10));
      doc.line(160, y, 160, (y + 15));//right
      doc.text(this.selecTipoFiltro=="Sobrantes"?"Sobrantes":"Requiere", 163, (y + 10));
      doc.line(180, y, 180, (y + 15));//right
      doc.text("Justificación", 225, (y + 5));
      doc.line(180, (y + 7), 290, (y + 7));//down

      doc.text("Compras", 192, (y + 10));
      doc.line(215, y + 7, 215, (y + 15));//right
      doc.line(180, (y + 11), 215, (y + 11));//down
      doc.text("Fecha", 185, (y + 14));
      doc.line(197.5, y + 11, 197.5, (y + 15));//right
      doc.text("Cantidad", 199, (y + 14));
      doc.text("Consumido", 217, (y + 12));
      doc.line(235, y + 7, 235, (y + 15));//right
      doc.text("Diferencia", 238, (y + 12));
      doc.line(255, y + 7, 255, (y + 15));//right
      doc.text("Caducado", 263, (y + 10));
      doc.line(255, (y + 11), 290, (y + 11));//down
      doc.text("Fecha", 260, (y + 14));
      doc.line(272.5, y + 11, 272.5, (y + 15));//right
      doc.text("Cantidad", 274, (y + 14));

      y = y + 15;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");
      if (this.listProductosIn.length > 0) {
        var datoJustificado:cJustificacionMedicina;
        for (var i = 0; i < this.listProductosIn.length; i++) {
          datoJustificado= this.listJustificacion.find(x=>x.inventarioId==this.listProductosIn[i].idProductoStock);
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
            doc.line(105, y, 105, (y + 15));//right
            doc.text("Und Mínima", 108, (y + 10));
            doc.line(130, y, 130, (y + 15));//right
            doc.text("Und Disponibles", 133, (y + 10));
            doc.line(160, y, 160, (y + 15));//right
            doc.text("Requiere", 163, (y + 10));
            doc.line(180, y, 180, (y + 15));//right
            doc.text("Justificación", 225, (y + 5));
            doc.line(180, (y + 7), 290, (y + 7));//down

            doc.text("Compras", 192, (y + 10));
            doc.line(215, y + 7, 215, (y + 15));//right
            doc.line(180, (y + 11), 215, (y + 11));//down
            doc.text("Fecha", 185, (y + 14));
            doc.line(197.5, y + 11, 197.5, (y + 15));//right
            doc.text("Cantidad", 199, (y + 14));
            doc.text("Consumido", 217, (y + 12));
            doc.line(235, y + 7, 235, (y + 15));//right
            doc.text("Diferencia", 238, (y + 12));
            doc.line(255, y + 7, 255, (y + 15));//right
            doc.text("Caducado", 263, (y + 10));
            doc.line(255, (y + 11), 290, (y + 11));//down
            doc.text("Fecha", 260, (y + 14));
            doc.line(272.5, y + 11, 272.5, (y + 15));//right
            doc.text("Cantidad", 274, (y + 14));

            y = 38;
            doc.setFontSize(8);
            doc.setFont("arial", "normal");
          }
          doc.line(5, (y - 8), 5, y);//left
          doc.line(290, (y - 8), 290, y);//right
          doc.line(5, y, 290, y);//down +10y1y2
          doc.text((i + 1).toString(), 11, (y - 3));
          doc.line(20, (y - 8), 20, y);//right
          doc.text(this.listProductosIn[i].nombre, 23, (y - 3));
          doc.line(105, (y - 8), 105, y);//right
          doc.text(this.listProductosIn[i].listBodegaProducto[0].cantMinima.toString(), 115, (y - 3));
          doc.line(130, (y - 8), 130, y);//right
          doc.text(this.listProductosIn[i].sumStock.toString(), 143, (y - 3));
          doc.line(160, (y - 8), 160, y);//right
          if (this.selecTipoFiltro == "Faltantes")
            doc.text((this.listProductosIn[i].listBodegaProducto[0].cantMinima - this.listProductosIn[i].sumStock).toString(), 169, (y - 3));
          else doc.text((this.listProductosIn[i].sumStock - this.listProductosIn[i].listBodegaProducto[0].cantMinima).toString(), 169, (y - 3));
          doc.line(180, (y - 8), 180, y);//right


          if(datoJustificado.isCompras){
            let auxFecha=datoJustificado.compras.fecha.split('T');
          doc.text(auxFecha[0], 182, (y - 3));
          doc.line(197.5, y-8, 197.5,y);//right
          doc.text(datoJustificado.compras.cantidad.toString(), 205, (y - 3));
          }else  doc.text("Sin Registros", 190, (y - 3));
          doc.line(215, (y - 8), 215, y);//right
          if(datoJustificado.cantConsumido!=0)
          doc.text(datoJustificado.cantConsumido.toString(), 225, (y - 3));
          else doc.text("---", 225, (y - 3));
          doc.line(235, (y - 8), 235, y);//right
          doc.text(datoJustificado.cantDiferencia.toString(), 245, (y - 3));
  
          doc.line(255, (y - 8), 255, y);//right
          if(datoJustificado.isCaducado){
            let auxFecha=datoJustificado.caducado.fecha.split('T');
          doc.text(auxFecha[0], 257, (y - 3));
          doc.line(272.5, y-8, 272.5,y);//right
          doc.text(datoJustificado.caducado.cantidad.toString(), 280, (y - 3));
          }else  doc.text("Sin Registros", 265, (y - 3));
          
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
      doc.save("ListaMedicamento_" + this.fechaHoy.strFecha + ".pdf");
    }
  }
}
