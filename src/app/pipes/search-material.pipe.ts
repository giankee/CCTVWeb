import { Pipe, PipeTransform } from '@angular/core';
import { cProducto_B } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'searchMaterial'
})
export class SearchMaterialPipe implements PipeTransform {

  transform(list: cProducto_B[], tDato: string, inText: string): any {
    if (inText.length <1 || (inText == "")) return list;
    if(tDato=="codigo")
      return list.filter(productoB => productoB.codigo.includes(inText));
    else return list.filter(productoB => productoB.nombre.includes(inText));
  }

}
