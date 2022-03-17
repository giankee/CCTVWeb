import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperLowerCase'
})
export class UpperLowerCasePipe implements PipeTransform {

  transform(value: string, arg?: number): string {
    if (!value)
      return "";
    if (arg) {
      switch (arg) {
        case 1: return value.toUpperCase(); break;
        case 2: return value.toLowerCase(); break;
        case 3:
          var primera = value.slice(0, 1).toUpperCase();
          var resto = value.slice(1, value.length).toLowerCase();
          return (primera + resto);
          break;
      }
    } else return value;
  }

}
