import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faPlus, faSave, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { cBodega, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cEnterpriceProveedor, cFecha, cVario, cWhatsapp } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { cArticulosPedido, cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { jsPDF } from "jspdf";
import { ProveedorService } from 'src/app/shared/otrosServices/proveedor.service';

@Component({
  selector: 'app-orden-pedido',
  templateUrl: './orden-pedido.component.html',
  styles: []
})

export class OrdenPedidoComponent implements OnInit {
  public get proveedorService(): ProveedorService {
    return this._proveedorService;
  }
  public set proveedorService(value: ProveedorService) {
    this._proveedorService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }
  public get ordenPedidoService(): OrdenPedidoService {
    return this._ordenPedidoService;
  }
  public set ordenPedidoService(value: OrdenPedidoService) {
    this._ordenPedidoService = value;
  }

  fechaHoy = new cFecha();
  spinnerOnOff: number = 0;
  listProductosIn: cProducto_B[] = [];
  listBarcos: cBodega[] = [];
  listAreas: cBodega[] = [];
  listVehiculos: cBodega[] = [];
  guardarDataProveedor: cEnterpriceProveedor;
  listProveedoresFiltros$: any;

  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;

  fasave = faSave; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes;
  constructor(private _conexcionService: ConexionService, private _ordenPedidoService: OrdenPedidoService, private enterpriceService: ApiEnterpriceService, private _proveedorService: ProveedorService, private toastr: ToastrService, private _variosService: VariosService, private whatsappService: WhatsappService) {
  }

  ngOnInit(): void {
    this.resetForm();
    this.cargarData();
  }

  cargarProductosProveedor(proveedorIn: string) {
    this.spinnerOnOff = 1;
    this.enterpriceService.getProductoProveedor(proveedorIn).subscribe((dato: any) => {
      this.listProductosIn = [];
      this.spinnerOnOff = 2;
      if (dato.exito == 1) {
        this.listProductosIn = dato.data;
      }
      if (this.ordenPedidoService.formData.area != "SIN ASIGNAR")
        this.ordenPedidoService.formData.agregarOneMaterial();
    }, error => console.error(error));
  }

  cargarData() {
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
    });
    this._variosService.getBodegasTipo("VEHICULO").subscribe(dato => {
      this.listVehiculos = dato;
    });
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta") {
      this._variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
        this.listAreas = dato;
      });
    }
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (this.conexcionService.UserR.rolAsignado == "pedido-flota")
      this.ordenPedidoService.formData = new cOrdenPedido(this._conexcionService.UserR.nombreU, "FLOTA");
    if (this.conexcionService.UserR.rolAsignado == "pedido-planta")
      this.ordenPedidoService.formData = new cOrdenPedido(this._conexcionService.UserR.nombreU, "P MANACRIPEX");
    if (this.conexcionService.UserR.rolAsignado == "pedido-super")
      this.ordenPedidoService.formData = new cOrdenPedido(this._conexcionService.UserR.nombreU, "P OFICINAS");
    this.spinnerOnOff = 0;
    this.okBttnSubmit = true;
  }

  onBListProgProveedor(value: string) {
    this.ordenPedidoService.formData.spinnerLoadingP = true;
    this.ordenPedidoService.formData.showSearchSelect = true;
    this.ordenPedidoService.formData.proveedor = value;
    this.ordenPedidoService.formData.listArticulosPedido = [];
    this.listProductosIn = [];
    if (value)
      this.listProveedoresFiltros$ = this.proveedorService.getProveedorSearch(value).pipe(
        map((x: cEnterpriceProveedor[]) => {
          return x;
        }),
        finalize(() => this.ordenPedidoService.formData.spinnerLoadingP = false)
      );
    else {
      this.ordenPedidoService.formData.spinnerLoadingP = false
      this.listProveedoresFiltros$ = null;
    }
  }

  onChooseProveedor(data: cEnterpriceProveedor) {
    this.ordenPedidoService.formData.showSearchSelect = false;
    if (data != null) {
      this._ordenPedidoService.formData.proveedor = data.proveedor;
      this.cargarProductosProveedor(data.cedrucpas);
      this.guardarDataProveedor = data;
    } else {
      this.guardarDataProveedor = null;
      this.spinnerOnOff = 2;
      this.listProductosIn = [];
    }
  }

  async onSubmit(form: NgForm) {
    this.okBttnSubmit = false;
    if (this.comprobarNewR()) {
      let fechaSeparar = this.ordenPedidoService.formData.fechaPedido.split("-");
      this.ordenPedidoService.formData.numSecuencial = fechaSeparar[1] + "-" + fechaSeparar[0];
      var auxOrdenesG: cOrdenPedido[] = [];
      var fechaHoy: cFecha = new cFecha();

      this.ordenPedidoService.formData.fechaAprobacion = fechaHoy.strFecha;
      if (this.conexcionService.UserR.nombreU == "CARLOS CEBALLOS" || this.conexcionService.UserR.nombreU == "JORGE SALAME" || this.conexcionService.UserR.nombreU == "PRUEBAG") {
        this.ordenPedidoService.formData.responsableAprobacion = this.conexcionService.UserR.nombreU;
        this.ordenPedidoService.formData.estadoProceso = "Pendiente Verificación";
        this.ordenPedidoService.formData.fechaAprobacion = this.ordenPedidoService.formData.fechaAprobacion + "T" + fechaHoy.strHoraA;
      }
      this.ordenPedidoService.formData.fechaPedido = this.ordenPedidoService.formData.fechaPedido + "T" + fechaHoy.strHoraA;
      this.ordenPedidoService.formData.sacarRuc();
      for (var i = 0; i < this.ordenPedidoService.formData.listArticulosPedido.length - 1; i++) {
        for (var j = i + 1; j < this.ordenPedidoService.formData.listArticulosPedido.length; j++) {
          if (this.ordenPedidoService.formData.listArticulosPedido[i].inventario.codigo == this.ordenPedidoService.formData.listArticulosPedido[j].inventario.codigo &&
            this.ordenPedidoService.formData.listArticulosPedido[i].inventario.nombre == this.ordenPedidoService.formData.listArticulosPedido[j].inventario.nombre) {
            if (this.ordenPedidoService.formData.listArticulosPedido[i].destinoArea == this.ordenPedidoService.formData.listArticulosPedido[j].destinoArea) {
              this.ordenPedidoService.formData.listArticulosPedido[i].cantidad += this.ordenPedidoService.formData.listArticulosPedido[j].cantidad;
              this.ordenPedidoService.formData.listArticulosPedido.splice(j, 1);
              j--;
            }
          }
        }
      }
      var index = -1;

      for (var i = 0; i < this.ordenPedidoService.formData.listArticulosPedido.length; i++) {
        this.ordenPedidoService.formData.listArticulosPedido[i].inventario.planta = this.ordenPedidoService.formData.planta;
        this.ordenPedidoService.formData.listArticulosPedido[i].cantidadPendiente = this.ordenPedidoService.formData.listArticulosPedido[i].cantidad;

        index = auxOrdenesG.findIndex(x => x.strLugarA == this.ordenPedidoService.formData.listArticulosPedido[i].destinoArea)
        if (index == -1) {
          var auxOrden: cOrdenPedido = JSON.parse(JSON.stringify(this.ordenPedidoService.formData));
          auxOrden.strLugarA = this.ordenPedidoService.formData.listArticulosPedido[i].destinoArea;
          auxOrden.listArticulosPedido = [];
          auxOrden.listArticulosPedido.push(this.ordenPedidoService.formData.listArticulosPedido[i]);
          auxOrdenesG.push(auxOrden);
        } else auxOrdenesG[index].listArticulosPedido.push(this.ordenPedidoService.formData.listArticulosPedido[i]);
      }
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      for (var i = 0; i < auxOrdenesG.length; i++) {
        await sleep(2000 * i);
        this.guardar(auxOrdenesG[i]);
      }
      await sleep(2000);
      this.resetForm();
    } else this.okBttnSubmit = true;
  }

  onNewItem() {
    if (this.spinnerOnOff == 2 && this.ordenPedidoService.formData.area != "SIN ASIGNAR") {
      if (this.comprobarNewR()) {
        this.ordenPedidoService.formData.agregarOneMaterial();
      }
    } else this.okAddNewBotton = false;
  }

  guardar(datoOrden: cOrdenPedido) {
    if(this.conexcionService.UserR.nombreU!="PRUEBAG")
    this.ordenPedidoService.insertarOrdenPedido(datoOrden).subscribe(
      (res: any) => {
        if (res.exito == 1) {
          this.toastr.success('Registro satisfactorio', 'Pedido Registrado');
          datoOrden.numSecuencial = res.data.numSecuencial;
          this.sendMessageGroupNotification(JSON.parse(JSON.stringify(datoOrden)));
        } else {
          this.okBttnSubmit = false;
          this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
        };
      });
    else this.sendMessageGroupNotification(JSON.parse(JSON.stringify(datoOrden)));
  }

  comprobarNewR() {
    var flag = true;
    if (this.ordenPedidoService.formData.listArticulosPedido.find(x => (x.cantidad <= 0 || x.spinnerLoading != 3 || x.destinoArea == "SIN ASIGNAR")) != undefined) {
      flag = false;
    }
    this.okAddNewBotton = flag;
    return (flag);
  }

  onRemoveNewR(indice) {
    var auxLR: cArticulosPedido[] = [];
    if (this.ordenPedidoService.formData.listArticulosPedido.length > 1) {
      this.ordenPedidoService.formData.listArticulosPedido.splice(indice, 1);
      auxLR = JSON.parse(JSON.stringify(this.ordenPedidoService.formData.listArticulosPedido));
      this.ordenPedidoService.formData.listArticulosPedido = [];
      this.ordenPedidoService.formData.listArticulosPedido = JSON.parse(JSON.stringify(auxLR));
    }
    this.comprobarNewR();
  }

  onListProducto(index: number, op: number, value: string | null) {
    if (value != null) {
      this.ordenPedidoService.formData.listArticulosPedido.forEach(x => x.showSearchSelect = 0);
      this.ordenPedidoService.formData.listArticulosPedido[index].showSearchSelect = op;
      this.ordenPedidoService.formData.listArticulosPedido[index].spinnerLoading = op;
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.resetProducto();
      if (value != "") {
        if (op == 1)
          this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = value;
        else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre = value;
      } else {
        this.ordenPedidoService.formData.listArticulosPedido[index].spinnerLoading = 0;
        this.ordenPedidoService.formData.listArticulosPedido[index].showSearchSelect = 0;
      }
    }
  }

  onChooseElemente(index, op: number, data?: cProducto_B) {
    this.ordenPedidoService.formData.listArticulosPedido[index].showSearchSelect = 0;
    this.ordenPedidoService.formData.listArticulosPedido[index].spinnerLoading = 3;
    if (data == null) {
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.contenidoNeto = 1;
      if (this.ordenPedidoService.formData.planta == "FLOTA")
        this.ordenPedidoService.formData.listArticulosPedido[index].inventario.planta = "FLOTA";
      else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.planta = "P MANACRIPEX";
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.proveedor = this.ordenPedidoService.formData.proveedor;
      if (op == 1) {
        var auxAux = this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo.split("COD_INV:");
        if (auxAux.length == 2) {
          this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre = auxAux[1];
        } else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre = this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo;
        this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = "COD_INV:" + this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre;
      } else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = "COD_INV:" + this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre;
    }
    else {
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.rellenarObjeto(data);
      if (this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo == null || this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo == "") {
        this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = "COD_INV:" + this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre;
      }
    }
    this.ordenPedidoService.formData.listArticulosPedido[index].inventario.disBttnInput = op;
  }

  convertPdf(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold");

    let auxSecuencial = orden.numSecuencial.split("-");
    var strDestino: string;
    doc.text("Orden de Pedido " + auxSecuencial[1], 75, 20);

    y = 25;
    doc.setFontSize(13);
    doc.text("Datos de la orden", 20, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Fecha de Registro: " + orden.fechaPedido, 15, (y + 10));
    doc.text("Empresa: " + orden.empresa, 80, (y + 10));
    doc.text("RUC: " + orden.strRuc, 140, (y + 10));
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 15, (y + 15));
    strDestino = "Lugar: " + orden.area + " - Sub-Área: " + orden.listArticulosPedido[0].destinoArea;
    doc.text(strDestino, 80, (y + 15));

    doc.text("Proveedor: " + orden.proveedor, 15, (y + 20));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 25));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 105, (y + 25));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 30));
    doc.setFont("arial", "normal");

    var auxH = y + 35;
    if (auxlinea.length > 1)
      auxH = auxH + 5 + ((3 * auxlinea.length) + 2);
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (auxH));//left
    doc.line(199, y, 199, auxH);//right
    doc.line(9, auxH, 199, auxH);//down

    y = auxH;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 70, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down

    doc.text("Código", 30, (y + 7));
    doc.line(60, y, 60, (y + 10));//right
    doc.text("Descripción", 80, (y + 7));
    doc.line(120, y, 120, (y + 10));//right
    doc.text("Cantidad", 122, (y + 7));
    doc.line(140, y, 140, (y + 10));//right
    doc.text("Observación", 160, (y + 7));

    doc.setFontSize(8);
    doc.setFont("arial", "normal");
    y = y + 10;

    var valorG: number = 0;
    var valorC: number;
    var valorN: number;
    var valorO: number;
    var lineaCodigo;
    var lineaNombre;
    var lineaObservacion;
    var auxPrueba: number;

    for (var i = 0; i < orden.listArticulosPedido.length; i++) {
      lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (45));
      lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
      lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (55));
      valorC = (3 * lineaCodigo.length) + 4;
      valorN = (3 * lineaNombre.length) + 4;
      valorO = (3 * lineaObservacion.length) + 4;

      if (valorC >= valorN && valorC >= valorO)
        valorG = valorC;
      if (valorN >= valorC && valorN >= valorO)
        valorG = valorN;
      if (valorO >= valorC && valorO >= valorN)
        valorG = valorO;

      y = y + valorG;

      if (y > 265) {
        doc.addPage();
        doc.setFontSize(11);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(9, y, 199, y);//up
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down

        doc.text("Código", 30, (y + 7));
        doc.line(60, y, 60, (y + 10));//right
        doc.text("Descripción", 80, (y + 7));
        doc.line(120, y, 120, (y + 10));//right
        doc.text("Cantidad", 122, (y + 7));
        doc.line(140, y, 140, (y + 10));//right
        doc.text("Observación", 160, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
      doc.text(lineaCodigo, 15, (y - valorG + auxPrueba));
      doc.line(60, (y - valorG), 60, y);//right
      auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
      doc.text(lineaNombre, 65, (y - valorG + auxPrueba));
      doc.line(120, (y - valorG), 120, y);//right
      doc.text(orden.listArticulosPedido[i].cantidad.toString(), 130, (y - ((valorG - 3) / 2)));
      doc.line(140, (y - valorG), 140, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
      if(orden.listArticulosPedido[i].aviso){
        doc.setTextColor(255,0,0);
        doc.text(lineaObservacion, 145, (y - valorG + auxPrueba));
        doc.setTextColor(0,0,0);
      }else doc.text(lineaObservacion, 145, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 265) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 265;
    var personaSubArea = null;
    personaSubArea = "Encargado " + orden.listArticulosPedido[0].destinoArea;

    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + personaSubArea, 146, y + 5);

    if (this.conexcionService.UserR.nombreU == "CARLOS CEBALLOS" || this.conexcionService.UserR.nombreU == "JORGE SALAME" || this.conexcionService.UserR.nombreU == "PRUEBAG")
      doc.save("Pedido_" + orden.numSecuencial + ".pdf");
    return (doc.output('datauristring'));
  }

  sendMessageGroupNotification(orden: cOrdenPedido) {
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp = {
      phone: "",
      chatname: "",
      message: "",
      title: "Pedido_" + orden.numSecuencial + ".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }
    var encabezado: string = ':bell: *Notificación Pedido ' + orden.empresa + '* :bell:';
    var asunto: string = "pedido a *" + orden.proveedor + "* para el área *" + orden.listArticulosPedido[0].destinoArea + "*";
    var lineaAux: string = '\n*Área:* ' + orden.listArticulosPedido[0].destinoArea;
    
    if (orden.planta == "P MANACRIPEX") {
      if (orden.estadoProceso == "Pendiente Aprobación")
        auxWhatsapp.phone = "593-999263188";
      else auxWhatsapp.chatname = "PEDIDOS MANACRIPEX";
      if (orden.area != "P MANACRIPEX") {
        asunto = "pedido a *" + orden.proveedor + "* para el barco *" + orden.area + "*";
        lineaAux = '\n*Barco:* ' + orden.area + ' :anchor:';
      }
    }
    if (orden.planta == "FLOTA") {
      asunto = "pedido a *" + orden.proveedor + "* para el barco *" + orden.area + "*";
      lineaAux = '\n*Barco:* ' + orden.area + ' :anchor:';
      if (orden.estadoProceso == "Pendiente Aprobación")
        auxWhatsapp.phone = "593-987402667";
      else auxWhatsapp.chatname = "PEDIDOS FLOTA PDF";
    }
    if (orden.planta == "P OFICINAS")
      auxWhatsapp.phone = "593-999486327";
    
    var auxNumSecuencial = orden.numSecuencial.split('-');
    auxWhatsapp.message = encabezado
      + '\n'
      + '\n:wave: Saludos:'
      + '\nSe les informa que se ha generado un ' + asunto
      + '\nLos datos del pedido son:'
      + '\n'
      + '\n*#' + auxNumSecuencial[1] + '*'
      + lineaAux
      + '\n*Fecha:* ' + orden.fechaPedido
      + '\n*Encargado del Pedido* ' + orden.cargoUser
      + '\n----------------------------------'
      + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
      + '\n----------------------------------';

    if (this.conexcionService.UserR.nombreU == "PRUEBAG") {
      auxWhatsapp.phone = "593-999786121";
      auxWhatsapp.chatname = "PEDIDOS FLOTA PDF";
    }

    if (orden.estadoProceso == "Pendiente Aprobación") {
      auxWhatsapp.chatname = "";
      this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
        res => {
          if (res.status != "error")
            this.toastr.success('Mensaje enviado Correctamente', 'Notificación enviada');
          else this.toastr.error('Error', 'Mensaje NO enviado');
        },
        err => {
          console.log(err);
        }
      );
    }
    else {
      auxWhatsapp.phone = "";
      this.whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
        res => {
          if (res.status == "error")
            this.toastr.error('Error', 'Mensaje NO enviado');
          else this.toastr.success('Mensaje enviado Correctamente', 'Notificación enviada');
          
          if (this.guardarDataProveedor != null) {
            if (this.guardarDataProveedor.telefono != null) {
              auxWhatsapp.chatname = "";
              if (this.conexcionService.UserR.nombreU == "PRUEBAG") {
                auxWhatsapp.phone = "593-999786121";
              }else auxWhatsapp.phone = this.guardarDataProveedor.telefono;
              this.whatsappService.sendMessageMedia(auxWhatsapp).subscribe(
                res => {
                  if (res.status != "error")
                    this.toastr.success('Mensaje enviado al Proveedor', 'Notificación enviada Proveedor');
                  else this.toastr.error('Error', 'Mensaje NO enviado');
                },
                err => {
                  console.log(err);
                }
              );
            }
          }
        },
        err => {
          console.log(err);
        }
      );
    }
  }
}