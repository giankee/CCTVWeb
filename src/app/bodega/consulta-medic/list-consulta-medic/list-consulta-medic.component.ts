import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faExchangeAlt, faEye, faEyeSlash, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ConsultaMedicService } from 'src/app/shared/bodega/consulta-medic.service';
import { cConsultaMedic } from 'src/app/shared/bodega/ordenTrabajo';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cAuxMedicamentos, cAuxMedicamentosByPaciente, cEnterpricePersonal, cFecha, cParemetosOrdenInterna, cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewConsultaComponent } from '../view-consulta/view-consulta.component';
import { jsPDF } from "jspdf";
import { ApiEnterpriceService } from 'src/app/shared/otrosServices/api-enterprice.service';
import { cBodega, cProducto_B } from 'src/app/shared/bodega/ordenEC';
import { ProductoBService } from 'src/app/shared/bodega/producto-b.service';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { ToastrService } from 'ngx-toastr';
import { TransConsultaAtencionComponent } from './trans-consulta-atencion/trans-consulta-atencion.component';

@Component({
  selector: 'app-list-consulta-medic',
  templateUrl: './list-consulta-medic.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListConsultaMedicComponent implements OnInit {
  public get productosBService(): ProductoBService {
    return this._productosBService;
  }
  public set productosBService(value: ProductoBService) {
    this._productosBService = value;
  }
  public get enterpriceService(): ApiEnterpriceService {
    return this._enterpriceService;
  }
  public set enterpriceService(value: ApiEnterpriceService) {
    this._enterpriceService = value;
  }
  public get variosService(): VariosService {
    return this._variosService;
  }
  public set variosService(value: VariosService) {
    this._variosService = value;
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

  spinnerOnOff: boolean = true;
  listBodega: cBodega[] = [];
  parametrosBusqueda: cParemetosOrdenInterna = new cParemetosOrdenInterna();
  _iconDownLeft: boolean = false;
  selecBodegaFiltro: string = "ENFERMERIA GENERAL";
  ordenConsulta: string = "default";
  listConsultasMostrar$: Observable<cConsultaMedic[]>;
  listPacienteFiltros$: any;
  listProdFiltros$: any;
  dataOrdenesResult: cConsultaMedic[] = [];

  /**Para pagination y fecha Entrada*/
  paginacion = new cPaginacion(50);
  fechaHoy = new cFecha();
  /**Fin paginatacion */

  sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle; fasearch = faSearch; faexchange = faExchangeAlt;
  faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faeyeslash = faEyeSlash
  constructor(private _conexcionService: ConexionService, private _consultaMedicService: ConsultaMedicService, private _variosService: VariosService, private dialog: MatDialog, private _enterpriceService: ApiEnterpriceService, private _productosBService: ProductoBService, private consultaPipe: SortPipe, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this._variosService.getBodegasTipo("PUERTO").subscribe(dato => {
      this.listBodega = dato;
      if (this._conexcionService.UserR.rolAsignado == "verificador-medic")
        this.selecBodegaFiltro = this.listBodega.find(x => x.encargadoBodega == this.conexcionService.UserR.nombreU).nombreBodega;
      this.parametrosBusqueda.anio = this.fechaHoy.anio.toString();
      this.parametrosBusqueda.strBodegaOrigen = this.selecBodegaFiltro;
      this.cargarData();
    });
  }

  cargarData() {//Datos de los ordenes traidos desde db
    this.spinnerOnOff = true;
    this.listConsultasMostrar$ = this._consultaMedicService.getListConsultasInter(this.selecBodegaFiltro).pipe(
      map((x: cConsultaMedic[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  getDataFiltro(data: cConsultaMedic[]) {//Para q la filtracion de datos se automatica
    if (data.length != undefined) {
      this.dataOrdenesResult = JSON.parse(JSON.stringify(data));
      this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.dataOrdenesResult.length);
    this.paginacion.updateIndex(0);
  }

  onOrdenConsulta(tipo: string) {// cambia el orden por medio de un pipe
    if (tipo == "Index") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-I")
        this.ordenConsulta = "up-I";
      else this.ordenConsulta = "down-I";
    }
    if (tipo == "Bodega") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-B")
        this.ordenConsulta = "up-B";
      else this.ordenConsulta = "down-B";
    }
    if (tipo == "Paciente") {
      if (this.ordenConsulta == "default" || this.ordenConsulta == "down-P")
        this.ordenConsulta = "up-P";
      else this.ordenConsulta = "down-P";
    }
  }

  onModal(dataIn: cConsultaMedic) {
    this.consultaMedicService.formData = new cConsultaMedic(this._conexcionService.UserR.nombreU);
    this.consultaMedicService.formData.completarObject(dataIn);
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = true;
    dialoConfig.height = "85%";
    dialoConfig.width = "90%";
    const auxId = dataIn.idConsultaMedic;
    dialoConfig.data = { auxId };
    this.dialog.open(ViewConsultaComponent, dialoConfig);
  }

  onPrepararModalAtencion(dataIn: cConsultaMedic) {
    var strParametro = "Tripulantes@" + dataIn.paciente + "@SIN ASIGNAR";
    this._enterpriceService.getPersonalEnter2(strParametro).subscribe(res => {
      if (res.length > 0) {
        const dialoConfig = new MatDialogConfig();
        dialoConfig.autoFocus = true;
        dialoConfig.disableClose = true;
        dialoConfig.height = "85%";
        dialoConfig.width = "90%";
        const auxData = dataIn;
        const auxIdPaciente = res[0].idEmpleado;
        dialoConfig.data = { auxData, auxIdPaciente };
        const dialogRef = this.dialog.open(TransConsultaAtencionComponent, dialoConfig);
        dialogRef.afterClosed().subscribe((result: number) => {
          if (result == 1) {
            dataIn.estadoConsulta = "Procesada";
            this.consultaMedicService.actualizarConsulta(dataIn).subscribe(
              (res: any) => {
                if (res.message == "Ok") {
                  this.toastr.success('Actualización satisfactoria', 'Consulta Procesada');
                }
              }
            )
          }
        });
      } else this.toastr.warning('No es un personal de la empresa', 'Aviso Importante');
    });
  }

  onListProducto(value: string) {
    this.parametrosBusqueda.spinLoadingG = 2;
    this.parametrosBusqueda.showSearchSelectG = 2;
    this.parametrosBusqueda.productoCodigo = "null";
    if (value != "") {
      var params = value + "@ENFERMERIA@2@";
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR")
        params = params + this.parametrosBusqueda.strBodegaOrigen;
      else params = params + "null";
      this.listProdFiltros$ = this._productosBService.getProductosSearch(params).pipe(
        map((x: cProducto_B[]) => x),
        finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
      );
    } else {
      this.parametrosBusqueda.strProducto = "";
      this.parametrosBusqueda.spinLoadingG = 0;
      this.parametrosBusqueda.showSearchSelectG = 0;
    }
  }

  onChooseElemente(data: any) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data != "null") {
      this.parametrosBusqueda.productoCodigo = data.idProductoStock;
      this.parametrosBusqueda.strProducto = data.nombre;
    } else this.parametrosBusqueda.strProducto = "";
  }

  onListPasciente(value: string) {
    this.parametrosBusqueda.spinLoadingG = 1;
    this.parametrosBusqueda.showSearchSelectG = 1;
    if (value != "") {
      this.parametrosBusqueda.strPersona = value;
      var strParametro = "all@" + value + "@SIN ASIGNAR";
      var auxBarcoSelect = "";
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR") {
        if (this.parametrosBusqueda.strBodegaOrigen != 'ENFERMERIA GENERAL') {
          strParametro = "Tripulantes@" + value + "@SIN ASIGNAR";
          var auxBarco = this.parametrosBusqueda.strBodegaOrigen.split(' ');
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
      }
      this.listPacienteFiltros$ = this._enterpriceService.getPersonalEnter2(strParametro).pipe(
        map((x: cEnterpricePersonal[]) => {
          if (auxBarcoSelect != "")
            return x.filter(y => y.barco.includes(auxBarcoSelect));
          else return x;
        }),
        finalize(() => this.parametrosBusqueda.spinLoadingG = 0)
      );
    } else {
      this.parametrosBusqueda.strPersona = "";
      this.parametrosBusqueda.spinLoadingG = 0;
      this.parametrosBusqueda.showSearchSelectG = 0;
    }
  }

  onChoosePaciente(data: string) {
    this.parametrosBusqueda.showSearchSelectG = 0;
    if (data == "null") {
      this.parametrosBusqueda.strPersona = "";
      this.parametrosBusqueda.spinLoadingG = 0;
    } else this.parametrosBusqueda.strPersona = data;
  }

  onFiltrarConsultas() {
    this.spinnerOnOff = true;
    var strParametros: string = this.parametrosBusqueda.transformarParametroConsulta(this.fechaHoy.inDesde, this.fechaHoy.inHasta);
    this.listConsultasMostrar$ = this.consultaMedicService.getFiltroConsultas(strParametros).pipe(
      map((x: cConsultaMedic[]) => {
        x.forEach(y => {
          y.fechaRegistro = y.fechaRegistro.substring(0, 10);
        });
        this.paginacion.getNumberIndex(x.length);
        return x;

      }),
      finalize(() => this.spinnerOnOff = false)
    );

  }

  onConvertPdfAll() {
    if (this.dataOrdenesResult.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenConsulta != "default")
        this.dataOrdenesResult = this.consultaPipe.transform(this.dataOrdenesResult, this.ordenConsulta, 'cConsultaMedic');

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Consultas", 120, 15);

      y = 20;
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 40));//left
      doc.line(290, y, 290, (y + 40));//right
      doc.line(5, (y + 40), 290, (y + 40));//down

      doc.setFontSize(13);
      doc.text("Parámetros de Búsqueda", 15, (y + 10));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      var strAux = "SIN ESPECIFICAR";
      doc.text("Fecha desde: " + this.fechaHoy.inDesde, 15, (y + 15));
      doc.text("Fecha hasta: " + this.fechaHoy.inHasta, 110, (y + 15));
      this.parametrosBusqueda.strPersona != '' ? strAux = this.parametrosBusqueda.strPersona : strAux = "SIN ESPECIFICAR";
      doc.text("Paciente: " + strAux, 205, (y + 15));
      this.parametrosBusqueda.strProducto != '' ? strAux = this.parametrosBusqueda.strProducto : strAux = "SIN ESPECIFICAR";
      doc.text("Medicamento: " + strAux, 15, (y + 20));
      doc.text("Bodega: " + this.parametrosBusqueda.strBodegaOrigen, 110, (y + 20));
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR" && this.parametrosBusqueda.strBodegaOrigen != "ENFERMERIA GENERL")
        doc.text("Marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio, 205, (y + 20));
      doc.line(5, (y + 25), 290, (y + 25));//down
      y = y + 25;
      doc.setFontSize(12);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 5));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número productos encontrados: " + this.dataOrdenesResult.length, 10, (y + 10));
      doc.text("Resultados a mostrar: " + this.dataOrdenesResult.length + "/" + this.paginacion.selectPagination, 80, (y + 10));
      doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 150, (y + 10));
      doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 220, (y + 10));
      y = y + 15;

      doc.setFontSize(10);
      doc.setFont("arial", "bold")
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      doc.text("#", 12, (y + 7));
      doc.line(20, y, 20, (y + 10));//left
      doc.text("Fecha Registro", 23, (y + 7));
      doc.line(50, y, 50, (y + 10));//left
      doc.text("Paciente", 80, (y + 7));
      doc.line(125, y, 125, (y + 10));//left
      doc.text("Síntomas", 145, (y + 7));
      doc.line(185, y, 185, (y + 10));//left
      doc.text("Medicamentos", 225, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorG: number = 0;
      var auxLinea: number;
      var lineaPaciente;
      var lineaMedicamento;
      var lineaMedicamentoG;

      var lineaSintomas;
      var auxpalabra: string;

      var auxListMedicamentosConsumidos: cAuxMedicamentos[] = [];
      var auxListPacienteConsumos: cAuxMedicamentosByPaciente[] = [];
      for (var index = 0; index < this.dataOrdenesResult.length; index++) {
        var auxIndiceP = auxListPacienteConsumos.findIndex(x => x.nombrePaciente == this.dataOrdenesResult[index].paciente);
        if (auxIndiceP == -1) {
          if (this.dataOrdenesResult[index].paciente != "MANACRIPEX") {
            auxListPacienteConsumos.push(new cAuxMedicamentosByPaciente(this.dataOrdenesResult[index].paciente));
            auxIndiceP = auxListPacienteConsumos.length - 1;
          } else auxIndiceP = -1;
        }
        lineaPaciente = doc.splitTextToSize(this.dataOrdenesResult[index].paciente, (70));
        valorG = (3 * lineaPaciente.length) + 4;
        lineaSintomas = doc.splitTextToSize(this.dataOrdenesResult[index].sintomas, (60));
        if (((3 * lineaSintomas.length) + 4) > valorG)
          valorG = (3 * lineaSintomas.length) + 4;
        lineaMedicamentoG = [];

        for (var i = 0; i < this.dataOrdenesResult[index].listReceta.length; i++) {
          auxpalabra = this.dataOrdenesResult[index].listReceta[i].cantidad + " " + this.dataOrdenesResult[index].listReceta[i].inventario.nombre;
          lineaMedicamento = doc.splitTextToSize(auxpalabra, (100));
          lineaMedicamento.forEach(x=>lineaMedicamentoG.push(x));

          if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR" && this.parametrosBusqueda.strBodegaOrigen != "ENFERMERIA GENERAL") {
            var auxIndex = auxListMedicamentosConsumidos.findIndex(x => x.medicamentoId == this.dataOrdenesResult[index].listReceta[i].inventarioId && this.dataOrdenesResult[index].paciente != "MANACRIPEX");
            var newAuxMedicamento = new cAuxMedicamentos(this.dataOrdenesResult[index].listReceta[i].inventarioId, this.dataOrdenesResult[index].listReceta[i].inventario.nombre, this.dataOrdenesResult[index].listReceta[i].cantidad, this.dataOrdenesResult[index].listReceta[i].inventario.descripcion);
            if (auxIndex != -1) {
              auxListMedicamentosConsumidos[auxIndex].cantidadOcupada = auxListMedicamentosConsumidos[auxIndex].cantidadOcupada + this.dataOrdenesResult[index].listReceta[i].cantidad;
            } else {
              if (this.dataOrdenesResult[index].paciente != "MANACRIPEX")
                auxListMedicamentosConsumidos.push(JSON.parse(JSON.stringify(newAuxMedicamento))); 
            }
            if (auxIndiceP != -1) {
              newAuxMedicamento.fechaConsumo = this.dataOrdenesResult[index].fechaRegistro;
              newAuxMedicamento.sintomasConsumo = this.dataOrdenesResult[index].sintomas;
              auxListPacienteConsumos[auxIndiceP].listMedicamentos.push(JSON.parse(JSON.stringify(newAuxMedicamento)));
            }
          }
        }
        if (((3 * lineaMedicamentoG.length) + 4) > valorG)
          valorG = (3 * lineaMedicamentoG.length) + 4;
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

          doc.text("#", 12, (y + 7));
          doc.line(20, y, 20, (y + 10));//left
          doc.text("Fecha Registro", 23, (y + 7));
          doc.line(50, y, 50, (y + 10));//left
          doc.text("Paciente", 80, (y + 7));
          doc.line(125, y, 125, (y + 10));//left
          doc.text("Síntomas", 145, (y + 7));
          doc.line(185, y, 185, (y + 10));//left
          doc.text("Medicamentos", 225, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2

        doc.text(this.dataOrdenesResult[index].numOrdenSecuencial.toString(), 10, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.dataOrdenesResult[index].fechaRegistro, 26, (y - ((valorG - 3) / 2)));
        doc.line(50, (y - valorG), 50, y);//right
        auxLinea = Number((valorG - (3 * lineaPaciente.length + (3 * (lineaPaciente.length - 1)))) / 2.5) + (2 + lineaPaciente.length);
        doc.text(lineaPaciente, 55, (y - valorG + auxLinea));
        doc.line(125, (y - valorG), 125, y);//right

        auxLinea = Number((valorG - (3 * lineaSintomas.length + (3 * (lineaSintomas.length - 1)))) / 2.5) + (2 + lineaSintomas.length);
        doc.text(lineaSintomas, 130, (y - valorG + auxLinea));
        doc.line(185, (y - valorG), 185, y);//right
        auxLinea = Number((valorG - (3 * lineaMedicamentoG.length + (3 * (lineaMedicamentoG.length - 1)))) / 2.5) + (2 + lineaMedicamentoG.length);
        doc.text(lineaMedicamentoG, 190, (y - valorG + auxLinea));
      }

      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR" && this.parametrosBusqueda.strBodegaOrigen != "ENFERMERIA GENERAL") {
        doc.text("Pág. #" + Npag, 280, 207);
        Npag++;
        doc.addPage();
        doc.text("Pág. #" + Npag, 280, 207);
        doc.setFontSize(11);
        doc.setFont("arial", "bold")
        y = 15;
        doc.line(5, (y), 290, (y));//up
        doc.line(5, y, 5, (y + 20));//left
        doc.line(290, y, 290, (y + 20));//right
        doc.line(5, (y + 10), 290, (y + 10));//down
        doc.text("Lista de medicamento consumidos en la marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio + " del barco: " + this.parametrosBusqueda.strBodegaOrigen, 15, (y + 7));

        doc.line(5, (y + 20), 290, (y + 20));//down
        doc.text("#", 12, (y + 17));
        doc.line(20, (y + 10), 20, (y + 20));//left
        doc.text("Medicamento", 35, (y + 17));
        doc.line(110, (y + 10), 110, (y + 20));//left
        doc.text("Descripción", 175, (y + 17));
        doc.line(255, (y + 10), 255, (y + 20));//left
        doc.text("Utilizado", 267, (y + 17));

        doc.setFontSize(9);
        doc.setFont("arial", "normal")
        y = y + 20;
        for (var index = 0; index < auxListMedicamentosConsumidos.length; index++) {
          y = y + 7;
          if (y > 200) {
            Npag++;
            doc.addPage();
            doc.text("Pág. #" + Npag, 280, 207);
            doc.setFontSize(11);
            doc.setFont("arial", "bold")
            y = 15;
            doc.line(5, (y), 290, (y));//up
            doc.line(5, y, 5, (y + 20));//left
            doc.line(290, y, 290, (y + 20));//right
            doc.line(5, (y + 10), 290, (y + 10));//down

            doc.text("Lista de medicamento ocupados en la marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio + " del barco: " + this.parametrosBusqueda.strBodegaOrigen, 15, (y + 7));
            doc.line(5, (y + 20), 290, (y + 20));//down
            doc.text("#", 12, (y + 17));
            doc.line(20, (y + 10), 20, (y + 20));//left
            doc.text("Medicamento", 35, (y + 17));
            doc.line(110, (y + 10), 110, (y + 20));//left
            doc.text("Descripción", 175, (y + 17));
            doc.line(255, (y + 10), 255, (y + 20));//left
            doc.text("Utilizado", 267, (y + 17));

            doc.setFontSize(9);
            doc.setFont("arial", "normal")
            y = y + 27;
          }
          doc.line(5, (y - 7), 5, y);//left
          doc.line(290, (y - 7), 290, y);//right
          doc.line(5, y, 290, y);//down +10y1y2
          doc.text((index + 1).toString(), 11, (y - 2));
          doc.line(20, (y - 7), 20, y);//right
          doc.text(auxListMedicamentosConsumidos[index].nombreMedicamento, 25, (y - 2));
          doc.line(110, (y - 7), 110, y);//right
          doc.text(auxListMedicamentosConsumidos[index].descripcionMedicamento, 115, (y - 2));
          doc.line(255, (y - 7), 255, y);//right
          doc.text(auxListMedicamentosConsumidos[index].cantidadOcupada.toString(), 270, (y - 2));
        }
        var auxIndex = -1;
        if ((auxIndex = this.dataOrdenesResult.findIndex(x => x.paciente == "MANACRIPEX")) != -1) {
          doc.setFontSize(11);
          doc.setFont("arial", "bold")
          y = y + 10;
          doc.line(5, (y), 290, (y));//up
          doc.line(5, y, 5, (y + 20));//left
          doc.line(290, y, 290, (y + 20));//right
          doc.line(5, (y + 10), 290, (y + 10));//down

          doc.text("Lista de medicamento de diferencia en la marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio + " del barco: " + this.parametrosBusqueda.strBodegaOrigen, 15, (y + 7));
          doc.line(5, (y + 20), 290, (y + 20));//down
          doc.text("#", 12, (y + 17));
          doc.line(20, (y + 10), 20, (y + 20));//left
          doc.text("Medicamento", 35, (y + 17));
          doc.line(110, (y + 10), 110, (y + 20));//left
          doc.text("Descripción", 175, (y + 17));
          doc.line(255, (y + 10), 255, (y + 20));//left
          doc.text("Utilizado", 267, (y + 17));

          doc.setFontSize(9);
          doc.setFont("arial", "normal")
          y = y + 20;

          for (var index = 0; index < this.dataOrdenesResult[auxIndex].listReceta.length; index++) {
            y = y + 7;
            if (y > 200) {
              Npag++;
              doc.addPage();
              doc.text("Pág. #" + Npag, 280, 207);
              doc.setFontSize(11);
              doc.setFont("arial", "bold")
              y = 15;
              doc.line(5, (y), 290, (y));//up
              doc.line(5, y, 5, (y + 20));//left
              doc.line(290, y, 290, (y + 20));//right
              doc.line(5, (y + 10), 290, (y + 10));//down

              doc.text("Lista de medicamento ocupados en la marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio + " del barco: " + this.parametrosBusqueda.strBodegaOrigen, 15, (y + 7));
              doc.line(5, (y + 20), 290, (y + 20));//down
              doc.text("#", 12, (y + 17));
              doc.line(20, (y + 10), 20, (y + 20));//left
              doc.text("Medicamento", 35, (y + 17));
              doc.line(110, (y + 10), 110, (y + 20));//left
              doc.text("Descripción", 175, (y + 17));
              doc.line(255, (y + 10), 255, (y + 20));//left
              doc.text("Utilizado", 267, (y + 17));

              doc.setFontSize(9);
              doc.setFont("arial", "normal")
              y = y + 27;
            }
            doc.line(5, (y - 7), 5, y);//left
            doc.line(290, (y - 7), 290, y);//right
            doc.line(5, y, 290, y);//down +10y1y2
            doc.text((index + 1).toString(), 11, (y - 2));
            doc.line(20, (y - 7), 20, y);//right
            doc.text(this.dataOrdenesResult[auxIndex].listReceta[index].inventario.nombre, 25, (y - 2));
            doc.line(110, (y - 7), 110, y);//right
            doc.text(this.dataOrdenesResult[auxIndex].listReceta[index].inventario.descripcion != null ? this.dataOrdenesResult[auxIndex].listReceta[index].inventario.descripcion : "", 115, (y - 2));
            doc.line(255, (y - 7), 255, y);//right
            doc.text(this.dataOrdenesResult[auxIndex].listReceta[index].cantidad.toString(), 270, (y - 2));
          }
        }
      }
      
      /**aquiiii nuevo */
      if (this.parametrosBusqueda.strBodegaOrigen != "SIN ASIGNAR" && this.parametrosBusqueda.strBodegaOrigen != "ENFERMERIA GENERAL") {
        var doc2 = new jsPDF();
        var y: number = 12;
        var lineaSintoma;
        var valorG: number = 0;
        for (var i = 0; i < auxListPacienteConsumos.length; i++) {
          if (i % 2 == 0) {
            y = 12;
            if (i != 0)
              doc2.addPage();
            doc2.line(1, (147), 209, (147));//downCut
          } else y = 160

          doc2.setFontSize(11);
          doc2.setFont("arial", "bold");

          doc2.line(9, y, 199, y);//up
          doc2.line(9, y, 9, (y + 12));//left
          doc2.line(199, y, 199, (y + 12));//right
          doc2.line(9, (y + 12), 199, (y + 12));//down
          doc2.text("Lista de medicamentos consumidos por: " + auxListPacienteConsumos[i].nombrePaciente, 15, (y + 5));
          doc2.text("Marea: " + this.parametrosBusqueda.marea + "-" + this.parametrosBusqueda.anio + "                 Barco: " + this.parametrosBusqueda.strBodegaOrigen, 15, (y + 9));
          y = y + 12;
          doc2.setFontSize(10);
          doc2.line(9, y, 9, (y + 9));//left
          doc2.line(199, y, 199, (y + 9));//right
          doc2.text("Fecha Registro", 11, (y + 6));
          doc2.line(35, y, 35, (y + 9));//left
          doc2.text("Cantidad", 36, (y + 6));
          doc2.line(51, y, 51, (y + 9));//left
          doc2.text("Medicamento", 80, (y + 6));
          doc2.line(125, y, 125, (y + 9));//left
          doc2.text("Sintomas", 155, (y + 6));
          doc2.line(9, (y + 9), 199, (y + 9));//down
          y = y + 9;
          doc2.setFontSize(9);
          doc2.setFont("arial", "normal");

          for (var j = 0; j < auxListPacienteConsumos[i].listMedicamentos.length; j++) {
            lineaSintoma = doc2.splitTextToSize(auxListPacienteConsumos[i].listMedicamentos[j].sintomasConsumo, (69));
            
            valorG = (3 * lineaSintoma.length) + 3;
            y = y + valorG;
            let auxPrueba = Number((valorG - (3 * lineaSintoma.length + (3 * (lineaSintoma.length - 1)))) / 2.5) + 3;
            doc2.line(9, (y - valorG), 9, y);//left
            doc2.line(199, (y - valorG), 199, y);//right

            doc2.text(auxListPacienteConsumos[i].listMedicamentos[j].fechaConsumo, 14,  (y - ((valorG - 3) / 2)));
            doc2.line(35, (y - valorG), 35, y);//left
            doc2.text(auxListPacienteConsumos[i].listMedicamentos[j].cantidadOcupada.toString(), 43,  (y - ((valorG - 3) / 2)));
            doc2.line(51, (y - valorG), 51, y);//left
            doc2.text(auxListPacienteConsumos[i].listMedicamentos[j].nombreMedicamento, 55,  (y - ((valorG - 3) / 2)));
            doc2.line(125, (y - valorG), 125, y);//left
            doc2.text(lineaSintoma, 128, (y - valorG + auxPrueba));
            doc2.line(9, y , 199, y);//down
          }

          if (i % 2 == 0)
            y = 130
          else y = 275;

          doc2.setFont("arial", "normal");
          doc2.setFontSize(10);
          doc2.line(35, (y), 85, (y));//downCut
          doc2.text(this.dataOrdenesResult[0].guardiaCargoUser , 48, (y + 4));
          doc2.line(115, (y), 165, (y));//downCut
          doc2.text(auxListPacienteConsumos[i].nombrePaciente, 110, (y + 4));

          doc2.setFontSize(11);
          doc2.setFont("arial", "bold");
          doc2.text("*** Nota:", 20, (y + 11));
          doc2.setFont("arial", "normal");
          doc2.setFontSize(10);
          doc2.text("Estos medicamentos NO serán descontados en ningún momento y serán asumidos por la empresa.", 37, (y + 11));
          doc2.setFontSize(11);
          doc2.setFont("arial", "bold");
          doc2.text("***", 178, (y + 11));
        }
        doc2.save("personalConsulta" + this.fechaHoy.strFecha + ".pdf");
      }
      doc.save("ListaConsulta" + this.fechaHoy.strFecha + ".pdf");
    }
  }
}
