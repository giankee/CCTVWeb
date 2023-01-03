import { Pipe, PipeTransform } from '@angular/core';
import { cBodega, cBodegaArea } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtrarBodega'
})
export class FiltrarBodegaPipe implements PipeTransform {

  transform(list: cBodega[], inText: string, inEmpresa?:string): cBodegaArea[] {

    if (list==null)
    return [];
    if(inText=="SIN ASIGNAR")
    return [];
    if(list.find(x=>x.nombreBodega==inText && x.estado==1)!=null){
      if(list.find(x=>x.nombreBodega==inText && x.estado==1).listAreas.length>0)
      return list.find(x=>x.nombreBodega==inText && x.estado==1).listAreas;
    }
    return [];
  }

}
