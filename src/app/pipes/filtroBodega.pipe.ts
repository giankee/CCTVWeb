import { Pipe, PipeTransform } from '@angular/core';
import { cProducto_B } from '../shared/bodega/ordenEC';

@Pipe({
  name: 'filtroBodega',
  pure: false
})
export class FiltroBodegahPipe implements PipeTransform {

  transform(list: cProducto_B[], inText: string): any[] {
    var listNew:cProducto_B[]=[];    
    list.forEach(x=>{
      if(x.listBodegaProducto.length>0){
        x.sumStock=0;
        if (inText == "SIN ASIGNAR"){
          x.listBodegaProducto.forEach(y=>{
            x.sumStock=x.sumStock+y.disponibilidad;
          });
          listNew.push(x);
        }else{
          if(x.listBodegaProducto.find(y=>y.nombreBodega==inText)){
            x.sumStock=x.listBodegaProducto.find(y=>y.nombreBodega==inText).disponibilidad;
            listNew.push(x);
          }
        }
      }
    });
    return listNew;
  }

}
