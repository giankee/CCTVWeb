import { Pipe, PipeTransform } from '@angular/core';
import { cBodegaProducto } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'sumCantBodega'
})
export class SumCantBodegaPipe implements PipeTransform {

  transform(list: cBodegaProducto[]): number {
    var sumCant=0;
    if(list.length>0)
    {
      list.forEach(x=>{
        sumCant=sumCant+x.disponibilidad;
      });
      return sumCant;
    }
    return 0;
  }

}
