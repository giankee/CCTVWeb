import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lugaresCat'
})
export class LugaresCatPipe implements PipeTransform {

  transform(list: any[], tDato: string, inText: string): any {
    if (!list)
      return [];
    if (tDato) {
      if (tDato == "cVario")
        return list.filter(x => x.categoria == inText);
      if (tDato == "cVistaSalida") {
        if (inText == 'notAll')
          return list.filter(x => x.subCat != "Planta" && x.subCat != "Puerto" && x.cat =="Lugar");
        else {
            if(inText=="Proveedor")
              return list.filter(x => x.cat == "Proveedor");  
          return list.filter(x => x.subCat == inText);
        }
      }

    } else return list;
  }

}
