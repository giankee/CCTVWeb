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
import { stringify } from 'querystring';
@Component({
  selector: 'app-orden-pedido',
  templateUrl: './orden-pedido.component.html',
  styles: []
})

export class OrdenPedidoComponent implements OnInit {
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
  public get enterpriceServise(): ApiEnterpriceService {
    return this._enterpriceServise;
  }
  public set enterpriceServise(value: ApiEnterpriceService) {
    this._enterpriceServise = value;
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
  listProveedoresFiltros$: any;

  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;

  fasave = faSave; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes;
  constructor(private _conexcionService: ConexionService, private _ordenPedidoService: OrdenPedidoService, private _enterpriceServise: ApiEnterpriceService, private toastr: ToastrService, private _variosService: VariosService, private whatsappService: WhatsappService) { }

  ngOnInit(): void {
    this.resetForm();
    this.cargarData();
  }

  cargarProductosProveedor(proveedorIn: string) {
    this.spinnerOnOff = 1;
    this.enterpriceServise.getProductoProveedor(proveedorIn).subscribe((dato: any) => {
      this.listProductosIn = [];
      if (dato.exito == 1) {
        this.listProductosIn = dato.data;
        this.spinnerOnOff = 2;
        if(this.ordenPedidoService.formData.barco!="SIN ASIGNAR")
        this.ordenPedidoService.formData.agregarOneMaterial();
      } else this.spinnerOnOff = 0;
      
    }, error => console.error(error));
  }

  cargarData() {
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos=dato;
    });
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
    }
    this.ordenPedidoService.formData = new cOrdenPedido(this._conexcionService.UserR.nombreU);
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
      this.listProveedoresFiltros$ = this._enterpriceServise.getProveedorSearch(value).pipe(
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
    if(data!=null){
      this._ordenPedidoService.formData.proveedor = data.proveedor;
      this.cargarProductosProveedor(data.cedrucpas);
    }else{
      this.spinnerOnOff = 2;
      this.listProductosIn = [];
    }

  }

  async onSubmit(form: NgForm) {
    this.okBttnSubmit = false;
    if (this.comprobarNewR()) {
      let fechaSeparar= this.ordenPedidoService.formData.fechaPedido.split("-");
      this.ordenPedidoService.formData.numSecuencial=fechaSeparar[1]+"-"+fechaSeparar[0];
      var auxOrdenesG:cOrdenPedido[]=[];
      for (var i = 0; i < this.ordenPedidoService.formData.listArticulosPedido.length - 1; i++) {
        this.ordenPedidoService.formData.listArticulosPedido[i].inventario.planta = "FLOTA";
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
      var index=-1;
      for(var i=0; i<this.ordenPedidoService.formData.listArticulosPedido.length;i++){
        index= auxOrdenesG.findIndex(x=>x.listArticulosPedido[0].destinoArea==this.ordenPedidoService.formData.listArticulosPedido[i].destinoArea)
        if(index==-1){
          var auxOrden:cOrdenPedido= JSON.parse(JSON.stringify(this.ordenPedidoService.formData));
          auxOrden.listArticulosPedido=[];
          auxOrden.listArticulosPedido.push(this.ordenPedidoService.formData.listArticulosPedido[i]);
          auxOrdenesG.push(auxOrden);
        }else auxOrdenesG[index].listArticulosPedido.push(this.ordenPedidoService.formData.listArticulosPedido[i]);
      }
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      for(var i=0; i<auxOrdenesG.length;i++){
        await sleep(2000*i);
        this.guardar(auxOrdenesG[i])
      }
      await sleep(2000);
      this.resetForm(form);
    } else this.okBttnSubmit = true;
  }

  onNewItem() {
    if (this.spinnerOnOff == 2 && this.ordenPedidoService.formData.barco!="SIN ASIGNAR") {
      if (this.comprobarNewR()) {
        this.ordenPedidoService.formData.agregarOneMaterial();
      }
    } else this.okAddNewBotton = false;
  }

  guardar(datoOrden:cOrdenPedido){
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

  onListProducto(index: number, op: number, value: string) {
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

  onChooseElemente(index, op: number, data?: cProducto_B) {
    this.ordenPedidoService.formData.listArticulosPedido[index].showSearchSelect = 0;
    this.ordenPedidoService.formData.listArticulosPedido[index].spinnerLoading = 3;
    if (data == null) {
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.contenidoNeto=1;
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.planta="FLOTA";
      this.ordenPedidoService.formData.listArticulosPedido[index].inventario.proveedor=this.ordenPedidoService.formData.proveedor;
      if (op == 1) {
        var auxAux = this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo.split("COD_INV:");
        if (auxAux.length == 2) {
          this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre = auxAux[1];
        } else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre = this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo;
        this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = "COD_INV:" + this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre;
      } else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.codigo = "COD_INV:" + this.ordenPedidoService.formData.listArticulosPedido[index].inventario.nombre;
    }
    else this.ordenPedidoService.formData.listArticulosPedido[index].inventario.rellenarObjeto(data);
    this.ordenPedidoService.formData.listArticulosPedido[index].inventario.disBttnInput = op;
  }

  convertPdf(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold")
    doc.text("Orden de Pedido " + orden.numSecuencial, 40, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 35));//left
    doc.line(199, y, 199, (y + 35));//right
    doc.line(9, (y + 35), 199, (y + 35));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 20, (y + 10));
    doc.text("Fecha de Registro: " + orden.fechaPedido, 105, (y + 10));
    doc.text("Proveedor: " + orden.proveedor, 20, (y + 15));
    doc.text("Usuario Sistema: " + orden.cargoUser, 20, (y + 20));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 105, (y + 20));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 20, (y + 25));
    doc.setFont("arial", "normal");
    y = y + 35;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 80, (y + 7));
    doc.setFontSize(11);
    y = y + 10;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down


    doc.text("Código", 25, (y + 7));
    doc.line(50, y, 50, (y + 10));//right
    doc.text("Descripción", 70, (y + 7));
    doc.line(110, y, 110, (y + 10));//right
    doc.text("Cantidad", 112, (y + 7));
    doc.line(130, y, 130, (y + 10));//right
    doc.text("Área", 137, (y + 7));
    doc.line(155, y, 155, (y + 10));//right
    doc.text("Observación", 165, (y + 7));

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
      lineaCodigo = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.codigo, (35));
      lineaNombre = doc.splitTextToSize(orden.listArticulosPedido[i].inventario.nombre, (55));
      lineaObservacion = doc.splitTextToSize(orden.listArticulosPedido[i].observacion, (40));
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

        doc.text("Código", 25, (y + 7));
        doc.line(50, y, 50, (y + 10));//right
        doc.text("Descripción", 70, (y + 7));
        doc.line(110, y, 110, (y + 10));//right
        doc.text("Cantidad", 112, (y + 7));
        doc.line(130, y, 130, (y + 10));//right
        doc.text("Área", 137, (y + 7));
        doc.line(155, y, 155, (y + 10));//right
        doc.text("Observación", 165, (y + 7));

        y = y + 10 + valorG;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, (y - valorG), 9, y);//left
      auxPrueba = Number((valorG - (3 * lineaCodigo.length + (3 * (lineaCodigo.length - 1)))) / 2.5) + 3;
      doc.text(lineaCodigo, 15, (y - valorG + auxPrueba));
      doc.line(50, (y - valorG), 50, y);//right
      auxPrueba = Number((valorG - (3 * lineaNombre.length + (3 * (lineaNombre.length - 1)))) / 2.5) + 3;
      doc.text(lineaNombre, 55, (y - valorG + auxPrueba));
      doc.line(110, (y - valorG), 110, y);//right
      doc.text(orden.listArticulosPedido[i].cantidad.toString(), 120, (y - ((valorG - 3) / 2)));
      doc.line(130, (y - valorG), 130, y);//right
      doc.text(orden.listArticulosPedido[i].destinoArea, 135, (y - ((valorG - 3) / 2)));
      doc.line(155, (y - valorG), 155, y);//right
      auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;
      doc.text(lineaObservacion, 15, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    doc.save("Pedido_" + orden.numSecuencial + ".pdf");
    return (doc.output('datauristring'));
  }

  sendMessageGroupNotification(orden: cOrdenPedido) {
    var auxBase = this.convertPdf(orden).split('base64,');
    var auxWhatsapp: cWhatsapp = {
      chatname: "PEDIDOS FLOTA",
      message: "",
      title: "Pedido_" + orden.numSecuencial +".pdf",
      media: auxBase[1],
      type: "application/pdf"
    }

    var encabezado: string = ':bell: *Notificación Pedido ' + orden.tipoPedido + '* :bell:'
    var asunto: string = "pedido a *" + orden.proveedor + "* para el barco *" + orden.barco + "*";
    var auxNumSecuencial= orden.numSecuencial.split('-');
    auxWhatsapp.message = encabezado
      + '\n'
      + '\n:wave: Saludos Compañeros:'
      + '\nSe les informa que se ha generado un ' + asunto
      + '\nLos datos del pedido son:'
      + '\n'
      + '\n*#' + auxNumSecuencial[1] + '*'
      + '\n*Barco:* ' + orden.barco + ' :anchor:'
      + '\n*Fecha:* ' + orden.fechaPedido
      + '\n*Encargado del Pedido* ' + orden.cargoUser
      + '\n----------------------------------'
      + '\nAdicionalmente se adjunta la orden detalladamente :paperclip:'
      + '\n----------------------------------';

    this.whatsappService.sendMessageMGroup(auxWhatsapp).subscribe(
      res => {
        if (res.status == "error")
          this.toastr.warning('Notificación error: ' + res.message, 'Mensaje no enviado');
        else this.toastr.success('Notificación enviada', 'Mensaje enviado Correctamente');
      },
      err => {
        console.log(err);
      }
    );
  }
}


