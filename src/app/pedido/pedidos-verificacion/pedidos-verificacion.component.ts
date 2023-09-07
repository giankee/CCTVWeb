import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faFlag, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { OrdenPedidoService } from 'src/app/shared/pedido/orden-pedido.service';
import { cOrdenPedido } from 'src/app/shared/pedido/pedido';

@Component({
  selector: 'app-pedidos-verificacion',
  templateUrl: './pedidos-verificacion.component.html',
  styles: []
})
export class PedidosVerificacionComponent implements OnInit {
  public get conexcionService(): ConexionService {
    return this._conexcionService;
  }
  public set conexcionService(value: ConexionService) {
    this._conexcionService = value;
  }

  listOrdenesMostrar: cOrdenPedido[] = [];
  spinnerOnOff: boolean = true;
  paginacion = new cPaginacion(25);

  /**Icon */
  fasave = faSave; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight; faflag = faFlag;


  constructor(private _conexcionService: ConexionService, private ordenPedidoService: OrdenPedidoService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.restartListPendientes();
  }

  restartListPendientes(valorPage?: number) {
    this.spinnerOnOff = true;
    this.listOrdenesMostrar = [];
    var parametros;
    if (this.conexcionService.UserDataToken.role == "pedido-flota")
      parametros = "FLOTA@Pendiente Verificación";
    if (this.conexcionService.UserDataToken.role == "pedido-planta")
      parametros = "P MANACRIPEX@Pendiente Verificación";
    if (this.conexcionService.UserDataToken.role == "pedido-super")
      parametros = "P OFICINAS@Pendiente Verificación";
    this.ordenPedidoService.getListPedido(parametros).subscribe(dato => {
      dato.forEach(x => {
        var fecha = x.fechaPedido.split('T');
        x.fechaPedido = fecha[0] + " " + fecha[1];

        fecha = x.fechaAprobacion.split('T');
        x.fechaAprobacion = fecha[0] + " " + fecha[1];

        let auxSecuencial = x.numSecuencial.split("-");
        x.strNumSecuencial = auxSecuencial[1];
        for(var i =0; i<x.listArticulosPedido.length;i++){
          x.listArticulosPedido[i].marcar=false;
          if(x.listArticulosPedido[i].estadoArticuloPedido=="Procesada"||x.listArticulosPedido[i].estadoArticuloPedido=="No Procesada"){
            x.listArticulosPedido.splice(i,1);
            i--;
          }
        }
        
        this.listOrdenesMostrar.push(x);
      });
      this.spinnerOnOff = false;
      this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
      if (valorPage != null)
        this.paginacion.updateIndex(valorPage);
      else this.paginacion.updateIndex(0);
    });
  }

  /* onSave(datoIn: cOrdenPedido, tipoIn: number) {
    if (datoIn.listArticulosPedido.find(x => x.marcar) != undefined) {
      datoIn.listArticulosPedido.forEach(x => {
        if (x.marcar) {
          if (tipoIn == 1)
            x.estadoArticuloPedido = "Procesada";
          else x.estadoArticuloPedido = "No Procesada";
        }
      });
      if (datoIn.listArticulosPedido.find(x => x.estadoArticuloPedido == "Pendiente") == undefined) {
        datoIn.estadoProceso = "Procesada";
        datoIn.verificacionUser = this.conexcionService.UserDataToken.name;
      }
      var fechaAux = datoIn.fechaPedido.split(" ");
      datoIn.fechaPedido = fechaAux[0] + "T" + fechaAux[1];
      var fechaAux = datoIn.fechaAprobacion.split(" ");
      datoIn.fechaAprobacion = fechaAux[0] + "T" + fechaAux[1];
      this.ordenPedidoService.verificacionOrdenPedido(datoIn).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Actualización de pedido satisfactorio', 'Orden Verificada');
            if (res.auxmessage == "Procesada") {
              this.restartListPendientes(this.paginacion.pagActualIndex);
            } else {
              for (var i = 0; i < datoIn.listArticulosPedido.length; i++) {
                if (datoIn.listArticulosPedido[i].estadoArticuloPedido == "Procesada" || datoIn.listArticulosPedido[i].estadoArticuloPedido == "No Procesada") {
                  datoIn.listArticulosPedido.splice(i, 1);
                  i--;
                }
              }
            }
          }
        },
        err => {
          console.log(err);
        });

    }
  } */

  onSaveMasive(tipoIn: number) {
    var soloDatosCheck: cOrdenPedido[] = this.listOrdenesMostrar.filter(x => x.listArticulosPedido.find(y => y.marcar));
    soloDatosCheck.forEach(x => {
      x.listArticulosPedido.forEach(y => {
        if (y.marcar) {
          if (tipoIn == 1)
            y.estadoArticuloPedido = "Procesada";
          else y.estadoArticuloPedido = "No Procesada";
        }
      });
      if (x.listArticulosPedido.find(x => x.estadoArticuloPedido == "Pendiente") == undefined){
        x.estadoProceso = "Procesada";
        x.verificacionUser=this.conexcionService.UserDataToken.name;
      }
      var fechaAux= x.fechaPedido.split(" ");
      x.fechaPedido= fechaAux[0]+"T"+fechaAux[1];
      var fechaAux= x.fechaAprobacion.split(" ");
      x.fechaAprobacion= fechaAux[0]+"T"+fechaAux[1];

    });
    this.ordenPedidoService.verificacionMultiOrdenPedido(soloDatosCheck).subscribe(
      (res: any) => {
        if (res.message == "Ok") {
          this.toastr.success('Actualización de pedido satisfactorio', 'Orden Verificada');
          this.restartListPendientes(this.paginacion.pagActualIndex);
        }
      },
      err => {
        console.log(err);
      });
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
    this.paginacion.updateIndex(0);
  }
}
