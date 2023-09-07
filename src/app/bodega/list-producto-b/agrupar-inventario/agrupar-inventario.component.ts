import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faAngleDown, faAngleLeft, faEye, faPencilAlt, faPlus, faSave, faSearch, faSort, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cComponentesProducto, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';

@Component({
  selector: 'app-agrupar-inventario',
  templateUrl: './agrupar-inventario.component.html',
  styles: [],
})
export class AgruparInventarioComponent implements OnInit {
  public get ordenTrabajoService(): OrdenTrabajoService {
    return this._ordenTrabajoService;
  }
  public set ordenTrabajoService(value: OrdenTrabajoService) {
    this._ordenTrabajoService = value;
  }
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
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  filtroProductoCreados = '';
  filtroProductoMaterial = '';
  listProductosIn: cProducto_B[] = [];
  listMaterialesIn: cProducto_B[] = [];

  paginacion = new cPaginacion(10);
  modoEdicion: number = 0;
  selectBodegaAux: string = "SIN ASIGNAR";
  ordenBy: string = "default";
  dataProductosResult: cProducto_B[] = [];
  okAddNewBotton: boolean = true;

  fapencilAlt = faPencilAlt; faeye = faEye; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch; faplus = faPlus;
  faangledown = faAngleDown; faangleleft = faAngleLeft; sort = faSort; fatimes = faTimes;

  constructor(private _conexcionService: ConexionService, private _productoBService: ProductoBService, private _variosService: VariosService, private toastr: ToastrService, private _ordenTrabajoService: OrdenTrabajoService) { }

  ngOnInit(): void {
    this.resetForm();
    this.cargarBodega();
  }

  resetForm() {
    this._productoBService.formData = new cProducto_B("P MANACRIPEX");
    this.productoBService.formData.proveedor = "CREADO EN PLANTA";
    this.modoEdicion = 0;
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.selectBodegaAux = dato.find(x => x.encargadoBodega.includes(this.conexcionService.UserDataToken.name)).nombre;
      this.cargarData();
    });
  }

  cargarData() {
    this._productoBService.getProductosAgrupados("P MANACRIPEX@" + this.selectBodegaAux)
      .subscribe(dato => {
        this.listMaterialesIn = [];
        this.listProductosIn = [];
        dato.forEach(x => {
          if (x.listComponentesProducto.length > 0)
            this.listProductosIn.push(x);
          else this.listMaterialesIn.push(x);
        });
        this.paginacion.getNumberIndex(this.listProductosIn.length);
        this.paginacion.updateIndex(0);
      },
        error => console.error(error));
  }

  onOrdenListBy() {
    if (this.ordenBy == "n-up")
      this.ordenBy = "n-down";
    else this.ordenBy = "n-up";
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataProductosResult.length);
    this.paginacion.updateIndex(0);
  }

  getDataFiltro(data: cProducto_B[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined && data.length != this.dataProductosResult.length) {
      this.dataProductosResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataProductosResult.length);
    }
  }

  onSubmit(form: NgForm) {
    if (this.modoEdicion == 0) {
      if (this.comprobarM()) {
        this.productoBService.formData.codigo = "INV-" + this.productoBService.formData.codigo;
        this.productoBService.formData.agregarOneBodega(null, this.selectBodegaAux);
        this._productoBService.insertarProducto(this._productoBService.formData).subscribe(
          (res: any) => {
            if (res.message == "DuplicateCode") {
              this.toastr.error('Código esta duplicado', 'Registro fallido.');
              this._productoBService.formData.codigo = null;
            } else {
              this.toastr.success('Ingreso satisfactorio', 'Producto Registrado');
              this.listProductosIn.push(res);
              this.resetForm();
              this.ordenBy = "default";
              this.paginacion.getNumberIndex(this.listProductosIn.length);
              this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
            }
          }
        );
      }
    }
    if (this.modoEdicion == 1) {
      if (this.comprobarM()) {
        this._productoBService.actualizarProducto(this._productoBService.formData).subscribe(
          (res: any) => {
            if (res.message == "Ok") {
              this.toastr.success('Edición satisfactoria', 'Producto');
              this.listProductosIn[this.listProductosIn.findIndex(x => x.idProductoStock == this.productoBService.formData.idProductoStock)] = JSON.parse(JSON.stringify(this._productoBService.formData));
              this.resetForm();
            }
            if (res.message == "DuplicateName") {
              this.toastr.error('Nombre Duplicado, revisar!', 'Producto');
              this._productoBService.formData.nombre = undefined;
            }
          },
          err => {
            console.log(err);
          }
        );
      }
    }
    if (this.modoEdicion == 2) {
      if (this.productoBService.formData.sumStock > 0) {
        this.productoBService.formData.listBodegaProducto[0].disponibilidad = this.productoBService.formData.listBodegaProducto[0].disponibilidad + this.productoBService.formData.sumStock;

        this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserDataToken.name, "P MANACRIPEX", this.selectBodegaAux);
        this._ordenTrabajoService.formData.bodeguero = this.conexcionService.UserDataToken.name;
        this._ordenTrabajoService.formData.tipoOrden = "Armar Kit";
        this._ordenTrabajoService.formData.personaResponsable = this.conexcionService.UserDataToken.name;
        this._ordenTrabajoService.formData.destinoLugar = this.selectBodegaAux;
        for (var i = 0; i < this._productoBService.formData.listComponentesProducto.length; i++) {
          this._ordenTrabajoService.formData.agregarOneMaterial();
          this._ordenTrabajoService.formData.listMaterialesO[i].inventario=null;
          this._ordenTrabajoService.formData.listMaterialesO[i].inventarioId = this.productoBService.formData.listComponentesProducto[i].labelId;
          this._ordenTrabajoService.formData.listMaterialesO[i].cantidad = this._productoBService.formData.sumStock * this._productoBService.formData.listComponentesProducto[i].cantidadNecesaria;
        }
        this._productoBService.actualizarProducto(this._productoBService.formData).subscribe(
          (res: any) => {
            if (res.message == "Ok") {
              this._ordenTrabajoService.insertarOrdenInterna(this._ordenTrabajoService.formData).subscribe(
                (res: any) => {
                  if (res.exito == 1) {
                    this.toastr.success('Agrupación de Material Exitoso', 'Producto');
                    this.cargarData();
                    this.resetForm();
                  }
                });
            }
          },
          err => {
            console.log(err);
          }
        )
      }
    }

  }

  onCompletarForm(op: number, listOne: cProducto_B, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this.okAddNewBotton = true;
      this.modoEdicion = op;
      this._productoBService.formData.rellenarObjeto(listOne);
      if (op == 2)
        this._productoBService.formData.sumStock = 0;
    }
  }

  onNewMaterial() {
    this.comprobarM();
    if (this.okAddNewBotton)
      this.productoBService.formData.agregarOneMaterial();
  }

  onListProducto(index: number, op: number, value: string) {
    if (value != null) {
      this._productoBService.formData.listComponentesProducto.forEach(x => {
        if (x.showSearchSelect != 3)
          x.showSearchSelect = 0;
      });
      this._productoBService.formData.listComponentesProducto[index].showSearchSelect = op;
      if (op == 2)
        this._productoBService.formData.listComponentesProducto[index].labelNombre = value.toUpperCase();
      else this._productoBService.formData.listComponentesProducto[index].labelCodigo = value.toUpperCase();
    }
  }

  onChooseElemente(index, data: cProducto_B) {
    this._productoBService.formData.listComponentesProducto[index].showSearchSelect = 3;
    this._productoBService.formData.listComponentesProducto[index].labelCodigo = data.codigo;
    this._productoBService.formData.listComponentesProducto[index].labelNombre = data.nombre;
    this._productoBService.formData.listComponentesProducto[index].bodegaProductoId = data.listBodegaProducto[0].idBodegaProducto;
  }

  onRemoveM(indice) {
    var auxLA: cComponentesProducto[] = [];
    if (this._productoBService.formData.listComponentesProducto.length > 1) {
      this._productoBService.formData.listComponentesProducto.splice(indice, 1);
      auxLA = JSON.parse(JSON.stringify(this._productoBService.formData.listComponentesProducto));
      this._productoBService.formData.listComponentesProducto = [];
      this._productoBService.formData.listComponentesProducto = JSON.parse(JSON.stringify(auxLA));
    }
    this.comprobarM();
  }

  comprobarM() {
    var flag = true;
    if (this._productoBService.formData.listComponentesProducto.find(x => x.cantidadNecesaria <= 0 || x.bodegaProductoId == undefined) != undefined)
      flag = false;
    this.okAddNewBotton = flag;
    return (flag);
  }

  onAumentarKit() {
    var flag = true;
    if (this._productoBService.formData.listComponentesProducto.find(x => (x.cantidadNecesaria * (this.productoBService.formData.sumStock + 1)) > x.bodegaProducto.disponibilidad) != undefined)
      flag = false;
    this.okAddNewBotton = flag;
    if (this.okAddNewBotton)
      this.productoBService.formData.sumStock++;
  }
}
