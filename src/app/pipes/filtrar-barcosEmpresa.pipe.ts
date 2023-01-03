import { Pipe, PipeTransform } from '@angular/core';
import { cBodega } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtrarBarcosEmpresa'
})
export class FiltrarBarcosEmpresaPipe implements PipeTransform {

  transform(list: cBodega[], inText: string): cBodega[] {
    if (list==null)
    return [];
    if(inText=="SIN ASIGNAR")
    return list;
    if(inText=="MANACRIPEX"){
      return list.filter(x=>x.nombreBodega=="BP SOUTHERN QUEEN");
    }
    if(inText=="DANIEL BUEHS"){
      return list.filter(x=>x.nombreBodega=="BP CAP BERNY B"|| x.nombreBodega=="BP MARINERO");
    }
    if(inText=="B&B TUNE"){
      return list.filter(x=>x.nombreBodega!="BP CAP BERNY B"&& x.nombreBodega!="BP MARINERO"&& x.nombreBodega!="BP SOUTHERN QUEEN");
    }
  }
}
