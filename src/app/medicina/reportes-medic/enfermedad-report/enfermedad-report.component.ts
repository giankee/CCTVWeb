import { Component, Input, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faEye, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cDepartamentoR, cReportGeneralMedic } from 'src/app/shared/medicina/medicina';

@Component({
  selector: 'app-enfermedad-report',
  templateUrl: './enfermedad-report.component.html',
  styles: [],
})
export class EnfermedadReportComponent implements OnInit {

  @Input() listEnfermedadesIn: cReportGeneralMedic[];
  @Input() tipoR: string;

  ordenBy: string = "default";
  dataEnfermedadesResult: cReportGeneralMedic[] = [];
  paramsReport: {
    filtroEnfermedad: string,
    isNormal: boolean,
    isControl: boolean,
    contEnfermedadesNormal: number,
    contEnfermedadesControl: number
    contOcurrenciaNormal: number,
    contOcurrenciaControl: number
  }  
  listDepartamentosIn: cDepartamentoR[] = [];

  sort = faSort; faeye = faEye; faprint = faPrint; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; fasearch = faSearch;
  constructor() { }

  ngOnInit(): void {
    this.paramsReport = {
      filtroEnfermedad: "",
      isNormal: true,
      isControl: true,
      contEnfermedadesControl: 0,
      contEnfermedadesNormal: 0,
      contOcurrenciaNormal: 0,
      contOcurrenciaControl: 0
    }
    if (this.listEnfermedadesIn != null) {
      if (this.tipoR == "caseB") {
        if (this.listEnfermedadesIn.filter(x => x.listDepartamentos.length > 0).length > 0) {
          this.listEnfermedadesIn.forEach(x => {
            x.listDepartamentos.forEach(y => {
              if (this.listDepartamentosIn.find(z => z.departamento == y.departamento) == undefined) {
                var auxNewD=new cDepartamentoR(y.departamento);
                this.listDepartamentosIn.push(auxNewD);
              }
            });
          });
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

  }
}
