import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaMes'
})
export class FechaMesPipe implements PipeTransform {

  transform(value: string): string {
    var aux = value.split('-');
    var soloMes= Number(aux[1]);
    var result = aux[0] + "-";
    if (soloMes < 10)
      result = result + '0' + soloMes;
    else result = result + soloMes;
    return result;
  }
}
