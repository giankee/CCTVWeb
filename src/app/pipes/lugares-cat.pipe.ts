import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lugaresCat'
})
export class LugaresCatPipe implements PipeTransform {

  transform(list: any[], tDato: string, inText: string, rolAsignadoIn?:string): any {
    if (!list)
      return [];
    if (tDato) {
      if (tDato == "cVario"){
        if(rolAsignadoIn!=undefined){
          if(rolAsignadoIn=="verificador-bodeguero")
          return list.filter(x => x.categoria == inText && x.prioridadNivel==3);
          if(rolAsignadoIn=="bodega_verificador-m")
          return list.filter(x => x.categoria == inText && x.prioridadNivel==1);
          if(rolAsignadoIn=="tinabg-m")
          return list.filter(x => x.categoria == inText && x.prioridadNivel>=1);
        }else return list.filter(x => x.categoria == inText);
      }
      if (tDato == "cVistaSalida") {
        if (inText == 'notAll'||inText == 'notAllB'){
          if(inText == 'notAll')
          return list.filter(x => x.subCat != "Planta" && x.subCat != "Puerto" && x.cat=="Lugar");
          else return list.filter(x => x.subCat != "Planta" && x.subCat != "Puerto" && x.cat =="Area");
        }
        else {
            if(inText=="Proveedor")
              return list.filter(x => x.cat == "Proveedor");  
          return list.filter(x => x.subCat == inText);
        }
      }

    } else return list;
  }

}
