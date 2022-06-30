import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faPrint } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';

@Component({
  selector: 'app-cargar-xlsx',
  templateUrl: './cargar-xlsx.component.html',
  styles: [],
})
export class CargarXLSXComponent implements OnInit {
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }

  paginacion = new cPaginacion(25);
  okBttnSubmit: boolean = true;
  productosMostrar: cProducto_B[] = [];

  faprint = faPrint;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<CargarXLSXComponent>, private _productoBService: ProductoBService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.dato.newlist.length > 0) {
      this.productosMostrar = this.dato.newlist;
      this.productosMostrar.forEach(x => {
        x.contenidoNeto=1;
        x.disBttnInput = 1;
        var index = -1;
        if ((index = this.dato.prelist.findIndex(y => y.codigo == x.codigo && y.proveedor == x.proveedor)) != -1) {
          for (var i = 0; i < x.listBodegaProducto.length; i++) {
            if (this.dato.prelist[index].listBodegaProducto.find(y => y.nombreBodega == x.listBodegaProducto[i].nombreBodega)) {
              x.listBodegaProducto.splice(i, 1);
              i--;
            }
          }
          if (x.listBodegaProducto.length == 0)
            x.disBttnInput = 2;
        }
      });
      this.paginacion.getNumberIndex(this.productosMostrar.length);
      this.paginacion.updateIndex(0);
    }
  }


  onExit() {
    this.dialogRef.close();
  }
  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.productosMostrar.length);
    this.paginacion.updateIndex(0);
  }

  onSubmit() {
    for (var i = 0; i < this.productosMostrar.length; i++) {
      if (this.productosMostrar[i].disBttnInput == 0 || this.productosMostrar[i].disBttnInput == 2) {
        this.productosMostrar.splice(i, 1);
        i--;
      }
    }
    if (this.productosMostrar.length > 0) {
      if (this.okBttnSubmit) {
        this.okBttnSubmit = false;
        this._productoBService.insertarMultiplesProductosB(this.productosMostrar).subscribe(
          (res: any) => {
            if (res.message == "Ok") {
              this.toastr.success('Registro satisfactorio', 'Inventario Ingresado');
              this.dialogRef.close("Ok");
            }
          }
        );
      }
    }
    else {
      this.toastr.info('No existe inventario marcado para registrar', 'Inventario');
      this.onExit();
    }
  }
}
