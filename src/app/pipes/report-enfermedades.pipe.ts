import { Pipe, PipeTransform } from '@angular/core';
import { cReportGeneralMedic } from '../shared/medicina/medicina';

@Pipe({
  name: 'reportEnfermedades',
  pure: false
})
export class ReportEnfermedadesPipe implements PipeTransform {

  transform(list: cReportGeneralMedic[], paramsIn: any): any[] {
    var newList:cReportGeneralMedic[]=[];
    paramsIn.contEnfermedadesNormal=0;
    paramsIn.contEnfermedadesControl=0;
    paramsIn.contOcurrenciaNormal=0;
    paramsIn.contOcurrenciaControl=0;
    if(paramsIn.filtroBusqueda!='')
      newList=list.filter(x => x.objNameG.toLowerCase().includes(paramsIn.filtroBusqueda.toLowerCase()));
    else newList=list;
    if(newList.length>0){
      
      if(paramsIn.isNormal && paramsIn.isControl){
        newList.forEach(x=>{
          var auxLetra=x.objNameG.slice(0,1);
          if(auxLetra=='Z'){
            paramsIn.contEnfermedadesControl++;
            paramsIn.contOcurrenciaControl+=x.contadorG;
          } 
          else {
            paramsIn.contEnfermedadesNormal++;
            paramsIn.contOcurrenciaNormal+=x.contadorG;
          }
        })
      }else
        if(paramsIn.isNormal || paramsIn.isControl){
          newList= newList.filter(x=>
            {
              var auxLetra=x.objNameG.slice(0,1);
              if(!paramsIn.isNormal){
                if(auxLetra=='Z'){
                  paramsIn.contEnfermedadesControl++;
                  paramsIn.contOcurrenciaControl+=x.contadorG;
                  return x;
                }
              }else{
                if(auxLetra!='Z'){
                  paramsIn.contEnfermedadesNormal++;
                  paramsIn.contOcurrenciaNormal+=x.contadorG;
                  return x;
                }
              }
          });
        }
    }
    return newList;
  }
}
