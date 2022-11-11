import { Component, OnInit } from '@angular/core';
import { faAngleDown, faAngleLeft, faArrowAltCircleLeft, faArrowAltCircleRight, faFlag, faSave, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { ConexionService } from 'src/app/shared/otrosServices/conexion.service';
import { cPaginacion } from 'src/app/shared/otrosServices/paginacion';
import { cVario } from 'src/app/shared/otrosServices/varios';
import { VariosService } from 'src/app/shared/otrosServices/varios.service';
import { WhatsappService } from 'src/app/shared/otrosServices/whatsapp.service';
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

  listBarcos: cVario[] = [];
  listOrdenesMostrar: cOrdenPedido[] = [];
  spinnerOnOff: boolean = true;
  paginacion = new cPaginacion(25);

  /**Icon */
  fasave = faSave; fatimesCircle = faTimesCircle; faangledown = faAngleDown; faangleleft = faAngleLeft; faArLeft = faArrowAltCircleLeft; faArRight = faArrowAltCircleRight;faflag=faFlag;


  constructor(private _conexcionService: ConexionService, private variosService: VariosService, private ordenPedidoService: OrdenPedidoService, private toastr: ToastrService, private whatsappService: WhatsappService) {
    this.variosService.getVariosPrioridad("Puerto").subscribe(dato => {
      this.listBarcos = dato;
      this.restartListPendientes();
    });
  }

  ngOnInit(): void {
  }

  restartListPendientes(valorPage?: number) {
    this.spinnerOnOff = true;
    this.listOrdenesMostrar = [];
    this.ordenPedidoService.getListPedido("Pendiente").subscribe(dato => {
      dato.forEach(x => {
        x.fechaPedido = x.fechaPedido.substring(0, 10);
        x.listArticulosPedido.forEach(y => y.marcar = false);
        this.listOrdenesMostrar.push(x);
      });
      this.spinnerOnOff = false;
      this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
      if (valorPage != null)
        this.paginacion.updateIndex(valorPage);
      else this.paginacion.updateIndex(0);
    });
  }

  onSave(datoIn: cOrdenPedido, tipoIn:number) {
    if (datoIn.listArticulosPedido.find(x => x.marcar) != undefined) {
      datoIn.listArticulosPedido.forEach(x => {
        if (x.marcar){
          if(tipoIn==1)
          x.estadoArticuloPedido = "Procesada";
          else x.estadoArticuloPedido="No Procesada";
        }
      });
      if (datoIn.listArticulosPedido.find(x => x.estadoArticuloPedido == "Pendiente") == undefined)
        datoIn.estadoProceso = "Procesada";
      this.ordenPedidoService.verificacionOrdenPedido(datoIn).subscribe(
        (res: any) => {
          if (res.message == "Ok") {
            this.toastr.success('Actualización de pedido satisfactorio', 'Orden Verificada');
            if (res.auxmessage == "Procesada") {
              this.restartListPendientes(this.paginacion.pagActualIndex);
            } else {
              for (var i = 0; i < datoIn.listArticulosPedido.length; i++) {
                if (datoIn.listArticulosPedido[i].estadoArticuloPedido == "Procesada"||datoIn.listArticulosPedido[i].estadoArticuloPedido == "No Procesada") {
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
  }

  onUpdateSelect(control) {//cuando hacen cambio en el numero de registrso por views
    this.paginacion.selectPagination = Number(control.value);
    this.paginacion.getNumberIndex(this.listOrdenesMostrar.length);
    this.paginacion.updateIndex(0);
  }
}
