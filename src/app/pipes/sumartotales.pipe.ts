import { Pipe, PipeTransform } from '@angular/core';
import { cObjR, cReportGeneralMedic } from '../shared/medicina/medicina';

@Pipe({
  name: 'sumartotales'
})
export class SumartotalesPipe implements PipeTransform {

  transform(listObject: cReportGeneralMedic[], objRIn: cObjR): cObjR {
    objRIn.contOcurrenciaTotal=0;
    objRIn.contOcurrenciaA=0;
    objRIn.contOcurrenciaB=0;
    listObject.forEach(x=>{
      var newObject=x.listObj.find(x => x.objName == objRIn.name); 
      objRIn.contOcurrenciaTotal+=newObject.contadorNum;
      var auxLetra=x.objNameG.slice(0,1);
      if(auxLetra=='Z')
        objRIn.contOcurrenciaB+=newObject.contadorNum;
      else objRIn.contOcurrenciaA+=newObject.contadorNum;
    });
    return objRIn;
  }

}
