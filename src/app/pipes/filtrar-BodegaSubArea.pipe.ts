import { Pipe, PipeTransform } from '@angular/core';
import { cBodega, cBodegaArea } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtrarBodegaSubArea'
})
export class FiltrarBodegaSubAreaPipe implements PipeTransform {

  transform(list: cBodega[], inBodega: string): cBodegaArea[] {
    if (list==null)
    return [];

    if(inBodega!="SIN ASIGNAR"){
      let bodegaAux=list.find(x=>x.nombreBodega==inBodega);
      if(bodegaAux!=null){
        if(bodegaAux.listAreas!= null && bodegaAux.listAreas.length>0){
          return bodegaAux.listAreas;
        }
      }
    }
    return [];
  }
}
