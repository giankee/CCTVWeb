import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faPlus, faSave, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cOrdenEC } from 'src/app/shared/bodega/ordenEC';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';
import { cEnterpriceProveedor, cFecha } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-devolucion-compra',
  templateUrl: './devolucion-compra.component.html',
  styles: [],
})
export class DevolucionCompraComponent implements OnInit {
  public get ordenECService(): OrdenECService {
    return this._ordenECService;
  }
  public set ordenECService(value: OrdenECService) {
    this._ordenECService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get selectProveedor(): cEnterpriceProveedor {
    return this._selectProveedor;
  }
  public set selectProveedor(value: cEnterpriceProveedor) {
    this._selectProveedor = value;
  }

  @Input()
  isOpen: boolean = false;

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  fechaHoy = new cFecha();
  paginacion = new cPaginacion(5);
  spinnerOnOff: number = 0;//0 off / 1 loading Espera / 2 loading completo
  private _selectProveedor: cEnterpriceProveedor = new cEnterpriceProveedor();

  listProveedoresFiltros$: any;
  autoFocus: boolean = false;
  okBttnSubmit: number = 2;//1 disable, 2 Ok, 3 error

  fasave = faSave; fasearch = faSearch; fatimes = faTimes; faplus = faPlus;
  constructor(private _conexcionService: ConexionService, private _ordenECService: OrdenECService, private proveedorService: ProveedorService, private toastr: ToastrService) {
    if (this._conexcionService.UserDataToken.role == 'gpv-o')
      this._ordenECService.formData = new cOrdenEC("OFICINAS", this._conexcionService.UserDataToken.name);
    else this._ordenECService.formData = new cOrdenEC("P MANACRIPEX", this._conexcionService.UserDataToken.name);
    this._ordenECService.formData.estadoProceso = "Devolución";
  }

  ngOnInit(): void {
  }

  onBListProgProveedor(value: string) {
    this._ordenECService.formData.spinnerLoadingP = true;
    this._ordenECService.formData.showSearchSelect = true;
    this.selectProveedor.fuente = "CCTV";
    this.selectProveedor.proveedor = value;
    if (value)
      this.listProveedoresFiltros$ = this.proveedorService.getProveedorUnificadaSearch(value).pipe(
        map((x: cEnterpriceProveedor[]) => {
          return x;
        }),
        finalize(() => this._ordenECService.formData.spinnerLoadingP = false)
      );
    else {
      this._ordenECService.formData.spinnerLoadingP = false
      this.listProveedoresFiltros$ = null;
    }
  }

  onChooseProveedor(data: cEnterpriceProveedor) {
    this._ordenECService.formData.showSearchSelect = false;
    this.selectProveedor.completarObj(data);
    this._ordenECService.formData.proveedor = this.selectProveedor.proveedor;
  }

  onBuscarFactura() {
    if (this.spinnerOnOff == 0) {
      this.spinnerOnOff = 1;
      if (this._ordenECService.formData.proveedor != null && this._ordenECService.formData.factura != undefined) {
        var strParametros = this._ordenECService.formData.planta + "@" + this._ordenECService.formData.proveedor + "@" + this._ordenECService.formData.factura;
        if (this._conexcionService.UserDataToken.role == 'gpv-o') {//si es con guia
          if (this._ordenECService.formData.guiaRemision == null) {
            this.spinnerOnOff = 0;
            this.toastr.warning('Busqueda Fallida, falta ingresar la Guía de salida', 'Busqueda Error');
          } else strParametros = strParametros + "@" + this._ordenECService.formData.guiaRemision;
        } else strParametros = strParametros + "@null";
        if (this.spinnerOnOff == 1)
          this._ordenECService.getCompraDevolucion(strParametros).subscribe(
            (res: any) => {
              if (res.message == "No Found") {
                this.toastr.warning('No se han encontrado compras con los parametros seleccionados', 'Resultado de Busqueda');
                this.spinnerOnOff = 0;
              } else {
                if (res.message == "Ok Devolucion") {
                  this._ordenECService.formData.idDevolucionGuia = Number(res.auxmessage);
                  this._ordenECService.formData.idCompraAutomatica = Number(res.data.idOrdenE_C);
                  var auxIndex = -1;
                  for (var i = 0; i < res.data.listPcomprasO.length; i++)
                    if ((auxIndex = res.auxData.findIndex(x => x.inventarioId == res.data.listPcomprasO[i].productoId)) != -1)
                      this._ordenECService.formData.agregarOneDevolucion(res.data.listPcomprasO[i], res.auxData[auxIndex].cantidad);
                }
                if (res.message == "Ok Compra") {
                  this._ordenECService.formData.idCompraAutomatica = Number(res.data.idOrdenE_C);
                  for (var i = 0; i < res.data.listPcomprasO.length; i++)
                    this._ordenECService.formData.agregarOneDevolucion(res.data.listPcomprasO[i]);
                }
                if (res.message == "Similar") {
                  this.toastr.info('Se han encontrado facturas similares a factura proporcionada, sea más especifico', 'Resultado de Busqueda');
                  this._ordenECService.formData.factura = null;
                  this.autoFocus = true;
                  this.spinnerOnOff = 0;
                }
                if (res.message == "No coincide guía") {
                  this.toastr.warning('No se ha encontrado guía de salida que coincida con los parametros enviados', 'Resultado de Busqueda');
                  this._ordenECService.formData.guiaRemision = null;
                  this.spinnerOnOff = 0;
                }
                if (this._ordenECService.formData.listPcomprasO.length > 0) {
                  this.spinnerOnOff = 2;
                  this.paginacion.getNumberIndex(this._ordenECService.formData.listPcomprasO.length);
                  this.paginacion.updateIndex(0);
                }
              }
            });
      } else {
        this.spinnerOnOff = 0;
        this.toastr.warning('Busqueda Fallida, faltan completar campos', 'Busqueda Error');
      }
    }
  }

  onChangeEventMoney(index) {
    this._ordenECService.formData.listPcomprasO[index].calcularPrecio();
    if (this._ordenECService.formData.listPcomprasO.find(x => x.marcar && (x.cantidad > x.disBttnInput || x.cantidad > x.producto.listBodegaProducto[0].disponibilidad)) != undefined)
      this.okBttnSubmit = 3;
    else this.okBttnSubmit = 2;
  }

  onSubmit(form: NgForm) {
    if (this.okBttnSubmit == 2) {
      this.okBttnSubmit = 1;
      if (this._ordenECService.formData.listPcomprasO.find(x => x.marcar && (x.cantidad > x.disBttnInput || (x.cantidad > x.producto.listBodegaProducto[0].disponibilidad && this.ordenECService.formData.planta!="OFICINAS"))) != undefined)
        this.okBttnSubmit = 3;
      else {
        for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
          if (!this._ordenECService.formData.listPcomprasO[i].marcar) {
            this._ordenECService.formData.listPcomprasO.splice(i, 1);
            i--;
          }
        }
        if (this._ordenECService.formData.listPcomprasO.length > 0) {
          this._ordenECService.formData.sumTotalLibre();
          this._ordenECService.devolucionOrdenCompra(this._ordenECService.formData).subscribe(
            (res: any) => {
              if (res.exito == 1) {
                if (res.message == "Ok") {
                  this.toastr.success('Se ha realizado correctamente la devolución', 'Devolución exitosa');
                  this.cerrar.emit(true);
                }
              } else {
                this.okBttnSubmit = 3;
                if (res.message == "No coincide bodega")
                  this.toastr.error('No coincide con la bodega', 'Devolución Fallida');
                if (res.message == "Bad Request")
                  this.toastr.error('Datos inconcistentes','Devolución Fallida');
              }
            }
          );
        } else this.okBttnSubmit = 3;
      }
    }
  }
}
