import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { jsPDF } from "jspdf";
import { cArticulosPedido, cOrdenPedido } from 'src/app/shared/pedido/pedido';
import { faPrint, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { cEnterpriceProveedor, cVario } from 'src/app/shared/otrosServices/varios';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-view-pedido-modal',
  templateUrl: './view-pedido-modal.component.html',
  styles: []
})
export class ViewPedidoModalComponent implements OnInit {
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

  okFormChange:boolean=false;
  spinnerOnOff: number = 0;
  listBarcos: cVario[] = [];
  listBodegas: cVario[] = [];
  listProductosIn: cProducto_B[] = [];
  listProveedoresFiltros$: any;

  faprint = faPrint; fatimes = faTimes; fasave = faSave; 
  constructor(@Inject(MAT_DIALOG_DATA) public dato, public dialogRef: MatDialogRef<ViewPedidoModalComponent>, private _ordenPedidoService: OrdenPedidoService,private _enterpriceServise: ApiEnterpriceService, private toastr: ToastrService, private _variosService: VariosService) { }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData() {
    this._variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      dato.forEach(x => {
        if (x.categoria == "Puerto" && x.idVarios != 4)
          this.listBarcos.push(x);
      });
    });
    this._variosService.getLugarSearch("Bodega@FLOTA").subscribe(dato => {
      this.listBodegas = dato;
    });
  }

  onBListProgProveedor(value: string) {
    this.okFormChange=true;
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
        this.ordenPedidoService.formData.agregarOneMaterial();
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
    doc.setFont("arial", "bold")
    doc.text("Orden de Pedido " + orden.barco + " # " + orden.numSecuencial, 55, 20);

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
    doc.save("Pedido_# " + orden.numSecuencial + "_" + orden.barco + "_" + orden.fechaPedido + ".pdf");
  }

  onSubmit(form: NgForm){
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
      this.okFormChange=true;
    }
  }

  onExit() {
    this.dialogRef.close();
  }

  onEliminar(){
    this.ordenPedidoService.formData.estadoProceso="Anulada";
    this.guardar();
  }

  guardar(){
    console.table(this.ordenPedidoService.formData);
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
    )
  }
}
