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
  listResultados: cReportGeneralMedic[] = [];

  fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft;
  constructor(private reportMedicService: ReportMedicService) { }

  ngOnInit(): void {
  }

  onGenerarR() {
    if (this.parametrosBusqueda.idEmpresa != undefined) {
      this.spinnerOnOff = 1;
      var parametros = this.parametrosBusqueda.tipoR + "@" + this.parametrosBusqueda.idEmpresa + "@";
      if (this.parametrosBusqueda.tipoR == "caseA" || this.parametrosBusqueda.tipoR == "caseB") {
        if (this.parametrosBusqueda.tipoR == "caseB")
          parametros = parametros + this.parametrosBusqueda.strPeriodo + "@" + this.parametrosBusqueda.strArea;
        this.reportMedicService.getReporteEnfermedades(parametros).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.listResultados = res.data;
            } else this.listResultados = [];
            this.spinnerOnOff = 2;
          });
      } else {
        if (this.parametrosBusqueda.soloMes!=0) {
          this.parametrosBusqueda.tipoR = "caseD";
          parametros = this.parametrosBusqueda.tipoR + "@" + this.parametrosBusqueda.idEmpresa + "@"+this.parametrosBusqueda.soloAnio+'-'+this.parametrosBusqueda.soloMes;
        }else {
          this.parametrosBusqueda.tipoR = "caseC";
          parametros = this.parametrosBusqueda.tipoR + "@" + this.parametrosBusqueda.idEmpresa + "@"+this.parametrosBusqueda.soloAnio;
        }
        this.reportMedicService.getReporteAusentisismo(parametros).subscribe(
          (res: any) => {
            if (res.exito == 1) {
              this.listResultados=res.data;
            } else this.listResultados=[];
            this.spinnerOnOff = 2;
          });
      }
    }
  }
}
