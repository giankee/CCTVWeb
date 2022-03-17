import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaMes'
})
export class FechaMesPipe implements PipeTransform {

  transform(value: string): string {
    var aux = value.split('-');
    if (aux.length == 2)
      return value;
    return aux[0] + "-" + aux[1];
  }
}
