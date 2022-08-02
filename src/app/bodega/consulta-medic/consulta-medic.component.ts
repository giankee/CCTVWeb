import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faOutdent, faPlus, faSave, faTimes, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { finalize, map } from 'rxjs/operators';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';
import { cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { cConsultaMedic, cRecetaMedic } from 'src/app/shared/bodega/ordenTrabajo';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cEnterpricePersonal, cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import Swal from 'sweetalert2';
import { jsPDF } from "jspdf";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-consulta-medic',
  templateUrl: './consulta-medic.component.html',
  styles: [],
})
export class ConsultaMedicComponent implements OnInit {
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get productoBService(): ProductoBService {
    return this._productoBService;
  }
  public set productoBService(value: ProductoBService) {
    this._productoBService = value;
  }
  public get consultaMedicService(): ConsultaMedicService {
    return this._consultaMedicService;
  }
  public set consultaMedicService(value: ConsultaMedicService) {
    this._consultaMedicService = value;
  }
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  @Input()
  isOpen: boolean;

  @Output()
  cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();

  fechaHoy = new cFecha();
  paginacion = new cPaginacion(5);
  listBarcos: cVario[] = [];
  listProdFiltros$: any;
  listPacienteFiltros$: any;

  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;

  faoutdent = faOutdent; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes; fasave = faSave;
  constructor(private _conexcionService: ConexionService, private variosService: VariosService, private _consultaMedicService: ConsultaMedicService, private _productoBService: ProductoBService, private _enterpriceService: ApiEnterpriceService, private toastr: ToastrService) {
    this.variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      this.listBarcos = dato.filter(x => x.encargadoBodega == this._conexcionService.UserR.nombreU);
      this.resetForm();
    });
  }

  ngOnInit(): void {
  }

  resetForm(form?: NgForm) {
    if (form != null) {
      form.resetForm();
    }
    if (this._conexcionService.UserR.rolAsignado == 'enfermeria')
      this._consultaMedicService.formData = new cConsultaMedic(this._conexcionService.UserR.nombreU, "ENFERMERIA GENERAL");
    else
      this._consultaMedicService.formData = new cConsultaMedic(this._conexcionService.UserR.nombreU, this.listBarcos[0].nombre);
    this._consultaMedicService.formData.agregarOneItem();
    this.paginacion.getNumberIndex(1);
    this.paginacion.updateIndex(0);
    this.okAddNewBotton = true;
    this.okBttnSubmit = true;
  }

  onTerminar() {
    this.cerrar.emit(true);
  }

  comprobarNewR() {
    var flag = true;
    if (this._consultaMedicService.formData.listReceta.find(x => (x.cantidad <= 0 || x.inventarioId == undefined) || (x.cantidad > x.inventario.listBodegaProducto[0].disponibilidad)) != undefined)
      flag = false;
    this.okAddNewBotton = flag;
    return (flag);
  }

  onNewItem() {
    if (this.comprobarNewR()) {
      this._consultaMedicService.formData.agregarOneItem();
      this.paginacion.getNumberIndex(this._consultaMedicService.formData.listReceta.length);
      this.paginacion.updateIndex(this.paginacion.pagTotal.length - 1);
    }
  }

  onRemoveNewR(indice) {
    var auxLR: cRecetaMedic[] = [];
    if (this._consultaMedicService.formData.listReceta.length > 1) {
      this._consultaMedicService.formData.listReceta.splice(indice, 1);
      auxLR = JSON.parse(JSON.stringify(this._consultaMedicService.formData.listReceta));
      this._consultaMedicService.formData.listReceta = [];
      this._consultaMedicService.formData.listReceta = JSON.parse(JSON.stringify(auxLR));
    }
    this.comprobarNewR();
  }

  onListProducto(index: number, op: number, value: string) {
    this._consultaMedicService.formData.listReceta[index].spinnerLoading = true;
    this._consultaMedicService.formData.listReceta.forEach(x => x.showSearchSelect = 0);
    this._consultaMedicService.formData.listReceta[index].showSearchSelect = op;
    this._consultaMedicService.formData.listReceta[index].inventario.resetProducto();
    if (value != "") {
      var strParametro = value;
      if (op == 2)
        this._consultaMedicService.formData.listReceta[index].inventario.nombre = value.toUpperCase();
      else this._consultaMedicService.formData.listReceta[index].inventario.codigo = value.toUpperCase();

      strParametro = strParametro + "@ENFERMERIA@" + op + "@";
      if (this.conexcionService.UserR.rolAsignado == "enfermeria")
        strParametro = strParametro + "ENFERMERIA GENERAL";
      else strParametro = strParametro + this.listBarcos[0].nombre;
      this.listProdFiltros$ = this._productoBService.getProductosSearch(strParametro).pipe(
        map((x: cProducto_B[]) => {
          return x.filter(y => y.listBodegaProducto.length > 0);
        }),
        finalize(() => this._consultaMedicService.formData.listReceta[index].spinnerLoading = false)
      );
    } else this._consultaMedicService.formData.listReceta[index].spinnerLoading = false;
  }

  onChooseElemente(index, op: number, data: any) {
    this._consultaMedicService.formData.listReceta[index].showSearchSelect = 0;
    this._consultaMedicService.formData.listReceta[index].inventario.rellenarObjeto(data);
    this._consultaMedicService.formData.listReceta[index].inventarioId = this._consultaMedicService.formData.listReceta[index].inventario.idProductoStock;
    this._consultaMedicService.formData.listReceta[index].inventario.disBttnInput = op;
  }

  onListPasciente(value: string) {
    this._consultaMedicService.formData.spinnerLoading = true;
    this._consultaMedicService.formData.showSearchSelect = true;
    this._consultaMedicService.formData.paciente = value;
    var strParametro = "all@" + value+'@SIN ASIGNAR';
    var auxBarcoSelect = "";
    if (this._conexcionService.UserR.rolAsignado == 'verificador-medic') {
      strParametro = "Tripulantes@" + value+'@SIN ASIGNAR';
      var auxBarco = this.listBarcos[0].nombre.split(' ');
      switch (auxBarco.length) {
        case 2:
          auxBarcoSelect = auxBarco[1];
          break;
        case 3:
          if (auxBarco[2] == "B")
            auxBarcoSelect = auxBarco[1];
          else auxBarcoSelect = auxBarco[2];
          break;
        case 4:
          auxBarcoSelect = auxBarco[2];
          break;
      }
    }
    if (value != "") {
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          if (auxBarcoSelect != "")
            return x.filter(y => y.barco.includes(auxBarcoSelect));
          else return x;
        }),
        finalize(() => this._consultaMedicService.formData.spinnerLoading = false)
      );
    } else this._consultaMedicService.formData.spinnerLoading = false;
  }

  onChoosePaciente(data: string) {
    this._consultaMedicService.formData.showSearchSelect = false;
    this._consultaMedicService.formData.paciente = data;
  }

  onSubmit(form: NgForm) {
    if (this._conexcionService.formData.connectionStatus == "nline") {
      this.okBttnSubmit = false;
      if (this.comprobarNewR()) {
        this.consultaMedicService.formData.marea=this.consultaMedicService.formData.marea+ "-"+this.fechaHoy.anio;
        this._consultaMedicService.insertarConsumoInterno(this._consultaMedicService.formData).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.toastr.success('Registro satisfactorio', 'Consumo Registrado');
              this._consultaMedicService.formData.numOrdenSecuencial = res.data.numOrdenSecuencial;
              this.convertPdf(this._consultaMedicService.formData);
              this.resetForm(form);
            } else {
              this.okBttnSubmit = false;
              this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
            };
          });
      } else this.okBttnSubmit = true;
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

  convertPdf(orden: cConsultaMedic) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("arial", "bold");
    doc.text("Consulta Médica #" + orden.numOrdenSecuencial, 85, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 40));//left
    doc.line(199, y, 199, (y + 40));//right
    doc.line(9, (y + 40), 199, (y + 40));//down
    doc.setFontSize(13);
    doc.text("Datos de la Consulta", 15, (y + 5));

    doc.setFontSize(11);

    doc.text("Bodega: ", 20, (y + 10));
    doc.text(orden.bodegaOrigen, 37, (y + 10));
    if (this.conexcionService.UserR.rolAsignado == "verificador-medic") {
      doc.text("Marea: ", 105, (y + 10));
      doc.text(orden.marea, 120, (y + 10));
    }
    doc.text("Paciente: ", 20, (y + 15));
    doc.text(orden.paciente, 37, (y + 15));
    doc.text("Fecha de Registro: ", 105, (y + 15));
    doc.text(orden.fechaRegistro, 140, (y + 15));
    doc.text("Entrega Medicamento: ", 20, (y + 20));
    doc.text(orden.personaResponsable, 60, (y + 20));
    doc.text("Usuario Sistema: ", 105, (y + 20));
    doc.text(orden.guardiaCargoUser, 135, (y + 20));
    doc.text("Sintomas: ", 20, (y + 25));
    doc.text(orden.sintomas, 20, (y + 30));

    doc.setFont("arial", "normal");
    y = y + 40;

    doc.setFontSize(13);
    doc.setFont("arial", "bold");

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

    for (var i = 0; i < orden.listReceta.length; i++) {
      lineaDescripcion = doc.splitTextToSize(orden.listReceta[i].inventario.nombre, (65));
      lineaObservacion = doc.splitTextToSize(orden.listReceta[i].observacion, (50));
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
      doc.text(orden.listReceta[i].inventario.codigo, 15, (y - ((valorG - 3) / 2)));
      doc.line(55, (y - valorG), 55, y);//right
      doc.text(orden.listReceta[i].cantidad.toString(), 65, (y - ((valorG - 3) / 2)));
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
    doc.text("Firma " + orden.personaResponsable, 25, y + 5);
    doc.line(144, y, 189, y);//Firma2
    doc.text("Firma " + orden.paciente, 146, y + 5);

    doc.save("Consulta #" + orden.numOrdenSecuencial + "_" + orden.fechaRegistro + ".pdf");
  }
}
