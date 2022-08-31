import { Pipe, PipeTransform } from '@angular/core';
import { cReportGeneralMedic } from '../shared/medicina/medicina';

@Pipe({
  name: 'reportEnfermedades',
  pure: false
})
export class ReportEnfermedadesPipe implements PipeTransform {

  transform(list: cReportGeneralMedic[], paramsIn: any): any[] {
    var newList:cReportGeneralMedic[]=list;
    paramsIn.contEnfermedadesNormal=0;
    paramsIn.contEnfermedadesControl=0;
    paramsIn.contOcurrenciaNormal=0;
    paramsIn.contOcurrenciaControl=0;
    if(paramsIn.filtroEnfermedad!=''){
      newList=newList.filter(x => x.enfermedadCIE10.toLowerCase().includes(paramsIn.filtroEnfermedad.toLowerCase()));
    }
    if(newList.length>0){
      if(paramsIn.isNormal && paramsIn.isControl){
        newList.forEach(x=>{
          var auxLetra=x.enfermedadCIE10.slice(0,1);
          if(auxLetra=='Z'){
            paramsIn.contEnfermedadesControl++;
            paramsIn.contOcurrenciaControl=paramsIn.contOcurrenciaControl+x.contadorOcurrencia;
          } 
          else {
            paramsIn.contEnfermedadesNormal++;
            paramsIn.contOcurrenciaNormal=paramsIn.contOcurrenciaNormal+x.contadorOcurrencia;
          }
        })
      }else{
        newList= newList.filter(x=>
          {
            var auxLetra=x.enfermedadCIE10.slice(0,1);
            if(!paramsIn.isNormal){
              if(auxLetra=='Z'){
                paramsIn.contEnfermedadesControl++;
                paramsIn.contOcurrenciaControl=paramsIn.contOcurrenciaControl+x.contadorOcurrencia;
                return x;
              }
            }else{
              if(auxLetra!='Z'){
                paramsIn.contEnfermedadesNormal++;
                paramsIn.contOcurrenciaNormal=paramsIn.contOcurrenciaNormal+x.contadorOcurrencia;
                return x;
              }
            }
        });
      }
    }
    return newList;
  }
}
