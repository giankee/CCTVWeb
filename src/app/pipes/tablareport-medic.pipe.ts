import { Pipe, PipeTransform } from '@angular/core';
import { cObjR, cReportGeneralMedic, cReportGeneralMedicList } from '../shared/medicina/medicina';

@Pipe({
  name: 'tablareportMedic'
})
export class TablareportMedicPipe implements PipeTransform {

  transform(oneObject: cReportGeneralMedic, objRIn: cObjR): cReportGeneralMedicList {
    var newObject: cReportGeneralMedicList = oneObject.listObj.find(x => x.objName == objRIn.name);
    return newObject;
  }

}
