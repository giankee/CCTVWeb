import { Component, Input, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faEye, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cObjR, cReportGeneralMedic, cReportGeneralMedicList } from 'src/app/shared/medicina/medicina';
import { cFecha } from 'src/app/shared/otrosServices/varios';
import { jsPDF } from "jspdf";
import { SortPipe } from 'src/app/pipes/sort.pipe';
import { SumartotalesPipe } from 'src/app/pipes/sumartotales.pipe';

@Component({
  selector: 'app-ausentisimo-report',
  templateUrl: './ausentisimo-report.component.html',
  styles: [],
  providers: [SortPipe,SumartotalesPipe]
})
export class AusentisimoReportComponent implements OnInit {

  @Input() listAusentisismoIn: cReportGeneralMedic[];
  @Input() tipoR: string;
  @Input() empresa: number;

  ordenBy: string = "default";
  dataEnfermedadesResult: cReportGeneralMedic[] = [];
  paramsReport: {
    filtroBusqueda: string,
    isNormal: boolean,
    isControl: boolean,
    contEnfermedadesNormal: number,
    contEnfermedadesControl: number
    contOcurrenciaNormal: number,
    contOcurrenciaControl: number
  }
  listObjetosIn: cObjR[] = [];

  sort = faSort; faeye = faEye; faprint = faPrint; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; fasearch = faSearch;
  constructor(private sortPipe: SortPipe, private sumTotales:SumartotalesPipe) { }

  ngOnInit(): void {
    this.paramsReport = {
      filtroBusqueda: "",
      isNormal: true,
      isControl: true,
      contEnfermedadesControl: 0,
      contEnfermedadesNormal: 0,
      contOcurrenciaNormal: 0,
      contOcurrenciaControl: 0
    }
    if (this.listAusentisismoIn != null) {
      if (this.tipoR == "caseD") {
        if (this.listAusentisismoIn.filter(x => x.listObj.length > 0).length > 0) {
          this.listAusentisismoIn.forEach(x => {
            x.listObj.forEach(y => {
              if (this.listObjetosIn.find(z => z.name == y.objName) == undefined) {
                var auxNewD = new cObjR(y.objName);
                this.listObjetosIn.push(auxNewD);
              }
            });
          }
          );
          this.listAusentisismoIn.forEach(x => {
            for (var i = 0; i < this.listObjetosIn.length; i++) {
              if (x.listObj.find(y => y.objName == this.listObjetosIn[i].name) == undefined) {
                var auxNewD = new cReportGeneralMedicList(this.listObjetosIn[i].name, 0);
                x.listObj.push(auxNewD);
              }
            }
          });
        }
      } else {
        this.paramsReport.isControl = false;
        this.paramsReport.isNormal = false;
        var fechaHoy: cFecha = new cFecha();
        for (var i = 0; i < fechaHoy.arrayMes.length; i++) {
          var auxNewD = new cObjR(fechaHoy.arrayMes[i].nombre);
          this.listObjetosIn.push(auxNewD);
        }
      }
    }

  }

  onOrdenListBy(op: number) {
    switch (op) {
      case 1:
        if (this.ordenBy == "up-E")
          this.ordenBy = "down-E";
        else this.ordenBy = "up-E";
        break;
      case 2:
        if (this.ordenBy == "up-C")
          this.ordenBy = "down-C";
        else this.ordenBy = "up-C";
        break;
      default: this.ordenBy = "default";
    }
  }

  getDataFiltro(data: cReportGeneralMedic[]) {
    if (data.length != undefined && data.length != this.dataEnfermedadesResult.length) {
      this.dataEnfermedadesResult = data;
    }
  }

  onConvertPdfAll() {
    if (this.dataEnfermedadesResult.length > 0) {
      var fechaHoy: cFecha = new cFecha();
      var y: number;
      var Npag: number = 1;
      var doc = new jsPDF({
        orientation: "landscape",
      });
      if (this.ordenBy != "default")
        this.dataEnfermedadesResult = this.sortPipe.transform(this.dataEnfermedadesResult, this.ordenBy, 'cReportGeneralMedic');

      doc.setFont("arial", "bold");

      var auxImage = new Image();
      auxImage.src = "/assets/img/LOGO_" + this.empresa + ".png";
      if (this.empresa == 1)
        doc.addImage(auxImage, "PNG", 18, 4, 27, 17);
  
      if (this.empresa == 3)
        doc.addImage(auxImage, "PNG", 18, 4, 25, 15);
  
      if (this.empresa == 4)
        doc.addImage(auxImage, "PNG", 18, 4, 27, 17);


      if (this.tipoR == "caseD") {
        doc.setFontSize(16);
        doc.text("Reporte de Ausentisismo", 115, 15);
        doc.setFontSize(11);
      }


      y = 23;
      doc.line(5, y, 290, y);//up
      doc.line(5, y, 5, (y + 10));//left
      doc.line(290, y, 290, (y + 10));//right
      doc.line(5, (y + 10), 290, (y + 10));//down

      if (this.tipoR == "caseC") {
        doc.setFontSize(16);
        doc.text("Reporte de Ausentisismo por Año", 110, 15);
        doc.setFontSize(11);

        doc.text("#", 9, (y + 7));
        doc.line(15, y, 15, (y + 10));//left
        doc.text("Paciente", 35, (y + 7));
        doc.line(77, y, 77, (y + 10));//left
        doc.text("Enero", 79, (y + 7));
        doc.line(91, y, 91, (y + 10));//left
        doc.text("Febrero", 92, (y + 7));
        doc.line(108, y, 108, (y + 10));//left
        doc.text("Marzo", 110, (y + 7));
        doc.line(122, y, 122, (y + 10));//left
        doc.text("Abril", 124, (y + 7));
        doc.line(136, y, 136, (y + 10));//left
        doc.text("Mayo", 139, (y + 7));
        doc.line(150, y, 150, (y + 10));//left
        doc.text("Junio", 152, (y + 7));
        doc.line(164, y, 164, (y + 10));//left
        doc.text("Julio", 166, (y + 7));
        doc.line(178, y, 178, (y + 10));//left
        doc.text("Agosto", 179, (y + 7));
        doc.line(193, y, 193, (y + 10));//left
        doc.text("Septiembre", 194, (y + 7));
        doc.line(213, y, 213, (y + 10));//left
        doc.text("Octubre", 214, (y + 7));
        doc.line(230, y, 230, (y + 10));//left
        doc.text("Noviembre", 231, (y + 7));
        doc.line(250, y, 250, (y + 10));//left
        doc.text("Diciembre", 251, (y + 7));
        doc.line(270, y, 270, (y + 10));//left
        doc.text("T. Horas", 272, (y + 7));

        y = y + 10;
        doc.setFontSize(8);
        doc.setFont("arial", "normal");

        var valorG: number = 0;
        var auxLinea: number;
        var lineaPaciente;
        var sumTotal = 0;
        for (var index = 0; index < this.dataEnfermedadesResult.length; index++) {
          lineaPaciente = doc.splitTextToSize(this.dataEnfermedadesResult[index].objNameG, (57));
          valorG = (3 * lineaPaciente.length) + 4;
          sumTotal += this.dataEnfermedadesResult[index].contadorG;
          y = y + valorG;

          if (y > 200) {
            doc.text("Pág. #" + Npag, 280, 207);
            Npag++;
            doc.addPage();
            doc.text("Pág. #" + Npag, 280, 207);
            doc.setFontSize(11);
            doc.setFont("arial", "bold")
            y = 15;
            doc.line(5, (y), 290, (y));//up
            doc.line(5, y, 5, (y + 10));//left
            doc.line(290, y, 290, (y + 10));//right
            doc.line(5, (y + 10), 290, (y + 10));//down

            doc.text("#", 9, (y + 7));
            doc.line(15, y, 15, (y + 10));//left
            doc.text("Paciente", 35, (y + 7));
            doc.line(77, y, 77, (y + 10));//left
            doc.text("Enero", 79, (y + 7));
            doc.line(91, y, 91, (y + 10));//left
            doc.text("Febrero", 92, (y + 7));
            doc.line(108, y, 108, (y + 10));//left
            doc.text("Marzo", 110, (y + 7));
            doc.line(122, y, 122, (y + 10));//left
            doc.text("Abril", 124, (y + 7));
            doc.line(136, y, 136, (y + 10));//left
            doc.text("Mayo", 139, (y + 7));
            doc.line(150, y, 150, (y + 10));//left
            doc.text("Junio", 152, (y + 7));
            doc.line(164, y, 164, (y + 10));//left
            doc.text("Julio", 166, (y + 7));
            doc.line(178, y, 178, (y + 10));//left
            doc.text("Agosto", 179, (y + 7));
            doc.line(193, y, 193, (y + 10));//left
            doc.text("Septiembre", 194, (y + 7));
            doc.line(213, y, 213, (y + 10));//left
            doc.text("Octubre", 214, (y + 7));
            doc.line(230, y, 230, (y + 10));//left
            doc.text("Noviembre", 231, (y + 7));
            doc.line(250, y, 250, (y + 10));//left
            doc.text("Diciembre", 251, (y + 7));
            doc.line(270, y, 270, (y + 10));//left
            doc.text("T. Horas", 272, (y + 7));

            y = y + 10 + valorG;
            doc.setFontSize(8);
            doc.setFont("arial", "normal");
          }

          doc.line(5, (y - valorG), 5, y);//left
          doc.line(290, (y - valorG), 290, y);//right
          doc.line(5, y, 290, y);//down +10y1y2

          doc.line(15, (y - valorG), 15, y);//right
          doc.line(77, (y - valorG), 77, y);//right
          doc.line(91, (y - valorG), 91, y);//right
          doc.line(108, (y - valorG), 108, y);//right
          doc.line(122, (y - valorG), 122, y);//right
          doc.line(136, (y - valorG), 136, y);//right
          doc.line(150, (y - valorG), 150, y);//right
          doc.line(164, (y - valorG), 164, y);//right
          doc.line(178, (y - valorG), 178, y);//right
          doc.line(193, (y - valorG), 193, y);//right
          doc.line(213, (y - valorG), 213, y);//right
          doc.line(230, (y - valorG), 230, y);//right
          doc.line(250, (y - valorG), 250, y);//right
          doc.line(270, (y - valorG), 270, y);//right

          doc.text((index + 1).toString(), 8, (y - ((valorG - 3) / 2)));
          auxLinea = Number((valorG - (3 * lineaPaciente.length + (3 * (lineaPaciente.length - 1)))) / 2.5) + (2 + lineaPaciente.length);
          doc.text(lineaPaciente, 18, (y - valorG + auxLinea));
          var x = 0;
          for (var i = 0; i < this.dataEnfermedadesResult[index].listObj.length; i++) {
            switch (i) {
              case 0: x = 84; break;
              case 1: x = 98; break;
              case 2: x = 114; break;
              case 3: x = 128; break;
              case 4: x = 142; break;
              case 5: x = 156; break;
              case 6: x = 170; break;
              case 7: x = 185; break;
              case 8: x = 202; break;
              case 9: x = 220; break;
              case 10: x = 240; break;
              case 11: x = 260; break;
            };
            doc.text((this.dataEnfermedadesResult[index].listObj[i].contadorNum).toString(), x, (y - ((valorG - 3) / 2)));
          }
          doc.text(this.dataEnfermedadesResult[index].contadorG.toString(), 278, (y - ((valorG - 3) / 2)));
        }
        doc.line(5, y, 290, y);//up
        doc.line(5, y, 5, (y + 10));//left
        doc.line(290, y, 290, (y + 10));//right
        doc.line(5, (y + 10), 290, (y + 10));//down

        doc.line(77, y, 77, (y + 10));//left
        doc.line(91, y, 91, (y + 10));//left
        doc.line(108, y, 108, (y + 10));//left
        doc.line(122, y, 122, (y + 10));//left
        doc.line(136, y, 136, (y + 10));//left
        doc.line(150, y, 150, (y + 10));//left
        doc.line(164, y, 164, (y + 10));//left
        doc.line(178, y, 178, (y + 10));//left
        doc.line(193, y, 193, (y + 10));//left
        doc.line(213, y, 213, (y + 10));//left
        doc.line(230, y, 230, (y + 10));//left
        doc.line(250, y, 250, (y + 10));//left
        doc.line(270, y, 270, (y + 10));//left

        for(var index=0;index<this.listObjetosIn.length;index++){
        var varObj = this.sumTotales.transform(this.dataEnfermedadesResult, this.listObjetosIn[index]);
        switch (index) {
          case 0: x = 84; break;
          case 1: x = 98; break;
          case 2: x = 114; break;
          case 3: x = 128; break;
          case 4: x = 142; break;
          case 5: x = 156; break;
          case 6: x = 170; break;
          case 7: x = 185; break;
          case 8: x = 202; break;
          case 9: x = 220; break;
          case 10: x = 240; break;
          case 11: x = 260; break;
        };
        doc.text((varObj.contOcurrenciaTotal).toString(), x, (y+7));
        }
        doc.setFontSize(9);
        doc.setFont("arial", "bold");
        doc.text("TOTAL DE HORAS POR MES", 10, (y + 7));
        doc.text(sumTotal.toString(), 278, (y + 7));
      }
      
      doc.save("Reporte" + fechaHoy.strFecha + ".pdf");
    }
  }
}
