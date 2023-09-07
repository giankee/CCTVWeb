import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cPersonal, cProducto } from 'src/app/shared/basicos';
import { cBodegaProducto, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { OrdenESService } from 'src/app/shared/orden-es.service';
import { cArticulosO, cOrdenEs } from 'src/app/shared/ordenEs';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cEnterpriceEmpleados, cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { PersonalService } from 'src/app/shared/personal.service';
import { ProductoService } from 'src/app/shared/producto.service';

@Component({
  selector: 'app-edit-orden',
  templateUrl: './edit-orden.component.html',
  styles: []
})
export class EditOrdenComponent implements OnInit {
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get productoService(): ProductoService {
    return this._productoService;
  }
  public set productoService(value: ProductoService) {
    this._productoService = value;
  }
  public get personalService(): PersonalService {
    return this._personalService;
  }
  public set personalService(value: PersonalService) {
    this._personalService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get ordenESService(): OrdenESService {
    return this._ordenESService;
  }
  public set ordenESService(value: OrdenESService) {
    this._ordenESService = value;
  }
  listChoferesIn: cEnterpriceEmpleados[] = [];
  listLugarPrioridadIn: cVario[] = [];
  okContinuar: boolean = true;
  /**Actualizar listProgresivas */
  listPersonalFiltros$: any;
  listVariosFiltros$: any;
  listProdFiltros$: any;
  spinLoadingG: number = 0;//0 offf, 1 es personal, 2 varios
  showSearchSelectG: number = 0;//0 offf, 1 es personal, 2 varios

  fechaHoy = new cFecha();
  fasave = faSave;

  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<EditOrdenComponent>, private _ordenESService: OrdenESService, private _enterpriceService: ApiEnterpriceService, private _variosService: VariosService, private _personalService: PersonalService, private _productoService: ProductoService, private _productoBService: ProductoBService, private toastr: ToastrService) { }

  ngOnInit(): void {
    if (this.dato.auxId != null) {
      this.cargarDataChoferes();
    }
  }

  cargarData() {
    this._ordenESService.getOneOrdenA(this.dato.auxId)
      .subscribe(datoOne => {
        this._ordenESService.formData = new cOrdenEs(datoOne.planta, datoOne.guardiaCargoUser);
        this._ordenESService.formData.completarAll(datoOne);
        if (this._ordenESService.formData.choferId != null) {
          var aux: cEnterpriceEmpleados = this.listChoferesIn.find(x => x.idEmpleado == this._ordenESService.formData.choferId)
          if (aux != null)
            this._ordenESService.formData.persona.resetChofer(aux.cedula, aux.empleado);
        }
        if (this._ordenESService.formData.planta == "OFICINAS")
          this._ordenESService.formData.listArticulosO.forEach((x: cArticulosO) => {
            if (x.inventarioId != null) {
              x.preCant = x.cantidad;
              this.productoBService.getBodegasByOneProducto(x.inventarioId.toString()).subscribe(bodegas => {
                x.inventario.listBodegaProducto = bodegas;
                if (x.observacion.includes("@INV-Bg:")) {
                  var separador = x.observacion.split("@INV-Bg:");
                  x.inventario.SelectBodega = separador[1];
                  x.inventario.preBodega = separador[1];
                  x.observacion = separador[0];
                }
                if (this._ordenESService.formData.tipoOrden == "Entrada" && (x.cantidad > x.inventario.listBodegaProducto.find(x1 => x1.nombreBodega == x.inventario.SelectBodega).disponibilidad))
                  x.showSearchSelect = 1;
              },
                error => console.error(error));
            }
          });
      },
        error => console.error(error));
  }

  cargarDataChoferes() {//Datos del choferes traidos desde db
    this._enterpriceService.getPersonalEnter("Choferes")
      .subscribe(dato => {
        this.listChoferesIn = dato;
        this.cargarData();
        this._variosService.getVariosPrioridad("gpv-o")
          .subscribe(dato => {
            this.listLugarPrioridadIn = dato;
          },
            error => console.error(error));
      },
        error => console.error(error));
  }

  onListPersonal(value: string) {
    this.spinLoadingG = 1;
    this.showSearchSelectG = 1;
    this.ordenESService.formData.persona = new cPersonal();
    this.ordenESService.formData.personaId = null;
    this.ordenESService.formData.choferId = null;
    var params = "" + value;
    if (!value)
      params = "DatoNull";
    this.listPersonalFiltros$ = this._personalService.getPersonalSearch(params).pipe(
      map((x: cPersonal[]) => {
        return x;
      }),
      finalize(() => this.spinLoadingG = 0)
    );

  }

  onChoosePersonal(data: any, tipo: string) {
    if (tipo == 'Chofer') {
      this._ordenESService.formData.persona.nombreP = data.empleado;
      this._ordenESService.formData.persona.tipoPersona = data.grupo;
      this._ordenESService.formData.persona.idPersona = data.idEmpleado;
      this._ordenESService.formData.persona.cedula = data.cedula;
      this._ordenESService.formData.checkCarro = true;
      this._ordenESService.formData.choferId = data.idEmpleado;
    }
    else {
      this._ordenESService.formData.persona.completarPersonal(data);
      this._ordenESService.formData.personaId = data.idPersona;
    }
    this.showSearchSelectG = 0;
  }

  onListLugares(value: string) {
    this.spinLoadingG = 2;
    this.showSearchSelectG = 2;
    this._ordenESService.formData.destinoProcedencia = value;
    var params = this._ordenESService.formData.tipoOrden + "@" + value;
    if (!value)
      params = this._ordenESService.formData.tipoOrden + "@DatoNull";
    this.listVariosFiltros$ = this._variosService.getLugarSearch(params).pipe(
      map((x: cVario[]) => {
        return x;
      }),
      finalize(() => this.spinLoadingG = 0)
    );
  }

  onChooseLugar(data: any) {
    this._ordenESService.formData.destinoProcedencia = data.nombre;
    this.showSearchSelectG = 0;
  }

  onListProducto(index: number, op: number, value: string) {
    this.ordenESService.formData.listArticulosO[index].spinnerLoading = true;
    this._ordenESService.formData.listArticulosO.forEach(x => x.showSearchSelect = 0);
    this._ordenESService.formData.listArticulosO[index].showSearchSelect = op;
    if (op == 1) {
      this._ordenESService.formData.listArticulosO[index].productoId = undefined;
      this.ordenESService.formData.listArticulosO[index].producto.idProducto = undefined;
      this._ordenESService.formData.listArticulosO[index].producto.nombre = value.toUpperCase();
    } else {
      this._ordenESService.formData.listArticulosO[index].inventarioId = undefined;
      this.ordenESService.formData.listArticulosO[index].inventario.idProductoStock = undefined;
      this._ordenESService.formData.listArticulosO[index].inventario.nombre = value.toUpperCase();
    }
    var strParametro = value;
    if (value != "") {
      if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
        strParametro = strParametro + "@OFICINAS@2@null";
        this.listProdFiltros$ = this._productoBService.getProductosSearch(strParametro).pipe(
          map((x: cProducto_B[]) => x),
          finalize(() => this._ordenESService.formData.listArticulosO[index].spinnerLoading = false)
        );
      } else {
        this.listProdFiltros$ = this._productoService.getProductosSearch(strParametro).pipe(
          map((x: cProducto[]) => x),
          finalize(() => this._ordenESService.formData.listArticulosO[index].spinnerLoading = false)
        );
      }
    }

  }

  onChooseElemente(index, data: any) {
    this._ordenESService.formData.listArticulosO[index].showSearchSelect = 0;
    if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
      this.ordenESService.formData.listArticulosO[index].productoId=0;
      this._ordenESService.formData.listArticulosO[index].inventario.rellenarObjeto(data);
      this._ordenESService.formData.listArticulosO[index].inventarioId = data.idProductoStock;
      this._ordenESService.formData.listArticulosO[index].inventario.preBodega = "SIN ASIGNAR";
      this.onComprobarStock(index);
    } else {
      this.ordenESService.formData.listArticulosO[index].inventarioId=0;
      this._ordenESService.formData.listArticulosO[index].producto.completarObj(data);
      this._ordenESService.formData.listArticulosO[index].productoId = data.idProducto;
    }
  }

  onTransformProductoToInv(index) {
    if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
      this._ordenESService.formData.listArticulosO[index].producto = null;
      this._ordenESService.formData.listArticulosO[index].productoId = null;
      this._ordenESService.formData.listArticulosO[index].inventario = new cProducto_B(this._ordenESService.formData.planta);
    } else {
      this._ordenESService.formData.listArticulosO[index].inventario = null;
      this._ordenESService.formData.listArticulosO[index].inventarioId = null;
      this._ordenESService.formData.listArticulosO[index].producto = new cProducto();
    }
  }

  onComprobarStock(index) {
    this.okContinuar = true;
    if (this._ordenESService.formData.listArticulosO[index].cantidad == 0)
      this.okContinuar = false;
    else
      if (this._ordenESService.formData.listArticulosO[index].checkInventario) {
        const cantDisponibleBSelect = this._ordenESService.formData.listArticulosO[index].inventario.listBodegaProducto.find(y => y.nombreBodega == this._ordenESService.formData.listArticulosO[index].inventario.SelectBodega).disponibilidad;
        if (this._ordenESService.formData.tipoOrden == "Salida") {
          if (this._ordenESService.formData.listArticulosO[index].cantidad > cantDisponibleBSelect)
            this.okContinuar = false;
          if (this._ordenESService.formData.listArticulosO[index].preCant != 0) {
            if (this._ordenESService.formData.listArticulosO[index].inventario.preBodega != "SIN ASIGNAR") {
              if (this._ordenESService.formData.listArticulosO[index].inventario.SelectBodega == this._ordenESService.formData.listArticulosO[index].inventario.preBodega) {
                this.okContinuar = true;
                if (this._ordenESService.formData.listArticulosO[index].cantidad > cantDisponibleBSelect)
                  if ((this._ordenESService.formData.listArticulosO[index].cantidad - this._ordenESService.formData.listArticulosO[index].preCant) > cantDisponibleBSelect)
                    this.okContinuar = false;
              }
            }
          }
        } else {
          if (this._ordenESService.formData.listArticulosO[index].preCant != 0) {
            if (this._ordenESService.formData.listArticulosO[index].inventario.preBodega != "SIN ASIGNAR") {
              if (this._ordenESService.formData.listArticulosO[index].cantidad < this._ordenESService.formData.listArticulosO[index].preCant)
                if ((this._ordenESService.formData.listArticulosO[index].preCant - this._ordenESService.formData.listArticulosO[index].cantidad) > cantDisponibleBSelect)
                  this.okContinuar = false;
            }
          }
        }
      }
  }

  onExit() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.okContinuar = true;
    if (this._ordenESService.formData.personaId == null && this._ordenESService.formData.choferId == null) {
      this.okContinuar = false;
    } else
      if (this._ordenESService.formData.listArticulosO.find(x => x.cantidad <= 0 || (x.productoId == null && x.inventarioId == null)) != undefined)
        this.okContinuar = false;
    if (this.okContinuar) {
      if (this._ordenESService.formData.planta == "OFICINAS") {
        if (this._ordenESService.formData.listArticulosO.find(x => x.inventarioId != null) != undefined) {
          this._ordenESService.formData.listArticulosO.forEach(x => {
            if (x.inventarioId != null) {
              x.observacion = x.observacion + "@INV-Bg:" + x.inventario.SelectBodega;
            }
          });
        }
      }
      this._ordenESService.actualizarOrdenES(this._ordenESService.formData).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Actualización satisfactoria', 'Orden Modificada');
            this.dialogRef.close(this._ordenESService.formData);
          }
        }
      )
    }
  }
}
