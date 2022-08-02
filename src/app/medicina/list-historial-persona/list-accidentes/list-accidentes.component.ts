import { Component, Input, OnInit } from '@angular/core';
import { faArrowAltCircleLeft, faArrowAltCircleRight, faEye, faPrint, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { AccidenteService } from 'src/app/shared/medicina/accidente.service';
import { cAccidenteMedic } from 'src/app/shared/medicina/medicina';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { jsPDF } from "jspdf";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ViewAccidenteModelComponent } from '../../new-accidente/view-accidente-model/view-accidente-model.component';

@Component({
  selector: 'app-list-accidentes',
  templateUrl: './list-accidentes.component.html',
  styles: [],
  providers: [SortPipe]
})
export class ListAccidentesComponent implements OnInit {
  public get accidenteMedicService(): AccidenteService {
    return this._accidenteMedicService;
  }
  public set accidenteMedicService(value: AccidenteService) {
    this._accidenteMedicService = value;
  }

  @Input() isOpen: boolean;
  @Input() idPacienteIn: number;
  @Input() pacienteNombre: string;

  listGeneral: cAccidenteMedic[] = [];
  paginacion = new cPaginacion(5);
  spinnerOnOff: boolean = true;
  ordenBy: string = "default";

  faeye = faEye; fatimesCircle = faTimesCircle; faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; sort = faSort;
  constructor(private _accidenteMedicService: AccidenteService, private consultaPipe: SortPipe,private dialog: MatDialog) { }

  ngOnInit(): void {
    this.accidenteMedicService.getListAccidentesPersona(this.idPacienteIn).subscribe((res: any) => {
      if (res.message == "Ok")
        this.listGeneral = res.data;
      this.paginacion.getNumberIndex(this.listGeneral.length);
      this.spinnerOnOff = false;
    });
  }

  onModal(dataIn: cAccidenteMedic) {
    var auxId = dataIn.idAccidenteMedic;
    var auxPacienteNombre=this.pacienteNombre;
    const dialoConfig = new MatDialogConfig();
    dialoConfig.autoFocus = true;
    dialoConfig.disableClose = false;
    dialoConfig.data = { auxId, auxPacienteNombre }
    this.dialog.open(ViewAccidenteModelComponent, dialoConfig);
    this._accidenteMedicService.formData = new cAccidenteMedic();
    this._accidenteMedicService.formData.completarObject(dataIn);
  }

  onConvertPdfAll() {
    if (this.listGeneral.length > 0) {
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenBy != "default")
        this.listGeneral = this.consultaPipe.transform(this.listGeneral, this.ordenBy, 'cAccidenteMedic');

      doc.setFontSize(17);
      doc.setFont("arial", "bold")
      doc.text("Lista de Accidentes", 120, 15);

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
      doc.text("Número de accidentes encontrados: " + this.listGeneral.length, 10, (y + 10));
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
      doc.text("Fecha Salida", 25, (y + 7));
      doc.line(50, y, 50, (y + 10));//left
      doc.text("Fecha Regreso", 55, (y + 7));
      doc.line(80, y, 80, (y + 10));//left
      doc.text("T. Horas", 81, (y + 7));
      doc.line(95, y, 95, (y + 10));//left
      doc.text("Lugar", 115, (y + 7));
      doc.line(140, y, 140, (y + 10));//left
      doc.text("Descripción", 165, (y + 7));
      doc.line(210, y, 210, (y + 10));//left
      doc.text("Causa", 220, (y + 7));
      doc.line(255, y, 255, (y + 10));//left
      doc.text("Jefe área", 265, (y + 7));

      y = y + 10;
      doc.setFontSize(8);
      doc.setFont("arial", "normal");

      var valorD: number = 0;
      var valorC: number = 0;
      var valorG: number = 0;
      var auxLinea: number;
      var lineaDescripcion;
      var lineaCausa;

      for (var index = 0; index < this.listGeneral.length; index++) {
        lineaDescripcion = doc.splitTextToSize(this.listGeneral[index].descripcion, (65));
        lineaCausa = doc.splitTextToSize(this.listGeneral[index].causaAccidente, (40));

        valorD = (3 * lineaDescripcion.length) + 4;
        valorC = (3 * lineaCausa.length) + 4;
        if (valorD >= valorC)
          valorG = valorD;
        else valorG = valorC;
        y = y + valorG;

        if (y > 280) {
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
          doc.text("Fecha Salida", 25, (y + 7));
          doc.line(50, y, 50, (y + 10));//left
          doc.text("Fecha Regreso", 55, (y + 7));
          doc.line(80, y, 80, (y + 10));//left
          doc.text("T. Horas", 81, (y + 7));
          doc.line(95, y, 95, (y + 10));//left
          doc.text("Lugar", 115, (y + 7));
          doc.line(140, y, 140, (y + 10));//left
          doc.text("Descripción", 165, (y + 7));
          doc.line(210, y, 210, (y + 10));//left
          doc.text("Causa", 220, (y + 7));
          doc.line(255, y, 255, (y + 10));//left
          doc.text("Jefe área", 265, (y + 7));

          y = y + 10 + valorG;
          doc.setFontSize(8);
          doc.setFont("arial", "normal");
        }

        doc.line(5, (y - valorG), 5, y);//left
        doc.line(290, (y - valorG), 290, y);//right
        doc.line(5, y, 290, y);//down +10y1y2

        doc.text((index + 1).toString(), 12, (y - ((valorG - 3) / 2)));
        doc.line(20, (y - valorG), 20, y);//right
        doc.text(this.listGeneral[index].fechaRegistro, 23, (y - ((valorG - 3) / 2)));
        doc.line(50, (y - valorG), 50, y);//right
        doc.text(this.listGeneral[index].fechaRegreso, 53, (y - ((valorG - 3) / 2)));
        doc.line(80, (y - valorG), 80, y);//right
        doc.text(this.listGeneral[index].totalHoras.toString(), 85, (y - ((valorG - 3) / 2)));
        doc.line(95, (y - valorG), 95, y);//right
        doc.text(this.listGeneral[index].lugarAccidente, 100, (y - ((valorG - 3) / 2)));
        doc.line(140, (y - valorG), 140, y);//right
        auxLinea = Number((valorG - (3 * lineaDescripcion.length + (3 * (lineaDescripcion.length - 1)))) / 2.5) + (2 + lineaDescripcion.length);
        doc.text(lineaDescripcion, 143, (y - valorG + auxLinea));
        doc.line(210, (y - valorG), 210, y);//right
        auxLinea = Number((valorG - (3 * lineaCausa.length + (3 * (lineaCausa.length - 1)))) / 2.5) + (2 + lineaCausa.length);
        doc.text(lineaCausa, 213, (y - valorG + auxLinea));
        doc.line(255, (y - valorG), 255, y);//right
        doc.text(this.listGeneral[index].jefeInmediato, 258, (y - ((valorG - 3) / 2)));        
      }
      doc.save("ListaAccidentes_" + this.pacienteNombre + ".pdf");
    }
  }

  onOrdenGeneral(tipo: string) {
    if (tipo == "Causa") {
      if (this.ordenBy == "default" || this.ordenBy == "down-C")
        this.ordenBy = "up-C";
      else this.ordenBy = "down-C";
    }
  }
}
