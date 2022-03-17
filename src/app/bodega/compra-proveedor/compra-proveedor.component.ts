import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { cCompraO, cOrdenEC, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpriceDocumento, cEnterpriceProveedor, cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import { faSave, faSearch, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import Swal from 'sweetalert2';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { finalize, map } from 'rxjs/operators';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';


@Component({
  selector: 'app-compra-proveedor',
  templateUrl: './compra-proveedor.component.html',
  styles: []
})
export class CompraProveedorComponent implements OnInit {
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
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
  public get ordenECService(): OrdenECService {
    return this._ordenECService;
  }
  public set ordenECService(value: OrdenECService) {
    this._ordenECService = value;
  }
  public get showSelect(): number {
    return this._showSelect;
  }
  public set showSelect(value: number) {
    this._showSelect = value;
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

  listProdFiltros$: any;
  listProveedoresFiltros$: any;
  private _selectProveedor: cEnterpriceProveedor = new cEnterpriceProveedor();


  private _showSelect: number = 1;
  spinnerOnOff: number = 0;//0 off / 1 loading Espera / 2 loading completo
  autoFocus: boolean = false;
  okCompraManual: boolean = false;
  okBttnSubmit: number = 2;//1 disable, 2 Ok, 3 error
  listBodega: cVario[] = [];
  okAddNewBotton: boolean = true;

  spinnerLoading: boolean = false;

  fasave = faSave; fasearch = faSearch; fatimes = faTimes; faplus = faPlus;
  constructor(private _conexcionService: ConexionService, private _ordenECService: OrdenECService, private _productoBService: ProductoBService, private toastr: ToastrService, private whatsappService: WhatsappService, private _enterpriceServise: ApiEnterpriceService, private _variosService: VariosService) {
  }

  ngOnInit(): void {
    this.resetForm();
    this.cargarBodega();
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.listBodega = dato;
    });
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
    }
    this.spinnerOnOff = 0;
    this.autoFocus = false;
    if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
      this._ordenECService.formData = new cOrdenEC("OFICINAS", this._conexcionService.UserR.nombreU);
    else this._ordenECService.formData = new cOrdenEC("P MANACRIPEX", this._conexcionService.UserR.nombreU);
  }

  onSubmit(form: NgForm) {
    if (this._ordenECService.formData.estadoProceso == "Temporal") {
      if (this._ordenECService.formData.idCompraAutomatica != 0) {
        if (this._ordenECService.formData.listPcomprasO.find(x => x.marcar && x.refenciaTemporalId == 0) != undefined) {
          this.okBttnSubmit = 3;
        } else {
          for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
            if (!this._ordenECService.formData.listPcomprasO[i].marcar) {
              this._ordenECService.formData.listPcomprasO.splice(i, 1);
              i--;
            } else {
              if (this._ordenECService.formData.listPcomprasO[i].productoId == undefined) {
                var indexTemporal = this._ordenECService.formData.listPtemporales.findIndex(x => x.productoId == this._ordenECService.formData.listPcomprasO[i].refenciaTemporalId);
                if(indexTemporal!=-1){
                  if(this._ordenECService.formData.listPtemporales[indexTemporal].producto.codigo=="Temp")
                    this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock=this._ordenECService.formData.listPcomprasO[i].refenciaTemporalId;
                }
              }
            }
          }
          this.actualizar();
        }
      } else {
        this._ordenECService.formData.factura = 0;
        for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
          this._ordenECService.formData.listPcomprasO[i].cargaIva = false;
          this._ordenECService.formData.listPcomprasO[i].producto.estado = 3;
          if (this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock == undefined) {
            this._ordenECService.formData.listPcomprasO[i].producto.nombre = "Temp-" + this._ordenECService.formData.listPcomprasO[i].descripcionProducto;
            this._ordenECService.formData.listPcomprasO[i].producto.codigo = "Temp";
            this._ordenECService.formData.listPcomprasO[i].producto.agregarOneBodega(null, this._ordenECService.formData.listPcomprasO[i].destinoBodega);
          } else this.ordenECService.formData.listPcomprasO[i].precio=0;
          this._ordenECService.formData.listPcomprasO[i].estadoCompra = "Temporal";
        }
        this.guardar();
      }
    } else{
      if (this._ordenECService.formData.listPcomprasO.find(x => x.cantidad == 0 || (x.destinoBodega == "SIN ASIGNAR" && x.marcar)) == undefined) {
        this.okBttnSubmit = 1;
        if (this._ordenECService.formData.factura == null)
          this._ordenECService.formData.factura = 0;
        if (this._ordenECService.formData.guiaRemision == null)
          this._ordenECService.formData.guiaRemision = 0;
        for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
          if (!this._ordenECService.formData.listPcomprasO[i].marcar) {
            this._ordenECService.formData.listPcomprasO.splice(i, 1);
            i--;
          } else {
            if (this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock == undefined) {
              this._ordenECService.formData.listPcomprasO[i].producto.nombre = this._ordenECService.formData.listPcomprasO[i].descripcionProducto;
            }
          }
        }
        this.guardar();
      } else this.okBttnSubmit = 3;
    }
  }

  onTerminar() {
    this.cerrar.emit(true);
  }

  guardar() {
    this._ordenECService.insertarOrdenCompra(this._ordenECService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          if (res.message == "Registro Existente")
            this.toastr.warning('Aviso Importante', 'La factura ya ha sido registrada anteriormente');
          if (res.message == "Ok") {
            this.onTerminar();
            this.toastr.success('Registro Exitoso', 'La compra se ha registrado satisfactoriamente');
          }
        } else {
          if (res.message == "Error Producto")
            this.toastr.warning('Producto Fallido', 'No se ha encontrado el código del prodcuto en la base de datos');
          if (res.message == "Bad Request")
            this.toastr.error('Registro Fallido', 'Datos inconcistentes');
        }
      }
    );
  }

  actualizar() {
    this._ordenECService.actualizarOrdenES(this._ordenECService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          if (res.message == "Ok") {
            this.onTerminar();
            this.toastr.success('Registro Exitoso', 'La compra se ha actualizado satisfactoriamente');
          }
        } else this.toastr.error('Registro Fallido', 'Datos inconcistentes');
      }
    );
  }

  verificacionAuto() {
    this._enterpriceServise.getDocumento(this._ordenECService.formData.factura + "@" + this._selectProveedor.cedrucpas)
      .subscribe((dato: any) => {
        var strTexto = "Revisar que la infomación ingresada es correcta!";
        var strTitulo = "No se ha Encontrado Coincidencia";
        var btn2Boton = "Revisar!";
        var btn1Boton = "Nuevo Registro!";

        if (dato.message == "ok" && dato.compra != null) {
          strTitulo = "Factura Encontrada!";
          strTexto = "Se encontro " + dato.compra.tP_Documento +': '+dato.compra.documento+ " emitida el " + dato.compra.emi_Fecha.substring(0, 10) + ", bajo la razón social: " + dato.compra.rS_Cliente;
          btn1Boton = "Continuar!";
          btn2Boton = "Cancelar!";

          Swal.fire({
            icon: "success",
            title: strTitulo,
            text: strTexto,
            showCancelButton: true,
            cancelButtonColor: '#E53935',
            confirmButtonText: btn1Boton,
            cancelButtonText: btn2Boton,
            customClass: {
              confirmButton: 'btn btn-Primario mr-2',
              cancelButton: 'btn btn-Secundario ml-2',
            }
          }).then((result) => {
            if (result.value) {
              if (dato.message == "ok")
                this.rellenarCompraAuto(dato.compra);
              else this.rellenarManual();
            } else {
              this._ordenECService.formData.factura = null;
              this.autoFocus = true;
              this.spinnerOnOff = 0;
            }
          })
        }
        if (dato.message == "Duplicada" && dato.compra != null) {
          strTitulo = "Factura Duplicada!";
          strTexto = "Se encontro " + dato.compra.tP_Documento + " registrada el " + dato.fecha + ", bajo la razón social: " + dato.compra.rS_Cliente;
          if (dato.compra.listCompraO.length > 0)
            btn1Boton = "Continuar!";
          else btn1Boton = "Salir"
          btn2Boton = "Cancelar!";

          Swal.fire({
            icon: "warning",
            title: strTitulo,
            text: strTexto,
            showCancelButton: true,
            cancelButtonColor: '#E53935',
            confirmButtonText: btn1Boton,
            cancelButtonText: btn2Boton,
            customClass: {
              confirmButton: 'btn btn-Primario mr-2',
              cancelButton: 'btn btn-Secundario ml-2',
            }
          }).then((result) => {
            if (result.value) {
              if (btn1Boton == "Continuar!")
                this.rellenarCompraAuto(dato.compra);
            } else {
              this._ordenECService.formData.factura = null;
              this.autoFocus = true;
              this.spinnerOnOff = 0;
            }
          });
        }
        if (dato.message == "Not Found") {
          Swal.fire({
            icon: "error",
            title: strTitulo,
            text: strTexto,
            showCancelButton: true,
            cancelButtonColor: '#E53935',
            confirmButtonText: btn1Boton,
            cancelButtonText: btn2Boton,
            customClass: {
              confirmButton: 'btn btn-Primario mr-2',
              cancelButton: 'btn btn-Secundario ml-2',
            }
          }).then((result) => {
            if (result.value) {
              this.rellenarManual();
            } else {
              this._ordenECService.formData.factura = null;
              this.autoFocus = true;
              this.spinnerOnOff = 0;
            }
          });
        }
      },
        error => console.error(error));
  }

  onBuscarFactura() {
    if (this.spinnerOnOff == 0) {
      this.spinnerOnOff = 1;
      if (this.selectProveedor.proveedor != null && (this._ordenECService.formData.factura != null || this._ordenECService.formData.guiaRemision != null)) {
        this._ordenECService.formData.showSearchSelect = false;
        this._ordenECService.formData.proveedor = this.selectProveedor.proveedor;
        if (this._ordenECService.formData.factura != null) {
          if (this._ordenECService.formData.guiaRemision != null) {
            this._ordenECService.getVerificarCompraTemporal(this._ordenECService.formData.planta + "@" + this._ordenECService.formData.proveedor + "@" + this._ordenECService.formData.guiaRemision).subscribe(data => {
              if (data != null)
                this._ordenECService.formData.completarTemporal(data);
              else this._ordenECService.formData.guiaRemision = 0;
              if (this.selectProveedor.fuente == "ENT") {
                this.verificacionAuto();
              } else this.rellenarManual();
            });
          } else {
            if (this.selectProveedor.fuente == "ENT") {
              this.verificacionAuto();
            } else this.rellenarManual();
          }
        }
        else {
          this._ordenECService.formData.estadoProceso = "Temporal";
          this.rellenarManual();
        }
      } else this.spinnerOnOff = 0;
    }
  }

  rellenarCompraAuto(datoCompra: cEnterpriceDocumento) {
    if (datoCompra != null) {
      this.okCompraManual = false;
      this._ordenECService.formData.idCompraAutomatica = datoCompra.idDocumento;
      this._productoBService.getProductosPlantaProveedor(this._ordenECService.formData.planta + "@" + this._ordenECService.formData.proveedor)
        .subscribe((dato: any) => {
          for (var i = 0; i < datoCompra.listCompraO.length; i++) {
            var indexP: number = -1;
            var auxArticuloCompra = new cCompraO();
            auxArticuloCompra.cantidad = datoCompra.listCompraO[i].cantidad;
            auxArticuloCompra.precio = Number(datoCompra.listCompraO[i].precio.toFixed(4));
            auxArticuloCompra.descuento = datoCompra.listCompraO[i].descuento;
            auxArticuloCompra.totalInd = datoCompra.listCompraO[i].subtotal;

            if (dato.message == "Ok") {
              if ((indexP = dato.data.findIndex(x => x.codigo == datoCompra.listCompraO[i].codigoprincipal)) != -1) {
                auxArticuloCompra.productoId = dato.data[indexP].idProductoStock;
                auxArticuloCompra.rellenarProducto(dato.data[indexP], 1);
                auxArticuloCompra.destinoBodega = auxArticuloCompra.producto.SelectBodega;
              }
              else {
                var auxProductoNew: cProducto_B = new cProducto_B(this._ordenECService.formData.planta, this._ordenECService.formData.proveedor);
                auxProductoNew.codigo = datoCompra.listCompraO[i].codigoprincipal;
                auxProductoNew.nombre = datoCompra.listCompraO[i].descripcion.toUpperCase();
                auxProductoNew.precioStandar = Number(datoCompra.listCompraO[i].precio.toFixed(4));
                auxArticuloCompra.descripcionProducto = datoCompra.listCompraO[i].descripcion;
                auxArticuloCompra.rellenarProducto(auxProductoNew);
              }
            } else {
              var auxProductoNew: cProducto_B = new cProducto_B(this._ordenECService.formData.planta, this._ordenECService.formData.proveedor);
              auxProductoNew.codigo = datoCompra.listCompraO[i].codigoprincipal;
              auxProductoNew.nombre = datoCompra.listCompraO[i].descripcion.toUpperCase();
              auxProductoNew.precioStandar = Number(datoCompra.listCompraO[i].precio.toFixed(4));
              auxArticuloCompra.descripcionProducto = datoCompra.listCompraO[i].descripcion;
              auxArticuloCompra.rellenarProducto(auxProductoNew);
            }
            if (this._ordenECService.formData.listPtemporales.length > 0) {
              var indexTemp = this._ordenECService.formData.listPtemporales.findIndex(x => x.producto.codigo == auxArticuloCompra.producto.codigo);
              if (indexTemp != -1) {
                auxArticuloCompra.refenciaTemporalId = this._ordenECService.formData.listPtemporales[indexTemp].productoId;
                auxArticuloCompra.idRegistro = this._ordenECService.formData.listPtemporales[indexTemp].idRegistro;
                auxArticuloCompra.ordenE_CId = this._ordenECService.formData.listPtemporales[indexTemp].ordenE_CId;
                auxArticuloCompra.destinoBodega = this._ordenECService.formData.listPtemporales[indexTemp].destinoBodega;
                auxArticuloCompra.disableSelectBodega=true;
                auxArticuloCompra.estadoCompra = "Procesada";
              }
            }
            this._ordenECService.formData.listPcomprasO.push(auxArticuloCompra);
          }
          this._ordenECService.formData.sumTotalLibre();
          this.spinnerOnOff = 2;
          this.paginacion.getNumberIndex(this._ordenECService.formData.listPcomprasO.length);
          this.paginacion.updateIndex(0);
        },
          error => console.error(error));
    }
  }

  rellenarManual() {
    this.okCompraManual = true;
    this.spinnerOnOff = 2;
    this.showSelect = 1;
    this.onAddNewP();
  }

  onBListProgProducto(index: number, op: number, value: string) {
    this._ordenECService.formData.listPcomprasO[index].spinnerLoading = true;
    this._ordenECService.formData.listPcomprasO.forEach(x => x.showSearchSelect = 0);
    this._ordenECService.formData.listPcomprasO[index].showSearchSelect = op;
    this._ordenECService.formData.listPcomprasO[index].disBttnInput = 0;
    this._ordenECService.formData.listPcomprasO[index].productoId = undefined;

    var strParametro = this._ordenECService.formData.planta + "@" + this.ordenECService.formData.proveedor + "@";
    this._ordenECService.formData.listPcomprasO[index].producto.resetProducto();
    this._ordenECService.formData.listPcomprasO[index].producto.proveedor = this.ordenECService.formData.proveedor;
    if (this.ordenECService.formData.listPcomprasO[index].precio != 0)
      this.ordenECService.formData.listPcomprasO[index].producto.precioStandar = this.ordenECService.formData.listPcomprasO[index].precio;
    if (op == 1) {
      this.ordenECService.formData.listPcomprasO[index].producto.codigo = value;
      strParametro = strParametro + value + "@null@10";
    } else {
      this.ordenECService.formData.listPcomprasO[index].descripcionProducto = value;
      strParametro = strParametro + "null@" + value + "@10";
    }
    this.listProdFiltros$ = this._productoBService.getProductosProveedorSearch(strParametro).pipe(
      map((x: cProducto_B[]) => x),
      finalize(() => this._ordenECService.formData.listPcomprasO[index].spinnerLoading = false)
    );
  }

  onBListProgProveedor(value: string) {
    this._ordenECService.formData.spinnerLoadingP = true;
    this._ordenECService.formData.showSearchSelect = true;
    this.selectProveedor.fuente = "CCTV";
    this.selectProveedor.proveedor = value;
    if (value)
      this.listProveedoresFiltros$ = this._enterpriceServise.getProveedorSearch(value).pipe(
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
  }

  onChooseElemente(index, op: number, data: cProducto_B) {
    this._ordenECService.formData.listPcomprasO[index].showSearchSelect = 0;
    if (op == 1)
      this._ordenECService.formData.listPcomprasO[index].disBttnInput = 2;
    else this._ordenECService.formData.listPcomprasO[index].disBttnInput = 1;

    this._ordenECService.formData.listPcomprasO[index].productoId = data.idProductoStock;
    this._ordenECService.formData.listPcomprasO[index].descripcionProducto = data.nombre;

    this._ordenECService.formData.listPcomprasO[index].rellenarProducto(data);
    this._ordenECService.formData.listPcomprasO[index].destinoBodega = this._ordenECService.formData.listPcomprasO[index].producto.SelectBodega;
    if (this.ordenECService.formData.estadoProceso != "Temporal") {
      this._ordenECService.formData.listPcomprasO[index].calcularPrecio();
      this._ordenECService.formData.sumTotalLibre();
    }
  }

  comprobarNewP() {
    var flag = true;
    if (this._ordenECService.formData.listPcomprasO.length > 0) {
      for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
        if (this._ordenECService.formData.estadoProceso == "Temporal") {
          if (this._ordenECService.formData.listPcomprasO[i].destinoBodega == "SIN ASIGNAR" || this._ordenECService.formData.listPcomprasO[i].cantidad == 0 || this._ordenECService.formData.listPcomprasO[i].descripcionProducto == "")
            flag = false;
        } else
          if (this._ordenECService.formData.listPcomprasO[i].precio == 0 || this._ordenECService.formData.listPcomprasO[i].destinoBodega == "SIN ASIGNAR" || this._ordenECService.formData.listPcomprasO[i].cantidad == 0 || this._ordenECService.formData.listPcomprasO[i].producto.codigo == undefined || this._ordenECService.formData.listPcomprasO[i].descripcionProducto == "")
            flag = false;
      }
    }
    this.okAddNewBotton = flag;
    return (flag);
  }

  onAddNewP() {
    if (this.comprobarNewP()) {
      var auxArticuloCompra = new cCompraO();
      if (this._conexcionService.UserR.rolAsignado == 'gpv-o')
        var auxProductoNew: cProducto_B = new cProducto_B("OFICINAS", this._ordenECService.formData.proveedor);
      else var auxProductoNew: cProducto_B = new cProducto_B("P MANACRIPEX", this._ordenECService.formData.proveedor);
      auxArticuloCompra.rellenarProducto(auxProductoNew);
      this._ordenECService.formData.listPcomprasO.push(auxArticuloCompra);
      this.paginacion.getNumberIndex(this._ordenECService.formData.listPcomprasO.length);
      this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
    }
  }

  onRemoveNewP(index) {
    this.ordenECService.formData.listPcomprasO.splice(index, 1);
    var aux: cCompraO[] = this.ordenECService.formData.listPcomprasO;
    this._ordenECService.formData.listPcomprasO = [];
    this._ordenECService.formData.listPcomprasO = aux;
    this._ordenECService.formData.sumTotalLibre();
    this.comprobarNewP();
  }

  onChangeEventMoney(index) {
    this._ordenECService.formData.listPcomprasO[index].calcularPrecio();
    this._ordenECService.formData.sumTotalLibre();
  }

  onChangeRefTemporal(index) {
    var indexTemporal = this._ordenECService.formData.listPtemporales.findIndex(x => x.productoId == this._ordenECService.formData.listPcomprasO[index].refenciaTemporalId);
    if (indexTemporal != -1) {
      this._ordenECService.formData.listPcomprasO[index].idRegistro = this._ordenECService.formData.listPtemporales[indexTemporal].idRegistro;
      this._ordenECService.formData.listPcomprasO[index].ordenE_CId = this._ordenECService.formData.listPtemporales[indexTemporal].ordenE_CId;
      this._ordenECService.formData.listPcomprasO[index].destinoBodega = this._ordenECService.formData.listPtemporales[indexTemporal].destinoBodega;
      this._ordenECService.formData.listPcomprasO[index].estadoCompra = "Procesada";
    }
  }
}
