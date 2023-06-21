import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'popOutXList'
})
export class PopOutXListPipe implements PipeTransform {

  transform(list: any[], inText: string): any[] {
    if (inText == "SIN ASIGNAR") return list;
    var listNew;
    listNew=list.filter(x=>x.nombreBodega!=inText);
    return listNew;
  }

}
