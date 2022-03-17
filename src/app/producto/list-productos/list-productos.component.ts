import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from 'src/app/shared/producto.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { faQuestion, faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { cProducto } from 'src/app/shared/basicos';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { OrdenESService } from 'src/app/shared/orden-es.service';

@Component({
  selector: 'app-list-productos',
  templateUrl: './list-productos.component.html',
  styles: []
})
export class ListProductosComponent implements OnInit {
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get productoService(): ProductoService {
    return this._productoService;
  }
  public set productoService(value: ProductoService) {
    this._productoService = value;
  }

  internetStatus: string = 'nline';
  filtroProducto = '';
  okAyuda: boolean = false;
  autoFocus: boolean = false;
  modoEdicion: boolean = false;
  listProductosIn: cProducto[] = [];
  ordenNombre:string="default";

  /**Para pagination */
  paginacion = new cPaginacion(50);
  /**Fin paginatacion */

  /**Icon */
  faquestion = faQuestion; sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; faeraser = faEraser; fasave = faSave; fatimesCircle = faTimesCircle; fasearch=faSearch;

  constructor(private _conexcionService: ConexionService, private _productoService: ProductoService, private toastr: ToastrService, private ordenESService:OrdenESService) {
    this.productoService.formData=new cProducto();
   }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarData();
  }

  cargarData() {//Datos de los productos traidos desde db
    this._productoService.getProductos()
      .subscribe(dato => {
        this.listProductosIn = dato;
        this.paginacion.getNumberIndex(this.listProductosIn.length);
      },
        error => console.error(error));
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
      this.autoFocus = false;
    }
    this.productoService.formData.resetObj();
    this.modoEdicion = false;
  }

  completarForm(list: cProducto, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this._productoService.formData.completarObj(list);
      this.modoEdicion = true;
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listProductosIn.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenNombre() {// cambia el orden por medio de un pipe
    if(this.ordenNombre=="default"||this.ordenNombre=="down")
      this.ordenNombre="up";
    else this.ordenNombre="down";
  }

  getDataFiltro(n) {//Para q la filtracion de datos se automatica
    if(n!=undefined)
      this.paginacion.getNumberIndex(n);
  }

  onDelete( datoProducto: cProducto) {
    if(this.internetStatus=="nline"){
      Swal.fire({
        title: 'Está seguro?',
        text: "Desea Eliminar esta producto?",
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#E53935',
        confirmButtonText: 'Continuar!',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-info mr-2',
          cancelButton: 'btn btn-danger ml-2'
        },
        buttonsStyling:false
      }).then((result) => {
        if (result.value) {
          this._productoService.getBuscarEliminar( datoProducto.idProducto.toString()).subscribe(
            (res: any) => {
              if(res.message=="OkDelate"){
                this.toastr.warning('Eliminación satisfactoria', 'Producto');
                this.listProductosIn.splice(this.listProductosIn.findIndex(x=>x.idProducto==datoProducto.idProducto),1);
                this.paginacion.getNumberIndex(this.listProductosIn.length);
              }else{
                var idProductoNuevo:number=0;
                Swal.fire({
                  title: 'Remplazar Producto',
                  text: "Este producto esta siendo utilizado en una o varias ordenes de E/S",
                  input: 'text',
                  icon: 'warning',
                  showCancelButton: true,
                  cancelButtonColor: '#E53935',
                  confirmButtonText: 'Continuar!',
                  cancelButtonText: 'Cancelar',
                  customClass: {
                    confirmButton: 'btn btn-info mr-2',
                    cancelButton: 'btn btn-danger ml-2'
                  },
                  buttonsStyling: false,
                  inputValidator: (value) => {
                    if (!value) {
                      return 'ingrese el nombre de un producto existente';
                    } else {
                      var indice=-1;
                      if((indice=this.listProductosIn.findIndex(x=>x.nombre==value.toUpperCase()))!=-1)
                      idProductoNuevo=this.listProductosIn[indice].idProducto;
                      else return "No se encontro el producto ingresado";
                    }
                  }
                }).then((resultB) => {
                  if (resultB.value) {
                    res.data.forEach(x => {
                      x.productoId=idProductoNuevo;
                    });
                    this.ordenESService.actualizarMultipleArtO(res.data).subscribe((resMultiple:any)=>{
                      if(resMultiple.message=="Ok")
                      this._productoService.getBuscarEliminar( datoProducto.idProducto.toString()).subscribe(
                        (res: any) => {
                          if(res.message=="OkDelate"){
                            this.toastr.warning('Eliminación satisfactoria', 'Producto');
                            this.listProductosIn.splice(this.listProductosIn.findIndex(x=>x.idProducto==datoProducto.idProducto),1);
                            this.paginacion.getNumberIndex(this.listProductosIn.length);
                          }
                        },
                        err => {
                          console.log(err);
                        }
                      )
                    });
                  }
                });
              }
            },
            err => {
              console.log(err);
            }
          )
        }
      })
    }else{
      Swal.fire({
        title: 'No ahi conexión de Internet',
        text: "Manten la paciencia e inténtalo de nuevo más tarde",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonText: 'Continuar!',
        customClass: {
          confirmButton: 'btn btn-info mr-2'
        },
        buttonsStyling:false
      })
    }
  }

  onSubmit(form: NgForm) {
    this.autoFocus = false;
    if (this.internetStatus == "nline") {
      if (this.modoEdicion) {
        this._productoService.actualizarProducto(this._productoService.formData).subscribe(
          (res: any) => {
            if (res.message = "Ok") {
              this.toastr.success('Edición satisfactoria', 'Producto');
              this.listProductosIn[this.listProductosIn.findIndex(x=>x.idProducto==this._productoService.formData.idProducto)] = JSON.parse(JSON.stringify(this._productoService.formData));
              this.resetForm(form);
            }
          },
          err => {
            console.log(err);
          }
        )
      }
      else {
        this._productoService.insertarProducto(this._productoService.formData).subscribe(
          (res: any) => {
            if (res.message) {
              this.toastr.error('Nombre esta duplicado', 'Registro fallido.');
              this._productoService.formData.nombre = null;
              this.autoFocus = true;
            } else {
              this.toastr.success('Ingreso satisfactorio', 'Producto Registrado');
              this.listProductosIn.push(res);
              this.resetForm(form);
              this.ordenNombre="default";
              this.paginacion.getNumberIndex(this.listProductosIn.length);
              this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
            }
          }
        )
      }
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

  salirDeRuta(): boolean | import("rxjs").Observable<boolean> | Promise<boolean> {
    if (this.internetStatus == "ffline") {
      window.alert('No ahi conexión de Internet! no se puede proseguir');
      return false
    }
    return true;
  }
}
