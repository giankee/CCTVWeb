import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  pure: false
})
export class SearchPipe implements PipeTransform {

  transform(list: any[], inText: string, tDato: string): any[] {
    if (inText.length < 1 || (inText == "")) return list;
    switch (tDato) {
      case 'cCarro':
        return list.filter(carro => carro.numMatricula.toLowerCase().includes(inText.toLowerCase()) || carro.marca.toLowerCase().includes(inText.toLowerCase()) || carro.propietario.toLowerCase().includes(inText.toLowerCase()));
      case 'cProducto':
        return list.filter(producto => producto.nombre.toLowerCase().includes(inText.toLowerCase()) || producto.categoria.toLowerCase().includes(inText.toLowerCase()));
      case 'cOrdenES':
        return list.filter(ordenES => ordenES.numDocumentacion.includes(inText) || ordenES.tipoOrden.toLowerCase().includes(inText.toLowerCase()) || ordenES.persona.nombreP.toLowerCase().includes(inText.toLowerCase()) || ordenES.fechaRegistro.toLowerCase().includes(inText.toLowerCase()) || ordenES.destinoProcedencia.toLowerCase().includes(inText.toLowerCase()) || ordenES.planta.toLowerCase().includes(inText.toLowerCase()) || ordenES.estadoProceso.toLowerCase().includes(inText.toLowerCase()));
      case 'cPersonal':
        return list.filter(personal => personal.cedula.includes(inText) || personal.nombreP.toLowerCase().includes(inText.toLowerCase()) || personal.tipoPersona.toLowerCase().includes(inText.toLowerCase()) || personal.empresa.toLowerCase().includes(inText.toLowerCase()));
      case 'cProductoB':
        return list.filter(productoB => productoB.codigo.includes(inText) || productoB.marca.includes(inText) || productoB.nombre.includes(inText) || productoB.categoria.includes(inText) || productoB.proveedor.toLowerCase().includes(inText.toLowerCase()));
      case 'cBalde':
        return list.filter(balde => balde.numBalde.toString().includes(inText) || balde.ubicacionActual.includes(inText) || balde.actividad.toLowerCase().includes(inText.toLowerCase()) || balde.estadoBalde.toLowerCase().includes(inText.toLowerCase()));
      case 'cReportGeneralMedic':
        return list.filter(reportAB => reportAB.enfermedadCIE10.toLowerCase().includes(inText.toLowerCase()));
      case 'cPedido':
        return list.filter(pedido => pedido.strNumSecuencial.toUpperCase().includes(inText.toUpperCase())|| pedido.proveedor.toUpperCase().includes(inText.toUpperCase()));
    }
  }
}
