import { Component, Input, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faEye, faPrint, faSearch, faSort, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { cObjR, cReportGeneralMedic, cReportGeneralMedicList } from 'src/app/shared/medicina/medicina';
import { cFecha } from 'src/app/shared/otrosServices/varios';

@Component({
  selector: 'app-ausentisimo-report',
  templateUrl: './ausentisimo-report.component.html',
  styles: [],
})
export class AusentisimoReportComponent implements OnInit {

  @Input() listAusentisismoIn: cReportGeneralMedic[];
  @Input() tipoR: string;
  
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
  constructor() { }

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
                var auxNewD=new cObjR(y.objName);
                this.listObjetosIn.push(auxNewD);
              }
            });
          }
          );
          this.listAusentisismoIn.forEach(x => {
            for(var i=0; i<this.listObjetosIn.length; i++){
              if(x.listObj.find(y=>y.objName==this.listObjetosIn[i].name)==undefined){
                var auxNewD=new cReportGeneralMedicList(this.listObjetosIn[i].name,0);
                x.listObj.push(auxNewD);
              }
            }
          });
        }
      }else{
        this.paramsReport.isControl=false;
        this.paramsReport.isNormal=false;
        var fechaHoy: cFecha=new cFecha();
        for(var i=0; i<fechaHoy.arrayMes.length; i++){
          var auxNewD=new cObjR(fechaHoy.arrayMes[i].nombre);
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

  }
}
