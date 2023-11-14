import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { faHandPointLeft, faOutdent, faPlus, faSave, faTasks, faTimes, faTimesCircle, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { finalize, map } from 'rxjs/operators';
import { OrdenTrabajoService } from 'src/app/shared/bodega/orden-trabajo.service';
import { cBodega, cBodegaArea, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { cMaterialesO, cOrdenTrabajoI } from 'src/app/shared/bodega/ordenTrabajo';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-new-orden-trabajo',
  templateUrl: './new-orden-trabajo.component.html',
  styles: [],
})
export class NewOrdenTrabajoComponent implements OnInit {
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

  paginacion = new cPaginacion(10);
  fechaHoy = new cFecha();
  listBodega: cBodega[] = [];
  listAreas: cBodega[] = [];
  listSubAreas: cBodegaArea[];
  okAddNewBotton: boolean = true;
  okBttnSubmit: boolean = true;
  listProdFiltros$: any;

  faoutdent = faOutdent; fatasks = faTasks; fausertag = faUserTag; fatimescircle = faTimesCircle; faplus = faPlus; fatimes = faTimes; faHandLeft = faHandPointLeft; fasave = faSave;
  constructor(private _conexcionService: ConexionService, private _ordenTrabajoService: OrdenTrabajoService, private productoBService: ProductoBService, private toastr: ToastrService, private variosService: VariosService) { }

  ngOnInit(): void {
    this.cargarBodega();
  }

  cargarBodega() {
    switch (this._conexcionService.UserDataToken.role) {
      case "verificador-bodeguero-h":
        this.variosService.getBodegasTipo("OFICINAS-PUERTO").subscribe(dato => {
          this.listBodega = dato.filter(x =>!x.nombreBodega.includes("HELICOPTERO")&& x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
          this.listAreas = dato.filter(x =>x.nombreBodega.includes("HELICOPTERO")&& x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
          this.resetForm();
        });
        break;
      case "verificador-bodeguero-b":
        this.variosService.getBodegasTipo("PUERTO").subscribe(dato => {
          this.listBodega = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
          this.resetForm();
        });
        break;
      default:
        this.variosService.getBodegasTipo("A MANACRIPEX").subscribe(dato => {
          this.listAreas = dato;
        });
        if(this.conexcionService.UserDataToken.name=="FERNANDA MORALES"){
          this.variosService.getBodegasTipo("P MANACRIPEX-PUERTO").subscribe(dato => {
            this.listBodega = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
            this.resetForm();
          });
        }else{
          this.variosService.getBodegasTipo("P MANACRIPEX").subscribe(dato => {
            this.listBodega = dato.filter(x => x.listEncargados.length > 0 && x.listEncargados.find(y => y.encargado == this.conexcionService.UserDataToken.name));
            this.resetForm();
          });
        }
        break;
    }
  }

  resetForm(form?: NgForm) {
    if (form != null) {
      form.resetForm();
    }
    this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserDataToken.name, "P MANACRIPEX", this.listBodega[0].nombreBodega);
    if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-b")
      this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserDataToken.name, "BARCOS", this.listBodega[0].nombreBodega);
    if (this.conexcionService.UserDataToken.role == "verificador-bodeguero-h"){
      this._ordenTrabajoService.formData = new cOrdenTrabajoI(this._conexcionService.UserDataToken.name, "OFICINAS", this.listBodega[0].nombreBodega);
      this.ordenTrabajoService.formData.estadoProceso="Pendiente";
    }
      
    this.ordenTrabajoService.formData.bodeguero = this.ordenTrabajoService.formData.guardiaCargoUser;
    this._ordenTrabajoService.formData.tipoOrden = "Trabajo Interno";
    this._ordenTrabajoService.formData.agregarOneMaterial();
    this.onChooseBarco();
    this.paginacion.getNumberIndex(1);
    this.paginacion.updateIndex(0);
    this.okBttnSubmit = true;
  }

  onChooseBarco() {
    if (this.conexcionService.UserDataToken.role == 'verificador-bodeguero'&&this.conexcionService.UserDataToken.name == "FERNANDA MORALES") {
        if (this.ordenTrabajoService.formData.bodega == "MECANICA NAVAL")
          this.ordenTrabajoService.formData.planta = "P MANACRIPEX";
        else this.ordenTrabajoService.formData.planta = "BARCOS";
    }
  }

  onChangeTipoOrden(){
    if(this.ordenTrabajoService.formData.tipoOrden!="Trabajo Interno"){
      this.ordenTrabajoService.formData.bodega="HANGAR (DANIEL BUEHS)"
      this.ordenTrabajoService.formData.destinoLugar="HANGAR (MANACRIPEX)";
    }
      
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
        this.listProdFiltros$ = this.productoBService.getProductosSearch(strParametro).pipe(
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
    this._ordenTrabajoService.formData.listMaterialesO[index].inventario.listBodegaProducto[0].sumStockBodegas();
  }

  comprobarNewM() {
    var flag = true;
    if (this.ordenTrabajoService.formData.listMaterialesO.length > 0)
      this.ordenTrabajoService.formData.listMaterialesO.forEach(x => {
        if (x.cantidad <= 0)
          flag = false;
        if (x.loteId == "SIN ASIGNAR" && x.cantidad > x.inventario.listBodegaProducto[0].disponibilidad)
          flag = false;
        if (x.inventario.listBodegaProducto[0].listAreas.length > 0) {
          if (x.loteId != "SIN ASIGNAR" && x.cantidad > x.inventario.listBodegaProducto[0].listAreas.find(y => y.nombreSub == x.loteId).disponibilidad)
            flag = false;
        }
      });
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

  onSubmit(form: NgForm) {
    if (this._conexcionService.formData.connectionStatus == "nline") {
      this.okBttnSubmit = false;
      if (this.comprobarNewM()) {
        if(this.ordenTrabajoService.formData.marea!='0'&& this.ordenTrabajoService.formData.marea!='')
        this.ordenTrabajoService.formData.marea = this.ordenTrabajoService.formData.marea + "-" + this.fechaHoy.anio;
      else this.ordenTrabajoService.formData.marea=null;
        if(this._conexcionService.UserDataToken.role=="verificador-bodeguero-h")
          this.ordenTrabajoService.formData.planta="OMA";
          
        this._ordenTrabajoService.insertarOrdenInterna(this._ordenTrabajoService.formData).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.toastr.success('Registro satisfactorio', 'Orden Registrada');
              this.ordenTrabajoService.formData.numOrdenSecuencial = res.data.numOrdenSecuencial;
              this.convertPdf(this.ordenTrabajoService.formData);
              this.resetForm();
            } else {
              this.okBttnSubmit = false;
              this.toastr.warning('Registro Fallido', 'Intentelo mas tarde');
            };
          });
      } else this.okBttnSubmit = true;
    }
  }

  convertPdf(orden: cOrdenTrabajoI) {
    var y: number;
    var doc = new jsPDF();
    doc.setFontSize(17);
    doc.setFont("arial", "bold");
    var auxTipo=orden.tipoOrden;
    if(orden.planta=="OMA"){
      if(orden.tipoOrden=="Trabajo Interno")
        auxTipo="Consumo Interno";
    }
    doc.text("Orden de " + auxTipo + " #" + orden.numOrdenSecuencial, 70, 20);

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
      doc.text("Responsable: ", 20, (y + 20));
    }
    doc.text("Usuario Sistema: ", 20, (y + 25));
    doc.text("Estado de la Orden: ", 105, (y + 25));
    doc.text("Justificación: ", 20, (y + 30));

    doc.setFont("arial", "normal");
    doc.text(orden.planta, 35, (y + 10));
    doc.text(orden.fechaRegistro, 132, (y + 10));
    doc.text(orden.bodega, 53, (y + 15));
    doc.text(orden.destinoLugar, 140, (y + 15));
    doc.text(orden.personaResponsable, 45, (y + 20));
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
