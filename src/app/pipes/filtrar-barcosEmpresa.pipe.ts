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
      return list.filter(x=>x.nombreBodega=="BP SOUTHERN QUEEN"|| x.nombreBodega.includes('MFA0072') || x.nombreBodega.includes('MDC0144')|| x.nombreBodega.includes('GMY0717')|| x.nombreBodega.includes('MPB1828')|| x.nombreBodega.includes('MBF2585')|| x.nombreBodega.includes('MBB8463')|| x.nombreBodega.includes('CN122')|| x.nombreBodega.includes('MONTACARGA') );
    }
    if(inText=="DANIEL BUEHS"){
      return list.filter(x=>x.nombreBodega=="BP CAP BERNY B"|| x.nombreBodega=="BP MARINERO" || x.nombreBodega.includes('MBB8381') || x.nombreBodega.includes('GRJ0635')|| x.nombreBodega.includes('MBB4187')|| x.nombreBodega.includes('MBA7617')|| x.nombreBodega.includes('MBD9438')|| x.nombreBodega.includes('MPB1818')|| x.nombreBodega.includes('PJE0048'));
    }
    if(inText=="B&B TUNE"){
      return list.filter(x=>x.nombreBodega=="BP BERNARDITA B"||x.nombreBodega=="BP EL CONDE"|| x.nombreBodega=="BP CAP TINO B"|| x.nombreBodega=="BP CAP DANNY B"|| x.nombreBodega.includes('RT870') || x.nombreBodega.includes('RT760E'));
    }
  }
}
