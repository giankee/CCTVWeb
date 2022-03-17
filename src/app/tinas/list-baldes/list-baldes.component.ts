import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { finalize, first, map } from 'rxjs/operators';
import { BaldeService } from 'src/app/shared/balde.service';
import { cBalde } from 'src/app/shared/basicos';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cFecha, cVario } from 'src/app/shared/otrosServices/varios';
import { faSort, faPencilAlt, faEye, faEraser, faSave, faTimesCircle, faSearch, faAngleDown, faAngleLeft, faPrint, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { jsPDF } from "jspdf";
import { SortPipe } from 'src/app/pipes/sort.pipe';

@Component({
  selector: 'app-list-baldes',
  templateUrl: './list-baldes.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListBaldesComponent implements OnInit {
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
  public get baldeService(): BaldeService {
    return this._baldeService;
  }
  public set baldeService(value: BaldeService) {
    this._baldeService = value;
  }

  internetStatus: string = 'nline';
  ordenBy: string = "num-up";
  filtroBaldeG = '';
  filtroBaldeEstado = "All";
  fechaHoy = new cFecha();
  paginacion = new cPaginacion(20);
  autoFocus: boolean = false;
  modoEdicion: boolean = false;
  spinnerOnOff: boolean = false;
  spinLoadingG = 0;
  showSearchSelectG = 0;

  listBaldes$: Observable<cBalde[]>;
  numLengthBalde: number = 0;
  listVariosFiltros$: Observable<cVario[]>;

  sort = faSort; fapencilAlt = faPencilAlt; faeye = faEye; fasave = faSave; fatimesCircle = faTimesCircle; fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;
  constructor(private _conexcionService: ConexionService, private toastr: ToastrService, private _baldeService: BaldeService, private _variosService: VariosService, private ordenarPipe: SortPipe) {
    this._baldeService.formData = new cBalde();
  }

  ngOnInit(): void {
    this._conexcionService.msg$.subscribe(mensajeStatus => {
      this.internetStatus = mensajeStatus.connectionStatus;
    });
    this.cargarData();
    this.resetForm();
  }

  cargarData() {//Datos de los ordenes traidos desde db
    this.spinnerOnOff = true;
    this.listBaldes$ = this._baldeService.getBaldes().pipe(
      map((x: cBalde[]) => {
        var auxBalde = new cBalde()
        x.forEach(y => {
          if (y.estadoBalde == "Prestado" && y.fechaPDevolucion != null) {
            auxBalde.completarObj(y);
            y.colorFecha = auxBalde.colorFecha;
          } else y.colorFecha = "normal";
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => this.spinnerOnOff = false)
    );
  }

  onListLugares(value: string) {
    this.spinLoadingG = 1;
    this.showSearchSelectG = 1;
    if (!value)
      var params = "Balde@DatoNull";
    else {
      this.baldeService.formData.ubicacionActual = value.toUpperCase();
      var params = "Balde@" + this.baldeService.formData.ubicacionActual;
    }
    this.listVariosFiltros$ = this._variosService.getLugarSearch(params).pipe(map((x: cVario[]) => {
      return x;
    }),
      finalize(() => {
        this.spinLoadingG = 0;
      })
    );
  }

  onChooseLugar(data: any) {
    this._baldeService.formData.ubicacionActual = data.nombre;
    this.showSearchSelectG = 0;
  }

  resetForm(form?: NgForm) {//Para que los valores en el html esten vacios
    if (form != null) {
      form.resetForm();
    }
    this.autoFocus = false;
    this.showSearchSelectG = 0;
    this.spinLoadingG = 0;
    this._baldeService.formData.resetObj();
    this.modoEdicion = false;
  }

  onCompletarForm(dato: cBalde, form?: NgForm) {//Para LLenar la informacion al formulario
    if (form == null) {
      this._baldeService.formData = new cBalde();
      this._baldeService.formData.completarObj(dato);
      this.modoEdicion = true;
    }
  }

  getDataFiltro(n) {//Para q la filtracion de datos se automatica
    if (n != undefined && n != this.numLengthBalde) {
      this.numLengthBalde = n;
      this.paginacion.getNumberIndex(n);
    }
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.numLengthBalde);
    this.paginacion.updateIndex(0);
  }

  onOrdenListBy(op: number) {
    if (op == 1) {
      if (this.ordenBy == "num-down")
        this.ordenBy = "num-up";
      else this.ordenBy = "num-down";
    } else {
      if (this.ordenBy == "est-down")
        this.ordenBy = "est-up";
      else this.ordenBy = "est-down";
    }
  }

  onSubmit(form: NgForm) {
    this.autoFocus = false;
    if (this.modoEdicion) {
      this._baldeService.actualizarBalde(this._baldeService.formData).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Modificación satisfactoria', 'Balde Modificado');
            this.listBaldes$ = this.listBaldes$.pipe(map((x: cBalde[]) => x),
              finalize(() => {
                this.resetForm();
              }));
          } else {
            this.toastr.error(res.message, 'Modificación fallida.');
            if (res.message == "Número de Balde Duplicado") {
              this._baldeService.formData.numBalde = undefined;
              this.autoFocus = true;
            }
          }
        }
      );
    }
    else {
      this._baldeService.insertarBalde(this._baldeService.formData).subscribe(
        (res: any) => {
          if (res.message == "DuplicateCode") {
            this.toastr.error('Balde esta duplicado', 'Registro fallido.');
            this._baldeService.formData.numBalde = null;
            this.autoFocus = true;
          } else {
            this.toastr.success('Ingreso satisfactorio', 'Balde Registrado');
            this.ordenBy = "default";
            this._baldeService.formData.idBalde = res.idBalde;
            this.listBaldes$ = this.listBaldes$.pipe(map((x: cBalde[]) => x),
              finalize(() => {
                this.resetForm()
              }));
          }
        }
      );
    }
  }

  onConvertPdfAll(result: cBalde[]) {
    var y: number;
    var doc = new jsPDF();

    doc.setFontSize(17);
    doc.setFont("arial", "bold")
    doc.text("Lista de Baldes", 75, 20);

    y = 25;
    doc.line(9, y, 199, y);//up
    doc.line(9, y, 9, (y + 40));//left
    doc.line(199, y, 199, (y + 40));//right
    doc.setFontSize(13);
    doc.text("Parámetros de Búsqueda", 15, (y + 10));
    doc.setFont("arial", "normal")
    doc.setFontSize(11);

    if (this.filtroBaldeEstado == "All")
      doc.text("Estado Balde: Todas las coincidencias", 20, (y + 15));
    else doc.text("Estado Balde: " + this.filtroBaldeEstado, 20, (y + 15));
    doc.text("Palabra Clave: " + this.filtroBaldeG, 105, (y + 15));

    y = y + 15;
    doc.line(9, (y + 25), 199, (y + 25));//down
    doc.setFontSize(14);
    doc.setFont("arial", "bold")
    doc.text("Resultados", 15, (y + 10));
    doc.setFontSize(12);
    doc.setFont("arial", "normal")
    doc.text("Número baldes encontradas:" + result.length, 20, (y + 15));
    doc.text("Resultados a mostrar: " + result.length + "/" + this.paginacion.selectPagination, 105, (y + 15));
    doc.text("Número página seleccionada: " + (this.paginacion.pagActualIndex + 1), 20, (y + 20));
    doc.text("Número de resultados por página: " + (this.paginacion.selectPagination), 105, (y + 20));

    y = y + 25;
    doc.setFontSize(10);
    doc.setFont("arial", "bold")
    doc.line(9, y, 9, (y + 10));//left
    doc.line(199, y, 199, (y + 10));//right
    doc.line(9, (y + 10), 199, (y + 10));//down
    doc.text("# Balde", 13, (y + 7));
    doc.line(32, y, 32, (y + 10));//right
    doc.text("Propietario", 35, (y + 7));
    doc.line(67, y, 67, (y + 10));//right
    doc.text("Ubicación Actual", 70, (y + 7));
    doc.line(105, y, 105, (y + 10));//right
    doc.text("Actividad", 108, (y + 7));
    doc.line(130, y, 130, (y + 10));//right
    doc.text("Estado Balde", 133, (y + 7));
    doc.line(165, y, 165, (y + 10));//right
    doc.text("Fecha Devolución", 168, (y + 7));

    y = y + 10;
    doc.setFontSize(8);
    doc.setFont("arial", "normal");

    for (var i = 0; i < result.length; i++) {
      y = y + 10;

      if (y > 280) {
        doc.addPage();
        doc.setFontSize(10);
        doc.setFont("arial", "bold")
        y = 20;
        doc.line(9, y, 199, y);//up
        doc.line(9, y, 9, (y + 10));//left
        doc.line(199, y, 199, (y + 10));//right
        doc.line(9, (y + 10), 199, (y + 10));//down

        doc.text("# Balde", 13, (y + 7));
        doc.line(32, y, 32, (y + 10));//right
        doc.text("Propietario", 35, (y + 7));
        doc.line(67, y, 67, (y + 10));//right
        doc.text("Ubicación Actual", 70, (y + 7));
        doc.line(105, y, 105, (y + 10));//right
        doc.text("Actividad", 108, (y + 7));
        doc.line(130, y, 130, (y + 10));//right
        doc.text("Estado Balde", 133, (y + 7));
        doc.line(165, y, 165, (y + 10));//right
        doc.text("Fecha Devolución", 168, (y + 7));

        y = y + 20;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");
      }
      doc.line(9, y, 199, y);//down +10y1y2

      doc.line(9, (y - 10), 9, y);//left
      doc.line(199, (y - 10), 199, y);//right

      doc.text(result[i].numBalde.toString(), 13, (y - ((7) / 2)));
      doc.line(32, (y - 10), 32, y);//right
      doc.text(result[i].propietario, 35, (y - ((7) / 2)));
      doc.line(67, (y - 10), 67, y);//right
      doc.text(result[i].ubicacionActual, 70, (y - ((7) / 2)));
      doc.line(105, (y - 10), 105, y);//right
      doc.text(result[i].actividad, 108, (y - ((7) / 2)));
      doc.line(130, (y - 10), 130, y);//right
      doc.text(result[i].estadoBalde, 133, (y - ((7) / 2)));
      doc.line(165, (y - 10), 165, y);//right
      if (result[i].fechaPDevolucion != null)
        doc.text(result[i].fechaPDevolucion, 168, (y - ((7) / 2)));
      else doc.text("NaN", 168, (y - ((7) / 2)));
    }
    doc.save("ListaBaldes" + this.fechaHoy.strFecha + ".pdf");

  }

  onFiltrarCampos() {
    this.spinnerOnOff = true;
    var params = "MANACRIPEX@datoNull@datoNull@" + this.filtroBaldeEstado;
    this.listBaldes$ = this._baldeService.getBaldesParams(params).pipe(
      map((x: cBalde[]) => {
        var auxBalde = new cBalde()
        x.forEach(y => {
          if (y.estadoBalde == "Prestado" && y.fechaPDevolucion != null) {
            auxBalde.completarObj(y);
            y.colorFecha = auxBalde.colorFecha;
          } else y.colorFecha = "normal";
        });
        this.paginacion.getNumberIndex(x.length);
        return x;
      }),
      finalize(() => {
        this.spinnerOnOff = false;
        this.paginacion.updateIndex(0);
      })
    );
  }

  onVerHistorial(dato: cBalde) {

  }
}
