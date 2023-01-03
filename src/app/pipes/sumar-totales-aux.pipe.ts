import { Pipe, PipeTransform } from '@angular/core';
import { cReportGeneralMedic } from '../shared/medicina/medicina';

@Pipe({
  name: 'sumarTotalesAux'
})
export class SumarTotalesAuxPipe implements PipeTransform {

  transform(listObject: cReportGeneralMedic[]): number {
    var resp:number=0;
    listObject.forEach(x=>{
      resp=resp+x.contadorG;
    });
    return resp;
  }
}
