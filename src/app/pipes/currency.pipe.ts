import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: any, precision?:number): any {
    var valordefault=2;
    if(precision!=null)
      valordefault=precision;
    return "$"+value.toFixed(valordefault);
  }

}