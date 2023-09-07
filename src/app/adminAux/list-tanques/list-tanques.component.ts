import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faPrint, faSearch, faSort } from '@fortawesome/free-solid-svg-icons';
import { OrdenESService } from 'src/app/shared/orden-es.service';
import { cParametroReporteTanques, cReporteTanque } from 'src/app/shared/ordenEs';

@Component({
  selector: 'app-list-tanques',
  templateUrl: './list-tanques.component.html',
  styles: [],
})
export class ListTanquesComponent implements OnInit {

  parametrosBusqueda: cParametroReporteTanques = new cParametroReporteTanques();
  iconDownLeft: boolean = false;
  spinnerOnOff: number = 0;
  listLugares:string[]=[];
  listResultados: cReporteTanque[] = [];

  fasearch = faSearch; faangledown = faAngleDown; faangleleft = faAngleLeft;faprint=faPrint;sort=faSort;
  constructor(private ordenESService: OrdenESService) { }

  ngOnInit(): void {
    this.cargarLugares();
  }
  
  cargarLugares(){
  this.ordenESService.getLugaresDiferentes().subscribe(dato => {
    this.listLugares = dato;
  });
  }

  onGenerarR(){
    if(this.parametrosBusqueda.tipoR!="SIN ASIGNAR"){
      this.spinnerOnOff=1;
      var parametros=this.parametrosBusqueda.tipoR+"@";
      if(this.parametrosBusqueda.boolPlanta){
        if(this.parametrosBusqueda.tipoR=="Salida Tanque Agua")
          parametros=parametros+"AGUAHER@"+this.parametrosBusqueda.strPeriodoA+"@"+this.parametrosBusqueda.strPeriodoB+"@"+this.parametrosBusqueda.strDestino+"@SIN ASIGNAR";
        else parametros=parametros+"PETROECUADOR@"+this.parametrosBusqueda.strPeriodoA+"@"+this.parametrosBusqueda.strPeriodoB+"@"+this.parametrosBusqueda.strDestino+"@SIN ASIGNAR";
      }else parametros=parametros+"P MANACRIPEX@"+this.parametrosBusqueda.strPeriodoA+"@"+this.parametrosBusqueda.strPeriodoB+"@"+this.parametrosBusqueda.strDestino+"@SIN ASIGNAR";
      this.ordenESService.getFiltroReportTanques(parametros).subscribe((dato:any )=> {
        this.listResultados=dato.data;
        this.spinnerOnOff=2;
      });
    }
    
  }
}
