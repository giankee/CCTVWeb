import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { OrdenECService } from 'src/app/shared/orden-e-c.service';
import { cBodega, cCompraO, cOrdenEC, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpriceDocumento, cEnterpriceProveedor, cFecha, cVario, cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import { faSave, faSearch, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import Swal from 'sweetalert2';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { finalize, map } from 'rxjs/operators';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import jsPDF from 'jspdf';
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';

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
  paginacion = new cPaginacion(15);

  listProdFiltros$: any;
  listProveedoresFiltros$: any;
  private _selectProveedor: cEnterpriceProveedor = new cEnterpriceProveedor();


  private _showSelect: number = 1;
  spinnerOnOff: number = 0;//0 off / 1 loading Espera / 2 loading completo
  autoFocus: boolean = false;
  okCompraManual: boolean = false;
  okBttnSubmit: number = 2;//1 disable, 2 Ok, 3 error
  listBodega: cBodega[] = [];
  okAddNewBotton: boolean = true;
  selectBarcoCompra: string = "SIN ASIGNAR";
  spinnerLoading: boolean = false;
  auxPreordenEnfermeria: boolean = false;
  fasave = faSave; fasearch = faSearch; fatimes = faTimes; faplus = faPlus;
  constructor(private _conexcionService: ConexionService, private _ordenECService: OrdenECService, private _productoBService: ProductoBService, private toastr: ToastrService, private whatsappService: WhatsappService, private _enterpriceServise: ApiEnterpriceService, private proveedorService: ProveedorService, private _variosService: VariosService) {
  }

  ngOnInit(): void {
    this.resetForm();
    this.cargarBodega();
  }

  cargarBodega() {
    if (this.conexcionService.UserDataToken.role == "enfermeria") {
      this.selectProveedor.fuente = "ENT";
      this.selectProveedor.proveedor = "DISTRIBUIDORA FARMACEUTICA ECUATORIANA DIFARE S.A";
      this.selectProveedor.cedrucpas = "0990858322001";
      this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
        this.listBodega = dato;
      });
    } else {
      if (this.conexcionService.UserDataToken.role == "gpv-o" || this.conexcionService.UserDataToken.role == "verificador-bodeguero-h") {
        this._variosService.getBodegasTipo("OFICINAS-PUERTO").subscribe(dato => {
          this.listBodega = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
        });
      } else {
        this._variosService.getBodegasTipo("P MANACRIPEX-PUERTO").subscribe(dato => {
          if (this.conexcionService.UserDataToken.role == "bodega_verificador-m")
            this.listBodega = dato.filter(x => x.tipoBodega == "P MANACRIPEX");
          else this.listBodega = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
        });
      }
    }
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
    }
    this.spinnerOnOff = 0;
    this.autoFocus = false;
    if (this._conexcionService.UserDataToken.role == 'gpv-o' || this.conexcionService.UserDataToken.role == "verificador-bodeguero-h")
      this._ordenECService.formData = new cOrdenEC("OFICINAS", this._conexcionService.UserDataToken.name);
    if (this._conexcionService.UserDataToken.role == 'tinabg-m' || this._conexcionService.UserDataToken.role == 'bodega_verificador-m' || this._conexcionService.UserDataToken.role == 'verificador-bodeguero')
      this._ordenECService.formData = new cOrdenEC("P MANACRIPEX", this._conexcionService.UserDataToken.name);
    if (this._conexcionService.UserDataToken.role == 'enfermeria')
      this._ordenECService.formData = new cOrdenEC("ENFERMERIA", this._conexcionService.UserDataToken.name);
  }

  onSubmit(form: NgForm) {
    this.okBttnSubmit = 1;
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
                if (indexTemporal != -1) {
                  if (this._ordenECService.formData.listPtemporales[indexTemporal].producto.codigo == "Temp")
                    this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock = this._ordenECService.formData.listPcomprasO[i].refenciaTemporalId;
                }
              }
            }
          }
          this.actualizar();
        }
      } else {
        this._ordenECService.formData.factura = 0;
        for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
          this._ordenECService.formData.listPcomprasO[i].cargaIva12 = false;
          this._ordenECService.formData.listPcomprasO[i].cargaIva15 = false;
          this._ordenECService.formData.listPcomprasO[i].producto.estado = 3;
          if (this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock == undefined) {
            this._ordenECService.formData.listPcomprasO[i].producto.contenidoNeto = 1;
            this._ordenECService.formData.listPcomprasO[i].producto.nombre = "Temp-" + this._ordenECService.formData.listPcomprasO[i].descripcionProducto;
            this._ordenECService.formData.listPcomprasO[i].producto.codigo = "Temp";
            this._ordenECService.formData.listPcomprasO[i].producto.agregarOneBodega(null, this._ordenECService.formData.listPcomprasO[i].destinoBodega);
          } else this.ordenECService.formData.listPcomprasO[i].precio = 0;
          this._ordenECService.formData.listPcomprasO[i].estadoCompra = "Temporal";
        }
        this.guardar();
      }
    } else {
      if (this._ordenECService.formData.planta == "ENFERMERIA") {
        if (this.ordenECService.formData.listPcomprasO.find(x => (x.fechaVencimientoMedic == null && x.loteMedic != null)) == null) {
          if (this.ordenECService.formData.estadoProceso == "Pendiente Verificación") {
            if (this.selectBarcoCompra != "SIN ASIGNAR") {
              if (this.conexcionService.UserDataToken.sub == "dr3")
                if (this.ordenECService.formData.listPcomprasO.find(x => x.loteMedic == null || x.loteMedic == "") != null)
                  this.ordenECService.formData.estadoProceso = "Pendiente";
              if (this.selectBarcoCompra == 'ENFERMERIA GENERAL')
                this.ordenECService.formData.estadoProceso = "Procesada";
              this.ordenECService.formData.listPcomprasO.forEach(x => {
                x.destinoBodega = this.selectBarcoCompra;
                if (this.selectBarcoCompra != "ENFERMERIA GENERAL") {
                  x.estadoCompra = "Pendiente Verificación";
                  if (x.loteMedic == null || x.loteMedic == "")
                    x.estadoCompra = "Pendiente";
                }
              });
            } else this.okBttnSubmit = 3;
          } else {
            for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
              if (this._ordenECService.formData.listPcomprasO[i].loteMedic != null) {
                this._ordenECService.formData.listPcomprasO[i].estadoCompra == "Pendiente Lote" ? this._ordenECService.formData.listPcomprasO[i].estadoCompra = "Procesada" : this._ordenECService.formData.listPcomprasO[i].estadoCompra = "Pendiente Verificación";
                this._ordenECService.formData.listPcomprasO[i].marcar = true;
              } else {
                this._ordenECService.formData.listPcomprasO.splice(i, 1);
                i--;
              }
            }
          }
          this._ordenECService.formData.marea = this._ordenECService.formData.marea + "-" + this.fechaHoy.anio;
          if (this.ordenECService.formData.idOrdenE_C != undefined && (this.ordenECService.formData.estadoProceso == "Pendiente Lote" || this.ordenECService.formData.estadoProceso == "Pendiente")) {
            this.okBttnSubmit = 3;
            this.actualizar();
          }
        } else this.okBttnSubmit = 3;
      }
      if (this.okBttnSubmit == 1) {
        if (this._ordenECService.formData.listPcomprasO.find(x => x.cantidad == 0 || (x.destinoBodega == "SIN ASIGNAR" && x.marcar)) == undefined) {
          if (this._ordenECService.formData.factura == null)
            this._ordenECService.formData.factura = 0;
          if (this._ordenECService.formData.guiaRemision == null)
            this._ordenECService.formData.guiaRemision = 0;
          for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
            if (!this._ordenECService.formData.listPcomprasO[i].marcar) {
              this._ordenECService.formData.listPcomprasO.splice(i, 1);
              i--;
            } else {
              if (this._ordenECService.formData.listPcomprasO[i].producto.idProductoStock == undefined)
                this._ordenECService.formData.listPcomprasO[i].producto.nombre = this._ordenECService.formData.listPcomprasO[i].descripcionProducto;
              if (this._ordenECService.formData.listPcomprasO[i].producto.tipoUnidad == "UNIDAD") {
                this._ordenECService.formData.listPcomprasO[i].producto.contenidoNeto = 1;
                this._ordenECService.formData.listPcomprasO[i].producto.precioNeto = 0;
              } else {
                if (this.ordenECService.formData.listPcomprasO[i].producto.precioNeto == 0)
                  this.onSepararContenidoNeto(i);
              }
              for (var j = i; j < this.ordenECService.formData.listPcomprasO.length - 1; j++) {
                if (this.ordenECService.formData.listPcomprasO[i].producto.codigo == this.ordenECService.formData.listPcomprasO[j + 1].producto.codigo && this.ordenECService.formData.listPcomprasO[i].descripcionProducto == this.ordenECService.formData.listPcomprasO[j + 1].descripcionProducto) {
                  this.ordenECService.formData.listPcomprasO[i].cantidad = this.ordenECService.formData.listPcomprasO[i].cantidad + this.ordenECService.formData.listPcomprasO[j + 1].cantidad;
                  this.ordenECService.formData.listPcomprasO[i].calcularPrecio();
                  this._ordenECService.formData.listPcomprasO.splice(j + 1, 1);
                  j--;
                }
              }
            }
          }
          if (this.ordenECService.formData.listPcomprasO.find(x => x.destinoBodega.includes("BP") || x.destinoBodega.includes("HELICOPTERO")) != undefined && this.ordenECService.formData.planta != "ENFERMERIA")
            this.ordenECService.formData.planta = this.ordenECService.formData.planta + "-BARCOS";

          this.guardar();
        } else this.okBttnSubmit = 3;
      }
    }
  }

  onTerminar() {
    if (this.isOpen)
      this.cerrar.emit(true);
    else this.resetForm();
  }

  guardar() {
    this._ordenECService.insertarOrdenCompra(this._ordenECService.formData).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          if (res.message == "Registro Existente")
            this.toastr.warning('Aviso Importante', 'La factura ya ha sido registrada anteriormente');
          if (res.message == "Ok") {
            if (this._ordenECService.formData.planta == "ENFERMERIA") {
              this.sendMediaMessageMedic(this.ordenECService.formData, this._conexcionService.UserDataToken.sub == 'dr3' ? '593-999786121' : this.listBodega.find(x => x.nombreBodega == this.selectBarcoCompra).listEncargados.find(x => x.cargo == 'BODEGUERO ENFERMERIA').telefono);
            }
            if (this._ordenECService.formData.planta == "P MANACRIPEX") {
              var auxBodegas: cBodega[] = [];
              for (var i = 0; i < this._ordenECService.formData.listPcomprasO.length; i++) {
                var auxBodega = this.listBodega.find(x => x.nombreBodega == this._ordenECService.formData.listPcomprasO[i].destinoBodega);
                if (auxBodega.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name) == null) {
                  if (auxBodegas.find(x => x.nombreBodega == auxBodega.nombreBodega) == undefined) {
                    auxBodegas.push(auxBodega);
                    this.sendMediaMessageTraspaso(this._ordenECService.formData, auxBodega);
                  }
                }
              }
            }
            this.toastr.success('Registro Exitoso', 'La compra se ha registrado satisfactoriamente');
          }
          this.onTerminar();
        } else {
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
    var paramsExtra = "";
    if (this.ordenECService.formData.planta == "ENFERMERIA") {
      paramsExtra = "@" + this.selectBarcoCompra;
    }
    this._enterpriceServise.getDocumento(this._ordenECService.formData.factura + "@" + this._selectProveedor.cedrucpas + paramsExtra)
      .subscribe((dato: any) => {
        var strTexto = "Revisar que la infomación ingresada es correcta!";
        var strTitulo = "No se ha Encontrado Coincidencia";
        var btn2Boton = "Revisar!";
        var btn1Boton = "Nuevo Registro!";

        if (dato.message == "ok" && dato.compra != null) {
          strTitulo = "Factura Encontrada!";
          strTexto = "Se encontro " + dato.compra.tp_documento + ': ' + dato.compra.factura + " emitida el " + dato.compra.emi_fecha.substring(0, 10) + ", bajo la razón social: " + dato.compra.rs_cliente;
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
          strTexto = "Se encontro " + dato.compra.tp_documento + " registrada el " + dato.fecha.substring(0, 10) + ", bajo la razón social: " + dato.compra.rs_cliente;
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
        if (dato.message == "Lotes Incompletos" && dato.compraPendiente != null) {
          strTitulo = "Lotes Incompletos!";
          strTexto = "Se encontro " + dato.compraPendiente.factura + " registrada el " + dato.compraPendiente.fechaRegistroBodega.substring(0, 10) + ", para el barco: " + dato.compraPendiente.listPcomprasO[0].destinoBodega;
          btn1Boton = "Continuar!";
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
              if (btn1Boton == "Continuar!") {
                this.ordenECService.formData.completar(dato.compraPendiente);
                this.selectBarcoCompra = this.ordenECService.formData.listPcomprasO[0].destinoBodega;
                this.ordenECService.formData.marea = (this.ordenECService.formData.marea.split("-"))[0];
                this.ordenECService.formData.sumTotalLibre();
                this.spinnerOnOff = 2;
                this.paginacion.getNumberIndex(this._ordenECService.formData.listPcomprasO.length);
                this.paginacion.updateIndex(0);
              }
            } else this.resetForm();
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
      if (this.selectProveedor.proveedor != null && (this._ordenECService.formData.factura != null || this._ordenECService.formData.guiaRemision != null)&&(this.conexcionService.UserDataToken.role!="enfermeria"||(this.conexcionService.UserDataToken.role=="enfermeria"&& this.selectBarcoCompra!="SIN ASIGNAR"))) {
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
      this._ordenECService.formData.idCompraAutomatica = datoCompra.iddocumento;
      this._ordenECService.formData.factura = Number(datoCompra.factura);
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
              if (datoCompra.listCompraO[i].codigoprincipal == null || datoCompra.listCompraO[i].codigoprincipal == "") {
                if (datoCompra.listCompraO[i].codigoauxiliar == null || datoCompra.listCompraO[i].codigoauxiliar == "") {
                  datoCompra.listCompraO[i].codigoprincipal = "COD_" + datoCompra.listCompraO[i].descripcion.toUpperCase();
                } else datoCompra.listCompraO[i].codigoprincipal = datoCompra.listCompraO[i].codigoauxiliar;
              }
              if ((indexP = dato.data.findIndex(x => x.codigo == datoCompra.listCompraO[i].codigoprincipal && x.nombre == datoCompra.listCompraO[i].descripcion)) != -1) {
                auxArticuloCompra.productoId = dato.data[indexP].idProductoStock;
                auxArticuloCompra.rellenarProducto(dato.data[indexP]);
                auxArticuloCompra.producto.precioUltima = auxArticuloCompra.producto.precioStandar;
                auxArticuloCompra.destinoBodega = auxArticuloCompra.producto.SelectBodega;
                if (auxArticuloCompra.producto.tipoUnidad != "UNIDAD")
                  auxArticuloCompra.producto.disBttnInput = 1;
              }
              else {
                var auxProductoNew: cProducto_B = new cProducto_B(this._ordenECService.formData.planta, this._ordenECService.formData.proveedor);
                this.ordenECService.formData.planta == "ENFERMERIA" ? auxProductoNew.estado = 2 : auxProductoNew.estado = 1;

                auxProductoNew.codigo = datoCompra.listCompraO[i].codigoprincipal;
                auxProductoNew.nombre = datoCompra.listCompraO[i].descripcion.toUpperCase();
                auxProductoNew.precioStandar = Number(datoCompra.listCompraO[i].precio.toFixed(4));
                auxArticuloCompra.descripcionProducto = datoCompra.listCompraO[i].descripcion;
                auxArticuloCompra.rellenarProducto(auxProductoNew);
              }
            } else {
              var auxProductoNew: cProducto_B = new cProducto_B(this._ordenECService.formData.planta, this._ordenECService.formData.proveedor);
              this.ordenECService.formData.planta == "ENFERMERIA" ? auxProductoNew.estado = 2 : auxProductoNew.estado = 1;

              if (datoCompra.listCompraO[i].codigoprincipal == null || datoCompra.listCompraO[i].codigoprincipal == "") {
                if (datoCompra.listCompraO[i].codigoauxiliar == null || datoCompra.listCompraO[i].codigoauxiliar == "") {
                  auxProductoNew.codigo = "COD_" + datoCompra.listCompraO[i].descripcion.toUpperCase();
                } else auxProductoNew.codigo = datoCompra.listCompraO[i].codigoauxiliar;
              } else auxProductoNew.codigo = datoCompra.listCompraO[i].codigoprincipal;
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
                auxArticuloCompra.disableSelectBodega = true;
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
      if (this._conexcionService.UserDataToken.role == 'gpv-o')
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

  onSepararContenidoNeto(index: number) {
    if (this._ordenECService.formData.listPcomprasO[index].producto.tipoUnidad == "CONTENIDO NETO") {
      this.ordenECService.formData.listPcomprasO[index].producto.precioNeto = Number(((this._ordenECService.formData.listPcomprasO[index].precio - this.ordenECService.formData.listPcomprasO[index].descuento) / this.ordenECService.formData.listPcomprasO[index].producto.contenidoNeto).toFixed(2));
    }
    if (this._ordenECService.formData.listPcomprasO[index].producto.tipoUnidad == "EQUIVALENCIA")
      this.ordenECService.formData.listPcomprasO[index].producto.precioNeto = Number(((this._ordenECService.formData.listPcomprasO[index].precio - this.ordenECService.formData.listPcomprasO[index].descuento) * this.ordenECService.formData.listPcomprasO[index].producto.contenidoNeto).toFixed(2));
  }

  onTransformarUnidad(index) {
    this.ordenECService.formData.listPcomprasO[index].producto.precioStandar = Number((this._ordenECService.formData.listPcomprasO[index].totalInd / (Number((this._ordenECService.formData.listPcomprasO[index].cantidad / this.ordenECService.formData.listPcomprasO[index].producto.contenidoNeto).toFixed(2)))).toFixed(2));
  }

  onConvertPdfOne(bodegaIn: string) {
    var y: number;
    var Npag: number = 1;
    var doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(18);
    doc.setFont("arial", "bold");
    if (this._ordenECService.formData.planta == "ENFERMERIA")
      doc.text("Inventario", 115, 15);
    else doc.text("Material Traspaso", 115, 15);

    doc.setFontSize(13);
    if (this._ordenECService.formData.planta == "ENFERMERIA" && this.selectBarcoCompra != "ENFERMERIA GENERAL")
      doc.text("Barco: " + this.selectBarcoCompra, 200, 25);
    else doc.text("Bodega: " + bodegaIn, 20, 25);
    y = 30;

    doc.setFontSize(10);
    doc.setFont("arial", "bold");
    doc.line(5, (y), 290, (y));//down
    doc.line(5, y, 5, (y + 10));//left
    doc.line(290, y, 290, (y + 10));//right
    doc.line(5, (y + 10), 290, (y + 10));//down

    doc.text("#", 10, (y + 7));
    doc.line(20, y, 20, (y + 10));//right
    doc.text("Código", 40, (y + 7));
    doc.line(70, y, 70, (y + 10));//right

    if (this.ordenECService.formData.planta == "ENFERMERIA") {
      doc.text("Cantidad", 73, (y + 7));
      doc.line(90, y, 90, (y + 10));//right
      doc.text("Cont.Neto", 92, (y + 7));
      doc.line(110, y, 110, (y + 10));//right
      doc.text("Unidades G.", 113, (y + 7));
      doc.line(135, y, 135, (y + 10));//right
      doc.text("Descripción", 170, (y + 7));
      doc.line(220, y, 220, (y + 10));//right
      doc.text("Lote", 240, (y + 7));
      doc.line(260, y, 260, (y + 10));//right
      doc.text("F. Vencimiento", 263, (y + 7));
    }
    else {
      doc.text("Cantidad", 75, (y + 7));
      doc.line(95, y, 95, (y + 10));//right
      doc.text("Cont.Neto", 100, (y + 7));
      doc.line(120, y, 120, (y + 10));//right
      doc.text("Unidades G.", 125, (y + 7));
      doc.line(150, y, 150, (y + 10));//right
      doc.text("Descripción", 200, (y + 7));
    }

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    var valorG: number = 10;

    var auxListaCompras: cCompraO[] = this._ordenECService.formData.listPcomprasO;
    if (bodegaIn != "SIN ASIGNAR")
      auxListaCompras = this._ordenECService.formData.listPcomprasO.filter(x => x.destinoBodega == bodegaIn);

    for (var i = 0; i < auxListaCompras.length; i++) {
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

        doc.text("#", 10, (y + 7));
        doc.line(20, y, 20, (y + 10));//right
        doc.text("Código", 40, (y + 7));
        doc.line(70, y, 70, (y + 10));//right
        if (this.ordenECService.formData.planta == "ENFERMERIA") {
          doc.text("Cantidad", 73, (y + 7));
          doc.line(90, y, 90, (y + 10));//right
          doc.text("Cont.Neto", 92, (y + 7));
          doc.line(110, y, 110, (y + 10));//right
          doc.text("Unidades G.", 113, (y + 7));
          doc.line(135, y, 135, (y + 10));//right
          doc.text("Descripción", 170, (y + 7));
          doc.line(220, y, 220, (y + 10));//right
          doc.text("Lote", 240, (y + 7));
          doc.line(260, y, 260, (y + 10));//right
          doc.text("F. Vencimiento", 265, (y + 7));
        }
        else {
          doc.text("Cantidad", 75, (y + 7));
          doc.line(95, y, 95, (y + 10));//right
          doc.text("Cont.Neto", 100, (y + 7));
          doc.line(120, y, 120, (y + 10));//right
          doc.text("Unidades G.", 125, (y + 7));
          doc.line(150, y, 150, (y + 10));//right
          doc.text("Descripción", 200, (y + 7));
        }
        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(5, (y - valorG), 5, y);//left
      doc.line(290, (y - valorG), 290, y);//right

      doc.text(i.toString() + 1, 10, (y - ((valorG - 3) / 2)));
      doc.line(20, (y - valorG), 20, y);//right
      doc.text(auxListaCompras[i].producto.codigo, 25, (y - ((valorG - 3) / 2)));
      doc.line(70, (y - valorG), 70, y);//right
      if (this.ordenECService.formData.planta == "ENFERMERIA") {
        doc.text(auxListaCompras[i].cantidad.toString(), 80, (y - ((valorG - 3) / 2)));
        doc.line(90, (y - valorG), 90, y);//right
        doc.text(auxListaCompras[i].producto.contenidoNeto.toString(), 98, (y - ((valorG - 3) / 2)));
        doc.line(110, (y - valorG), 110, y);//right
        doc.text((auxListaCompras[i].producto.contenidoNeto * auxListaCompras[i].cantidad) + "", 120, (y - ((valorG - 3) / 2)));
        doc.line(135, (y - valorG), 135, y);//right
        doc.text(auxListaCompras[i].producto.nombre, 140, (y - ((valorG - 3) / 2)));
        doc.line(220, (y - valorG), 220, y);//right

        doc.line(260, (y - valorG), 260, y);//right
        if (auxListaCompras[i].loteMedic == null && auxListaCompras[i].fechaVencimientoMedic == null) {
          doc.text("SIN ASIGNAR", 225, (y - ((valorG - 3) / 2)));
          doc.text("SIN ASIGNAR", 265, (y - ((valorG - 3) / 2)));
        } else {
          doc.text(auxListaCompras[i].loteMedic + "", 225, (y - ((valorG - 3) / 2)));
          doc.text(auxListaCompras[i].fechaVencimientoMedic + "", 265, (y - ((valorG - 3) / 2)));
        }
      }
      else {
        doc.text(auxListaCompras[i].cantidad.toString(), 80, (y - ((valorG - 3) / 2)));
        doc.line(95, (y - valorG), 95, y);//right
        doc.text(auxListaCompras[i].producto.contenidoNeto.toString(), 105, (y - ((valorG - 3) / 2)));
        doc.line(120, (y - valorG), 120, y);//right
        doc.text((auxListaCompras[i].producto.contenidoNeto * auxListaCompras[i].cantidad) + "", 130, (y - ((valorG - 3) / 2)));
        doc.line(150, (y - valorG), 150, y);//right
        doc.text(auxListaCompras[i].producto.nombre, 155, (y - ((valorG - 3) / 2)));

      }
      doc.line(5, y, 290, y);//down
    }
    return (doc.output('datauristring'));
  }

  sendMediaMessageMedic(orden: cOrdenEC, telefonoIn: string) {
    var auxBase = this.onConvertPdfOne("SIN ASIGNAR").split('base64,');
    var auxWhatsapp: cWhatsapp;
    auxWhatsapp = {
      phone: telefonoIn,
      message: "",
      caption: "",
      title: orden.planta + "_" + orden.fechaRegistroBodega + "-" + orden.factura + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    auxWhatsapp.caption = ':bell: *Notificación Compra Medicamento*:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos Compañero:'
      + '\nSe le informa que se ha registrado una nueva compra de medicamentos para el barco *' + this.selectBarcoCompra + '*.'
      + '\nLos datos de la compra son:'
      + '\n'
      + '\n*Factura:* ' + orden.factura
      + '\n*Fecha de Registro* ' + orden.fechaRegistroBodega
      + '\n*Usuario:* ' + orden.guardiaCargoUser
      + '\n----------------------------------';

    this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
      res => {
      },
      err => {
        console.log(err);
      }
    )
  }

  sendMediaMessageTraspaso(orden: cOrdenEC, auxBodega: cBodega) {
    var auxBase = this.onConvertPdfOne(auxBodega.nombreBodega).split('base64,');
    var auxWhatsapp: cWhatsapp;
    auxWhatsapp = {
      phone: auxBodega.telefonoEncargado,
      message: "",
      caption: "",
      title: orden.planta + "_" + orden.fechaRegistroBodega + "-" + orden.factura + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    auxWhatsapp.caption = ':bell: *Notificación Compra Material*:exclamation: :bell:'
      + '\n'
      + '\n:wave: Saludos Compañero:'
      + '\nSe le informa que se ha comprado material para la bodega *' + auxBodega.nombreBodega + '*.'
      + '\nLos materiales fueron trasladados a su respectivo lugar'
      + '\nLos datos de la compra son:'
      + '\n'
      + '\n*Factura:* ' + orden.factura
      + '\n*Fecha de Registro* ' + orden.fechaRegistroBodega
      + '\n*Usuario:* ' + orden.guardiaCargoUser
      + '\n----------------------------------';

    this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
      res => {
      },
      err => {
        console.log(err);
      }
    )
  }
}
