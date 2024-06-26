import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'underscore'

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: any[], arg?: string, tDato?: string): any {
    if (!value)
      return [];
    if (arg) {
      switch (tDato) {
        case 'cCarro':
          switch (arg) {
            case "up": return _.sortBy(value, function (dato) { return dato.propietario });
            case "down": return _.sortBy(value, function (dato) { return dato.propietario }).reverse();
            case "default": return value;
          }
          break;
        case 'cProducto':
          switch (arg) {
            case "up": return _.sortBy(value, function (dato) { return dato.nombre });
            case "down": return _.sortBy(value, function (dato) { return dato.nombre }).reverse();
            case "default": return value;
          }
          break;
        case 'cOrdenES':
          switch (arg) {
            case "default": return value;
            case "up-N": return _.sortBy(value, function (dato) { return dato.persona.nombreP });
            case "down-N": return _.sortBy(value, function (dato) { return dato.persona.nombreP }).reverse();
            case "up-G": return _.sortBy(value, function (dato) {
              var split = dato.numDocumentacion.split(": ");
              return Number(split[1]);
            });
            case "down-G": return _.sortBy(value, function (dato) {
              var split = dato.numDocumentacion.split(": ");
              return Number(split[1]);
            }).reverse();
          }
          break;
        case 'cPersonal':
          switch (arg) {
            case "up": return _.sortBy(value, function (dato) { return dato.nombreP });
            case "down": return _.sortBy(value, function (dato) { return dato.nombreP }).reverse();
            case "default": return value;
          }
          break;
        case 'cProductoB':
          switch (arg) {
            case "default": return value;
            case "n-up": return _.sortBy(value, function (dato) { return dato.nombre });
            case "n-down": return _.sortBy(value, function (dato) { return dato.nombre }).reverse();
            case "ct-up": return _.sortBy(value, function (dato) { return dato.categoria });
            case "ct-down": return _.sortBy(value, function (dato) { return dato.categoria }).reverse();
            case "pv-up": return _.sortBy(value, function (dato) { return dato.proveedor });
            case "pv-down": return _.sortBy(value, function (dato) { return dato.proveedor }).reverse();
            case "m-up": return _.sortBy(value, function (dato) { return dato.marca });
            case "m-down": return _.sortBy(value, function (dato) { return dato.marca }).reverse();

            case "pstandar-up": return _.sortBy(value, function (dato) { return dato.precioStandar });
            case "pstandar-down": return _.sortBy(value, function (dato) { return dato.precioStandar }).reverse();
            case "pnacional-up": return _.sortBy(value, function (dato) { return dato.precioNacional });
            case "pnacional-down": return _.sortBy(value, function (dato) { return dato.precioNacional }).reverse();
            case "pventa-up": return _.sortBy(value, function (dato) { return dato.precioVenta });
            case "pventa-down": return _.sortBy(value, function (dato) { return dato.precioVenta }).reverse();

          }
          break;
        case 'cProveedor':
          switch (arg) {
            case "up": return _.sortBy(value, function (dato) { return dato.proveedor });
            case "down": return _.sortBy(value, function (dato) { return dato.proveedor }).reverse();
          }
          break;
        case 'cBalde':
          switch (arg) {
            case "default": return value;
            case "num-up": return _.sortBy(value, function (dato) { return dato.numBalde });
            case "num-down": return _.sortBy(value, function (dato) { return dato.numBalde }).reverse();
            case "est-up": return _.sortBy(value, function (dato) { return dato.estadoBalde });
            case "est-down": return _.sortBy(value, function (dato) { return dato.estadoBalde }).reverse();
          }
          break;
        case 'cOrdenEC':
          switch (arg) {
            case "default": return value;
            case "up-F": return _.sortBy(value, function (dato) { return dato.factura });
            case "down-F": return _.sortBy(value, function (dato) { return dato.factura }).reverse();
            case "up-P": return _.sortBy(value, function (dato) { return dato.proveedor });
            case "down-P": return _.sortBy(value, function (dato) { return dato.proveedor }).reverse();
            case "up-B": return _.sortBy(value, function (dato) { return dato.listPcomprasO[0].destinoBodega });
            case "down-B": return _.sortBy(value, function (dato) { return dato.listPcomprasO[0].destinoBodega }).reverse();
          }
          break;
        case 'cOrdenTrabajoI':
          switch (arg) {
            case "default": return value;
            case "up-I": return _.sortBy(value, function (dato) { return dato.numOrdenSecuencial });
            case "down-I": return _.sortBy(value, function (dato) { return dato.numOrdenSecuencial }).reverse();
            case "up-B": return _.sortBy(value, function (dato) { return dato.bodega });
            case "down-B": return _.sortBy(value, function (dato) { return dato.bodega }).reverse();
            case "up-E": return _.sortBy(value, function (dato) { return dato.estadoProceso });
            case "down-E": return _.sortBy(value, function (dato) { return dato.estadoProceso }).reverse();
          }
          break;
        case 'cConsultaMedic':
          switch (arg) {
            case "default": return value;
            case "up-I": return _.sortBy(value, function (dato) { return dato.numOrdenSecuencial });
            case "down-I": return _.sortBy(value, function (dato) { return dato.numOrdenSecuencial }).reverse();
            case "up-B": return _.sortBy(value, function (dato) { return dato.bodegaOrigen });
            case "down-B": return _.sortBy(value, function (dato) { return dato.bodegaOrigen }).reverse();
            case "up-P": return _.sortBy(value, function (dato) { return dato.paciente });
            case "down-P": return _.sortBy(value, function (dato) { return dato.paciente }).reverse();
          }
          break;
        case 'cAtencionMedic':
          switch (arg) {
            case "default": return value;
            case "up-E": return _.sortBy(value, function (dato) { return dato.enfermedadCIE10 });
            case "down-E": return _.sortBy(value, function (dato) { return dato.enfermedadCIE10 }).reverse();
            case "up-P": return _.sortBy(value, function (dato) { return dato.pacienteMedic.empleado });
            case "down-P": return _.sortBy(value, function (dato) { return dato.pacienteMedic.empleado }).reverse();
          }
          break;
        case 'cAccidenteMedic':
          switch (arg) {
            case "default": return value;
            case "up-C": return _.sortBy(value, function (dato) { return dato.causaAccidente });
            case "down-C": return _.sortBy(value, function (dato) { return dato.causaAccidente }).reverse();

          }
          break;
        case 'cPermisoMedic':
          switch (arg) {
            case "default": return value;
            case "up-E": return _.sortBy(value, function (dato) { return dato.enfermedadCIE10 });
            case "down-E": return _.sortBy(value, function (dato) { return dato.enfermedadCIE10 }).reverse();
            case "up-P": return _.sortBy(value, function (dato) { return dato.pacienteMedic.empleado });
            case "down-P": return _.sortBy(value, function (dato) { return dato.pacienteMedic.empleado }).reverse();
            case "up-T": return _.sortBy(value, function (dato) { return dato.tipoPermiso });
            case "down-T": return _.sortBy(value, function (dato) { return dato.tipoPermiso }).reverse();
          }
          break;
        case 'cReportGeneralMedic':
          switch (arg) {
            case "default": return value;
            case "up-E": return _.sortBy(value, function (dato) { return dato.objNameG });
            case "down-E": return _.sortBy(value, function (dato) { return dato.objNameG }).reverse();
            case "up-C": return _.sortBy(value, function (dato) { return dato.contadorOcurrencia });
            case "down-C": return _.sortBy(value, function (dato) { return dato.contadorOcurrencia }).reverse();
          }
          break;
        case 'cOrdenPedido':
          switch (arg) {
            case "default": return value;
            case "up-T": return _.sortBy(value, function (dato) { return dato.tipoPedido });
            case "down-T": return _.sortBy(value, function (dato) { return dato.tipoPedido }).reverse();
            case "up-P": return _.sortBy(value, function (dato) { return dato.proveedor });
            case "down-P": return _.sortBy(value, function (dato) { return dato.proveedor }).reverse();
            case "up-B": return _.sortBy(value, function (dato) { return dato.barco });
            case "down-B": return _.sortBy(value, function (dato) { return dato.barco }).reverse();
            case "up-S": return _.sortBy(value, function (dato) { return dato.strNumSecuencial });
            case "down-S": return _.sortBy(value, function (dato) { return dato.strNumSecuencial }).reverse();
            case "up-E": return _.sortBy(value, function (dato) { return dato.empresa });
            case "down-E": return _.sortBy(value, function (dato) { return dato.empresa }).reverse();
            case "up-F": return _.sortBy(value, function (dato) { return dato.fechaPedido });
            case "down-F": return _.sortBy(value, function (dato) { return dato.fechaPedido }).reverse();
          }
          break;
        case 'cBodega':
          switch (arg) {
            case "default": return value;
            case "up-T": return _.sortBy(value, function (dato) { return dato.tipoBodega });
            case "down-T": return _.sortBy(value, function (dato) { return dato.tipoBodega }).reverse();
            case "up-N": return _.sortBy(value, function (dato) { return dato.nombreBodega });
            case "down-N": return _.sortBy(value, function (dato) { return dato.nombreBodega }).reverse();
          }
          break;
      }
    } else return value;
  }
}
