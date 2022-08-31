import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { faAngleDown, faAngleLeft, faEye, faEyeSlash, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cFiltroTablaProducto } from 'src/app/shared/otrosServices/varios';
import { KardexComponent } from '../../kardex/kardex.component';
import { jsPDF } from "jspdf";
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { SearchPipe } from 'src/app/pipes/search.pipe';

@Component({
  selector: 'app-reporte-producto',
  templateUrl: './reporte-producto.component.html',
  styles: [],
  providers: [SortPipe, SearchPipe]
})
export class ReporteProductoComponent implements OnInit {
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  @Input() listProductosIn: cProducto_B[];
  @Input() tipoR: string;

  filtroTablaProd: cFiltroTablaProducto = new cFiltroTablaProducto();
  dataProductosResult: cProducto_B[] = [];
  ordenBy: string = "default";
  paginacion = new cPaginacion(25);
  fechaHoy = new cFecha();

  /**Icon */
  sort = faSort; faeye = faEye; faprint = faPrint; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; fasearch = faSearch; faeyeslash = faEyeSlash
  constructor(private _conexcionService: ConexionService, private _productoBService: ProductoBService, private dialog: MatDialog, private ordenarPipe: SortPipe, private searchPipe: SearchPipe) { }

  ngOnInit(): void {
    this.paginacion.getNumberIndex(this.listProductosIn.length);
    this.paginacion.updateIndex(0);
  }


  onConvertPdfAll() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });
    var data: cProducto_B[] = [];

    if (this.filtroTablaProd.filtroProducto != "") {
      data = this.searchPipe.transform(this.dataProductosResult, this.filtroTablaProd.filtroProducto, 'cProductoB');
      data = data.slice(this.paginacion.startIndex, this.paginacion.endIndex);
    } else data = JSON.parse(JSON.stringify(this.dataProductosResult));

    if (this.ordenBy != "default") {
      data = this.ordenarPipe.transform(data, this.ordenBy, 'cProductoB');
      data = data.slice(this.paginacion.startIndex, this.paginacion.endIndex);
    } else data = JSON.parse(JSON.stringify(data.slice(this.paginacion.startIndex, this.paginacion.endIndex)));
    doc.setFontSize(18);
    doc.setFont("arial", "bold")
    doc.text("Lista de Productos Inventariados", 110, 15);
    y = 20;
    doc.line(5, y, 290, y);//up
    doc.line(5, y, 5, (y + 25));//left
    doc.line(290, y, 290, (y + 25));//right
    doc.line(5, (y + 25), 290, (y + 25));//down
    doc.setFontSize(13);
    doc.text("Parámetros de Búsqueda", 15, (y + 10));
    doc.setFont("arial", "normal");
    doc.setFontSize(11);
    doc.text("Número productos encontrados:" + data.length, 10, (y + 15));
    doc.text("Resultados a mostrar: " + data.length + "/" + this.paginacion.selectPagination, 80, (y + 15));
    doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 150, (y + 15));
    doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 220, (y + 15));
    if (this.filtroTablaProd.filtroProducto != "")
      doc.text("Palabra Clave: " + this.filtroTablaProd.filtroProducto, 10, (y + 20));
    y = y + 25;

    doc.setFontSize(10);
    doc.setFont("arial", "bold")
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down


    //total 10 columnas
    var colAux = 45;
    var colProveedor: number = 122.5;
    var colDescripcion: number = 122.5;

    doc.text("#", 9, (y + 7));
    doc.line(14, y, 14, (y + 10));//right
    doc.text("Código", 17, (y + 7));
    doc.line(45, y, 45, (y + 10));//right


    if (this.filtroTablaProd.checkCategoria) {
      colProveedor -= 12.5;
      colDescripcion -= 12.5;
    }
    if (this.filtroTablaProd.checkMarca) {
      colProveedor -= 15;
      colDescripcion -= 15;
    }
    if (this.filtroTablaProd.checkPrecio) {
      colProveedor -= 7.5;
      colDescripcion -= 7.5;
    }
    if (this.filtroTablaProd.checkBodega) {
      colProveedor -= 10;
      colDescripcion -= 10;
    }
    if (this.filtroTablaProd.checkExistencia) {
      colProveedor -= 10;
      colDescripcion -= 10;
    }
    if (this.filtroTablaProd.chechPerchaFila) {
      colProveedor -= 10;
      colDescripcion -= 10;
    }
    if (this.filtroTablaProd.CheckCasillero) {
      colProveedor -= 7.5;
      colDescripcion -= 7.5;
    }
    if (this.filtroTablaProd.CheckPalet) {
      colProveedor -= 7.5;
      colDescripcion -= 7.5;
    }

    doc.text("Descripción", colAux + 5, (y + 7));
    doc.line(colAux + colDescripcion, y, colAux + colDescripcion, (y + 10));//right
    colAux = colAux + colDescripcion;
    doc.text("Proveedor", colAux + 5, (y + 7));
    doc.line(colAux + colProveedor, y, colAux + colProveedor, (y + 10));//right
    colAux = colAux + colProveedor;
    if (this.filtroTablaProd.checkCategoria) {
      doc.text("Categoría", colAux + 2, (y + 7));
      doc.line(colAux + 25, y, colAux + 25, (y + 10));//right
      colAux = colAux + 25;
    }
    if (this.filtroTablaProd.checkMarca) {
      doc.text("Marca", colAux + 2, (y + 7));
      doc.line(colAux + 30, y, colAux + 30, (y + 10));//right
      colAux = colAux + 30;
    }
    if (this.filtroTablaProd.checkPrecio) {
      doc.text("Precio U.", colAux + 1, (y + 7));
      doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
      colAux = colAux + 15;
    }
    if (this.filtroTablaProd.checkBodega) {
      doc.text("Bodega", colAux + 2, (y + 7));
      doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
      colAux = colAux + 20;
    }
    if (this.filtroTablaProd.checkExistencia) {
      doc.text("Existencia", colAux + 0.5, (y + 7));
      doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
      colAux = colAux + 20;
    }
    if (this.filtroTablaProd.chechPerchaFila) {
      doc.text("Percha/Fila", colAux + 1, (y + 7));
      doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
      colAux = colAux + 20;
    }
    if (this.filtroTablaProd.CheckCasillero) {
      doc.text("Casillero", colAux + 1, (y + 7));
      doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
      colAux = colAux + 15;
    }
    if (this.filtroTablaProd.CheckPalet) {
      doc.text("Palet", colAux + 3, (y + 7));
      doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
      colAux = colAux + 15;
    }

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");

    var valorN: number = 0;
    var valorP: number = 0;
    var valorB: number = 0;
    var valorG: number = 0;
    var auxLinea: number;
    var lineaNombre;
    var lineaProveedor;
    var lineaBodegaG;
    for (var i = 0; i < data.length; i++) {
      var lineaStockG = [];
      var lineaPerchaG = [];
      var lineaCasilleroG = [];
      var lineaNumPaletG = [];
      lineaNombre = doc.splitTextToSize(data[i].nombre, (colDescripcion - 5));
      lineaProveedor = doc.splitTextToSize(data[i].proveedor, (colProveedor - 5));
      lineaBodegaG = [];

      for (var j = 0; j < data[i].listBodegaProducto.length; j++) {
        lineaBodegaG.push(data[i].listBodegaProducto[j].nombreBodega);
        lineaStockG.push(data[i].listBodegaProducto[j].disponibilidad.toString());
        lineaPerchaG.push("P:" + data[i].listBodegaProducto[j].percha + ", F:" + data[i].listBodegaProducto[j].fila);
        lineaCasilleroG.push(data[i].listBodegaProducto[j].numCasillero.toString());
        lineaNumPaletG.push(data[i].listBodegaProducto[j].numPalet.toString());
      }

      valorN = (3.5 * lineaNombre.length) + 4;
      valorP = (3.5 * lineaProveedor.length) + 4;
      valorB = (3.5 * lineaBodegaG.length) + 4;

      if (valorB >= valorP && valorB >= valorN) {
        valorG = valorB;
      }
      if (valorP >= valorB && valorP >= valorN) {
        valorG = valorP;
      }
      if (valorN >= valorB && valorN >= valorP) {
        valorG = valorN;
      }
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

        var colAux = 45;

        doc.text("#", 9, (y + 7));
        doc.line(14, y, 14, (y + 10));//right
        doc.text("Código", 17, (y + 7));
        doc.line(45, y, 45, (y + 10));//right
        doc.text("Descripción", colAux + 5, (y + 7));
        doc.line(colAux + colDescripcion, y, colAux + colDescripcion, (y + 10));//right
        colAux = colAux + colDescripcion;
        doc.text("Proveedor", colAux + 5, (y + 7));
        doc.line(colAux + colProveedor, y, colAux + colProveedor, (y + 10));//right
        colAux = colAux + colProveedor;
        if (this.filtroTablaProd.checkCategoria) {
          doc.text("Categoría", colAux + 2, (y + 7));
          doc.line(colAux + 25, y, colAux + 25, (y + 10));//right
          colAux = colAux + 25;
        }
        if (this.filtroTablaProd.checkMarca) {
          doc.text("Marca", colAux + 2, (y + 7));
          doc.line(colAux + 30, y, colAux + 30, (y + 10));//right
          colAux = colAux + 30;
        }
        if (this.filtroTablaProd.checkPrecio) {
          doc.text("Precio U.", colAux + 1, (y + 7));
          doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
          colAux = colAux + 15;
        }
        if (this.filtroTablaProd.checkBodega) {
          doc.text("Bodega", colAux + 2, (y + 7));
          doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
          colAux = colAux + 20;
        }
        if (this.filtroTablaProd.checkExistencia) {
          doc.text("Existencia", colAux + 0.5, (y + 7));
          doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
          colAux = colAux + 20;
        }
        if (this.filtroTablaProd.chechPerchaFila) {
          doc.text("Percha/Fila", colAux + 1, (y + 7));
          doc.line(colAux + 20, y, colAux + 20, (y + 10));//right
          colAux = colAux + 20;
        }
        if (this.filtroTablaProd.CheckCasillero) {
          doc.text("Casillero", colAux + 1, (y + 7));
          doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
          colAux = colAux + 15;
        }
        if (this.filtroTablaProd.CheckPalet) {
          doc.text("Palet", colAux + 3, (y + 7));
          doc.line(colAux + 15, y, colAux + 15, (y + 10));//right
          colAux = colAux + 15;
        }
        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }

      doc.line(5, (y - valorG), 5, y);//left
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down +10y1y2
      colAux = 45;
      doc.text((i + 1).toString(), 9, (y - ((valorG - 3) / 2)));
      doc.line(14, (y - valorG), 14, y);//right
      doc.text(data[i].codigo, 17, (y - ((valorG - 3) / 2)));
      doc.line(colAux, (y - valorG), colAux, y);//right

      auxLinea = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + (2 + lineaNombre.length);
      doc.text(lineaNombre, colAux + 2, (y - valorG + auxLinea));
      doc.line(colAux + colDescripcion, (y - valorG), colAux + colDescripcion, y);//right
      colAux += colDescripcion;
      auxLinea = Number((valorG - (3 * lineaProveedor.length + (3 * (lineaProveedor.length - 1)))) / 2.5) + (2 + lineaProveedor.length);
      doc.text(lineaProveedor, colAux + 2, (y - valorG + auxLinea));
      doc.line(colAux + colProveedor, (y - valorG), colAux + colProveedor, y);//right
      colAux += colProveedor;

      if (this.filtroTablaProd.checkCategoria) {
        doc.text(data[i].categoria, colAux + 2, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 25, (y - valorG), colAux + 25, y);//right
        colAux = colAux + 25;
      }
      if (this.filtroTablaProd.checkMarca) {
        doc.text(data[i].categoria, colAux + 2, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 30, (y - valorG), colAux + 30, y);//right
        colAux = colAux + 30;
      }
      if (this.filtroTablaProd.checkPrecio) {
        doc.text("$"+data[i].precioStandar.toString(), colAux + 5, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 15, (y - valorG), colAux + 15, y);//right
        colAux = colAux + 15;
      }
      if (this.filtroTablaProd.checkBodega) {
        doc.text(lineaBodegaG, colAux + 2, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 20, (y - valorG), colAux + 20, y);//right
        colAux = colAux + 20;
      }
      if (this.filtroTablaProd.checkExistencia) {
        doc.text(lineaStockG, colAux + 5, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 20, (y - valorG), colAux + 20, y);//right
        colAux = colAux + 20;
      }
      if (this.filtroTablaProd.chechPerchaFila) {
        doc.text(lineaPerchaG, colAux + 2, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 20, (y - valorG), colAux + 20, y);//right
        colAux = colAux + 20;
      }
      if (this.filtroTablaProd.CheckCasillero) {
        doc.text(lineaCasilleroG, colAux + 5, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 15, (y - valorG), colAux + 15, y);//right
        colAux = colAux + 15;
      }
      if (this.filtroTablaProd.CheckPalet) {
        doc.text(lineaNumPaletG, colAux + 5, (y - ((valorG - 3) / 2)));
        doc.line(colAux + 15, (y - valorG), colAux + 15, y);//right
        colAux = colAux + 15;
      }
    }
    doc.save("ListaProductos_" + this.fechaHoy.strFecha + ".pdf");
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listProductosIn.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenListBy(op: number) {// cambia el orden por medio de un pipe
    switch (op) {
      case 1:
        if (this.ordenBy == "n-up")
          this.ordenBy = "n-down";
        else this.ordenBy = "n-up";
        break;
      /* case 2:
        if (this.showSelect1 == 1) {
          if (this.ordenBy == "pv-up")
            this.ordenBy = "pv-down";
          else this.ordenBy = "pv-up";
        }
        if (this.showSelect1 == 2) {
          if (this.ordenBy == "ct-up")
            this.ordenBy = "ct-down";
          else this.ordenBy = "ct-up";

        };
        if (this.showSelect1 == 3) {
          if (this.ordenBy == "m-up")
            this.ordenBy = "m-down";
          else this.ordenBy = "m-up";
        };
        break; */
      default: this.ordenBy = "default";
    }
  }

  getDataFiltro(data: cProducto_B[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataProductosResult.length) {
      this.dataProductosResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataProductosResult.length);
    }
  }

  onModalKardex(dataIn: cProducto_B) {
    const auxId = dataIn.idProductoStock;
    this._productoBService.formData = dataIn;
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    dialoConfig.data = { auxId }
    this.dialog.open(KardexComponent, dialoConfig);
  }
}
