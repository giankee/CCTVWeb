import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: any, precision?:number): any {
    var valordefault=2;
    if (value % 1 != 0) {
      if(precision!=null)
      valordefault=precision;
      return "$"+value;
    }
    return "$"+value+".00";
  }

}