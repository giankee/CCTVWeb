import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { UserService } from 'src/app/shared/user.service';
import { faTasks, faOutdent, faUserTag, faTimesCircle, faPlus, faTimes, faHandPointLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cMaterialesO, cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { NgForm } from '@angular/forms';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { finalize, map } from 'rxjs/operators';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-control-es',
  templateUrl: './control-es.component.html',
  styleUrls: ['./control-es.component.css']
})
export class ControlESComponent implements OnInit {
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
  }
  public get ordenTrabajoService(): OrdenTrabajoService {
    return this._ordenTrabajoService;
  }
  public set ordenTrabajoService(value: OrdenTrabajoService) {
    this._ordenTrabajoService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  paginacion = new cPaginacion(3);
  fechaHoy = new cFecha();
  strFases: string = "Inicio";
  proveedorIsOpened: boolean = false;
  traspasoIsOpened: boolean = false;
  devolucionIsOpened: boolean = false;
  consultaIsOpened: boolean = false;
  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;
  listBodega: cVario[] = [];
  listProdFiltros$: any;

  faoutdent = faOutdent; fatasks = faTasks; fausertag = faUserTag; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes; faHandLeft = faHandPointLeft; fasave = faSave;
  constructor(private _userService: UserService, private router: Router, private _conexcionService: ConexionService, private _ordenTrabajoService: OrdenTrabajoService, private _variosService: VariosService, private _productoBService: ProductoBService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    if (!this._userService.estaLogueado) {
      this.router.navigate(["/user-Login"]);
    } else {
      this.resetForm();
      this.cargarBodega();
    }
  }

  recibirRes(salir: boolean, tipo: string) {
    if (tipo == "proveedor")
      this.proveedorIsOpened = !salir;
    if (tipo == "traspaso") {
      this.resetForm();
      this.traspasoIsOpened = !salir;
    }
    if (tipo == "devolucion")
      this.devolucionIsOpened = !salir;
    this.strFases = "Inicio";
    if (tipo == "consulta")
      this.consultaIsOpened = !salir;
  }

  onStart(op: string) {
    this.strFases = op;
    switch (op) {
      case 'OrdenTrabajo':
        this._ordenTrabajoService.formData.tipoOrden = "Trabajo Interno";
        this._ordenTrabajoService.formData.agregarOneMaterial();
        this.paginacion.getNumberIndex(1);
        this.paginacion.updateIndex(0);
        break;
      case 'Traspaso':
        this._ordenTrabajoService.formData.tipoOrden = "Traspaso Bodega";
        if (this._conexcionService.UserR.rolAsignado == "enfermeria") {
          this._ordenTrabajoService.formData.bodega = "SIN ASIGNAR";
          this._ordenTrabajoService.formData.destinoLugar = "ENFERMERIA GENERAL";
          this._ordenTrabajoService.formData.personaResponsable = "VERÓNICA CHUMO";
        }
        this.traspasoIsOpened = true;
        break;
      case 'Proveedor':
        this.proveedorIsOpened = true;
        break;
      case 'Devolucion':
        this.devolucionIsOpened = true;
        break;
      case 'Consulta':
        this.consultaIsOpened = true;
        break;
    }
  }

  resetForm(form?: NgForm) {
    if (form != null) {
      form.resetForm();
    }
    if (this._conexcionService.UserR.rolAsignado != "enfermeria") {
      this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserR.nombreU, "P MANACRIPEX");
      if (this._conexcionService.UserR.rolAsignado == "bodega_verificador-m")
        this._ordenTrabajoService.formData.bodega = "GENERAL";
    } else this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserR.nombreU, "ENFERMERIA");
    this.strFases = "Inicio";
    this.okBttnSubmit = true;
  }

  onAntSig(op: string) {
    this.strFases = "Inicio";
    this.resetForm();
  }

  cargarBodega() {
    this._variosService.getLugarSearch("Bodega@b").subscribe(dato => {
      this.listBodega = dato;
    });
  }

  comprobarNewM() {
    var flag = true;
    if (this._ordenTrabajoService.formData.listMaterialesO.find(x => (x.cantidad <= 0 || x.inventarioId == undefined) || (x.cantidad > x.inventario.listBodegaProducto[0].disponibilidad)) != undefined)
      flag = false;
    this.okAddNewBotton = flag;
    return (flag);
  }

  onNewMaterial() {
    if (this.comprobarNewM()) {
      this._ordenTrabajoService.formData.agregarOneMaterial();
      this.paginacion.getNumberIndex(this._ordenTrabajoService.formData.listMaterialesO.length);
      this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
    }
  }

  onRemoveNewM(indice) {
    var auxLA: cMaterialesO[] = [];
    if (this._ordenTrabajoService.formData.listMaterialesO.length > 1) {
      this._ordenTrabajoService.formData.listMaterialesO.splice(indice, 1);
      auxLA = JSON.parse(JSON.stringify(this._ordenTrabajoService.formData.listMaterialesO));
      this._ordenTrabajoService.formData.listMaterialesO = [];
      this._ordenTrabajoService.formData.listMaterialesO = JSON.parse(JSON.stringify(auxLA));
    }
    this.comprobarNewM();
  }

  onListProducto(index: number, op: number, value: string) {
    if (value != null) {
      this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = true;
      this._ordenTrabajoService.formData.listMaterialesO.forEach(x => x.showSearchSelect = 0);
      this._ordenTrabajoService.formData.listMaterialesO[index].showSearchSelect = op;
      this._ordenTrabajoService.formData.listMaterialesO[index].inventario.resetProducto();
      if (op == 2)
        this._ordenTrabajoService.formData.listMaterialesO[index].inventario.nombre = value.toUpperCase();
      else this._ordenTrabajoService.formData.listMaterialesO[index].inventario.codigo = value.toUpperCase();

      var strParametro = value;
      if (value != "") {
        strParametro = strParametro + "@" + this._ordenTrabajoService.formData.planta + "@" + op + "@" + this.ordenTrabajoService.formData.bodega;

        this.listProdFiltros$ = this._productoBService.getProductosSearch(strParametro).pipe(
          map((x: cProducto_B[]) => {
            return x.filter(y => y.listBodegaProducto.length > 0);
          }),
          finalize(() => this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = false)
        );
      } else this._ordenTrabajoService.formData.listMaterialesO[index].spinnerLoading = false;
    }
  }

  onChooseElemente(index, op: number, data: any) {
    this._ordenTrabajoService.formData.listMaterialesO[index].showSearchSelect = 0;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.rellenarObjeto(data);
    this._ordenTrabajoService.formData.listMaterialesO[index].inventarioId = this.ordenTrabajoService.formData.listMaterialesO[index].inventario.idProductoStock;
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.disBttnInput = op;
  }

  onSubmit(form: NgForm) {
    if (this._conexcionService.formData.connectionStatus == "nline") {
      this.okBttnSubmit = false;
      if (this.strFases == "OrdenTrabajo") {
        if (this.comprobarNewM()) {
          this._ordenTrabajoService.insertarOrdenInterna(this._ordenTrabajoService.formData).subscribe(
            (res: any) => {
              if (res.exito == 1) {
                this.toastr.success('Registro satisfactorio', 'Orden Registrada');
                this.ordenTrabajoService.formData.numOrdenSecuencial = res.data.numOrdenSecuencial;
                this.convertPdf(this.ordenTrabajoService.formData);
                this.resetForm(form);
              } else {
                this.okBttnSubmit = false;
                this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
              };
            });
        } else this.okBttnSubmit = true;
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

  convertPdf(orden: cOrdenTrabajoI) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold");
    doc.text("Orden de " + orden.tipoOrden + " #" + orden.numOrdenSecuencial, 70, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 45));//left
    doc.line(199, y, 199, (y + 45));//right
    doc.line(9, (y + 45), 199, (y + 45));//down
    doc.setFontSize(13);
    doc.text("Datos de la orden", 15, (y + 5));

    doc.setFontSize(11);

    doc.text("Planta: ", 20, (y + 10));
    doc.text("Fecha Registro: ", 105, (y + 10));
    doc.text("Bodega de Salida: ", 20, (y + 15));
    if (orden.tipoOrden == "Trabajo Interno") {
      doc.text("Área de Destino: ", 105, (y + 15));
      doc.text("Responsable de la Solicitud: ", 20, (y + 20));
    } else {
      doc.text("Bodega de Destino: ", 105, (y + 15));
      doc.text("Responsable de la Transferencia: ", 20, (y + 20));
    }
    doc.text("Usuario Sistema: ", 20, (y + 25));
    doc.text("Estado de la Orden: ", 105, (y + 25));
    doc.text("Justificación: ", 20, (y + 30));

    doc.setFont("arial", "normal");
    doc.text(orden.planta, 32, (y + 10));
    doc.text(orden.fechaRegistro, 132, (y + 10));
    doc.text(orden.bodega, 53, (y + 15));
    doc.text(orden.destinoLugar, 135, (y + 15));
    doc.text(orden.personaResponsable, 67, (y + 20));
    doc.text(orden.guardiaCargoUser, 50, (y + 25));
    doc.text(orden.estadoProceso, 140, (y + 25));
    doc.text(orden.observacion, 20, (y + 35));
    y = y + 45;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");
    if (orden.tipoOrden == "Trabajo Interno") {
      doc.text("Lista de Materiales", 80, (y + 7));
      doc.setFontSize(11);
      y = y + 10;
      doc.line(9, y, 199, y);//up
      doc.line(9, y, 9, (y + 10));//left
      doc.line(199, y, 199, (y + 10));//right
      doc.line(9, (y + 10), 199, (y + 10));//down

      doc.text("Código", 20, (y + 7));
      doc.line(55, y, 55, (y + 10));//right
      doc.text("Cantidad", 60, (y + 7));
      doc.line(80, y, 80, (y + 10));//right
      doc.text("Descripción", 100, (y + 7));
      doc.line(145, y, 145, (y + 10));//right
      doc.text("Observación", 165, (y + 7));

      doc.setFontSize(8);
      doc.setFont("arial", "normal");
      y = y + 10;

      var valorG: number = 0;
      var valorD: number;
      var valorO: number;
      var lineaDescripcion;
      var lineaObservacion;
      var auxPrueba: number;

      for (var i = 0; i < orden.listMaterialesO.length; i++) {
        lineaDescripcion = doc.splitTextToSize(orden.listMaterialesO[i].inventario.nombre, (65));
        lineaObservacion = doc.splitTextToSize(orden.listMaterialesO[i].observacion, (50));
        valorD = (3 * lineaDescripcion.length) + 4;
        valorO = (3 * lineaObservacion.length) + 4;

        if (valorD > valorO)
          valorG = valorD;
        else valorG = valorO;

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

          doc.text("Código", 20, (y + 7));
          doc.line(55, y, 55, (y + 10));//right
          doc.text("Cantidad", 60, (y + 7));
          doc.line(80, y, 80, (y + 10));//right
          doc.text("Descripción", 100, (y + 7));
          doc.line(145, y, 145, (y + 10));//right
          doc.text("Observación", 165, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }
        doc.line(9, (y - valorG), 9, y);//left
        doc.text(orden.listMaterialesO[i].inventario.codigo, 15, (y - ((valorG - 3) / 2)));
        doc.line(55, (y - valorG), 55, y);//right
        doc.text(orden.listMaterialesO[i].cantidad.toString(), 75, (y - ((valorG - 3) / 2)));
        doc.line(80, (y - valorG), 80, y);//right

        auxPrueba = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaDescripcion, 85, (y - valorG + auxPrueba));
        doc.line(145, (y - valorG), 145, y);//right
        auxPrueba = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + 3;//mega formula para centrar el texto en el espacio establecido
        doc.text(lineaObservacion, 150, (y - valorG + auxPrueba));
        doc.line(199, (y - valorG), 199, y);//right
        doc.line(9, y, 199, y);//down
      }
      if (y >= 270) {
        doc.addPage();
        doc.setLineWidth(0.4);
        y = 40;
      } else y = 275;
      doc.line(18, y, 63, y);//Firma1
      doc.text("Firma " + orden.bodeguero, 25, y + 5);
      doc.line(81, y, 126, y);//Firma2
      doc.text("Firma de Área", 87, y + 5);

      doc.line(144, y, 189, y);//Firma2
      doc.text("Firma " + orden.personaResponsable, 146, y + 5);
    }
    doc.save("Orden#" + orden.numOrdenSecuencial + "_" + orden.fechaRegistro + ".pdf");
    //return (doc.output('datauristring'));
  }
}
