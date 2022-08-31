import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { cParametroReporteMedic, cReportGeneralMedic } from 'src/app/shared/medicina/medicina';
import { ReportMedicService } from 'src/app/shared/medicina/report-medic.service';


@Component({
  selector: 'app-reportes-medic',
  templateUrl: './reportes-medic.component.html',
  styles: [],
})
export class ReportesMedicComponent implements OnInit {

  parametrosBusqueda: cParametroReporteMedic = new cParametroReporteMedic();
  iconDownLeft: boolean = false;
  spinnerOnOff: number = 0;
  listResultadosAB: cReportGeneralMedic[] = [];
  listResultadosCD: any[] = [];

  fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft;
  //sort = faSort; faeye = faEye; fatimesCircle = faTimesCircle;  faprint = faPrint; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;
  constructor(private reportMedicService: ReportMedicService) { }

  ngOnInit(): void {
  }

  onGenerarR() {
    if(this.parametrosBusqueda.idEmpresa!=undefined){
      this.spinnerOnOff = 1;
      var parametros = this.parametrosBusqueda.tipoR + "@" + this.parametrosBusqueda.idEmpresa + "@";
      switch (this.parametrosBusqueda.tipoR) {
        case 'caseA':
        case 'caseB':
          if(this.parametrosBusqueda.tipoR=="caseB")
            parametros= parametros+ this.parametrosBusqueda.strPeriodo+"@"+this.parametrosBusqueda.strArea;
          this.reportMedicService.getReporteEnfermedades(parametros).subscribe(
            (res: any) => {
              if (res.exito == 1) {
                this.listResultadosAB=res.data;
              } else this.listResultadosAB=[];
              this.spinnerOnOff = 2;
            });
          break;
        case 'caseC':
          console.log("caseC")
          break;
        case 'caseD':
          console.log("caseD")
          break;
      }
    }
    
    
  }
}
