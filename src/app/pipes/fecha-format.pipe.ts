import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaFormat'
})
export class FechaFormatPipe implements PipeTransform {

  transform(value: string): string {
    var aux = value.split('T');
    if(aux.length==2){
      return aux[0];
    }
    return value;
  }

}
