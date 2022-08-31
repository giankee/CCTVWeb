import { Component, Input, OnInit } from '@angular/core';
import { faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faPrint, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { cPermisoMedic } from 'src/app/shared/medicina/medicina';
import { PermisoService } from 'src/app/shared/medicina/permiso.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-list-permisos-personales',
  templateUrl: './list-permisos-personales.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListPermisosPersonalesComponent implements OnInit {
  public get permisoMedicService(): PermisoService {
    return this._permisoMedicService;
  }
  public set permisoMedicService(value: PermisoService) {
    this._permisoMedicService = value;
  }

  @Input() isOpen: boolean;
  @Input() idPacienteIn: number;
  @Input() pacienteNombre: string;

  listGeneral: cPermisoMedic[] = [];
  paginacion = new cPaginacion(5);
  spinnerOnOff: boolean = true;
  ordenBy: string = "default";

  faeye = faEye; fatimesCircle = faTimesCircle; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; sort = faSort;
  constructor(private _permisoMedicService: PermisoService, private consultaPipe: SortPipe) { }

  ngOnInit(): void {
    this._permisoMedicService.getListPermisosPersona(this.idPacienteIn).subscribe((res: any) => {
      if (res.message == "Ok")
        this.listGeneral = res.data;
      this.paginacion.getNumberIndex(this.listGeneral.length);
      this.spinnerOnOff = false;
    });
  }

  onConvertPdfAll() {
    if (this.listGeneral.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenBy != "default")
        this.listGeneral = this.consultaPipe.transform(this.listGeneral, this.ordenBy, 'cPermisoMedic');

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Permisos", 120, 15);

      y = 20;
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 15));//left
      doc.line(290, y, 290, (y + 15));//right
      doc.line(5, (y + 15), 290, (y + 15));//down

      doc.setFontSize(12);
      doc.setFont("arial", "bold")
      doc.text("Resultados", 15, (y + 5));
      doc.setFont("arial", "normal");
      doc.setFontSize(11);
      doc.text("Número de permisos encontrados: " + this.listGeneral.length, 10, (y + 10));
      doc.text("Resultados a mostrar: " + this.listGeneral.length + "/" + this.paginacion.selectPagination, 80, (y + 10));
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
      doc.text("Tipo Permiso", 25, (y + 7));
      doc.line(55, y, 55, (y + 10));//left
      doc.text("Enfermedad CIE10", 75, (y + 7));
      doc.line(125, y, 125, (y + 10));//left
      doc.text("Fecha Salida", 130, (y + 7));
      doc.line(155, y, 155, (y + 10));//left
      doc.text("Fecha Regreso", 160, (y + 7));
      doc.line(185, y, 185, (y + 10));//left
      doc.text("T. Días", 187, (y + 7));
      doc.line(200, y, 200, (y + 10));//left
      doc.text("T. Horas", 201, (y + 7));
      doc.line(215, y, 215, (y + 10));//left
      doc.text("Observación", 240, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorE: number = 0;
      var valorO: number = 0;
      var valorG: number = 0;
      var auxLinea: number;
      var lineaEnfermedad;
      var lineaObservacion;

      for (var index = 0; index < this.listGeneral.length; index++) {
        lineaEnfermedad = doc.splitTextToSize(this.listGeneral[index].enfermedadCIE10, (65));
        lineaObservacion = doc.splitTextToSize(this.listGeneral[index].observacion, (70));

        valorE = (3 * lineaEnfermedad.length) + 4;
        valorO = (3 * lineaObservacion.length) + 4;
        if (valorE >= valorO)
          valorG = valorE;
        else valorG=valorO;
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
          doc.text("Tipo Permiso", 25, (y + 7));
          doc.line(55, y, 55, (y + 10));//left
          doc.text("Enfermedad CIE10", 75, (y + 7));
          doc.line(125, y, 125, (y + 10));//left
          doc.text("Fecha Salida", 130, (y + 7));
          doc.line(155, y, 155, (y + 10));//left
          doc.text("Fecha Regreso", 160, (y + 7));
          doc.line(185, y, 185, (y + 10));//left
          doc.text("T. Días", 187, (y + 7));
          doc.line(200, y, 200, (y + 10));//left
          doc.text("T. Horas", 201, (y + 7));
          doc.line(215, y, 215, (y + 10));//left
          doc.text("Observación", 240, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2

        doc.text((index + 1).toString(), 12, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.listGeneral[index].tipoPermiso, 25, (y - ((valorG - 3) / 2)));
        doc.line(55, (y - valorG), 55, y);//right
        auxLinea = Number((valorG - (3 * lineaEnfermedad.length + (3 * (lineaEnfermedad.length - 1)))) / 2.5) + (2 + lineaEnfermedad.length);
        doc.text(lineaEnfermedad, 58, (y - valorG + auxLinea));
        doc.line(125, (y - valorG), 125, y);//right
        doc.text(this.listGeneral[index].fechaSalida, 128, (y - ((valorG - 3) / 2)));
        doc.line(155, (y - valorG), 155, y);//right
        doc.text(this.listGeneral[index].fechaRegreso, 158, (y - ((valorG - 3) / 2)));
        doc.line(185, (y - valorG), 185, y);//right
        doc.text(this.listGeneral[index].totalDias.toString(), 190, (y - ((valorG - 3) / 2)));
        doc.line(200, (y - valorG), 200, y);//right
        doc.text(this.listGeneral[index].totalHoras.toString(), 205, (y - ((valorG - 3) / 2)));
        doc.line(215, (y - valorG), 215, y);//right
        auxLinea = Number((valorG - (3 * lineaObservacion.length + (3 * (lineaObservacion.length - 1)))) / 2.5) + (2 + lineaObservacion.length);
        doc.text(lineaObservacion, 220, (y - valorG + auxLinea));
      }
      doc.save("ListaPermisos_"+this.pacienteNombre + ".pdf");
    }
  }

  onOrdenGeneral(tipo: string) {
    if (tipo == "Enfermedad") {
      if (this.ordenBy == "default" || this.ordenBy == "down-E")
        this.ordenBy = "up-E";
      else this.ordenBy = "down-E";
    }
    if (tipo == "TipoPermiso") {
      if (this.ordenBy == "default" || this.ordenBy == "down-T")
        this.ordenBy = "up-T";
      else this.ordenBy = "down-T";
    }
  }
}
