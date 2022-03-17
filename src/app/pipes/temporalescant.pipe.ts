import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temporalescant'
})
export class TemporalescantPipe implements PipeTransform {

  transform(list: any[], limiteCant?: number): any {
    if (!list)
      return [];
    if (limiteCant>0) {
        return list.filter(x => x.cantidad==limiteCant);
    } else return list;
  }
}
