import { Pipe, PipeTransform } from '@angular/core';
import { cProducto_B } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtroBodega',
  pure: false
})
export class FiltroBodegahPipe implements PipeTransform {

  transform(list: cProducto_B[], inText: string): any[] {
    if (inText == "SIN ASIGNAR") return list;
    var listNew:cProducto_B[];
    listNew=list.filter(x=>x.listBodegaProducto.find(y=>y.nombreBodega==inText));
    return listNew;
  }

}
