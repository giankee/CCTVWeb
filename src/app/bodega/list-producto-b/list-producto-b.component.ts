import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch, faPrint, faPlus, faAngleDown, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { jsPDF } from "jspdf";
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { SearchPipe } from 'src/app/pipes/search.pipe';
import Swal from 'sweetalert2';
import { KardexComponent } from '../kardex/kardex.component';
import * as XLSX from 'xlsx';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { CargarXLSXComponent } from '../cargar-xlsx/cargar-xlsx.component';


@Component({
  selector: 'app-list-producto-b',
  templateUrl: './list-producto-b.component.html',
  styles: [],
  providers: [SortPipe, SearchPipe]
})
export class ListProductoBComponent implements OnInit {
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
  public get showSelect1(): number {
    return this._showSelect1;
  }
  public set showSelect1(value: number) {
    this._showSelect1 = value;
  }

  internetStatus: string = 'nline';
  filtroProducto = '';
  listProductosIn: cProducto_B[] = [];

  listProveedores: string[] = [];
  listCategorias: string[] = [];
  listMarcas: string[] = [];
  nuevoCategoria: string = "";
  nuevoProveedor: string = "";
  nuevoMarca: string = "";
  listBodega: cVario[] = [];

  paginacion = new cPaginacion(25);
  ordenBy: string = "default";
  autoFocus: boolean = false;
  modoEdicion: boolean = false;
  fechaHoy = new cFecha();
  private _showSelect1: number = 1;
  selectBodegaAux: string = "SIN ASIGNAR";
  selecBodegaFiltro: string = "SIN ASIGNAR";
  dataProductosResult: cProducto_B[] = [];

  /**Excel */
  flagExcel: boolean;
  arrayBuffer: ArrayBuffer | string;
  listProdFiltradosExcel: cProducto_B[] = [];

  /**Icon */
  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faprint = faPrint;
  faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch; faplus = faPlus;
  faangledown = faAngleDown; faangleleft = faAngleLeft;

  constructor(private _conexcionService: ConexionService, private _productoBService: ProductoBService, private toastr: ToastrService, private ordenarPipe: SortPipe, private searchPipe: SearchPipe, private dialog: MatDialog, private _variosService: VariosService) {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
  }

  ngOnInit(): void {
    this.cargarData();
    this.resetForm();
    this.cargarBodega();
    this.fechaHoy;
  }

  cargarData() {//Datos de los productos traidos desde db
    this.listProductosIn = [];
    var strParametro = "P MANACRIPEX";
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      strParametro = "OFICINAS";
    this._productoBService.getProductosPlanta(strParametro)
      .subscribe(dato => {
        for (var i = 0; i < dato.length; i++) {
          this.listProductosIn.push(dato[i]);
          if (this.listProveedores.find(x => x == dato[i].proveedor) == undefined)
            this.listProveedores.push(dato[i].proveedor);
          if (this.listCategorias.find(x => x == dato[i].categoria) == undefined)
            this.listCategorias.push(dato[i].categoria);
          if (this.listMarcas.find(x => x == dato[i].marca) == undefined)
            this.listMarcas.push(dato[i].marca);
        }
        if (this._conexcionService.UserR.rolAsignado == 'bodega_verificador-m')
          this.listProductosIn = this.listProductosIn.filter(x => {
            if (x.listBodegaProducto.find(y => y.nombreBodega == "GENERAL") != undefined) {
              x.listBodegaProducto = x.listBodegaProducto.filter(y => y.nombreBodega == "GENERAL");
              return x;
            }
          });
        this.paginacion.getNumberIndex(this.listProductosIn.length);
        this.paginacion.updateIndex(0);
      },
        error => console.error(error));
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.listBodega = dato;
    });
  }

  resetForm() {//Para que los valores en el html esten vacios
    this.selectBodegaAux = "SIN ASIGNAR";
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      this._productoBService.formData = new cProducto_B("OFICINAS");
    else {
      if (this._conexcionService.UserR.rolAsignado == "bodega_verificador-m") {
        this._productoBService.formData = new cProducto_B("P MANACRIPEX");
        this.selectBodegaAux = "GENERAL";
        this.onNewBodega();
      } else this._productoBService.formData = new cProducto_B("P MANACRIPEX");
    }
    this.nuevoCategoria = "";
    this.nuevoProveedor = "";
    this.nuevoMarca = "";
    this.modoEdicion = false;
  }

  onNewBodega() {
    if (this.selectBodegaAux != "SIN ASIGNAR") {
      if (this._productoBService.formData.listBodegaProducto.find(x => x.nombreBodega == this.selectBodegaAux) == undefined)
        this._productoBService.formData.agregarOneBodega(null, this.selectBodegaAux);
    }
  }

  onMostrarBodega(index: number) {
    for (var i = 0; i < this._productoBService.formData.listBodegaProducto.length; i++) {
      if (i == index)
        this._productoBService.formData.listBodegaProducto[i].ocultarObj = !this._productoBService.formData.listBodegaProducto[i].ocultarObj;
      else this._productoBService.formData.listBodegaProducto[i].ocultarObj = true;
    }
  }

  onCompletarForm(listOne: cProducto_B, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this._productoBService.formData.rellenarObjeto(listOne);
      this.modoEdicion = true;
    }
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
      case 2:
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
        break;
      default: this.ordenBy = "default";
    }
  }

  getDataFiltro(data: cProducto_B[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataProductosResult.length) {
      this.dataProductosResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataProductosResult.length);
    }
  }

  onSubmit(form: NgForm) {
    this.autoFocus = false;
    if (this._productoBService.formData.proveedor == "-1NEW")
      this._productoBService.formData.proveedor = this.nuevoProveedor;
    if (this._productoBService.formData.categoria == "-1NEW")
      this._productoBService.formData.categoria = this.nuevoCategoria;
    if (this._productoBService.formData.marca == "-1NEW")
      this._productoBService.formData.marca = this.nuevoMarca;
    if (this.modoEdicion) {
      this._productoBService.actualizarProducto(this._productoBService.formData).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Edición satisfactoria', 'Producto');
            this.listProductosIn[this.listProductosIn.findIndex(x => x.idProductoStock == this.productoBService.formData.idProductoStock)] = JSON.parse(JSON.stringify(this._productoBService.formData));
            if (this.nuevoCategoria != "")
              this.listCategorias.push(this.nuevoCategoria);
            if (this.nuevoMarca != "")
              this.listMarcas.push(this.nuevoMarca);
            this.resetForm();
          }
          if (res.message == "Delate") {
            this.toastr.success('Eliminación csatisfactoria', 'Producto');
            this.listProductosIn.splice(this.listProductosIn.findIndex(x => x.idProductoStock == this.productoBService.formData.idProductoStock), 1);
            this.resetForm();
          }
          if (res.message == "DuplicateCode") {
            this.toastr.error('Código Duplicado, revisar!', 'Producto');
            this._productoBService.formData.codigo = undefined;
            window.setTimeout(function () {
              document.getElementById('idCodigo').focus();
            }, 0);
          }
          if (res.message == "DuplicateName") {
            this.toastr.error('Nombre Duplicado, revisar!', 'Producto');
            this._productoBService.formData.nombre = undefined;
            window.setTimeout(function () {
              document.getElementById('idNombre').focus();
            }, 0);
          }
        },
        err => {
          console.log(err);
        }
      )
    }
    else {
      this._productoBService.insertarProducto(this._productoBService.formData).subscribe(
        (res: any) => {
          if (res.message == "DuplicateCode") {
            this.toastr.error('Código esta duplicado', 'Registro fallido.');
            this._productoBService.formData.codigo = null;
            this.autoFocus = true;
          } else {
            this.toastr.success('Ingreso satisfactorio', 'Producto Registrado');
            this.listProductosIn.push(res);
            if (this.nuevoProveedor != "")
              this.listProveedores.push(this.nuevoProveedor);
            if (this.nuevoCategoria != "")
              this.listCategorias.push(this.nuevoCategoria);
            if (this.nuevoMarca != "")
              this.listMarcas.push(this.nuevoMarca);
            this.resetForm();
            this.ordenBy = "default";
            this.paginacion.getNumberIndex(this.listProductosIn.length);
            this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
          }
        }
      )
    }
  }

  onDelate(form?: NgForm) {
    this._productoBService.formData.estado = 0;
    this.onSubmit(form);
  }

  onModalKardex(dataIn: cProducto_B) {
    const auxId = dataIn.idProductoStock;
    if (this.internetStatus == "nline") {
      this.onCompletarForm(dataIn);
      const dialoConfig = new MatDialogConfig();
      dialoConfig.autoFocus = true;
      dialoConfig.disableClose = true;
      dialoConfig.height = "85%";
      dialoConfig.width = "90%";
      dialoConfig.data = { auxId }
      this.dialog.open(KardexComponent, dialoConfig);
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

  onComprobarFocus(op: number) {
    var strFocus = "nada";
    if (op == 1)
      if (this._productoBService.formData.proveedor == "-1NEW")
        strFocus = "nProveedor";
    if (op == 2)
      if (this._productoBService.formData.categoria == "-1NEW")
        strFocus = "nCategoria";
    if (op == 3)
      if (this._productoBService.formData.marca == "-1NEW")
        strFocus = "nMarca";
    if (strFocus != "nada") {
      window.setTimeout(function () {
        document.getElementById(strFocus).focus();
      }, 0);
    }
  }
  //tengoq editar
  onConvertPdfAll() {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });
    var data: cProducto_B[] = [];

    if (this.filtroProducto != "") {
      data = this.searchPipe.transform(this.dataProductosResult, this.filtroProducto, 'cProductoB');
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
    if (this.filtroProducto != "")
      doc.text("Palabra Clave: " + this.filtroProducto, 10, (y + 20));
    y = y + 25;

    doc.setFontSize(10);
    doc.setFont("arial", "bold")
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    if (this.conexcionService.UserR.rolAsignado == "gpv-o") {
      doc.text("Código", 15, (y + 7));
      doc.line(40, y, 40, (y + 10));//right
      doc.text("Descripción", 60, (y + 7));
      doc.line(125, y, 125, (y + 10));//right
      doc.text("Proveedor", 140, (y + 7));
      doc.line(200, y, 200, (y + 10));//right
      doc.text("Marca", 215, (y + 7));
      doc.line(245, y, 245, (y + 10));//right
      doc.text("Stock", 260, (y + 7));
    } else {
      doc.text("Código", 15, (y + 7));
      doc.line(35, y, 35, (y + 10));//right
      doc.text("Descripción", 60, (y + 7));
      doc.line(100, y, 100, (y + 10));//right
      doc.text("Proveedor", 125, (y + 7));
      doc.line(165, y, 165, (y + 10));//right
      doc.text("Marca", 175, (y + 7));
      doc.line(200, y, 200, (y + 10));//right
      doc.text("Stock / Ubicacion", 220, (y + 7));
      doc.line(270, y, 270, (y + 10));//right
      doc.text("Inventario", 273, (y + 7));
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
    var lineaBodegaG;
    var lineaProveedor;
    for (var i = 0; i < data.length; i++) {
      if (this.conexcionService.UserR.rolAsignado == "gpv-o") {
        lineaNombre = doc.splitTextToSize(data[i].nombre, (80));
        lineaProveedor = doc.splitTextToSize(data[i].proveedor, (65));
      } else {
        lineaNombre = doc.splitTextToSize(data[i].nombre, (55));
        lineaProveedor = doc.splitTextToSize(data[i].proveedor, (55));
      }

      lineaBodegaG = [];
      for (var j = 0; j < data[i].listBodegaProducto.length; j++) {
        var lineaBodega;
        var auxpalabra = data[i].listBodegaProducto[j].nombreBodega + ":" + data[i].listBodegaProducto[j].disponibilidad;
        if (this.conexcionService.UserR.rolAsignado != "gpv-o") {
          if (data[i].listBodegaProducto[j].percha != 0)
            auxpalabra = auxpalabra + ", Percha:" + data[i].listBodegaProducto[j].percha;
          if (data[i].listBodegaProducto[j].fila != 0)
            auxpalabra = auxpalabra + ", Fila:" + data[i].listBodegaProducto[j].fila;
          if (data[i].listBodegaProducto[j].percha != 0)
            auxpalabra = auxpalabra + ", NumCasilla:" + data[i].listBodegaProducto[j].numCasillero;
          lineaBodega = doc.splitTextToSize(auxpalabra, (65));
        } else lineaBodega = doc.splitTextToSize(auxpalabra, (30));
        for (var il = 0; il < lineaBodega.length; il++) {
          lineaBodegaG.push(lineaBodega[il]);
        }
      }

      valorN = (3.5 * lineaNombre.length) + 4;
      valorP = (3.5 * lineaProveedor.length) + 4;
      valorB = (4 * lineaBodega.length) + 5;

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

      if (y > 205) {
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

        if (this.conexcionService.UserR.rolAsignado == "gpv-o") {
          doc.text("Código", 15, (y + 7));
          doc.line(40, y, 40, (y + 10));//right
          doc.text("Descripción", 60, (y + 7));
          doc.line(125, y, 125, (y + 10));//right
          doc.text("Proveedor", 140, (y + 7));
          doc.line(200, y, 200, (y + 10));//right
          doc.text("Marca", 215, (y + 7));
          doc.line(245, y, 245, (y + 10));//right
          doc.text("Stock", 260, (y + 7));
        } else {
          doc.text("Código", 15, (y + 7));
          doc.line(35, y, 35, (y + 10));//right
          doc.text("Descripción", 60, (y + 7));
          doc.line(100, y, 100, (y + 10));//right
          doc.text("Proveedor", 125, (y + 7));
          doc.line(165, y, 165, (y + 10));//right
          doc.text("Marca", 175, (y + 7));
          doc.line(200, y, 200, (y + 10));//right
          doc.text("Stock / Ubicación", 220, (y + 7));
          doc.line(270, y, 270, (y + 10));//right
          doc.text("Inventario", 272, (y + 7));
        }
        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(5, (y - valorG), 5, y);//left
      doc.line(290, (y - valorG), 290, y);//right
      doc.line(5, y, 290, y);//down +10y1y2


      if (this.conexcionService.UserR.rolAsignado == "gpv-o") {
        doc.text(data[i].codigo, 10, (y - ((valorG - 3) / 2)));
        doc.line(40, (y - valorG), 40, y);//right
        auxLinea = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + (2 + lineaNombre.length);
        doc.text(lineaNombre, 45, (y - valorG + auxLinea));
        doc.line(125, (y - valorG), 125, y);//right
        auxLinea = Number((valorG - (3 * lineaProveedor.length + (3 * (lineaProveedor.length - 1)))) / 2.5) + (2 + lineaProveedor.length);
        doc.text(lineaProveedor, 130, (y - valorG + auxLinea));
        doc.line(200, (y - valorG), 200, y);//right
        doc.text(data[i].marca, 205, (y - ((valorG - 3) / 2)));
        doc.line(245, (y - valorG), 245, y);//right
        auxLinea = Number((valorG - (3 * lineaBodegaG.length + (3 * (lineaBodegaG.length - 1)))) / 2.5) + (2 + lineaBodegaG.length);
        doc.text(lineaBodegaG, 250, (y - valorG + auxLinea));
      } else {
        doc.text(data[i].codigo, 10, (y - ((valorG - 3) / 2)));
        doc.line(35, (y - valorG), 35, y);//right
        auxLinea = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + (2 + lineaNombre.length);
        doc.text(lineaNombre, 40, (y - valorG + auxLinea));
        doc.line(100, (y - valorG), 100, y);//right
        auxLinea = Number((valorG - (3 * lineaProveedor.length + (3 * (lineaProveedor.length - 1)))) / 2.5) + (2 + lineaProveedor.length);
        doc.text(lineaProveedor, 105, (y - valorG + auxLinea));
        doc.line(165, (y - valorG), 165, y);//right
        doc.text(data[i].marca, 170, (y - ((valorG - 3) / 2)));
        doc.line(200, (y - valorG), 200, y);//right
        auxLinea = Number((valorG - (3 * lineaBodegaG.length + (3 * (lineaBodegaG.length - 1)))) / 2.5) + (2 + lineaBodegaG.length);
        doc.text(lineaBodegaG, 203, (y - valorG + auxLinea));
        doc.line(270, (y - valorG), 270, y);//right

      }
    }
    doc.save("ListaProductos_" + this.fechaHoy.strFecha + ".pdf");
  }

  onExcelUpload(file: File) {
    this.flagExcel = false;
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      let binaryData = fileReader.result;
      var workbook = XLSX.read(binaryData, { type: "binary" });
      workbook.SheetNames.forEach(sheet => {
        this.filtrarProductosXML(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
      });
    }
    fileReader.readAsBinaryString(file[0]); fileReader.onloadend = (e) => {
      this.flagExcel = true;
      this.onModalXML(this.listProdFiltradosExcel);
    }
  }

  filtrarProductosXML(dataIn) {
    this.listProdFiltradosExcel = [];
    const validadorExpresion = /.*\S.*/;
    var auxProducto: cProducto_B;
    var index;
    for (var i = 0; i < dataIn.length; i++) {
      if (dataIn[i].Codigo && dataIn[i].Descripcion && dataIn[i].Bodega && dataIn[i].Proveedor && dataIn[i].Precio_U != null && dataIn[i].Stock != null) {
        if (dataIn[i].Codigo.toString().match(validadorExpresion) && dataIn[i].Descripcion.toString().match(validadorExpresion)) {
          index = -1;
          if ((index = this.listProdFiltradosExcel.findIndex(x => x.codigo == dataIn[i].Codigo.toString().toUpperCase() && x.proveedor == dataIn[i].Proveedor.toUpperCase())) == -1) {
            auxProducto = new cProducto_B("P MANACRIPEX", dataIn[i].Proveedor.toUpperCase());
            auxProducto.codigo = dataIn[i].Codigo.toString().toUpperCase();
            auxProducto.nombre = dataIn[i].Descripcion.toString().toUpperCase();
            auxProducto.precioStandar = dataIn[i].Precio_U;
            if (dataIn[i].Unidad != null)
              auxProducto.tipoUnidad = dataIn[i].Unidad.toString();
            auxProducto.agregarOneBodega(null, dataIn[i].Bodega.toUpperCase());
            auxProducto.listBodegaProducto[0].cantInicial = dataIn[i].Stock;
            auxProducto.listBodegaProducto[0].disponibilidad = dataIn[i].Stock;
            if (dataIn[i].NumCasillero != undefined)
              auxProducto.listBodegaProducto[0].numCasillero = dataIn[i].NumCasillero;
            if (dataIn[i].Percha != undefined)
              auxProducto.listBodegaProducto[0].percha = dataIn[i].Percha;
            if (dataIn[i].Fila != undefined)
              auxProducto.listBodegaProducto[0].fila = dataIn[i].Fila;
            this.listProdFiltradosExcel.push(auxProducto);
          } else {
            if (this.listProdFiltradosExcel[index].listBodegaProducto.find(x => x.nombreBodega == dataIn[i].Bodega.toUpperCase()) == undefined) {
              this.listProdFiltradosExcel[index].agregarOneBodega(null, dataIn[i].Bodega.toUpperCase());
              this.listProdFiltradosExcel[index].listBodegaProducto[this.listProdFiltradosExcel[index].listBodegaProducto.length - 1].cantInicial = dataIn[i].Stock;
              this.listProdFiltradosExcel[index].listBodegaProducto[this.listProdFiltradosExcel[index].listBodegaProducto.length - 1].disponibilidad = dataIn[i].Stock;
              if (dataIn[i].NumCasillero != undefined)
                this.listProdFiltradosExcel[index].listBodegaProducto[this.listProdFiltradosExcel[index].listBodegaProducto.length - 1].numCasillero = dataIn[i].NumCasillero;
              if (dataIn[i].Percha != undefined)
                this.listProdFiltradosExcel[index].listBodegaProducto[this.listProdFiltradosExcel[index].listBodegaProducto.length - 1].percha = dataIn[i].Percha;
              if (dataIn[i].Fila != undefined)
                this.listProdFiltradosExcel[index].listBodegaProducto[this.listProdFiltradosExcel[index].listBodegaProducto.length - 1].fila = dataIn[i].Fila;
            } else {
              this.toastr.warning('El código ' + dataIn[i].Codigo + ' esta duplicado ', 'Advertencia Inventario.', {
                closeButton: true,
                timeOut: 0,
                extendedTimeOut: 1500,
              });
            }
          }
        }
      }
    }
  }

  onModalXML(ListIn: cProducto_B[]) {
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    const newlist = ListIn;
    const prelist = this.listProductosIn;
    dialoConfig.data = { newlist, prelist };
    const dialogRef = this.dialog.open(CargarXLSXComponent, dialoConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result == "Ok")
          this.cargarData();
      }
    });
  }
}