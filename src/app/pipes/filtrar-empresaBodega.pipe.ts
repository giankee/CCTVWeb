import { Pipe, PipeTransform } from '@angular/core';
import { cBodega } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtrarEmpresaBodega'
})
export class FiltrarEmpresaBodegaPipe implements PipeTransform {

  transform(list: cBodega[], inText: string): cBodega[] {
    if (list==null)
    return [];
    if(inText=="SIN ASIGNAR")
    return list;
    return list.filter(x=>x.empresaAfiliada.includes(inText));
  }
}
