import { Pipe, PipeTransform } from '@angular/core';
import { cDepartamentoR, cReportGeneralMedic, cReportGeneralMedicArea } from '../shared/medicina/medicina';

@Pipe({
  name: 'nullDepartamentos',
  pure: false
})
export class NullDepartamentosPipe implements PipeTransform {

  transform(oneEnfermedad: cReportGeneralMedic, departamentoIn: cDepartamentoR): cReportGeneralMedicArea[] {
    var newDepartamento:cReportGeneralMedicArea[]=[];
    newDepartamento=oneEnfermedad.listDepartamentos.filter(x=>x.departamento==departamentoIn.departamento);
    if(newDepartamento.length>0){
      departamentoIn.contOcurrenciaTotal=departamentoIn.contOcurrenciaTotal+newDepartamento[0].contadorOcurrencia;
      var auxLetra=oneEnfermedad.enfermedadCIE10.slice(0,1);
      if(auxLetra=='Z')
        departamentoIn.contOcurrenciaControl=departamentoIn.contOcurrenciaControl+newDepartamento[0].contadorOcurrencia;
      else departamentoIn.contOcurrenciaNormal=departamentoIn.contOcurrenciaNormal+newDepartamento[0].contadorOcurrencia;
      return newDepartamento;
    }
    else{
      var aux:cReportGeneralMedicArea=new cReportGeneralMedicArea();
      aux.contadorOcurrencia=0;
      newDepartamento.push(aux);
    }
    return newDepartamento;
  }
}
