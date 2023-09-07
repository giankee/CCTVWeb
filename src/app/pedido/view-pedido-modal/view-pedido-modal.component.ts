import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { jsPDF } from "jspdf";
import { cArticulosPedido, cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { faPlus, faPrint, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { cEnterpriceProveedor, cVario } from 'src/app/shared/otrosServices/varios';
import { cBodega, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { finalize, map } from 'rxjs/operators';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';

@Component({
  selector: 'app-view-pedido-modal',
  templateUrl: './view-pedido-modal.component.html',
  styles: []
})
export class ViewPedidoModalComponent implements OnInit {
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
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get ordenPedidoService(): OrdenPedidoService {
    return this._ordenPedidoService;
  }
  public set ordenPedidoService(value: OrdenPedidoService) {
    this._ordenPedidoService = value;
  }

  okFormChange: boolean = true;
  spinnerOnOff: number = 0;


  listBarcos: cBodega[] = [];
  listAreas: cBodega[] = [];
  listVehiculos: cBodega[] = [];
  listProductosIn: cProducto_B[] = [];
  listProveedoresFiltros$: any;
  okAddNewBotton: boolean = true;

  faprint = faPrint; fatimes = faTimes; fasave = faSave; faplus = faPlus;
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewPedidoModalComponent>, private _conexcionService: ConexionService, private _ordenPedidoService: OrdenPedidoService, private _enterpriceServise: ApiEnterpriceService, private toastr: ToastrService, private _variosService: VariosService) {
    this.cargarData();
  }

  ngOnInit(): void {
    this._enterpriceServise.getProveedorSearch(this.ordenPedidoService.formData.proveedor).subscribe( (dato:any)=>{
      this.cargarProductosProveedor(dato[0].cedrucpas);
    });
  }

  cargarData() {
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBarcos = dato;
    });
    this._variosService.getBodegasTipo("VEHICULO").subscribe(dato => {
      this.listVehiculos = dato;
    });
    if (this.ordenPedidoService.formData.planta == "P MANACRIPEX") {
      this._variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
        this.listAreas = dato;
      });
    }
  }

  onBListProgProveedor(value: string) {
    this.okFormChange = true;
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
    this._ordenPedidoService.formData.proveedor = data.proveedor;
    this.cargarProductosProveedor(data.cedrucpas);
  }

  cargarProductosProveedor(proveedorIn: string) {
    this.spinnerOnOff = 1;
    this.enterpriceServise.getProductoProveedor(proveedorIn).subscribe((dato: any) => {
      if (dato.exito == 1) {
        this.listProductosIn = dato.data;
        this.spinnerOnOff = 2;
      } else {
        this.listProductosIn = [];
        this.spinnerOnOff = 0;
      }
    }, error => console.error(error));
  }

  onConvertPdf(orden: cOrdenPedido) {
    var doc = new jsPDF();
    var y: number;

    doc.setFontSize(16);
    doc.setFont("arial", "bold");

    let auxSecuencial = orden.numSecuencial.split("-");
    var strDestino: string;
    doc.text("Orden de Pedido: " + auxSecuencial[1], 75, 20);

    y = 25;
    doc.setFontSize(13);
    doc.text("Datos de la orden", 20, (y + 5));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);
    doc.text("Fecha de Registro: " + orden.fechaPedido, 15, (y + 10));
    doc.text("Empresa: " + orden.empresa, 80, (y + 10));
    doc.text("RUC: " + orden.strRuc, 140, (y + 10));
    doc.text("Tipo de Pedido: " + orden.tipoPedido, 15, (y + 15));
    if (orden.area == "P MANACRIPEX")
      strDestino = "Área: " + orden.listArticulosPedido[0].destinoArea;
    else strDestino = "Lugar: " + orden.area + " - Sub-Área: " + orden.listArticulosPedido[0].destinoArea;
    doc.text(strDestino, 80, (y + 15));
    doc.text("Proveedor: " + orden.proveedor, 15, (y + 20));
    doc.text("Usuario Sistema: " + orden.cargoUser, 15, (y + 25));
    doc.text("Tipo Pedido: " + orden.tipoPedido, 105, (y + 25));
    doc.text("Estado de la Orden: " + orden.estadoProceso, 15, (y + 30));
    if (orden.estadoProceso != "Pendiente Aprobación" && orden.estadoProceso != "Rechazada")
      doc.text("Fecha Aprobación: " + orden.fechaAprobacion, 105, (y + 30));
    if (orden.estadoProceso == "Rechazada")
      doc.text("Fecha Rechazada: " + orden.fechaAprobacion, 105, (y + 30));

    var auxlinea = doc.splitTextToSize("Justificación: " + orden.justificacion, (165));
    doc.text(auxlinea, 15, (y + 35));
    doc.setFont("arial", "normal");

    var auxH = y + 40;
    if (auxlinea.length > 1)
      auxH = auxH + 5 + ((3 * auxlinea.length) + 2);
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (auxH));//left
    doc.line(199, y, 199, auxH);//right
    doc.line(9, auxH, 199, auxH);//down

    y = auxH;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

    doc.text("Lista de Materiales", 90, (y + 7));
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
      if (orden.listArticulosPedido[i].aviso) {
        doc.setTextColor(255, 0, 0);
        doc.text(lineaObservacion, 145, (y - valorG + auxPrueba));
        doc.setTextColor(0, 0, 0);
      } else doc.text(lineaObservacion, 145, (y - valorG + auxPrueba));
      doc.line(199, (y - valorG), 199, y);//right
      doc.line(9, y, 199, y);//down
    }
    if (y >= 265) {
      doc.addPage();
      doc.setLineWidth(0.4);
      y = 40;
    } else y = 265;
    var personaSubArea = null;
    if (orden.area == "P MANACRIPEX") {
      personaSubArea = this.listAreas.find(x => x.nombreBodega == orden.listArticulosPedido[0].destinoArea).encargadoBodega;
    } else {
      var auxArea: cBodega = this.listBarcos.find(x => x.nombreBodega == orden.area);
      if (auxArea == undefined) {
        auxArea = this.listVehiculos.find(x => x.nombreBodega == orden.area);
      }
      if (auxArea != undefined) {
        personaSubArea = auxArea.listAreas.find(y => y.nombreArea == orden.listArticulosPedido[0].destinoArea).encargadoArea;
      }
    }
    if (personaSubArea == null)
      personaSubArea = "Encargado " + orden.listArticulosPedido[0].destinoArea;

    doc.line(18, y, 63, y);//Firma1
    doc.text("Firma " + orden.cargoUser, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + personaSubArea, 146, y + 5);
    doc.save("Pedido_" + orden.numSecuencial + ".pdf");
  }

  onSubmit(form: NgForm) {
    if (this.okFormChange) {
      this.guardar();
    }
  }

  onRemoveNewR(indice) {
    var auxLR: cArticulosPedido[] = [];
    if (this.ordenPedidoService.formData.listArticulosPedido.length > 1) {
      this.ordenPedidoService.formData.listArticulosPedido.splice(indice, 1);
      auxLR = JSON.parse(JSON.stringify(this.ordenPedidoService.formData.listArticulosPedido));
      this.ordenPedidoService.formData.listArticulosPedido = [];
      this.ordenPedidoService.formData.listArticulosPedido = JSON.parse(JSON.stringify(auxLR));
      this.okFormChange = true;
    }
  }

  onExit() {
    this.dialogRef.close();
  }

  onEliminar() {
    this.ordenPedidoService.formData.estadoProceso = "Anulada";
    this.ordenPedidoService.formData.responsableAnulada = this.conexcionService.UserDataToken.name;
    this.guardar();
  }

  onNewItem() {
    if (this.comprobarNewR()) {
      this.ordenPedidoService.formData.agregarOneMaterial();
      this.ordenPedidoService.formData.listArticulosPedido[this.ordenPedidoService.formData.listArticulosPedido.length-1].marcar=true;
      this.ordenPedidoService.formData.listArticulosPedido[this.ordenPedidoService.formData.listArticulosPedido.length-1].ordenPedidoId=this.ordenPedidoService.formData.idOrdenPedido;
      this.ordenPedidoService.formData.listArticulosPedido[this.ordenPedidoService.formData.listArticulosPedido.length-1].destinoArea=this.ordenPedidoService.formData.listArticulosPedido[0].destinoArea;
    }
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

  comprobarNewR() {
    var flag = true;
    if (this.ordenPedidoService.formData.listArticulosPedido.find(x => (x.cantidad <= 0  || x.destinoArea == "SIN ASIGNAR")) != undefined) {
      flag = false;
    }
    this.okAddNewBotton = flag;
    return (flag);
  }

  guardar() {
    this.ordenPedidoService.formData.corregirFechas();
    this.ordenPedidoService.actualizarPedido(this.ordenPedidoService.formData).subscribe(
      (res: any) => {
        if (res.message == "Ok") {
          this.toastr.success('Actualización satisfactoria', 'Orden Modificada');
          this.dialogRef.close();
        }
        if (res.message == "Eliminar") {
          this.toastr.success('Eliminación satisfactoria', 'Orden Eliminada');
          this.dialogRef.close();
        }
      }
    );
  }
}
