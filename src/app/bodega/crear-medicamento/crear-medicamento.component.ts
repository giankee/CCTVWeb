import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faAngleRight, faSave, faSearch, faSort, faTimesCircle, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';

@Component({
  selector: 'app-crear-medicamento',
  templateUrl: './crear-medicamento.component.html',
  styles: []
})
export class CrearMedicamentoComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
  }

  fechaHoy = new cFecha();
  iconDownLeft: boolean = false;
  spinnerOnOff: number = 1;
  listProductosIn: cProducto_B[] = [];
  dataProductosResult: cProducto_B[] = [];
  filtroProducto = '';
  listBodega: cVario[] = [];
  ordenBy: string = "default";
  paginacion = new cPaginacion(50);

  /**Icon */
  fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; faangleright = faAngleRight; fasearch = faSearch; sort = faSort; fasave = faSave; fawarehouse = faWarehouse;
  constructor(private _enterpriceServise: ApiEnterpriceService, private _productoBService: ProductoBService, private toastr: ToastrService, private _variosService: VariosService) { }

  ngOnInit(): void {
    this.cargardata();
    this.cargarBodega();
  }

  cargardata() {
    this.enterpriceServise.getInventarioNoRegistrado().subscribe((dato: any) => {
      if (dato.exito == 1) {
        var i = 1;
        this.listProductosIn = dato.data;
        this.listProductosIn.forEach(x => {
          x.idProductoStock = i++;
          x.check = false;
        });
        this.spinnerOnOff = 2;

        this.paginacion.getNumberIndex(this.listProductosIn.length);
        this.paginacion.updateIndex(0);
      }
    },
      error => console.error(error));
  }

  onOrdenListBy() {// cambia el orden por medio de un pipe
    if (this.ordenBy == "n-up")
      this.ordenBy = "n-down";
    else this.ordenBy = "n-up";
  }

  getDataFiltro(data: cProducto_B[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined) {
      this.dataProductosResult = [];
      this.dataProductosResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataProductosResult.length);
    }
  }

  onChangeDown(dataIn: cProducto_B) {
    this.listProductosIn.forEach(x => {
      if (x.idProductoStock != dataIn.idProductoStock) {
        x.check = false;
      }
    });
    if (dataIn.tipoUnidad != "UNIDAD") {
      dataIn.check = !dataIn.check;
    } else dataIn.check = false;
    this.listProductosIn.find(x => x.idProductoStock == dataIn.idProductoStock).check = dataIn.check;
  }

  onSepararContenidoNeto(dataIn: cProducto_B, t: number) {
    this.listProductosIn.find(x => x.idProductoStock == dataIn.idProductoStock).contenidoNeto = dataIn.contenidoNeto;
    if (t == 1)
      this.listProductosIn.find(x => x.idProductoStock == dataIn.idProductoStock).precioNeto = Number((dataIn.precioStandar / dataIn.contenidoNeto).toFixed(2));
    else this.listProductosIn.find(x => x.idProductoStock == dataIn.idProductoStock).precioNeto = 0;
  }

  onSaveProducto(dataIn: cProducto_B) {
    let auxId = dataIn.idProductoStock;
    dataIn.idProductoStock = 0;
    for (var i = 0; i < dataIn.listBodegaProducto.length; i++) {
      if (dataIn.listBodegaProducto[i].cantInicial == 0 && dataIn.listBodegaProducto[i].cantMinima == 0) {
        dataIn.listBodegaProducto.splice(i, 1);
        i--;
      } else dataIn.listBodegaProducto[i].disponibilidad = dataIn.listBodegaProducto[i].cantInicial;
    }
    if (dataIn.listBodegaProducto.length > 0) {
      this._productoBService.insertarProducto(dataIn).subscribe(
        (res: any) => {
          if (res.message == "DuplicateCode") {
            this.toastr.error('Código esta duplicado', 'Registro fallido.');
          } else {
            this.toastr.success('Ingreso satisfactorio', 'Producto Registrado');
            this.listProductosIn.splice(this.listProductosIn.findIndex(x => x.idProductoStock == auxId), 1);
            this.paginacion.getNumberIndex(this.listProductosIn.length);
            this.resetForm();
          }
        }
      )
    }
  }

  onAgregarStock(dataIn: cProducto_B) {
    this.productoBService.formData = new cProducto_B();
    this.productoBService.formData.rellenarObjeto(dataIn);
    if (this.productoBService.formData.listBodegaProducto.length == 0) {
      this.productoBService.formData.agregarOneBodega(null, "ENFERMERIA GENERAL");
      this.productoBService.formData.listBodegaProducto[0].cantMinima = 0;
      for (var i = 0; i < this.listBodega.length; i++) {
        this.productoBService.formData.agregarOneBodega(null, this.listBodega[i].nombre);
        this.productoBService.formData.listBodegaProducto[i + 1].cantMinima = 0;
      }
    }
  }

  cargarBodega() {
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      dato.forEach(x => {
        if (x.categoria == "Puerto" && x.prioridadNivel == 1)
          this.listBodega.push(x);
      });
    });
  }

  resetForm() {
    this.productoBService.formData = null;
  }

  onMostrarBodega(index: number) {
    for (var i = 0; i < this._productoBService.formData.listBodegaProducto.length; i++) {
      if (i == index)
        this._productoBService.formData.listBodegaProducto[i].ocultarObj = !this._productoBService.formData.listBodegaProducto[i].ocultarObj;
      else this._productoBService.formData.listBodegaProducto[i].ocultarObj = true;
    }
  }

  onUpdateSelect(control) {
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listProductosIn.length);
    this.paginacion.updateIndex(0);
  }
}
