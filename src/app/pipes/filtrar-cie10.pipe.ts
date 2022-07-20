import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtrarCie10'
})
export class FiltrarCie10Pipe implements PipeTransform {

  transform(list: any[], inText: string): any[] {
    var listNew: any[] = [];
    if (inText == "") {
      for (var i = 0; i < 10; i++)
        listNew.push(list[i]);
    } else {
      var aux = list.filter(x => x.description.toUpperCase().includes(inText) || x.code.toUpperCase().includes(inText));
      listNew= aux.splice(0, 10);
    }
    return listNew;
  }
}
