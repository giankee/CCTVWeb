import { Component, OnInit } from '@angular/core';
import { faPrint, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
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
  listBodega: cVario[] = [];
  selecBodegaFiltro: string = "SIN ASIGNAR";
  selecTipoFiltro: string = "Faltantes";
  listProductosIn: cProducto_B[] = [];
  fechaHoy = new cFecha();

  faprint = faPrint; fasearch = faSearch;
  constructor(private _productoBService: ProductoBService, private _variosService: VariosService,private _conexcionService: ConexionService) { }

  ngOnInit(): void {
    this.cargarBodega();
  }
  cargarBodega() {
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      dato.forEach(x => {
        if (x.categoria == "Puerto" && x.prioridadNivel == 1)
          this.listBodega.push(x);
      });
      if (this._conexcionService.UserR.rolAsignado == "verificador-medic")
        this.selecBodegaFiltro = this.listBodega.find(x => x.encargadoBodega == this.conexcionService.UserR.nombreU).nombre;
    });
  }

  onBuscarDiferencias() {
    if (this.selecBodegaFiltro != "SIN ASIGNAR") {
      this.spinnerOnOff = 1;
      this._productoBService.getProductosFaltantesMedic(this.selecBodegaFiltro + "@" + this.selecTipoFiltro)
        .subscribe(dato => {
          this.listProductosIn = [];
          this.listProductosIn = dato;
          this.spinnerOnOff = 2;
        },
          error => console.error(error));
    }
  }

  onConvertPdfAll() {
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

            y = y + 8;
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
          doc.text(this.listProductosIn[i].listBodegaProducto[0].disponibilidad.toString(), 220, (y - 3));
          doc.line(240, (y - 8), 240, y);//right
          if (this.selecTipoFiltro == "Faltantes")
            doc.text((this.listProductosIn[i].listBodegaProducto[0].cantMinima - this.listProductosIn[i].listBodegaProducto[0].disponibilidad).toString(), 260, (y - 3));
          else doc.text((this.listProductosIn[i].listBodegaProducto[0].disponibilidad - this.listProductosIn[i].listBodegaProducto[0].cantMinima).toString(), 260, (y - 3));
        }
      else {
        y=y+10;
        doc.line(5, (y - 10), 5, y);//left
        doc.line(290, (y - 10), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2
        doc.setFontSize(10);
        doc.setFont("arial", "italic");

        doc.text("No existen medicamentos " +this.selecTipoFiltro, 120 , (y - 4));
      }
      doc.save("ListaMedicamento_" + this.fechaHoy.strFecha + ".pdf");
    }
  }
}
